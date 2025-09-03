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
  gender?: string | null
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
      
      // Only backfill names from Supabase if missing in Railway to avoid overwriting user edits
      const updateQuery = `
        UPDATE users u
        SET 
          email = $2,
          first_name = CASE WHEN (u.first_name IS NULL OR u.first_name = '') THEN $3 ELSE u.first_name END,
          last_name  = CASE WHEN (u.last_name  IS NULL OR u.last_name  = '') THEN $4 ELSE u.last_name  END,
          full_name  = CASE WHEN (u.full_name  IS NULL OR u.full_name  = '') THEN $5 ELSE u.full_name  END,
          updated_at = NOW()
        WHERE u.id = $1
        RETURNING *
      `
      const updateResult = await client.query(updateQuery, [
        userData.id,
        userData.email,
        userData.first_name || '',
        userData.last_name || '',
        fullName || ''
      ])
      
      console.log('✅ User updated in Railway (non-destructive):', updateResult.rows[0])
      return { success: true, action: 'updated', user: updateResult.rows[0] }
    } else {
      // Insert new user
      console.log('➕ Inserting new user in Railway')
      const insertQuery = `
        INSERT INTO users (id, email, first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, false), $12, $13)
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
        userData.birthday ?? null,
        userData.gender ?? null
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