import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
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

    // Fetch from recruiter_jobs table for the current recruiter
    console.log('🔍 Fetching jobs for userId:', userId)
    const result = await pool.query(`
      SELECT 
        rj.*, 
        COALESCE(rj.company_id, u.company) AS company_name,
        'recruiter_jobs' as source_table
      FROM recruiter_jobs rj
      LEFT JOIN users u ON u.id = rj.recruiter_id
      WHERE rj.recruiter_id = $1
      ORDER BY rj.created_at DESC
    `, [userId])

    console.log('🔍 Database query result:', {
      rowCount: result.rows.length,
      rows: result.rows
    })

    let jobs = result.rows.map((row: any, index: number) => ({
      id: `${row.source_table}_${row.id}_${index}`, // Create unique ID by combining source table, original ID, and index
      originalId: String(row.id), // Keep original ID for reference
      title: row.job_title || row.title || 'Untitled Role',
      description: row.job_description || 'No description available',
      industry: row.industry || 'Not Specified',
      department: row.department || 'Not Specified',
      experienceLevel: row.experience_level || 'Not Specified',
      salaryMin: row.salary_min || 0,
      salaryMax: row.salary_max || 0,
      status: row.status || 'inactive',
      company: row.company_name || 'Unknown Company',
      created_at: row.created_at,
      work_type: row.work_type,
      work_arrangement: row.work_arrangement,
      shift: row.shift,
      priority: row.priority,
      currency: row.currency,
      salary_type: row.salary_type,
      application_deadline: row.application_deadline,
      requirements: row.requirements || [],
      responsibilities: row.responsibilities || [],
      benefits: row.benefits || [],
      skills: row.skills || [],
      source_table: row.source_table
    }))

    console.log('🔍 Final jobs array:', jobs)

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a recruiter
    const recruiterCheck = await pool.query(
      'SELECT admin_level, company FROM users WHERE id = $1',
      [userId]
    )
    
    if (recruiterCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (recruiterCheck.rows[0]?.admin_level !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiter access required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Get the recruiter user ID and company from the authenticated user
    const recruiterId = userId
    const recruiterCompany = recruiterCheck.rows[0].company
    
    // Insert into recruiter_jobs table
    const result = await pool.query(`
      INSERT INTO recruiter_jobs (
        recruiter_id, company_id, job_title, job_description, industry, department, work_type, 
        work_arrangement, experience_level, salary_min, salary_max, 
        currency, salary_type, application_deadline, priority, shift,
        requirements, responsibilities, benefits, skills, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      recruiterId, // recruiter_id - references the recruiter user who created the job
      recruiterCompany, // company_id - references users.company field
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
      'new_request' // Default status as per your requirements
    ])

    return NextResponse.json({ 
      success: true, 
      job: result.rows[0] 
    })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
