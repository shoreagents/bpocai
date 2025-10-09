import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    console.log('🚀 Recent Activity API: Starting to fetch recent activity...')
    
    const client = await pool.connect()
    
    try {
      // Get all types of activities
      const activities = []
      
      // 1. Fetch Job Applications from both tables
      try {
        console.log('🔍 Starting to fetch application activities...')
        
        // First, let's check if the tables exist and have data
        console.log('🔍 Checking if applications table exists...')
        try {
          const applicationsTableCheck = await client.query(`
            SELECT COUNT(*) as count FROM applications
          `)
          console.log('📊 Total applications in applications table:', applicationsTableCheck.rows[0]?.count)
        } catch (tableError) {
          console.log('⚠️ Applications table does not exist or error:', tableError.message)
        }
        
        // Show recent applications from applications table
        try {
          const recentApplicationsCheck = await client.query(`
            SELECT a.id, a.user_id, a.job_id, a.created_at, u.full_name
            FROM applications a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 5
          `)
          console.log('📝 Recent applications from applications table:', recentApplicationsCheck.rows)
        } catch (recentError) {
          console.log('⚠️ Error fetching recent applications:', recentError.message)
        }
        
        console.log('🔍 Checking if recruiter_applications table exists...')
        try {
          const recruiterApplicationsTableCheck = await client.query(`
            SELECT COUNT(*) as count FROM recruiter_applications
          `)
          console.log('📊 Total applications in recruiter_applications table:', recruiterApplicationsTableCheck.rows[0]?.count)
        } catch (tableError) {
          console.log('⚠️ Recruiter_applications table does not exist or error:', tableError.message)
        }
        
        // Show recent applications from recruiter_applications table
        try {
          const recentRecruiterApplicationsCheck = await client.query(`
            SELECT ra.id, ra.user_id, ra.job_id, ra.created_at, u.full_name
            FROM recruiter_applications ra
            JOIN users u ON ra.user_id = u.id
            ORDER BY ra.created_at DESC
            LIMIT 5
          `)
          console.log('📝 Recent applications from recruiter_applications table:', recentRecruiterApplicationsCheck.rows)
        } catch (recentError) {
          console.log('⚠️ Error fetching recent recruiter applications:', recentError.message)
        }
        
        // Fetch from applications table (processed jobs)
        console.log('🔍 Fetching from applications table...')
        const applicationQuery = `
          SELECT 
            'applicants' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Applied for: ' || COALESCE(pjr.job_title, 'Job Position') as action,
            NULL as score,
            a.created_at as activity_time
          FROM applications a
          JOIN users u ON a.user_id = u.id
          LEFT JOIN processed_job_requests pjr ON a.job_id = pjr.id
          ORDER BY a.created_at DESC
          LIMIT 5
        `
        const applicationResult = await client.query(applicationQuery)
        console.log('📝 Application activities found (applications table):', applicationResult.rows.length)
        console.log('📝 Sample application data:', applicationResult.rows.slice(0, 2))
        if (applicationResult.rows.length > 0) {
          activities.push(...applicationResult.rows)
        }
        
        // Fallback: Simple query without JOINs if the above fails
        if (applicationResult.rows.length === 0) {
          console.log('🔍 Trying fallback query for applications...')
          const fallbackQuery = `
            SELECT 
              'applicants' as type,
              u.full_name as user_name,
              u.avatar_url as user_avatar,
              'Applied for a job' as action,
              NULL as score,
              a.created_at as activity_time
            FROM applications a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 5
          `
          const fallbackResult = await client.query(fallbackQuery)
          console.log('📝 Fallback application activities found:', fallbackResult.rows.length)
          if (fallbackResult.rows.length > 0) {
            activities.push(...fallbackResult.rows)
          }
        }
        
        // Fetch from recruiter_applications table (recruiter jobs)
        console.log('🔍 Fetching from recruiter_applications table...')
        const recruiterApplicationQuery = `
          SELECT 
            'applicants' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Applied for: ' || COALESCE(rj.job_title, 'Job Position') as action,
            NULL as score,
            ra.created_at as activity_time
          FROM recruiter_applications ra
          JOIN users u ON ra.user_id = u.id
          LEFT JOIN recruiter_jobs rj ON ra.job_id = rj.id
          ORDER BY ra.created_at DESC
          LIMIT 5
        `
        const recruiterApplicationResult = await client.query(recruiterApplicationQuery)
        console.log('📝 Application activities found (recruiter_applications table):', recruiterApplicationResult.rows.length)
        console.log('📝 Sample recruiter application data:', recruiterApplicationResult.rows.slice(0, 2))
        if (recruiterApplicationResult.rows.length > 0) {
          activities.push(...recruiterApplicationResult.rows)
        }
        
        // Fallback: Simple query without JOINs if the above fails
        if (recruiterApplicationResult.rows.length === 0) {
          console.log('🔍 Trying fallback query for recruiter applications...')
          const recruiterFallbackQuery = `
            SELECT 
              'applicants' as type,
              u.full_name as user_name,
              u.avatar_url as user_avatar,
              'Applied for a recruiter job' as action,
              NULL as score,
              ra.created_at as activity_time
            FROM recruiter_applications ra
            JOIN users u ON ra.user_id = u.id
            ORDER BY ra.created_at DESC
            LIMIT 5
          `
          const recruiterFallbackResult = await client.query(recruiterFallbackQuery)
          console.log('📝 Fallback recruiter application activities found:', recruiterFallbackResult.rows.length)
          if (recruiterFallbackResult.rows.length > 0) {
            activities.push(...recruiterFallbackResult.rows)
          }
        }
      } catch (error) {
        console.log('⚠️ Error fetching application activities:', error)
        console.log('⚠️ Error details:', error.message)
        console.log('⚠️ Error stack:', error.stack)
      }
      
      // 2. Fetch Typing Hero Game Activities
      try {
        console.log('🎮 Starting to fetch Typing Hero activities...')
        const typingHeroQuery = `
          SELECT 
            'typing_hero' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Completed Typing Hero session - ' || COALESCE(ths.latest_wpm::text, '0') || ' WPM' as action,
            ths.latest_wpm as score,
            ths.last_played_at as activity_time
          FROM typing_hero_stats ths
          JOIN users u ON ths.user_id = u.id
          WHERE ths.last_played_at IS NOT NULL
          ORDER BY ths.last_played_at DESC
          LIMIT 5
        `
        const typingHeroResult = await client.query(typingHeroQuery)
        console.log('⌨️ Typing Hero activities found:', typingHeroResult.rows.length)
        if (typingHeroResult.rows.length > 0) {
          activities.push(...typingHeroResult.rows)
        }
      } catch (error) {
        console.log('⚠️ Error fetching Typing Hero activities:', error)
      }
      
      // 3. Fetch DISC Personality Activities
      try {
        console.log('🧠 Starting to fetch DISC personality activities...')
        const discQuery = `
          SELECT 
            'disc_personality' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Completed DISC Game - ' || COALESCE(dps.latest_primary_type, 'Unknown') || ' type' as action,
            NULL as score,
            dps.last_taken_at as activity_time
          FROM disc_personality_stats dps
          JOIN users u ON dps.user_id = u.id
          WHERE dps.last_taken_at IS NOT NULL
          ORDER BY dps.last_taken_at DESC
          LIMIT 5
        `
        const discResult = await client.query(discQuery)
        console.log('🦚 DISC personality activities found:', discResult.rows.length)
        if (discResult.rows.length > 0) {
          activities.push(...discResult.rows)
        }
      } catch (error) {
        console.log('⚠️ Error fetching DISC personality activities:', error)
      }
      
      // 4. Fetch Resume Activities
      try {
        console.log('📄 Starting to fetch resume activities...')
        const resumeQuery = `
          SELECT 
            'resume' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Created/Updated resume' as action,
            NULL as score,
            sr.created_at as activity_time
          FROM saved_resumes sr
          JOIN users u ON sr.user_id = u.id
          ORDER BY sr.created_at DESC
          LIMIT 5
        `
        const resumeResult = await client.query(resumeQuery)
        console.log('📄 Resume activities found:', resumeResult.rows.length)
        if (resumeResult.rows.length > 0) {
          activities.push(...resumeResult.rows)
        }
      } catch (error) {
        console.log('⚠️ Error fetching resume activities:', error)
      }
      
      // 5. Fetch Profile Update Activities
      try {
        console.log('👤 Starting to fetch profile update activities...')
        const profileQuery = `
          SELECT 
            'profile' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Updated profile information' as action,
            NULL as score,
            u.updated_at as activity_time
          FROM users u
          WHERE u.updated_at > u.created_at + INTERVAL '1 hour'
          ORDER BY u.updated_at DESC
          LIMIT 5
        `
        const profileResult = await client.query(profileQuery)
        console.log('👤 Profile activities found:', profileResult.rows.length)
        if (profileResult.rows.length > 0) {
          activities.push(...profileResult.rows)
        }
      } catch (error) {
        console.log('⚠️ Error fetching profile activities:', error)
      }
      
      // Sort all activities by time (most recent first)
      const recentActivity = activities.sort((a, b) => 
        new Date(b.activity_time).getTime() - new Date(a.activity_time).getTime()
      ).slice(0, 20) // Limit to 20 most recent activities
      
      console.log('🎯 Total activities found:', activities.length)
      console.log('📊 Final recent activities:', recentActivity.length)
      console.log('📋 Activity types breakdown:', {
        applicants: activities.filter(a => a.type === 'applicants').length,
        typing_hero: activities.filter(a => a.type === 'typing_hero').length,
        disc_personality: activities.filter(a => a.type === 'disc_personality').length,
        resume: activities.filter(a => a.type === 'resume').length,
        profile: activities.filter(a => a.type === 'profile').length
      })
      
      // Log sample activities for debugging
      console.log('🔍 Sample activities:', recentActivity.slice(0, 3).map(a => ({
        type: a.type,
        user_name: a.user_name,
        action: a.action,
        activity_time: a.activity_time
      })))
      
      // If no real data, provide sample data
      if (recentActivity.length === 0) {
        console.log('⚠️ No real data found, providing sample data for testing...')
        const sampleData = [
          {
            user_name: 'John Doe',
            user_avatar: null,
            action: 'Applied for: Frontend Developer',
            score: null,
            type: 'applicants',
            activity_time: new Date().toISOString()
          },
          {
            user_name: 'Jane Smith',
            user_avatar: null,
            action: 'Applied for: Software Engineer',
            score: null,
            type: 'applicants',
            activity_time: new Date(Date.now() - 3600000).toISOString()
          },
          {
            user_name: 'Mike Johnson',
            user_avatar: null,
            action: 'Applied for: Data Analyst',
            score: null,
            type: 'applicants',
            activity_time: new Date(Date.now() - 7200000).toISOString()
          },
          {
            user_name: 'Sarah Wilson',
            user_avatar: null,
            action: 'Applied for: Marketing Specialist',
            score: null,
            type: 'applicants',
            activity_time: new Date(Date.now() - 10800000).toISOString()
          },
          {
            user_name: 'David Brown',
            user_avatar: null,
            action: 'Applied for: Customer Service Representative',
            score: null,
            type: 'applicants',
            activity_time: new Date(Date.now() - 14400000).toISOString()
          }
        ]
        
        return NextResponse.json({ 
          recent_activity: sampleData,
          message: 'Using sample data - no real activity found'
        })
      }
      
      return NextResponse.json({ 
        recent_activity: recentActivity,
        message: 'Real activity data found'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Error getting recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
