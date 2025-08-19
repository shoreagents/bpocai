import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
	const isProduction = process.env.NODE_ENV === 'production'
	const baseUrl = isProduction 
		? (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bpoc.io')
		: 'http://localhost:3000'
	
	console.log('🔗 Google OAuth redirect URL (supabase.ts):', `${baseUrl}/auth/callback`)
	
	return await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${baseUrl}/auth/callback`
		}
	})
}

export const signOut = async () => {
	try {
		console.log('🚪 Starting comprehensive sign out...')
		
		// Clear browser storage
		if (typeof window !== 'undefined') {
			// Clear localStorage items
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
			return { error }
		}
		
		console.log('✅ Sign out successful')
		return { error: null }
		
	} catch (error) {
		console.error('❌ Sign out failed:', error)
		return { error }
	}
}

export const getCurrentUser = () => {
	return supabase.auth.getUser()
}

export const getSession = () => {
	return supabase.auth.getSession()
}

// Password reset helpers
export const requestPasswordReset = async (email: string) => {
	const isProduction = process.env.NODE_ENV === 'production'
	const baseUrl = isProduction 
		? (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bpoc.io')
		: 'http://localhost:3000'
	const redirectTo = `${baseUrl}/reset-password`
	return await supabase.auth.resetPasswordForEmail(email, { redirectTo })
}

export const updatePassword = async (newPassword: string, accessToken?: string) => {
	if (!accessToken) {
		return await supabase.auth.updateUser({ password: newPassword })
	}
	// Use a temporary client with the provided access token
	const temp = createClient(supabaseUrl, supabaseAnonKey, {
		global: { headers: { Authorization: `Bearer ${accessToken}` } }
	})
	return await temp.auth.updateUser({ password: newPassword })
} 