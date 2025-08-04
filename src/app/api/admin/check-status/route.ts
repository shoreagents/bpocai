import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check if user is admin in the Railway users table
    const query = `
      SELECT id, email, full_name, is_admin, admin_level, avatar_url 
      FROM users 
      WHERE id = $1 AND is_admin = true
    `
    const result = await pool.query(query, [userId])
    
    if (result.rows.length > 0) {
      return NextResponse.json({
        isAdmin: true,
        adminUser: result.rows[0]
      })
    }

    return NextResponse.json({ isAdmin: false })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
} 