'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { syncUserToDatabase } from '@/lib/user-sync'

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
      const { data: { session } } = await supabase.auth.getSession()
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
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth Event:', event, session?.user?.email)
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
      // Immediately sync the user since they're created
      try {
        await syncUserToDatabase(data.user)
        console.log('✅ Immediate sync after signup successful')
      } catch (syncError) {
        console.error('❌ Immediate sync after signup failed:', syncError)
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
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://bpocai-production.up.railway.app')
      : 'http://localhost:3000'
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
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
      console.log('✅ Supabase update successful, syncing to Railway')
      // Update the local user state to reflect changes immediately
      setUser(data.user)
      
      try {
        await syncUserToDatabase(data.user)
        console.log('✅ Railway sync after profile update successful')
      } catch (syncError) {
        console.error('❌ Error syncing updated profile to Railway:', syncError)
      }
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