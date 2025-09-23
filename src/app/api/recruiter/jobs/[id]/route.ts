import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a recruiter
    const recruiterCheck = await pool.query(
      'SELECT admin_level FROM users WHERE id = $1',
      [userId]
    )
    
    if (recruiterCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
    }

    const jobId = params.id
    const body = await request.json()
    
    // Verify the job belongs to this recruiter
    const jobCheck = await pool.query(
      'SELECT id FROM recruiter_jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, userId]
    )
    
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found or not owned by recruiter' }, { status: 404 })
    }

    // Update the job
    const result = await pool.query(`
      UPDATE recruiter_jobs SET
        job_title = $2,
        job_description = $3,
        industry = $4,
        department = $5,
        work_type = $6,
        work_arrangement = $7,
        experience_level = $8,
        salary_min = $9,
        salary_max = $10,
        currency = $11,
        salary_type = $12,
        application_deadline = $13,
        priority = $14,
        shift = $15,
        requirements = $16,
        responsibilities = $17,
        benefits = $18,
        skills = $19,
        company_id = $20,
        status = $21,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      jobId,
      body.job_title,
      body.job_description,
      body.industry,
      body.department,
      body.work_type,
      body.work_arrangement,
      body.experience_level,
      body.salary_min,
      body.salary_max,
      body.currency,
      body.salary_type,
      body.application_deadline,
      body.priority,
      body.shift,
      body.requirements,
      body.responsibilities,
      body.benefits,
      body.skills,
      body.company,
      body.status
    ])

    return NextResponse.json({ 
      success: true, 
      job: result.rows[0] 
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a recruiter
    const recruiterCheck = await pool.query(
      'SELECT admin_level FROM users WHERE id = $1',
      [userId]
    )
    
    if (recruiterCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
    }

    const jobId = params.id
    const body = await request.json()
    
    // Verify the job belongs to this recruiter
    const jobCheck = await pool.query(
      'SELECT id FROM recruiter_jobs WHERE id = $1 AND recruiter_id = $2',
      [jobId, userId]
    )
    
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found or not owned by recruiter' }, { status: 404 })
    }

    // Update only the status
    const result = await pool.query(`
      UPDATE recruiter_jobs SET
        status = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [jobId, body.status])

    return NextResponse.json({ 
      success: true, 
      job: result.rows[0] 
    })
  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 })
  }
}