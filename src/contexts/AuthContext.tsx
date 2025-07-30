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
        try {
          await syncUserToDatabase(session.user)
        } catch (error) {
          console.error('Error syncing user on initial load:', error)
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Sync user to Railway database on sign up/sign in
        if (session?.user && (event === 'SIGNED_IN' || event === 'SIGNED_UP')) {
          try {
            await syncUserToDatabase(session.user)
            console.log('User synced to Railway database:', session.user.email)
          } catch (error) {
            console.error('Error syncing user to Railway:', error)
          }
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
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
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    })
    
    // Sync updated profile to Railway database
    if (data.user && !error) {
      try {
        await syncUserToDatabase(data.user)
      } catch (syncError) {
        console.error('Error syncing updated profile:', syncError)
      }
    }
    
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 