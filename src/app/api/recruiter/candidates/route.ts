import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for testing
    // const userId = request.headers.get('x-user-id')
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // // Verify user is a recruiter
    // const recruiterCheck = await pool.query(
    //   'SELECT admin_level FROM users WHERE id = $1',
    //   [userId]
    // )
    
    // if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
    //   return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
    // }

    // Fetch users with overall scores above 50 and include applicant scores
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
        CASE WHEN uws.completed_data IS NOT NULL THEN uws.completed_data ELSE false END as work_status_completed,
        COALESCE(las.score, 0) as applicant_score
      FROM users u
      INNER JOIN leaderboard_overall_scores los ON u.id = los.user_id
      LEFT JOIN user_work_status uws ON u.id = uws.user_id
      LEFT JOIN leaderboard_applicant_scores las ON u.id = las.user_id AND las.period = 'all'
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
      applicantScore: row.applicant_score
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
