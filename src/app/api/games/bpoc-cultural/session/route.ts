import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      startedAt,
      finishedAt,
      durationMs,
      stageReached,
      challengeCompleted,
      gameState,
      timeLeft,
      survivalStatus,
      interactionCount,
      usScore,
      ukScore,
      auScore,
      caScore,
      tierName,
      tierDescription,
      achievements,
      metrics
    } = body || {}

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert session data
      const insertSessionSql = `
        INSERT INTO bpoc_cultural_sessions (
          user_id, started_at, finished_at, duration_ms,
          stage_reached, challenge_completed, game_state,
          time_left, survival_status, interaction_count,
          us_score, uk_score, au_score, ca_score,
          tier_name, tier_description, achievements, metrics
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING id
      `

      const sessionResult = await client.query(insertSessionSql, [
        userId,
        startedAt ? new Date(startedAt) : new Date(),
        finishedAt ? new Date(finishedAt) : new Date(),
        typeof durationMs === 'number' ? durationMs : null,
        Number.isFinite(stageReached) ? stageReached : null,
        Number.isFinite(challengeCompleted) ? challengeCompleted : null,
        gameState || null,
        Number.isFinite(timeLeft) ? timeLeft : null,
        Number.isFinite(survivalStatus) ? survivalStatus : null,
        Number.isFinite(interactionCount) ? interactionCount : null,
        Number.isFinite(usScore) ? usScore : null,
        Number.isFinite(ukScore) ? ukScore : null,
        Number.isFinite(auScore) ? auScore : null,
        Number.isFinite(caScore) ? caScore : null,
        tierName || null,
        tierDescription || null,
        achievements ? JSON.stringify(achievements) : '[]',
        metrics ? JSON.stringify(metrics) : '{}'
      ])

      // Calculate averages and update stats
      const avgScoresSql = `
        SELECT 
          AVG(us_score) as avg_us,
          AVG(uk_score) as avg_uk,
          AVG(au_score) as avg_au,
          AVG(ca_score) as avg_ca,
          AVG(duration_ms) as avg_duration,
          AVG(interaction_count) as avg_interactions,
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN game_state = 'results' THEN 1 END) as completed_sessions,
          MAX(started_at) as last_played_at,
          MAX(survival_status) as best_survival,
          MAX((us_score + uk_score + au_score + ca_score) / 4.0) as best_avg_score,
          MAX(stage_reached) as highest_stage
        FROM bpoc_cultural_sessions 
        WHERE user_id = $1
      `

      const avgResult = await client.query(avgScoresSql, [userId])
      const stats = avgResult.rows[0]

      // Get all unique achievements across all sessions
      const achievementsSql = `
        SELECT DISTINCT jsonb_array_elements_text(achievements) as achievement
        FROM bpoc_cultural_sessions 
        WHERE user_id = $1 AND achievements != '[]'::jsonb
      `
      const achievementsResult = await client.query(achievementsSql, [userId])
      const uniqueAchievements = achievementsResult.rows.map(row => row.achievement)

      // Upsert stats
      const upsertStatsSql = `
        INSERT INTO bpoc_cultural_stats (
          user_id, total_sessions, completed_sessions, last_played_at,
          best_survival_status, best_average_score, highest_stage_reached,
          avg_us_score, avg_uk_score, avg_au_score, avg_ca_score,
          avg_duration_ms, avg_interaction_count, total_achievements,
          unique_achievements, current_tier, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          total_sessions = EXCLUDED.total_sessions,
          completed_sessions = EXCLUDED.completed_sessions,
          last_played_at = EXCLUDED.last_played_at,
          best_survival_status = GREATEST(bpoc_cultural_stats.best_survival_status, EXCLUDED.best_survival_status),
          best_average_score = GREATEST(bpoc_cultural_stats.best_average_score, EXCLUDED.best_average_score),
          highest_stage_reached = GREATEST(bpoc_cultural_stats.highest_stage_reached, EXCLUDED.highest_stage_reached),
          avg_us_score = EXCLUDED.avg_us_score,
          avg_uk_score = EXCLUDED.avg_uk_score,
          avg_au_score = EXCLUDED.avg_au_score,
          avg_ca_score = EXCLUDED.avg_ca_score,
          avg_duration_ms = EXCLUDED.avg_duration_ms,
          avg_interaction_count = EXCLUDED.avg_interaction_count,
          total_achievements = EXCLUDED.total_achievements,
          unique_achievements = EXCLUDED.unique_achievements,
          current_tier = EXCLUDED.current_tier,
          updated_at = NOW()
      `

      await client.query(upsertStatsSql, [
        userId,
        parseInt(stats.total_sessions) || 0,
        parseInt(stats.completed_sessions) || 0,
        stats.last_played_at || null,
        Number.isFinite(stats.best_survival) ? stats.best_survival : null,
        Number.isFinite(stats.best_avg_score) ? parseFloat(stats.best_avg_score) : null,
        Number.isFinite(stats.highest_stage) ? stats.highest_stage : null,
        Number.isFinite(stats.avg_us) ? parseFloat(stats.avg_us) : null,
        Number.isFinite(stats.avg_uk) ? parseFloat(stats.avg_uk) : null,
        Number.isFinite(stats.avg_au) ? parseFloat(stats.avg_au) : null,
        Number.isFinite(stats.avg_ca) ? parseFloat(stats.avg_ca) : null,
        Number.isFinite(stats.avg_duration) ? parseInt(stats.avg_duration) : null,
        Number.isFinite(stats.avg_interactions) ? parseFloat(stats.avg_interactions) : null,
        uniqueAchievements.length,
        JSON.stringify(uniqueAchievements),
        tierName || null
      ])

      await client.query('COMMIT')
      return NextResponse.json({ 
        success: true, 
        sessionId: sessionResult.rows[0].id 
      })

    } catch (e) {
      await client.query('ROLLBACK')
      console.error('Failed to save BPOC Cultural session', e)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    } finally {
      client.release()
    }

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
