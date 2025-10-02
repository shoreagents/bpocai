import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting talent search API...')
    
    // Get filter parameter from query string
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    console.log('📊 Filter requested:', filter)
    
    // Step 1: Test basic database connection
    console.log('📊 Step 1: Testing database connection...')
    try {
      const testQuery = `SELECT COUNT(*) as user_count FROM users`
      const testResult = await pool.query(testQuery)
      console.log('✅ Database connection test result:', testResult.rows[0])
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: dbError.message 
      }, { status: 500 })
    }
    
    // Step 2: Check if leaderboard_overall_scores table exists and has data
    console.log('📊 Step 2: Checking leaderboard_overall_scores table...')
    try {
      const leaderboardQuery = `SELECT COUNT(*) as score_count FROM leaderboard_overall_scores`
      const leaderboardResult = await pool.query(leaderboardQuery)
      console.log('✅ Leaderboard scores count:', leaderboardResult.rows[0])
    } catch (leaderboardError) {
      console.error('❌ Leaderboard table query failed:', leaderboardError)
      return NextResponse.json({ 
        success: false, 
        error: 'Leaderboard table not found or accessible',
        details: leaderboardError.message 
      }, { status: 500 })
    }
    
    // Step 3: Check for ALL users (not just those with scores > 50)
    console.log('📊 Step 3: Checking for ALL users with basic profile data...')
    try {
      const allUsersQuery = `
        SELECT COUNT(*) as all_users_count 
        FROM users u 
        WHERE u.full_name IS NOT NULL 
          AND u.full_name != ''
          AND u.slug IS NOT NULL
          AND u.slug != ''
      `
      const allUsersResult = await pool.query(allUsersQuery)
      console.log('✅ All users with basic profile data:', allUsersResult.rows[0])
    } catch (allUsersError) {
      console.error('❌ All users query failed:', allUsersError)
      return NextResponse.json({ 
        success: false, 
        error: 'All users query failed',
        details: allUsersError.message 
      }, { status: 500 })
    }
    
    // Step 4: Get ALL users and check their verification status
    console.log('📊 Step 4: Getting ALL users and checking verification status...')
    let result
    try {
      const fullQuery = `
        SELECT 
          u.id,
          u.full_name,
          u.position,
          u.email,
          u.avatar_url,
          u.created_at,
          u.location,
          u.completed_data,
          u.slug,
          COALESCE(los.overall_score, 0) as overall_score,
          CASE WHEN sr.id IS NOT NULL THEN true ELSE false END as has_resume,
          CASE WHEN uws.completed_data IS NOT NULL THEN uws.completed_data ELSE false END as work_status_completed,
          sr.resume_slug,
          CASE WHEN sr.id IS NOT NULL THEN 1 ELSE 0 END as resume_score,
          CASE WHEN ths.id IS NOT NULL THEN true ELSE false END as has_typing_hero,
          CASE WHEN dps.id IS NOT NULL THEN true ELSE false END as has_disc_personality
        FROM users u
        LEFT JOIN leaderboard_overall_scores los ON u.id = los.user_id
        LEFT JOIN saved_resumes sr ON u.id = sr.user_id
        LEFT JOIN user_work_status uws ON u.id = uws.user_id
        LEFT JOIN typing_hero_stats ths ON u.id = ths.user_id
        LEFT JOIN disc_personality_stats dps ON u.id = dps.user_id
        WHERE u.full_name IS NOT NULL 
          AND u.full_name != ''
          AND u.slug IS NOT NULL
          AND u.slug != ''
        ORDER BY COALESCE(los.overall_score, 0) DESC, u.created_at DESC
        LIMIT 100
      `
      
      console.log('Executing full query with verification data...')
      result = await pool.query(fullQuery)
      console.log('✅ Full query result:', result.rows.length, 'candidates found before verification filter')
    } catch (queryError) {
      console.error('❌ Full query failed:', queryError)
      return NextResponse.json({ 
        success: false, 
        error: 'Full query failed',
        details: queryError.message 
      }, { status: 500 })
    }
    
    if (result.rows.length === 0) {
      console.log('⚠️ No users found with basic profile data, returning empty result')
      return NextResponse.json({ 
        success: true, 
        candidates: [],
        total: 0,
        message: 'No users found with basic profile data'
      })
    }
    
    console.log('📊 Found', result.rows.length, 'users with basic profile data, now checking verification status...')
    
    // Log sample data
    console.log('📊 Sample user data:', {
      name: result.rows[0].full_name,
      score: result.rows[0].overall_score,
      completed_data: result.rows[0].completed_data,
      work_status_completed: result.rows[0].work_status_completed,
      has_resume: result.rows[0].has_resume,
      has_typing_hero: result.rows[0].has_typing_hero,
      has_disc_personality: result.rows[0].has_disc_personality
    })
    
    // Apply filtering based on the filter parameter
    const candidates = result.rows
      .map(row => {
        // Calculate verified status using the same 5-step logic as profile page
        const hasPersonalData = row.completed_data === true;
        const hasWorkStatusData = row.work_status_completed === true;
        const hasResume = row.resume_score !== undefined && row.resume_score > 0;
        const hasTypingHero = row.has_typing_hero === true;
        const hasDisc = row.has_disc_personality === true;
        const completedSteps = [hasPersonalData, hasWorkStatusData, hasResume, hasTypingHero, hasDisc].filter(Boolean).length;
        const isVerified = completedSteps === 5; // 100% completion required for verified badge
        
        // Check if user has high score
        const hasHighScore = (row.overall_score || 0) > 50;
        
        // Determine if user qualifies based on filter
        let qualifies = false;
        switch (filter) {
          case 'highest-scores':
            qualifies = hasHighScore; // Only users with score > 50
            break;
          case 'verified':
            qualifies = isVerified; // Only verified users
            break;
          case 'all':
          default:
            qualifies = isVerified || hasHighScore; // Verified OR high score
            break;
        }

        console.log(`🔍 User ${row.full_name}: Personal=${hasPersonalData}, Work=${hasWorkStatusData}, Resume=${hasResume}, Typing=${hasTypingHero}, DISC=${hasDisc} -> Steps=${completedSteps}/5 -> Verified=${isVerified}, Score=${row.overall_score || 0} -> HighScore=${hasHighScore} -> Filter=${filter} -> Qualifies=${qualifies}`);

        return {
          id: row.id,
          name: row.full_name,
          position: row.position || 'Position not specified',
          email: row.email,
          avatar: row.avatar_url ? row.avatar_url : row.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
          joinDate: new Date(row.created_at).toLocaleDateString(),
          location: row.location || 'Location not specified',
          overallScore: Math.round(row.overall_score || 0),
          resumeAvailable: row.has_resume || false,
          profileComplete: row.completed_data && (row.work_status_completed || false),
          verified: isVerified,
          slug: row.slug,
          resumeSlug: row.resume_slug || null
        }
      })
      .filter(candidate => {
        const isVerified = candidate.verified;
        const hasHighScore = candidate.overallScore > 50;
        
        let qualifies = false;
        switch (filter) {
          case 'highest-scores':
            qualifies = hasHighScore;
            break;
          case 'verified':
            qualifies = isVerified;
            break;
          case 'all':
          default:
            qualifies = isVerified || hasHighScore;
            break;
        }
        
        if (!qualifies) {
          console.log('❌ Filtering out user:', candidate.name, 'verified:', isVerified, 'score:', candidate.overallScore, 'filter:', filter)
        } else {
          console.log('✅ Keeping user:', candidate.name, 'verified:', isVerified, 'score:', candidate.overallScore, 'filter:', filter)
        }
        return qualifies
      })

    console.log('✅ Returning', candidates.length, 'candidates to frontend')
    console.log(`📊 Summary: Scanned ${result.rows.length} users, ${candidates.length} qualify with filter: ${filter}`)
    
    return NextResponse.json({ 
      success: true, 
      candidates,
      total: candidates.length
    })

  } catch (error) {
    console.error('Error fetching talent search data:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch talent data',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
