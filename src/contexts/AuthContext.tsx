'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { syncUserToDatabase } from '@/lib/user-sync'
import { cleanupLocalStorageOnSignOut } from '@/lib/utils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (email: string, password: string) => Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (metadata: any) => Promise<any>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          // If it's a refresh token error, clear storage and continue
          if (error.message?.includes('refresh token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('🧹 Clearing storage due to refresh token error')
            if (typeof window !== 'undefined') {
              localStorage.clear()
              sessionStorage.clear()
            }
          }
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          // Sync user to Railway database if session exists
          if (session?.user) {
            console.log('🔄 Initial session found, syncing user:', session.user.email)
            try {
              await syncUserToDatabase(session.user)
              console.log('✅ Initial sync successful')
            } catch (error) {
              console.error('❌ Error syncing user on initial load:', error)
            }
          }
        }
      } catch (error) {
        console.error('❌ Unexpected error in getInitialSession:', error)
        setSession(null)
        setUser(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth Event:', event, session?.user?.email)
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('❌ Token refresh failed, clearing storage')
          if (typeof window !== 'undefined') {
            localStorage.clear()
            sessionStorage.clear()
          }
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Sync user to Railway database on sign up/sign in
        if (session?.user && event === 'SIGNED_IN') {
          console.log('🔄 Attempting sync for:', session.user.email)
          console.log('📋 User metadata:', session.user.user_metadata)
          try {
            await syncUserToDatabase(session.user)
            console.log('✅ User synced to Railway database:', session.user.email)
          } catch (error) {
            console.error('❌ Error syncing user to Railway:', error)
          }
        } else {
          console.log('⏭️ Skipping sync - event:', event, 'user:', !!session?.user)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Sign up attempt for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (data.user) {
      console.log('✅ Sign up successful for:', data.user.email)
      console.log('📋 User metadata:', data.user.user_metadata)
      
      // Only sync immediately if it's not a recruiter signup
      // Recruiter signups are handled by the RecruiterSignUpForm
      if (data.user.user_metadata?.admin_level !== 'recruiter') {
        try {
          await syncUserToDatabase(data.user)
          console.log('✅ Immediate sync after signup successful')
        } catch (syncError) {
          console.error('❌ Immediate sync after signup failed:', syncError)
        }
      } else {
        console.log('⏭️ Skipping immediate sync for recruiter - handled by signup form')
      }
    }
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    // Force the correct redirect URL based on current environment
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = isProduction 
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bpoc.io')
      : 'http://localhost:3000'
    
    console.log('🔗 Google OAuth redirect URL:', `${baseUrl}/auth/callback`)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Starting comprehensive sign out...')
      
      // Clear browser storage
      if (typeof window !== 'undefined') {
        // Clean up BPOC-related localStorage data
        cleanupLocalStorageOnSignOut()
        
        // Clear Supabase auth items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        console.log('🧹 Cleared browser storage')
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) {
        console.error('❌ Supabase sign out error:', error)
        throw error
      }
      
      console.log('✅ Sign out successful')
      
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateProfile = async (metadata: any) => {
    console.log('🔄 Updating Supabase user metadata:', metadata)
    
    // Ensure full_name is always generated from first_name and last_name if not provided
    if (metadata.first_name && metadata.last_name && !metadata.full_name) {
      metadata.full_name = `${metadata.first_name} ${metadata.last_name}`.trim()
      console.log('🔧 Generated full_name from first_name and last_name:', metadata.full_name)
    }
    
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    })
    
    console.log('📋 Supabase update result:', { data, error })
    
    if (data.user && !error) {
      console.log('✅ Supabase update successful')
      // Update the local user state to reflect changes immediately
      setUser(data.user)
      
      // Note: We don't automatically sync to Railway here to avoid overwriting
      // Railway data with Supabase metadata. The settings page handles Railway updates separately.
    } else {
      console.error('❌ Supabase update failed:', error)
    }
    
    return { data, error }
  }

  // Function to refresh user data from Supabase
  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        setUser(user)
        console.log('✅ User data refreshed from Supabase')
      } else {
        console.error('❌ Failed to refresh user data:', error)
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 