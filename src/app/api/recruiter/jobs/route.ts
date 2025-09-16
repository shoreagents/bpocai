import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Company name mapping for frontend display
const getDisplayCompanyName = (dbCompanyName: string): string => {
  const companyMappings: { [key: string]: string } = {
    'UrbanX Pty Ltd': 'ShoreAgents',
    'ShoreAgentss': 'ShoreAgents',
    'ShoreAgents Inc.': 'ShoreAgents',
    // Add more mappings as needed
  }
  
  return companyMappings[dbCompanyName] || dbCompanyName
}

export async function GET(request: NextRequest) {
  try {
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

    const jobs = result.rows.map((row: any, index: number) => ({
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

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
