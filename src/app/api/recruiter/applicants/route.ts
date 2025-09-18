import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is a recruiter
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a recruiter
    const recruiterCheck = await pool.query(
      'SELECT admin_level FROM users WHERE id = $1',
      [userId]
    )
    
    if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
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
      user: { 
        email: r.user_email, 
        full_name: r.user_full_name, 
        avatar_url: r.user_avatar, 
        position: r.user_position, 
        location: r.user_location 
      },
      resume_title: r.saved_resume_title
    }))

    return NextResponse.json({ applications })
  } catch (e) {
    console.error('Error fetching applicants:', e)
    return NextResponse.json({ error: 'Failed to fetch applicants' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated and is a recruiter
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a recruiter
    const recruiterCheck = await pool.query(
      'SELECT admin_level FROM users WHERE id = $1',
      [userId]
    )
    
    if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
    }

    const body = await request.json()
    const { applicationId, status } = body

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'applicationId and status are required' }, { status: 400 })
    }

    // Validate status against the enum
    const validStatuses = [
      'submitted', 'qualified', 'for verification', 'verified', 
      'initial interview', 'final interview', 'not qualified', 'passed', 
      'rejected', 'withdrawn', 'hired', 'closed'
    ]
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the application status
    const updateResult = await pool.query(
      'UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, applicationId]
    )

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    console.log(`Recruiter updated application ${applicationId} status to ${status}`)

    return NextResponse.json({ 
      message: 'Application status updated successfully',
      application: updateResult.rows[0]
    })

  } catch (e) {
    console.error('Error updating application status:', e)
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
  }
}
