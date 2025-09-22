import pool from '@/lib/database'

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  location: string
  avatar_url?: string | null
  phone?: string | null
  bio?: string | null
  position?: string | null
  company?: string | null
  completed_data?: boolean | null
  birthday?: string | null
  gender?: string | null
  admin_level?: string
}

export async function syncUserToDatabaseServer(userData: UserData) {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Starting server-side user sync for:', userData.email)
    
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE id = $1'
    const checkResult = await client.query(checkQuery, [userData.id])
    
    if (checkResult.rows.length > 0) {
      // User exists, update their data
      console.log('👤 User exists, updating data...')
      
      const updateQuery = `
        UPDATE users SET
          email = $2,
          first_name = $3,
          last_name = $4,
          full_name = $5,
          location = $6,
          avatar_url = $7,
          phone = $8,
          bio = $9,
          position = $10,
          company = $11,
          completed_data = $12,
          birthday = $13,
          gender = $14,
          admin_level = $15,
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, admin_level
      `
      
      const updateResult = await client.query(updateQuery, [
        userData.id,
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.full_name,
        userData.location,
        userData.avatar_url,
        userData.phone,
        userData.bio,
        userData.position,
        userData.company,
        userData.completed_data,
        userData.birthday,
        userData.gender,
        userData.admin_level
      ])
      
      console.log('✅ User updated successfully:', updateResult.rows[0])
      return {
        success: true,
        action: 'updated',
        user: updateResult.rows[0]
      }
      
    } else {
      // User doesn't exist, create new user
      console.log('👤 User does not exist, creating new user...')
      
      const insertQuery = `
        INSERT INTO users (
          id, email, first_name, last_name, full_name, location,
          avatar_url, phone, bio, position, company, completed_data,
          birthday, gender, admin_level, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
        )
        RETURNING id, email, first_name, last_name, admin_level
      `
      
      const insertResult = await client.query(insertQuery, [
        userData.id,
        userData.email,
        userData.first_name,
        userData.last_name,
        userData.full_name,
        userData.location,
        userData.avatar_url,
        userData.phone,
        userData.bio,
        userData.position,
        userData.company,
        userData.completed_data,
        userData.birthday,
        userData.gender,
        userData.admin_level
      ])
      
      console.log('✅ User created successfully:', insertResult.rows[0])
      return {
        success: true,
        action: 'created',
        user: insertResult.rows[0]
      }
    }
    
  } catch (error) {
    console.error('❌ Error in server-side user sync:', error)
    throw error
  } finally {
    client.release()
  }
}
