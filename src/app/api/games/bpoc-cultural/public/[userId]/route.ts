import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const client = await pool.connect()
    try {
      const latest = await client.query(
        `SELECT id, started_at, finished_at, duration_ms, survival_status, cultural_score, us_score, uk_score, au_score, ca_score
         FROM bpoc_cultural_sessions
         WHERE user_id = $1
         ORDER BY started_at DESC
         LIMIT 1`,
        [userId]
      )

      const stats = await client.query(
        `SELECT survival_status, cultural_score, us_score, uk_score, au_score, ca_score, total_sessions, best_session_score, created_at
         FROM bpoc_cultural_stats
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      )

      return NextResponse.json({
        latestSession: latest.rows[0] || null,
        stats: stats.rows[0] || null,
      })
    } finally {
      client.release()
    }
  } catch (e) {
    console.error('Failed to fetch BPOC Cultural public data', e)
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}
