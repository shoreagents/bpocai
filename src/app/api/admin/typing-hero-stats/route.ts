import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
             SELECT
         ths.id,
         ths.user_id,
         ths.total_sessions,
         ths.completed_sessions,
         ths.last_played_at,
         ths.best_wpm,
         ths.best_accuracy,
         ths.median_wpm,
         ths.recent_wpm,
         ths.consistency_index,
         ths.percentile,
         ths.created_at,
         ths.updated_at,
         u.full_name as user_name,
         u.email as user_email,
         u.avatar_url as user_avatar
      FROM typing_hero_stats ths
      LEFT JOIN users u ON ths.user_id = u.id
      ORDER BY ths.last_played_at DESC NULLS LAST, ths.created_at DESC
    `)

         const transformedStats = result.rows.map((stat: any) => ({
       id: stat.id,
       user_id: stat.user_id,
       total_sessions: stat.total_sessions || 0,
       completed_sessions: stat.completed_sessions || 0,
       last_played_at: stat.last_played_at,
       best_wpm: stat.best_wpm,
       best_accuracy: stat.best_accuracy,
       median_wpm: stat.median_wpm,
       recent_wpm: stat.recent_wpm,
       consistency_index: stat.consistency_index,
       percentile: stat.percentile,
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
    console.error('Error in typing hero stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
