import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting to fetch users...')
    console.log('API: Database URL exists:', !!process.env.DATABASE_URL)
    
    // Fetch users from your users table using PostgreSQL
    const result = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC'
    )

    console.log('API: Raw users data:', result.rows)
    console.log('API: Number of users found:', result.rows.length)

    // Transform the data to match the expected format
    const transformedUsers = result.rows.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      last_sign_in_at: user.updated_at, // Using updated_at as last activity
      status: 'active', // All users in your table are active
      role: 'user', // Default role
      location: user.location,
      bio: user.bio,
      position: user.position
    }))

    return NextResponse.json({ 
      users: transformedUsers,
      total: transformedUsers.length,
      active: transformedUsers.filter((u: any) => u.status === 'active').length,
      inactive: transformedUsers.filter((u: any) => u.status === 'inactive').length
    })

  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, ...data } = body

    switch (action) {
      case 'update':
        // Update user in your users table using PostgreSQL
        const updateResult = await pool.query(
          'UPDATE users SET full_name = $1, email = $2, phone = $3, location = $4, bio = $5, position = $6, avatar_url = $7, updated_at = NOW() WHERE id = $8',
          [data.full_name, data.email, data.phone, data.location, data.bio, data.position, data.avatar_url, userId]
        )

        if (updateResult.rowCount === 0) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'User updated successfully' })

      case 'delete':
        // Delete user from your users table using PostgreSQL
        const deleteResult = await pool.query(
          'DELETE FROM users WHERE id = $1',
          [userId]
        )

        if (deleteResult.rowCount === 0) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'User deleted successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in users API POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 