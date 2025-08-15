import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('Ultimate API: Starting database query...')
    const result = await pool.query(`
      SELECT
        us.id,
        us.user_id,
        us.total_sessions,
        us.completed_sessions,
        us.last_played_at,
        us.leadership,
        us.crisis_mgmt,
        us.integrity,
        us.communications,
        us.analysis,
        us.overall,
        us.pass_level,
        us.percentile,
        us.created_at,
        us.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar
      FROM ultimate_stats us
      LEFT JOIN users u ON us.user_id = u.id
      ORDER BY us.last_played_at DESC NULLS LAST, us.created_at DESC
    `)

    console.log('Ultimate API: Query result rows:', result.rows.length)
    console.log('Ultimate API: First row sample:', result.rows[0])

    const transformedStats = result.rows.map((stat: any) => ({
      id: stat.id,
      user_id: stat.user_id,
      total_sessions: stat.total_sessions || 0,
      completed_sessions: stat.completed_sessions || 0,
      last_played_at: stat.last_played_at,
      leadership: stat.leadership || 0,
      crisis_mgmt: stat.crisis_mgmt || 0,
      integrity: stat.integrity || 0,
      communications: stat.communications || 0,
      analysis: stat.analysis || 0,
      overall: stat.overall || 0,
      pass_level: stat.pass_level || 'N/A',
      percentile: stat.percentile || 0,
      created_at: stat.created_at,
      updated_at: stat.updated_at,
      user_name: stat.user_name || 'Unknown User',
      user_email: stat.user_email || 'No Email',
      user_avatar: stat.user_avatar
    }))

    return NextResponse.json({
      stats: transformedStats,
      total: transformedStats.length,
      active_players: transformedStats.filter((s: any) => s.last_played_at && new Date(s.last_played_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      total_sessions: transformedStats.reduce((sum: number, s: any) => sum + s.total_sessions, 0)
    })

  } catch (error) {
    console.error('Error in Ultimate stats API:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
