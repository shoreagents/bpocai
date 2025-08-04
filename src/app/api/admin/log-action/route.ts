import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pool from '@/lib/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { action, details } = await request.json()
    
    // Get user from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminQuery = `
      SELECT id FROM users 
      WHERE id = $1 AND is_admin = true
    `
    const adminResult = await pool.query(adminQuery, [user.id])
    
    if (adminResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not admin' }, { status: 403 })
    }

    const userId = adminResult.rows[0].id
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Log the action
    const logQuery = `
      SELECT log_admin_action($1, $2, $3, $4)
    `
    await pool.query(logQuery, [userId, action, details, ipAddress])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging admin action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 