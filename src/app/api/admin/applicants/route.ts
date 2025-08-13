import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (process.env.NODE_ENV !== 'development') {
      const adminCheck = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId])
      if (!adminCheck.rows[0]?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const jobId = Number((request.nextUrl.searchParams.get('jobId') || '').trim())
    if (!jobId || Number.isNaN(jobId)) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

    const res = await pool.query(
      `SELECT a.*, 
              u.email as user_email, u.full_name as user_full_name, u.avatar_url as user_avatar, u.position as user_position, u.location as user_location,
              sr.resume_title as saved_resume_title
       FROM applications a
       LEFT JOIN users u ON u.id = a.user_id
       LEFT JOIN saved_resumes sr ON sr.id = a.resume_id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [jobId]
    )

    const applications = res.rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      job_id: r.job_id,
      resume_slug: r.resume_slug,
      status: r.status,
      created_at: r.created_at,
      user: { email: r.user_email, full_name: r.user_full_name, avatar_url: r.user_avatar, position: r.user_position, location: r.user_location },
      resume_title: r.saved_resume_title
    }))

    return NextResponse.json({ applications })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 })
  }
}


