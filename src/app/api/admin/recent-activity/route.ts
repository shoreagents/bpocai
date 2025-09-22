import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    console.log('🚀 Recent Activity API: Starting to fetch recent activity...')
    
    const client = await pool.connect()
    
    try {
      // Get recent job applications only
      const activities = []
      
      try {
        console.log('🔍 Starting to fetch application activities...')
        
        // First, let's check if there are any applications at all
        const checkApplicationsQuery = `SELECT COUNT(*) as app_count FROM applications`
        const checkResult = await client.query(checkApplicationsQuery)
        console.log('📊 Total applications in database:', checkResult.rows[0]?.app_count)
        
        // Check if there are any applications with user data
        const checkWithUsersQuery = `
          SELECT COUNT(*) as app_with_users_count 
          FROM applications a 
          JOIN users u ON a.user_id = u.id
        `
        const checkWithUsersResult = await client.query(checkWithUsersQuery)
        console.log('👥 Applications with user data:', checkWithUsersResult.rows[0]?.app_with_users_count)
        
        // Check what's actually in the applications table
        const sampleApplicationsQuery = `
          SELECT a.*, u.full_name, pjr.position as job_position
          FROM applications a
          LEFT JOIN users u ON a.user_id = u.id
          LEFT JOIN processed_job_requests pjr ON a.job_id = pjr.id
          LIMIT 3
        `
        const sampleResult = await client.query(sampleApplicationsQuery)
        console.log('📋 Sample applications data:', sampleResult.rows)
        
        const applicationQuery = `
          SELECT 
            'applicants' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Applied for: ' || COALESCE(pjr.position, 'Job Position') as action,
            NULL as score,
            a.created_at as activity_time
          FROM applications a
          JOIN users u ON a.user_id = u.id
          JOIN processed_job_requests pjr ON a.job_id = pjr.id
          ORDER BY a.created_at DESC
          LIMIT 10
        `
        const applicationResult = await client.query(applicationQuery)
        console.log('📝 Application activities found:', applicationResult.rows.length)
        if (applicationResult.rows.length > 0) {
          activities.push(...applicationResult.rows)
        }
      } catch (error) {
        console.log('⚠️ Error fetching application activities:', error)
        // Try a simpler query without the join if the first one fails
        try {
          const simpleApplicationQuery = `
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
            LIMIT 10
          `
          const simpleResult = await client.query(simpleApplicationQuery)
          console.log('📝 Simple application activities found:', simpleResult.rows.length)
          if (simpleResult.rows.length > 0) {
            activities.push(...simpleResult.rows)
          }
        } catch (simpleError) {
          console.log('⚠️ Error fetching simple application activities:', simpleError)
        }
      }
      
      // Take the most recent applications (already sorted by created_at DESC)
      const recentActivity = activities
      
      console.log('🎯 Total activities found:', activities.length)
      console.log('📊 Final recent activities:', recentActivity.length)
      
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
