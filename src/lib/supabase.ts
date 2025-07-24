import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const signUp = async (email: string, password: string, metadata?: any) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const signInWithGoogle = async () => {
  // Determine the correct redirect URL based on environment
  const isProduction = window.location.href.includes('railway.app') || 
                       window.location.href.includes('production')
  
  const redirectTo = isProduction 
    ? 'https://bpocai-production.up.railway.app/auth/callback'
    : `${window.location.origin}/auth/callback`
  
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getSession = () => {
  return supabase.auth.getSession()
} 