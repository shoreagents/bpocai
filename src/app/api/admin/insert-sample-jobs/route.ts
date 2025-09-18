import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('Inserting sample job data...')
    
    // First, insert a sample company if it doesn't exist
    const companyResult = await pool.query(`
      INSERT INTO members (company_id, company, contact_person, email, phone, address, created_at)
      VALUES (
        gen_random_uuid(),
        'ShoreAgents',
        'John Smith',
        'contact@shoreagents.com',
        '+1-555-0123',
        '123 Business St, City, Country',
        NOW()
      )
      ON CONFLICT (company) DO NOTHING
      RETURNING company_id
    `)
    
    // Get the company_id for ShoreAgents
    const companyIdResult = await pool.query('SELECT company_id FROM members WHERE company = $1', ['ShoreAgents'])
    const companyId = companyIdResult.rows[0]?.company_id
    
    if (!companyId) {
      throw new Error('Failed to get company ID')
    }

    // Insert sample job requests
    const jobRequests = await pool.query(`
      INSERT INTO job_requests (
        company_id,
        job_title,
        job_description,
        industry,
        department,
        work_type,
        work_arrangement,
        experience_level,
        salary_min,
        salary_max,
        currency,
        salary_type,
        status,
        priority,
        shift,
        requirements,
        responsibilities,
        benefits,
        skills,
        created_at
      ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()),
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()),
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()),
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()),
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      RETURNING *
    `, [
      companyId,
      'Bookkeeper',
      'We are seeking a detail-oriented Bookkeeper to join our real estate company to maintain accurate financial records and manage day-to-day accounting operations.',
      'Real Estate',
      'Finance',
      'full-time',
      'onsite',
      'mid-level',
      25000,
      35000,
      'PHP',
      'monthly',
      'processed',
      'medium',
      'day',
      ['High school diploma or equivalent', '2+ years bookkeeping experience', 'Proficiency in accounting software', 'Strong attention to detail'],
      ['Maintain accurate financial records', 'Process accounts payable and receivable', 'Prepare monthly financial reports', 'Reconcile bank statements'],
      ['Health insurance', 'Paid time off', 'Performance bonuses', 'Career development opportunities'],
      ['Accounting', 'Bookkeeping', 'Financial reporting', 'Attention to detail']
    ])

    // Insert some processed jobs as well
    const processedJobs = await pool.query(`
      INSERT INTO processed_job_requests (
        id,
        company_id,
        job_title,
        job_description,
        industry,
        department,
        work_type,
        work_arrangement,
        experience_level,
        salary_min,
        salary_max,
        currency,
        salary_type,
        status,
        priority,
        shift,
        requirements,
        responsibilities,
        benefits,
        skills,
        created_at
      ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()),
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
      RETURNING *
    `, [
      1,
      companyId,
      'Senior Web Developer',
      'We are looking for an experienced Senior Web Developer to lead our development team and build scalable web applications.',
      'Technology',
      'Engineering',
      'full-time',
      'remote',
      'senior-level',
      60000,
      80000,
      'PHP',
      'monthly',
      'active',
      'high',
      'day',
      ['Bachelor degree in Computer Science', '5+ years development experience', 'Proficiency in multiple programming languages', 'Leadership experience'],
      ['Design software architecture', 'Write clean, maintainable code', 'Mentor junior developers', 'Collaborate with cross-functional teams'],
      ['Competitive salary', 'Health insurance', 'Stock options', 'Professional development budget'],
      ['Software development', 'Leadership', 'Problem-solving', 'Team collaboration']
    ])

    // Update the job_requests table to mark some jobs as processed
    await pool.query('UPDATE job_requests SET status = $1::job_status_enum, updated_at = NOW() WHERE id IN (1, 2)', ['processed'])

    // Get counts
    const jobRequestsCount = await pool.query('SELECT COUNT(*) as count FROM job_requests')
    const processedJobsCount = await pool.query('SELECT COUNT(*) as count FROM processed_job_requests')
    const membersCount = await pool.query('SELECT COUNT(*) as count FROM members')

    return NextResponse.json({ 
      success: true,
      message: 'Sample job data inserted successfully',
      counts: {
        job_requests: jobRequestsCount.rows[0].count,
        processed_job_requests: processedJobsCount.rows[0].count,
        members: membersCount.rows[0].count
      }
    })
  } catch (error) {
    console.error('Error inserting sample job data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
