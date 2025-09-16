import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    const body = await request.json()
    
    // Update the job in job_requests table
    const result = await pool.query(`
      UPDATE job_requests SET
        job_title = $1,
        job_description = $2,
        industry = $3,
        department = $4,
        work_type = $5,
        work_arrangement = $6,
        experience_level = $7,
        salary_min = $8,
        salary_max = $9,
        currency = $10,
        salary_type = $11,
        application_deadline = $12,
        priority = $13,
        shift = $14,
        requirements = $15,
        responsibilities = $16,
        benefits = $17,
        skills = $18,
        updated_at = now()
      WHERE id = $19
      RETURNING *
    `, [
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
      jobId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      job: result.rows[0] 
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}
