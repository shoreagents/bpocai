import { User } from '@supabase/supabase-js'

export const syncUserToDatabase = async (user: User) => {
  try {
    const metadata = user.user_metadata || {}
    const { firstName, lastName } = parseFullName(metadata.full_name || user.email || '')
    
         const userData = {
       id: user.id,
       email: user.email || '',
       first_name: metadata.first_name || firstName,
       last_name: metadata.last_name || lastName,
       full_name: `${metadata.first_name || firstName} ${metadata.last_name || lastName}`.trim(),
       location: metadata.location || '',
       avatar_url: null, // Don't sync avatar_url from Supabase - let Railway preserve its own value
       phone: metadata.phone || '',
       bio: metadata.bio || '',
       position: metadata.position || ''
     }

    console.log('Syncing user data to Railway:', userData)

    const response = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to sync user data')
    }

    const result = await response.json()
    console.log('User sync successful:', result)
    return result
  } catch (error) {
    console.error('Error syncing user to database:', error)
    throw error
  }
}

const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' }
  }
  const trimmedName = fullName.trim()
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0)
  if (nameParts.length === 0) { return { firstName: '', lastName: '' } }
  if (nameParts.length === 1) { return { firstName: nameParts[0], lastName: '' } }
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')
  return { firstName, lastName }
} 