import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      startedAt,
      finishedAt,
      durationMs,
      difficulty,
      triage_score,
      correct_priority_pct,
      sla_adherence_pct,
      avg_decision_ms,
      false_positives,
      false_negatives,
      decisions
    } = body || {}

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const insertSql = `
        INSERT INTO inbox_zero_sessions (
          user_id, started_at, finished_at, duration_ms, difficulty,
          triage_score, correct_priority_pct, sla_adherence_pct,
          avg_decision_ms, false_positives, false_negatives, decisions
        ) VALUES (
          $1, $2, $3, $4, $5::game_difficulty_enum,
          $6, $7, $8, $9, $10, $11, COALESCE($12, '[]'::jsonb)
        ) RETURNING id`

      // Coerce values safely
      const n = (v: any) => (typeof v === 'number' && isFinite(v) ? v : null)

      await client.query(insertSql, [
        userId,
        startedAt ? new Date(startedAt) : new Date(),
        finishedAt ? new Date(finishedAt) : new Date(),
        n(durationMs),
        difficulty ?? null,
        n(triage_score),
        n(correct_priority_pct),
        n(sla_adherence_pct),
        n(avg_decision_ms),
        n(false_positives),
        n(false_negatives),
        decisions ? JSON.stringify(decisions) : null,
      ])

      const upsertStats = `
        WITH agg AS (
          SELECT 
            COUNT(*)::int AS total_sessions,
            COUNT(*)::int AS completed_sessions,
            MAX(started_at) AS last_played_at,
            MAX(triage_score)::int AS best_triage_score,
            AVG(avg_decision_ms)::int AS avg_decision_ms,
            AVG(COALESCE(correct_priority_pct,0))::numeric(5,2) AS correct_priority_pct,
            AVG(COALESCE(sla_adherence_pct,0))::numeric(5,2) AS sla_adherence_pct
          FROM inbox_zero_sessions
          WHERE user_id = $1
        ),
        bests AS (
          SELECT user_id, MAX(triage_score) AS best
          FROM inbox_zero_sessions
          WHERE triage_score IS NOT NULL
          GROUP BY user_id
        ),
        pct AS (
          SELECT CASE WHEN COUNT(*) = 0 THEN NULL
                      ELSE (COUNT(*) FILTER (WHERE best <= (SELECT best_triage_score FROM agg)))::numeric / COUNT(*)
                 END AS p
          FROM bests
        )
        INSERT INTO inbox_zero_stats (
          user_id, total_sessions, completed_sessions, last_played_at,
          best_triage_score, correct_priority_pct, sla_adherence_pct, avg_decision_ms,
          percentile, created_at, updated_at
        )
        SELECT $1, total_sessions, completed_sessions, last_played_at,
               best_triage_score, correct_priority_pct, sla_adherence_pct, avg_decision_ms,
               CASE WHEN (SELECT p FROM pct) IS NULL THEN NULL ELSE ROUND((SELECT p FROM pct) * 100, 2) END,
               NOW(), NOW()
        FROM agg
        ON CONFLICT (user_id)
        DO UPDATE SET
          total_sessions = EXCLUDED.total_sessions,
          completed_sessions = EXCLUDED.completed_sessions,
          last_played_at = EXCLUDED.last_played_at,
          best_triage_score = EXCLUDED.best_triage_score,
          correct_priority_pct = EXCLUDED.correct_priority_pct,
          sla_adherence_pct = EXCLUDED.sla_adherence_pct,
          avg_decision_ms = EXCLUDED.avg_decision_ms,
          percentile = EXCLUDED.percentile,
          updated_at = NOW()`

      await client.query(upsertStats, [userId])

      await client.query('COMMIT')
      return NextResponse.json({ success: true })
    } catch (e) {
      await client.query('ROLLBACK')
      console.error('Failed to save inbox zero session', e)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (e) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}


