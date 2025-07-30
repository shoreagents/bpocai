import pool from './database'

// Server-side only function for syncing user to Railway database
export const syncUserToDatabaseServer = async (userData: {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string | null
}) => {
  try {
    // Insert or update user in Railway database
    await pool.query(`
      INSERT INTO users (id, email, first_name, last_name, full_name, location, avatar_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (id) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        location = EXCLUDED.location,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
    `, [
      userData.id,
      userData.email,
      userData.first_name,
      userData.last_name,
      userData.full_name,
      userData.location,
      userData.avatar_url
    ])
    
    console.log('User synced to Railway database:', userData.id)
  } catch (error) {
    console.error('Error syncing user to Railway:', error)
    throw error
  }
} 