import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('🔍 Applications API called with userId:', userId);
    
    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      console.log('🔗 Database connected, executing query...');
      
      // First, let's check if the user has any applications with a simple query
      console.log('🔍 Checking if user has applications...');
      const userAppsCheck = await client.query(
        'SELECT COUNT(*) as count FROM applications WHERE user_id = $1',
        [userId]
      );
      console.log('📊 User applications count:', userAppsCheck.rows[0]?.count);

      // Let's also check what status values actually exist in the applications table
      console.log('🔍 Checking what status values exist in applications table...');
      const statusCheck = await client.query(
        'SELECT DISTINCT status FROM applications WHERE user_id = $1 ORDER BY status',
        [userId]
      );
      console.log('📊 Available status values:', statusCheck.rows.map(row => ({ status: row.status, type: typeof row.status })));

      if (userAppsCheck.rows[0]?.count === 0) {
        console.log('📭 No applications found for user');
        return NextResponse.json({
          applications: [],
          total: 0,
          message: 'No applications found'
        });
      }

      // Now let's try a simpler query first to see if the JOIN is the issue
      console.log('🔍 Executing simple applications query...');
      const simpleResult = await client.query(
        `SELECT 
          a.id,
          a.job_id::int4 as "jobId",
          a.resume_id as "resumeId",
          a.resume_slug as "resumeSlug",
          a.status as "applicationStatus",
          a.created_at as "appliedDate"
         FROM applications a
         WHERE a.user_id = $1
         ORDER BY a.created_at DESC`,
        [userId]
      );
      console.log('📋 Simple query executed, rows returned:', simpleResult.rows.length);
      console.log('📋 Applications query result:', JSON.stringify(simpleResult.rows, null, 2));
      console.log('🔍 Raw status values from database:', simpleResult.rows.map(row => ({ id: row.id, status: row.applicationStatus, statusType: typeof row.applicationStatus })));

      // Now let's try to get job details separately
      if (simpleResult.rows.length > 0) {
        console.log('🔍 Fetching job details...');
        const jobIds = simpleResult.rows.map(row => row.jobId);
        console.log('📋 Job IDs to fetch:', jobIds);
        console.log('📋 Job IDs type check:', jobIds.map(id => ({ id, type: typeof id })));

        const jobsResult = await client.query(
          `SELECT 
            p.id,
            p.job_title,
            p.job_description,
            p.requirements,
            p.benefits,
            p.skills,
            p.salary_min,
            p.salary_max,
            p.currency,
            p.salary_type,
            p.work_arrangement,
            p.experience_level,
            p.industry,
            p.department,
            p.application_deadline,
            m.company as company_name
           FROM processed_job_requests p
           LEFT JOIN members m ON p.company_id = m.company_id
           WHERE p.id = ANY($1)`,
          [jobIds]
        );
        console.log('📋 Jobs query executed, rows returned:', jobsResult.rows.length);
        console.log('📋 Jobs query result:', JSON.stringify(jobsResult.rows, null, 2));

        // Create a map of job details
        const jobDetailsMap = new Map();
        jobsResult.rows.forEach(job => {
          jobDetailsMap.set(job.id, job);
        });

        // Combine application data with job details
        const applications = simpleResult.rows.map(appRow => {
          const jobDetails = jobDetailsMap.get(appRow.jobId);
          
          console.log('🔍 Processing application row:', {
            id: appRow.id,
            jobId: appRow.jobId,
            status: appRow.applicationStatus,
            statusType: typeof appRow.applicationStatus,
            rawRow: appRow
          });
          
          // Format salary
          let salary = '';
          if (jobDetails?.salary_min || jobDetails?.salary_max) {
            const currency = jobDetails.currency || '₱';
            const min = jobDetails.salary_min ? Number(jobDetails.salary_min) : 0;
            const max = jobDetails.salary_max ? Number(jobDetails.salary_max) : min;
            const type = jobDetails.salary_type || 'monthly';
            
            if (min === max) {
              salary = `${currency}${min.toLocaleString()} / ${type}`;
            } else {
              salary = `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()} / ${type}`;
            }
          }

          // Format requirements and benefits
          const requirements = Array.isArray(jobDetails?.requirements) ? jobDetails.requirements : [];
          const benefits = Array.isArray(jobDetails?.benefits) ? jobDetails.benefits : [];
          const skills = Array.isArray(jobDetails?.skills) ? jobDetails.skills : [];

          // Map the application status to the frontend status format
          const getFrontendStatus = (dbStatus: string) => {
            console.log('🔍 getFrontendStatus called with:', dbStatus, 'type:', typeof dbStatus);
            // Return the exact database status for more granular display
            return dbStatus;
          };

          const finalStatus = getFrontendStatus(appRow.applicationStatus);
          console.log('🔍 Final status for application:', appRow.id, ':', finalStatus);

          return {
            id: appRow.id,
            jobId: appRow.jobId,
            resumeId: appRow.resumeId,
            resumeSlug: appRow.resumeSlug,
            jobTitle: jobDetails?.job_title || 'Unknown Position',
            companyName: jobDetails?.company_name || 'Unknown Company',
            location: 'Location not specified', // Default since location column doesn't exist
            salary,
            status: finalStatus,
            appliedDate: appRow.appliedDate,
            lastUpdated: appRow.appliedDate,
            jobDescription: jobDetails?.job_description || 'No description available',
            requirements,
            benefits,
            skills,
            workArrangement: jobDetails?.work_arrangement,
            experienceLevel: jobDetails?.experience_level,
            industry: jobDetails?.industry,
            department: jobDetails?.department,
            applicationDeadline: jobDetails?.application_deadline
          };
        });

        console.log('✅ Processed applications:', applications.length);
        console.log('✅ Sample processed application:', applications[0]);

        return NextResponse.json({
          applications,
          total: applications.length,
          message: 'Applications retrieved successfully'
        });
      }

      return NextResponse.json({
        applications: [],
        total: 0,
        message: 'No applications found'
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error in applications API:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, jobId, resumeId, resumeSlug } = body;

    if (!userId || !jobId || !resumeId || !resumeSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, jobId, resumeId, resumeSlug' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if user already applied to this job
      const existingApp = await client.query(
        'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
        [userId, jobId]
      );

      if (existingApp.rows.length > 0) {
        return NextResponse.json(
          { error: 'You have already applied to this job' },
          { status: 400 }
        );
      }

      // Insert new application into the applications table
      const result = await client.query(
        `INSERT INTO applications (
          user_id, job_id, resume_id, resume_slug, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING *`,
        [
          userId, 
          jobId, 
          resumeId, 
          resumeSlug, 
          'submitted' // Default status
        ]
      );

      const newApplication = result.rows[0];

      return NextResponse.json({
        application: {
          id: newApplication.id,
          jobId: newApplication.job_id,
          resumeId: newApplication.resume_id,
          resumeSlug: newApplication.resume_slug,
          status: 'applied', // Frontend status
          appliedDate: newApplication.created_at
        },
        message: 'Application submitted successfully'
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
