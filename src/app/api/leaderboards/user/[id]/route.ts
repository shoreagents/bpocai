import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await Promise.resolve(params)
    const source = new URL(_request.url).searchParams.get('source') || 'tables'
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Overall components (live or tables)
    let overallData: any = null
    if (source === 'live') {
      const gameNormRes = await pool.query(
        `WITH per_game_max AS (
           SELECT game_id, MAX(best_score) AS max_score
           FROM leaderboard_game_scores
           WHERE period = 'all'
           GROUP BY game_id
         ), per_user_game_norm AS (
           SELECT l.user_id,
                  AVG(100.0 * l.best_score / NULLIF(m.max_score,0)) AS game_norm
           FROM leaderboard_game_scores l
           JOIN per_game_max m ON m.game_id = l.game_id
           WHERE l.period = 'all' AND l.user_id = $1
           GROUP BY l.user_id
         ), app AS (
           SELECT score FROM leaderboard_applicant_scores WHERE period = 'all' AND user_id = $1
         ), app_max AS (
           SELECT MAX(score) AS max_app FROM leaderboard_applicant_scores WHERE period = 'all'
         ), eng AS (
           SELECT score FROM leaderboard_engagement_scores WHERE period = 'all' AND user_id = $1
         ), eng_max AS (
           SELECT MAX(score) AS max_eng FROM leaderboard_engagement_scores WHERE period = 'all'
         )
         SELECT 
           COALESCE((SELECT game_norm FROM per_user_game_norm), 0) AS game_norm,
           100.0 * COALESCE((SELECT score FROM app), 0) / NULLIF((SELECT max_app FROM app_max),0) AS applicant_norm,
           100.0 * COALESCE((SELECT score FROM eng), 0) / NULLIF((SELECT max_eng FROM eng_max),0) AS engagement_norm`,
        [userId]
      )
      const g = gameNormRes.rows[0] || { game_norm: 0, applicant_norm: 0, engagement_norm: 0 }
      const overall = Math.round(0.6 * (g.game_norm || 0) + 0.3 * (g.applicant_norm || 0) + 0.1 * (g.engagement_norm || 0))
      overallData = { overall_score: overall, game_norm: g.game_norm || 0, applicant_norm: g.applicant_norm || 0, engagement_norm: g.engagement_norm || 0 }
    } else {
      const overallRes = await pool.query(
        `SELECT overall_score, game_norm, applicant_norm, engagement_norm
         FROM leaderboard_overall_scores
         WHERE user_id = $1`,
        [userId]
      )
      overallData = overallRes.rows[0] || null
    }

    // Applications details (per job current status -> points)
    const appsRes = await pool.query(
      `SELECT job_id, status, created_at FROM applications WHERE user_id = $1`,
      [userId]
    )
    const statusPoints: Record<string, number> = {
      'submitted': 5,
      'qualified': 15,
      'for verification': 20,
      'verified': 25,
      'initial interview': 35,
      'final interview': 50,
      'passed': 60,
      'hired': 100,
    }
    const applicationItems = appsRes.rows.map((r: any) => ({
      job_id: r.job_id,
      status: r.status,
      points: statusPoints[r.status] ?? 0,
      updated_at: r.created_at,
    }))
    const applicationsTotal = applicationItems.reduce((a: number, b: any) => a + (b.points || 0), 0)

    // Engagement score
    const engScoreRes = await pool.query(
      `SELECT score FROM leaderboard_engagement_scores WHERE period = 'all' AND user_id = $1`,
      [userId]
    )
    // Engagement details
    const [typing, bpoc, ultimate, disc, resumeCnt, userAvatar] = await Promise.all([
      pool.query(`SELECT 1 FROM typing_hero_sessions WHERE user_id = $1 LIMIT 1`, [userId]),
      pool.query(`SELECT 1 FROM bpoc_cultural_sessions WHERE user_id = $1 LIMIT 1`, [userId]),
      pool.query(`SELECT 1 FROM ultimate_sessions WHERE user_id = $1 LIMIT 1`, [userId]),
      pool.query(`SELECT 1 FROM disc_personality_sessions WHERE user_id = $1 LIMIT 1`, [userId]),
      pool.query(`SELECT COUNT(*)::int AS cnt FROM saved_resumes WHERE user_id = $1`, [userId]),
      pool.query(`SELECT avatar_url FROM users WHERE id = $1`, [userId]),
    ])
    const hasTyping = typing.rowCount > 0
    const hasBpoc = bpoc.rowCount > 0
    const hasUltimate = ultimate.rowCount > 0
    const hasDisc = disc.rowCount > 0
    const allGames = hasTyping && hasBpoc && hasUltimate && hasDisc
    const hasAvatar = !!(userAvatar.rows[0]?.avatar_url && String(userAvatar.rows[0]?.avatar_url).trim())
    const hasResume = Number(resumeCnt.rows[0]?.cnt || 0) > 0
    const engagementItems = [
      { label: 'Typing Hero Completed', points: hasTyping ? 5 : 0 },
      { label: 'BPOC Cultural Completed', points: hasBpoc ? 5 : 0 },
      { label: 'Ultimate Completed', points: hasUltimate ? 5 : 0 },
      { label: 'DISC Personality Completed', points: hasDisc ? 5 : 0 },
      { label: 'All 4 Games Completed', points: allGames ? 20 : 0 },
      { label: 'Avatar Uploaded (first time)', points: hasAvatar ? 5 : 0 },
      { label: 'First Resume Created', points: hasResume ? 10 : 0 },
    ]
    const engagementTotal = engagementItems.reduce((a, b) => a + b.points, 0)

    // Per-game bests (all-time) — already live enough from leaderboard table
    const gamesRes = await pool.query(
      `SELECT game_id, best_score, plays, last_played
       FROM leaderboard_game_scores
       WHERE period = 'all' AND user_id = $1
       ORDER BY game_id`,
      [userId]
    )

    return NextResponse.json({
      overall: overallData,
      applications: { total: applicationsTotal, items: applicationItems },
      engagement: { total: engScoreRes.rows[0]?.score ?? engagementTotal, items: engagementItems },
      games: gamesRes.rows || []
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load user breakdown' }, { status: 500 })
  }
}


