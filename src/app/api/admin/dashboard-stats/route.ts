import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pool from '@/lib/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify admin status
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

    // Get dashboard statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM resumes) as total_resumes,
        (SELECT COUNT(*) FROM typing_hero_results) + 
        (SELECT COUNT(*) FROM task_juggler_results) + 
        (SELECT COUNT(*) FROM logic_grid_results) as total_games,
        (SELECT COUNT(*) FROM disc_personality_results) + 
        (SELECT COUNT(*) FROM communication_skills_results) as total_assessments
    `
    const statsResult = await pool.query(statsQuery)
    const stats = statsResult.rows[0]

    // Get recent admin activity
    const activityQuery = `
      SELECT aal.*, u.full_name as admin_name
      FROM admin_activity_logs aal
      JOIN users u ON aal.user_id = u.id
      ORDER BY aal.created_at DESC
      LIMIT 10
    `
    const activityResult = await pool.query(activityQuery)

    return NextResponse.json({
      total_users: parseInt(stats.total_users),
      total_resumes: parseInt(stats.total_resumes),
      total_games: parseInt(stats.total_games),
      total_assessments: parseInt(stats.total_assessments),
      recent_activity: activityResult.rows
    })
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 