import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Fetch users with overall scores above 50 (same as talent-search but without saved_resumes)
    const query = `
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
        los.overall_score,
        CASE WHEN uws.completed_data IS NOT NULL THEN uws.completed_data ELSE false END as work_status_completed
      FROM users u
      INNER JOIN leaderboard_overall_scores los ON u.id = los.user_id
      LEFT JOIN user_work_status uws ON u.id = uws.user_id
      WHERE los.overall_score > 50
      ORDER BY los.overall_score DESC
    `
    
    const result = await pool.query(query)
    const candidates = result.rows.map(row => ({
      id: row.id,
      name: row.full_name,
      title: row.position || 'Position not specified',
      email: row.email,
      avatar: row.avatar_url ? row.avatar_url : row.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
      joinDate: new Date(row.created_at).toLocaleDateString(),
      location: row.location || 'Location not specified',
      overallScore: Math.round(row.overall_score),
      profileComplete: row.completed_data && row.work_status_completed,
      slug: row.slug,
      // Mock data for fields not in database
      experience: 'Not specified',
      appliedDate: 'Recently'
    }))

    return NextResponse.json({ 
      success: true, 
      candidates,
      total: candidates.length
    })

  } catch (error) {
    console.error('Error fetching recruiter candidates data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates data' },
      { status: 500 }
    )
  }
}
