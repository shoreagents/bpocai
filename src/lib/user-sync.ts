import { supabase } from './supabase'

// This function will be called from API routes, not directly from client
export const syncUserToDatabase = async (user: any) => {
  try {
    // Extract user metadata from Supabase
    const userMetadata = user.user_metadata || {}
    
    // Call the API route to sync user to database
    const response = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        first_name: userMetadata.first_name || '',
        last_name: userMetadata.last_name || '',
        full_name: userMetadata.full_name || `${userMetadata.first_name || ''} ${userMetadata.last_name || ''}`.trim(),
        location: userMetadata.location || '',
        avatar_url: userMetadata.avatar_url || null
      })
    })

    if (!response.ok) {
      throw new Error('Failed to sync user to database')
    }
    
    console.log('User synced to database:', user.id)
  } catch (error) {
    console.error('Error syncing user:', error)
    throw error
  }
} 