import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import pool from '@/lib/database'

// GET user profile from Railway database
export async function GET(req: NextRequest) {
  try {
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from Railway database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, full_name, location, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// UPDATE user profile in Railway database
export async function PUT(req: NextRequest) {
  try {
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { first_name, last_name, full_name, location, avatar_url } = await req.json()

    // Update user profile in Railway database
    const result = await pool.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, full_name = $3, location = $4, avatar_url = $5, updated_at = NOW()
      WHERE id = $6 
      RETURNING *
    `, [first_name, last_name, full_name, location, avatar_url, user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Also update Supabase user metadata
    await supabase.auth.updateUser({
      data: {
        first_name,
        last_name,
        full_name,
        location,
        avatar_url
      }
    })

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 