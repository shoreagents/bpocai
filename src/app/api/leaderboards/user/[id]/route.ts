import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = await Promise.resolve(params)
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    console.log('🔍 Fetching user breakdown for:', userId)

    // Get user's leaderboard data from the new unified system
    const leaderboardRes = await pool.query(`
      SELECT 
        user_id,
        overall_score,
        typing_hero_score,
        disc_personality_score,
        profile_completion_score,
        resume_building_score,
        application_activity_score,
        tier,
        rank_position,
        metrics,
        updated_at,
        last_activity_at
      FROM user_leaderboard_scores
      WHERE user_id = $1
    `, [userId])

    if (leaderboardRes.rows.length === 0) {
      // Return default/empty data instead of 404 error
      return NextResponse.json({
        user_id: userId,
        overall_score: 0,
        typing_hero_score: 0,
        disc_personality_score: 0,
        profile_completion_score: 0,
        resume_building_score: 0,
        application_activity_score: 0,
        tier: 'Bronze',
        rank_position: 0,
        metrics: {},
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        engagement: {
          items: [],
          total: 0
        },
        games: {
          typing_hero: null,
          disc_personality: null
        },
        applications: {
          total: 0,
          by_status: {}
        }
      })
    }

    const leaderboardData = leaderboardRes.rows[0]

    // Get user's detailed game stats with error handling
    let typingStats = { rows: [] }
    let discStats = { rows: [] }
    
    try {
      [typingStats, discStats] = await Promise.all([
        pool.query(`
          SELECT 
            best_wpm, best_accuracy, total_sessions, total_time_spent,
            created_at, updated_at
          FROM typing_hero_stats 
          WHERE user_id = $1
        `, [userId]),
        pool.query(`
          SELECT 
            best_confidence_score, completed_sessions, latest_primary_type,
            created_at, updated_at
          FROM disc_personality_stats 
          WHERE user_id = $1
        `, [userId])
      ])
    } catch (error) {
      console.log('⚠️ Game stats tables may not exist, using empty data:', error)
      // Continue with empty data
    }

    // Get user's application details with error handling
    let applicationsRes = { rows: [] }
    try {
      applicationsRes = await pool.query(`
        SELECT 
          job_id, status, created_at, updated_at
        FROM applications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId])
    } catch (error) {
      console.log('⚠️ Applications table may not exist, using empty data:', error)
      // Continue with empty data
    }

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

    const applicationItems = applicationsRes.rows.map((r: any) => ({
      job_id: r.job_id,
      status: r.status,
      points: statusPoints[r.status] ?? 0,
      created_at: r.created_at,
      updated_at: r.updated_at
    }))

    // Get user's profile completion details with error handling
    let userRes = { rows: [] }
    try {
      userRes = await pool.query(`
        SELECT 
          first_name, last_name, username, email, phone, bio, 
          avatar_url, location, birthday, gender, position,
          completed_data, created_at, updated_at
        FROM users 
        WHERE id = $1
      `, [userId])
    } catch (error) {
      console.log('⚠️ Users table query failed, using empty data:', error)
      // Continue with empty data
    }

    const user = userRes.rows[0] || {}
    
    // Calculate profile completion breakdown
    const profileItems = [
      { label: 'First Name', completed: !!user.first_name, points: 10 },
      { label: 'Last Name', completed: !!user.last_name, points: 10 },
      { label: 'Username', completed: !!user.username, points: 10 },
      { label: 'Email', completed: !!user.email, points: 10 },
      { label: 'Phone', completed: !!user.phone, points: 10 },
      { label: 'Bio (20+ chars)', completed: !!(user.bio && user.bio.length > 20), points: 10 },
      { label: 'Avatar', completed: !!user.avatar_url, points: 10 },
      { label: 'Location', completed: !!user.location, points: 10 },
      { label: 'Birthday', completed: !!user.birthday, points: 10 },
      { label: 'Work Status Completed', completed: !!user.completed_data, points: 20 }
    ]

    // Get resume building details
    const [resumeRes, aiAnalysisRes] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as resume_count, MAX(created_at) as last_created
        FROM saved_resumes 
        WHERE user_id = $1
      `, [userId]),
      pool.query(`
        SELECT 
          overall_score, ats_compatibility_score, content_quality_score,
          professional_presentation_score, skills_alignment_score,
          created_at, updated_at
        FROM ai_analysis_results 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId])
    ])

    const resumeCount = Number(resumeRes.rows[0]?.resume_count || 0)
    const aiAnalysis = aiAnalysisRes.rows[0] || {}

    const resumeItems = [
      { 
        label: 'Resumes Created', 
        completed: resumeCount > 0, 
        points: resumeCount > 0 ? 20 : 0,
        details: `${resumeCount} resume(s) created`
      },
      { 
        label: 'AI Analysis Score', 
        completed: !!aiAnalysis.overall_score, 
        points: aiAnalysis.overall_score ? Math.round(aiAnalysis.overall_score * 0.8) : 0,
        details: aiAnalysis.overall_score ? `${aiAnalysis.overall_score}% overall score` : 'No analysis'
      }
    ]

    return NextResponse.json({
      // Overall leaderboard data
      overall: {
        overall_score: leaderboardData.overall_score,
        tier: leaderboardData.tier,
        rank_position: leaderboardData.rank_position,
        last_activity_at: leaderboardData.last_activity_at,
        updated_at: leaderboardData.updated_at
      },
      
      // Component scores
      components: {
        typing_hero: {
          score: leaderboardData.typing_hero_score,
          details: typingStats.rows[0] ? {
            best_wpm: typingStats.rows[0].best_wpm,
            best_accuracy: typingStats.rows[0].best_accuracy,
            total_sessions: typingStats.rows[0].total_sessions,
            total_time_spent: typingStats.rows[0].total_time_spent
          } : null
        },
        disc_personality: {
          score: leaderboardData.disc_personality_score,
          details: discStats.rows[0] ? {
            best_confidence_score: discStats.rows[0].best_confidence_score,
            completed_sessions: discStats.rows[0].completed_sessions,
            latest_primary_type: discStats.rows[0].latest_primary_type
          } : null
        },
        profile_completion: {
          score: leaderboardData.profile_completion_score,
          items: profileItems
        },
        resume_building: {
          score: leaderboardData.resume_building_score,
          items: resumeItems,
          ai_analysis: aiAnalysis
        },
        application_activity: {
          score: leaderboardData.application_activity_score,
          total_applications: applicationsRes.rows.length,
          items: applicationItems
        }
      },

      // Raw metrics from the database
      metrics: leaderboardData.metrics,
      
      // System info
      system: 'new_unified',
      description: 'Unified leaderboard system with 5 weighted components'
    })

  } catch (error) {
    console.error('❌ User breakdown error:', error)
    return NextResponse.json({ 
      error: 'Failed to load user breakdown',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}