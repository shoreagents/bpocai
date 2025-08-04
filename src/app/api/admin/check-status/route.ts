import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pool from '@/lib/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ isAdmin: false })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check if user is admin in the users table
    const query = `
      SELECT id, email, full_name, is_admin, admin_level 
      FROM users 
      WHERE id = $1 AND is_admin = true
    `
    const result = await pool.query(query, [user.id])
    
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