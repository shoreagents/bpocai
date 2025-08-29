import pool from './database'

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string
  phone?: string
  bio?: string
  position?: string
  completed_data?: boolean
  birthday?: string | null
}

export const syncUserToDatabaseServer = async (userData: UserData) => {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Syncing user to Railway database:', userData.id)
    
    // Generate full_name from first_name and last_name
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE id = $1'
    const checkResult = await client.query(checkQuery, [userData.id])
    
    if (checkResult.rows.length > 0) {
      // Update existing user
      console.log('📝 Updating existing user in Railway')
      
      // Get existing user data to preserve avatar_url if not provided
      const existingUserQuery = 'SELECT avatar_url FROM users WHERE id = $1'
      const existingUserResult = await client.query(existingUserQuery, [userData.id])
      const existingAvatarUrl = existingUserResult.rows[0]?.avatar_url
      
             // Always preserve existing avatar_url from Railway - don't overwrite with Supabase data
       const avatarUrl = existingAvatarUrl
      
      const updateQuery = `
        UPDATE users 
        SET email = $2, first_name = $3, last_name = $4, full_name = $5, 
            location = $6, avatar_url = $7, phone = $8, bio = $9, position = $10, 
            completed_data = COALESCE($11, completed_data), birthday = COALESCE($12, birthday), updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
      const updateResult = await client.query(updateQuery, [
        userData.id,
        userData.email,
        userData.first_name || '',
        userData.last_name || '',
        fullName || '',
        userData.location || '',
        avatarUrl,
        userData.phone || null,
        userData.bio || null,
        userData.position || null,
        userData.completed_data ?? null,
        userData.birthday ?? null
      ])
      
      console.log('✅ User updated in Railway:', updateResult.rows[0])
      return { success: true, action: 'updated', user: updateResult.rows[0] }
    } else {
      // Insert new user
      console.log('➕ Inserting new user in Railway')
      const insertQuery = `
        INSERT INTO users (id, email, first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, false), $12)
        RETURNING *
      `
      const insertResult = await client.query(insertQuery, [
        userData.id,
        userData.email,
        userData.first_name || '',
        userData.last_name || '',
        fullName || '',
        userData.location || '',
        userData.avatar_url || null,
        userData.phone || null,
        userData.bio || null,
        userData.position || null,
        userData.completed_data ?? null,
        userData.birthday ?? null
      ])
      
      console.log('✅ User inserted in Railway:', insertResult.rows[0])
      return { success: true, action: 'inserted', user: insertResult.rows[0] }
    }
  } catch (error) {
    console.error('❌ Error syncing user to Railway:', error)
    throw error
  } finally {
    client.release()
  }
} 