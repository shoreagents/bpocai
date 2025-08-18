import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    console.log('🚀 Recent Activity API: Starting to fetch recent activity...')
    
    const client = await pool.connect()
    
    try {
      // Simple approach: get recent activity from each table separately
      const activities = []
      
      // 1. Get recent typing hero sessions
      try {
        const typingHeroQuery = `
          SELECT 
            'game' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Completed Typing Hero Game' as action,
            ths.wpm as score,
            ths.finished_at as activity_time
          FROM typing_hero_sessions ths
          JOIN users u ON ths.user_id = u.id
          WHERE ths.finished_at IS NOT NULL
          ORDER BY ths.finished_at DESC
          LIMIT 3
        `
        const typingHeroResult = await client.query(typingHeroQuery)
        console.log('🎮 Typing Hero activities found:', typingHeroResult.rows.length)
        activities.push(...typingHeroResult.rows)
      } catch (error) {
        console.log('⚠️ Error fetching typing hero activities:', error)
      }
      
      // 2. Get recent resume updates
      try {
        const resumeQuery = `
          SELECT 
            'resume' as type,
            u.full_name as user_name,
            u.avatar_url as user_avatar,
            'Updated Resume: ' || COALESCE(sr.resume_title, 'Untitled') as action,
            NULL as score,
            sr.updated_at as activity_time
          FROM saved_resumes sr
          JOIN users u ON sr.user_id = u.id
          ORDER BY sr.updated_at DESC
          LIMIT 3
        `
        const resumeResult = await client.query(resumeQuery)
        console.log('📄 Resume activities found:', resumeResult.rows.length)
        activities.push(...resumeResult.rows)
      } catch (error) {
        console.log('⚠️ Error fetching resume activities:', error)
      }
      
      // 3. Get recent job applications
      try {
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
          LIMIT 3
        `
        const applicationResult = await client.query(applicationQuery)
        console.log('📝 Application activities found:', applicationResult.rows.length)
        activities.push(...applicationResult.rows)
      } catch (error) {
        console.log('⚠️ Error fetching application activities:', error)
      }
      
      // Sort all activities by time
      activities.sort((a, b) => new Date(b.activity_time).getTime() - new Date(a.activity_time).getTime())
      
      // Take only the most recent 10
      const recentActivity = activities.slice(0, 10)
      
      console.log('🎯 Total activities found:', activities.length)
      console.log('📊 Final recent activities:', recentActivity.length)
      
      // If no real data, provide sample data
      if (recentActivity.length === 0) {
        console.log('⚠️ No real data found, providing sample data for testing...')
        const sampleData = [
          {
            user_name: 'John Doe',
            user_avatar: null,
            action: 'Completed Typing Hero Game',
            score: 85,
            type: 'game',
            activity_time: new Date().toISOString()
          },
          {
            user_name: 'Jane Smith',
            user_avatar: null,
            action: 'Updated Resume: Software Engineer',
            score: null,
            type: 'resume',
            activity_time: new Date(Date.now() - 3600000).toISOString()
          },
          {
            user_name: 'Mike Johnson',
            user_avatar: null,
            action: 'Applied for: Frontend Developer',
            score: null,
            type: 'applicants',
            activity_time: new Date(Date.now() - 7200000).toISOString()
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
