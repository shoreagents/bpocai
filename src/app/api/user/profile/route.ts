import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET - Fetch user profile from Railway
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔍 API: Fetching profile for user:', userId)

    const query = `
      SELECT id, email, first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday, created_at, updated_at
      FROM users 
      WHERE id = $1
    `
    const result = await pool.query(query, [userId])

    if (result.rows.length === 0) {
      console.log('❌ API: User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]
    console.log('✅ API: User profile loaded:', {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      phone: user.phone,
      bio: user.bio,
      position: user.position,
      completed_data: user.completed_data,
      birthday: user.birthday,
      created_at: user.created_at,
      updated_at: user.updated_at
    })
    console.log('🔍 API: Raw database result:', user)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('❌ API: Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user profile in Railway
export async function PUT(request: NextRequest) {
  try {
    const { userId, ...updateData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔄 API: Updating profile for user:', userId)
    console.log('📊 API: Update data received:', updateData)

    // Load existing values to avoid overwriting with nulls when not provided
    const existingRes = await pool.query(
      `SELECT first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday FROM users WHERE id = $1`,
      [userId]
    )

    if (existingRes.rows.length === 0) {
      console.log('❌ API: User not found for update:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = existingRes.rows[0]

    const firstName = updateData.first_name ?? existing.first_name
    const lastName = updateData.last_name ?? existing.last_name
    const location = updateData.location ?? existing.location
    const avatarUrl = updateData.avatar_url ?? existing.avatar_url
    const phone = updateData.phone ?? existing.phone
    const bio = updateData.bio ?? existing.bio
    const position = updateData.position ?? existing.position

    // Handle completed_data and birthday, preserving ability to clear birthday
    const completedData = Object.prototype.hasOwnProperty.call(updateData, 'completed_data')
      ? updateData.completed_data
      : existing.completed_data
    const birthday = Object.prototype.hasOwnProperty.call(updateData, 'birthday')
      ? updateData.birthday
      : existing.birthday

    // Recompute full_name from first/last when applicable, otherwise keep existing
    const recomputedFullName = `${firstName || ''} ${lastName || ''}`.trim()
    const fullName = recomputedFullName || existing.full_name

    const query = `
      UPDATE users 
      SET first_name = $2, last_name = $3, full_name = $4, location = $5, 
          avatar_url = $6, phone = $7, bio = $8, position = $9, completed_data = $10, birthday = $11, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `
    const result = await pool.query(query, [
      userId,
      firstName,
      lastName,
      fullName,
      location,
      avatarUrl,
      phone,
      bio,
      position,
      completedData,
      birthday
    ])

    if (result.rows.length === 0) {
      console.log('❌ API: User not found for update:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = result.rows[0]
    console.log('✅ API: User profile updated:', {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      avatar_url: updatedUser.avatar_url
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('❌ API: Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 