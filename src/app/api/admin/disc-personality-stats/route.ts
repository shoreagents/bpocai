import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('DISC Personality Stats API called')
    
    const result = await pool.query(`
      SELECT
        dps.id,
        dps.user_id,
        dps.total_sessions,
        dps.completed_sessions,
        dps.last_taken_at,
        dps.d,
        dps.i,
        dps.s,
        dps.c,
        dps.primary_style,
        dps.secondary_style,
        dps.consistency_index,
        dps.percentile,
        dps.created_at,
        dps.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        u.avatar_url as user_avatar
      FROM disc_personality_stats dps
      LEFT JOIN users u ON dps.user_id = u.id
      ORDER BY dps.last_taken_at DESC NULLS LAST, dps.created_at DESC
    `)

    const transformedStats = result.rows.map((stat: any) => ({
      id: stat.id,
      user_id: stat.user_id,
      total_sessions: stat.total_sessions || 0,
      completed_sessions: stat.completed_sessions || 0,
      last_taken_at: stat.last_taken_at,
      d: stat.d || 0,
      i: stat.i || 0,
      s: stat.s || 0,
      c: stat.c || 0,
      primary_style: stat.primary_style || 'N/A',
      secondary_style: stat.secondary_style || 'N/A',
      consistency_index: stat.consistency_index || 0,
      percentile: stat.percentile || 0,
      created_at: stat.created_at,
      updated_at: stat.updated_at,
      user_name: stat.user_name || 'Unknown User',
      user_email: stat.user_email || 'No Email',
      user_avatar: stat.user_avatar
    }))

    console.log('DISC API - Raw rows:', result.rows.length)
    console.log('DISC API - Transformed stats:', transformedStats.length)

    return NextResponse.json({
      stats: transformedStats,
      total: transformedStats.length,
      active_players: transformedStats.filter((s: any) => s.last_taken_at && new Date(s.last_taken_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      total_assessments: transformedStats.length
    })

  } catch (error) {
    console.error('Error in DISC personality stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
