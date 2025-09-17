import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const viewerUserId = searchParams.get('viewerUserId') // Optional - if provided, check if viewing own profile
    
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Get user data
      const res = await client.query(
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
      const isOwner = viewerUserId && viewerUserId === user.id

      // Get privacy settings
      const privacyRes = await client.query(
        'SELECT * FROM privacy_settings WHERE user_id = $1',
        [user.id]
      )

      const privacySettings = privacyRes.rowCount > 0 ? privacyRes.rows[0] : {
        username: 'public',
        first_name: 'public',
        last_name: 'only-me',
        location: 'public',
        job_title: 'public',
        birthday: 'only-me',
        age: 'only-me',
        gender: 'only-me',
        member_since: 'public',
        resume_score: 'public',
        games_completed: 'public',
        key_strengths: 'only-me'
      }

      // Filter data based on privacy settings
      const filteredUser = { ...user }

      // Apply privacy filters (only if not owner)
      if (!isOwner) {
        // Personal information
        if (privacySettings.first_name === 'only-me') {
          delete filteredUser.first_name
        }
        if (privacySettings.last_name === 'only-me') {
          delete filteredUser.last_name
          delete filteredUser.full_name
        }
        if (privacySettings.location === 'only-me') {
          delete filteredUser.location
        }
        if (privacySettings.birthday === 'only-me') {
          delete filteredUser.birthday
        }
        if (privacySettings.gender === 'only-me') {
          delete filteredUser.gender
          delete filteredUser.gender_custom
        }

        // Member Since information
        if (privacySettings.member_since === 'only-me') {
          delete filteredUser.created_at
        }

        // Work information
        if (privacySettings.job_title === 'only-me') {
          delete filteredUser.position
        }

        // Analysis information
        if (privacySettings.resume_score === 'only-me') {
          delete filteredUser.resume_score
          delete filteredUser.ats_compatibility_score
          delete filteredUser.content_quality_score
          delete filteredUser.professional_presentation_score
          delete filteredUser.skills_alignment_score
        }
        if (privacySettings.key_strengths === 'only-me') {
          delete filteredUser.key_strengths
          delete filteredUser.strengths_analysis
        }

        // Always hide private fields for non-owners
        delete filteredUser.email
        delete filteredUser.phone
        delete filteredUser.current_salary
      }

      // Get game completion data - only if user exists
      let completedGames = 0
      try {
        const gameCompletionRes = await client.query(
          `SELECT 
            (SELECT COUNT(*) FROM bpoc_cultural_sessions WHERE user_id = $1) +
            (SELECT COUNT(*) FROM disc_personality_sessions WHERE user_id = $1) +
            (SELECT COUNT(*) FROM typing_hero_sessions WHERE user_id = $1) +
            (SELECT COUNT(*) FROM ultimate_sessions WHERE user_id = $1) as total_sessions`,
          [user.id]
        )
        
        // Count how many different game types the user has played
        const gameTypesRes = await client.query(
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
        completedGames = 0
      }

      // Apply privacy filter to games completed
      if (!isOwner && privacySettings.games_completed === 'only-me') {
        completedGames = 0 // Hide the count
      }

      const totalGames = 4

      // Get game stats data
      let gameStats = {
        bpoc_cultural_stats: null,
        disc_personality_stats: null,
        typing_hero_stats: null,
        ultimate_stats: null
      }

      try {
        // Only fetch game stats if user is owner or games are public
        if (isOwner || privacySettings.games_completed === 'public') {
          // Fetch BPOC Cultural Stats
          const bpocStatsRes = await client.query(
            'SELECT * FROM bpoc_cultural_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
          )
          gameStats.bpoc_cultural_stats = bpocStatsRes.rows[0] || null

          // Fetch DISC Personality Stats
          const discStatsRes = await client.query(
            'SELECT * FROM disc_personality_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
          )
          gameStats.disc_personality_stats = discStatsRes.rows[0] || null

          // Fetch Typing Hero Stats
          const typingStatsRes = await client.query(
            'SELECT * FROM typing_hero_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
          )
          gameStats.typing_hero_stats = typingStatsRes.rows[0] || null

          // Fetch Ultimate Stats
          const ultimateStatsRes = await client.query(
            'SELECT * FROM ultimate_stats WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
          )
          gameStats.ultimate_stats = ultimateStatsRes.rows[0] || null

          // Fetch BPOC Cultural Results
          const bpocResultsRes = await client.query(
            'SELECT result_json FROM bpoc_cultural_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [user.id]
          )
          gameStats.bpoc_cultural_results = bpocResultsRes.rows[0]?.result_json || null
        }
      } catch (gameStatsError) {
        console.log('Game stats tables might not exist:', gameStatsError)
      }

      return NextResponse.json({ 
        user: {
          ...filteredUser,
          completed_games: completedGames,
          total_games: totalGames,
          game_stats: gameStats,
          is_owner: isOwner
        }
      })

    } finally {
      client.release()
    }

  } catch (e) {
    console.error('Error in user-by-slug:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


