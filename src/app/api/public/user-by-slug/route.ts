import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const res = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.full_name, u.location, u.avatar_url, u.phone, u.bio, u.position, u.gender, u.gender_custom, u.birthday, u.created_at, u.updated_at, u.slug, u.username,
       aar.overall_score as resume_score, aar.key_strengths, aar.strengths_analysis, aar.ats_compatibility_score, aar.content_quality_score, aar.professional_presentation_score, aar.skills_alignment_score,
       aar.improvements, aar.recommendations, aar.improved_summary, aar.salary_analysis, aar.career_path, aar.section_analysis,
       uws.current_employer, uws.current_position, uws.current_salary, uws.notice_period_days, uws.current_mood, uws.work_status, uws.preferred_shift, uws.expected_salary, uws.work_setup
       FROM users u
       LEFT JOIN ai_analysis_results aar ON u.id = aar.user_id
       LEFT JOIN user_work_status uws ON u.id = uws.user_id
       WHERE u.slug = $1 LIMIT 1`,
      [slug]
    )

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = res.rows[0]
    
    // Get game completion data - only if user exists
    let completedGames = 0
    try {
      const gameCompletionRes = await pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM bpoc_cultural_sessions WHERE user_id = $1) +
          (SELECT COUNT(*) FROM disc_personality_sessions WHERE user_id = $1) +
          (SELECT COUNT(*) FROM typing_hero_sessions WHERE user_id = $1) +
          (SELECT COUNT(*) FROM ultimate_sessions WHERE user_id = $1) as total_sessions`,
        [user.id]
      )
      
      // Count how many different game types the user has played
      const gameTypesRes = await pool.query(
        `SELECT 
          CASE WHEN EXISTS(SELECT 1 FROM bpoc_cultural_sessions WHERE user_id = $1) THEN 1 ELSE 0 END +
          CASE WHEN EXISTS(SELECT 1 FROM disc_personality_sessions WHERE user_id = $1) THEN 1 ELSE 0 END +
          CASE WHEN EXISTS(SELECT 1 FROM typing_hero_sessions WHERE user_id = $1) THEN 1 ELSE 0 END +
          CASE WHEN EXISTS(SELECT 1 FROM ultimate_sessions WHERE user_id = $1) THEN 1 ELSE 0 END as completed_games`,
        [user.id]
      )
      
      completedGames = gameTypesRes.rows[0]?.completed_games || 0
    } catch (gameError) {
      console.log('Game sessions tables might not exist:', gameError)
      // If game sessions tables don't exist, just use 0
      completedGames = 0
    }

    const totalGames = 4 // Total number of available games

    // Get game stats data
    let gameStats = {
      bpoc_cultural_stats: null,
      disc_personality_stats: null,
      typing_hero_stats: null,
      ultimate_stats: null
    }

    try {
      // Fetch BPOC Cultural Stats
      const bpocStatsRes = await pool.query(
        'SELECT * FROM bpoc_cultural_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      gameStats.bpoc_cultural_stats = bpocStatsRes.rows[0] || null

      // Fetch DISC Personality Stats
      const discStatsRes = await pool.query(
        'SELECT * FROM disc_personality_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      gameStats.disc_personality_stats = discStatsRes.rows[0] || null

      // Fetch Typing Hero Stats
      const typingStatsRes = await pool.query(
        'SELECT * FROM typing_hero_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      gameStats.typing_hero_stats = typingStatsRes.rows[0] || null

      // Fetch Ultimate Stats
      const ultimateStatsRes = await pool.query(
        'SELECT * FROM ultimate_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      gameStats.ultimate_stats = ultimateStatsRes.rows[0] || null

      // Fetch BPOC Cultural Results (contains hire recommendation and writing score)
      const bpocResultsRes = await pool.query(
        'SELECT result_json FROM bpoc_cultural_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      )
      gameStats.bpoc_cultural_results = bpocResultsRes.rows[0]?.result_json || null

    } catch (gameStatsError) {
      console.log('Game stats tables might not exist:', gameStatsError)
      // If game stats tables don't exist, keep null values
    }

    return NextResponse.json({ 
      user: {
        ...user,
        completed_games: completedGames,
        total_games: totalGames,
        game_stats: gameStats
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


