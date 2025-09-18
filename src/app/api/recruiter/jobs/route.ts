import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Company name mapping for frontend display
const getDisplayCompanyName = (dbCompanyName: string): string => {
  // Always return ShoreAgents for frontend display
  return 'ShoreAgents'
}

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

    // Fetch both job_requests and processed_job_requests
    const result = await pool.query(`
      SELECT 
        j.*, 
        m.company AS company_name,
        'job_requests' as source_table
      FROM job_requests j
      LEFT JOIN members m ON m.company_id = j.company_id
      
      UNION ALL
      
      SELECT 
        p.*, 
        m.company AS company_name,
        'processed_job_requests' as source_table
      FROM processed_job_requests p
      LEFT JOIN members m ON m.company_id = p.company_id
      
      ORDER BY created_at DESC
    `)

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
      company: getDisplayCompanyName(row.company_name || 'Unknown Company'),
      created_at: row.created_at,
      source_table: row.source_table
    }))

    // If no jobs found, return sample data for demonstration
    if (jobs.length === 0) {
      jobs = [
        {
          id: 'sample_1',
          originalId: '1',
          title: 'Bookkeeper',
          description: 'We are seeking a detail-oriented Bookkeeper to join our real estate company to maintain accurate financial records and manage day-to-day accounting operations.',
          industry: 'Real Estate',
          department: 'Finance',
          experienceLevel: 'Mid Level',
          salaryMin: 25000,
          salaryMax: 35000,
          status: 'processed',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'job_requests'
        },
        {
          id: 'sample_2',
          originalId: '2',
          title: 'Bookkeeper',
          description: 'We are seeking a detail-oriented Bookkeeper to join our real estate company to maintain accurate financial records and manage day-to-day accounting operations.',
          industry: 'Real Estate',
          department: 'Finance',
          experienceLevel: 'Mid Level',
          salaryMin: 25000,
          salaryMax: 35000,
          status: 'active',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'job_requests'
        },
        {
          id: 'sample_3',
          originalId: '3',
          title: 'Bookkeeper',
          description: 'We are seeking a detail-oriented Bookkeeper to join our real estate company to maintain accurate financial records and manage day-to-day accounting operations.',
          industry: 'Real Estate',
          department: 'Finance',
          experienceLevel: 'Mid Level',
          salaryMin: 25000,
          salaryMax: 35000,
          status: 'processed',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'job_requests'
        },
        {
          id: 'sample_4',
          originalId: '4',
          title: 'Bookkeeper',
          description: 'We are seeking a detail-oriented Bookkeeper to join our real estate company to maintain accurate financial records and manage day-to-day accounting operations.',
          industry: 'Real Estate',
          department: 'Finance',
          experienceLevel: 'Mid Level',
          salaryMin: 25000,
          salaryMax: 35000,
          status: 'processed',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'job_requests'
        },
        {
          id: 'sample_5',
          originalId: '5',
          title: 'Senior Web Developer',
          description: 'We are looking for an experienced Senior Web Developer to lead our development team and build scalable web applications using modern technologies.',
          industry: 'Technology',
          department: 'Engineering',
          experienceLevel: 'Senior Level',
          salaryMin: 60000,
          salaryMax: 80000,
          status: 'inactive',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'processed_job_requests'
        },
        {
          id: 'sample_6',
          originalId: '6',
          title: 'Real Estate Virtual Assistant',
          description: 'We are seeking a dedicated Real Estate Virtual Assistant to support our real estate operations and provide administrative assistance to our agents.',
          industry: 'Real Estate',
          department: 'Administration',
          experienceLevel: 'Entry Level',
          salaryMin: 20000,
          salaryMax: 30000,
          status: 'active',
          company: 'ShoreAgents',
          created_at: new Date().toISOString(),
          source_table: 'job_requests'
        }
      ]
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    
    // Insert into job_requests table
    const result = await pool.query(`
      INSERT INTO job_requests (
        job_title, job_description, industry, department, work_type, 
        work_arrangement, experience_level, salary_min, salary_max, 
        currency, salary_type, application_deadline, priority, shift,
        requirements, responsibilities, benefits, skills, status, company_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
      'active',
      body.company_id
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
