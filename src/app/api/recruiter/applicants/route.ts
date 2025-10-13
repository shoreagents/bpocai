import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('🔍 API called: /api/recruiter/applicants');
  
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');
    const recruiterId = request.headers.get('x-user-id');

    console.log('🔍 Request params:', { jobId, userId, recruiterId });

    if (!jobId && !userId) {
      console.log('❌ No jobId or userId provided');
      return NextResponse.json({ error: 'Job ID or User ID is required' }, { status: 400 });
    }

    if (!recruiterId) {
      console.log('❌ No recruiterId provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Connecting to database...');
    const client = await pool.connect();
    console.log('🔍 Database connected successfully');
    
    try {
      console.log('🔍 Fetching applicants for job:', jobId, 'by recruiter:', recruiterId);
      
      // First, verify that the recruiter owns this job
      console.log('🔍 Checking job ownership...');
      const jobCheck = await client.query(
        'SELECT id, job_title FROM recruiter_jobs WHERE id = $1 AND recruiter_id = $2',
        [jobId, recruiterId]
      );

      console.log('🔍 Job check result:', jobCheck.rows.length);

      if (jobCheck.rows.length === 0) {
        console.log('❌ Job not found or access denied');
        return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
      }

      const job = jobCheck.rows[0];
      console.log('🔍 Found job:', job.job_title);

      // Check if recruiter_applications table exists
      try {
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'recruiter_applications'
          );
        `);
        
        console.log('🔍 recruiter_applications table exists:', tableCheck.rows[0]?.exists);
        
        if (!tableCheck.rows[0]?.exists) {
          return NextResponse.json({ 
            error: 'recruiter_applications table does not exist',
            message: 'Please run the database migration to create the recruiter_applications table'
          }, { status: 500 });
        }
      } catch (tableError) {
        console.error('🔍 Error checking table existence:', tableError);
        return NextResponse.json({ 
          error: 'Database table check failed',
          details: tableError.message 
        }, { status: 500 });
      }

      // First, let's check if there are any applications for this job
      const countResult = await client.query(
        'SELECT COUNT(*) as count FROM recruiter_applications WHERE job_id = $1',
        [jobId]
      );
      
      console.log('🔍 Total applications for this job:', countResult.rows[0]?.count);

      // Fetch applicants for this job with better error handling
      let applicantsResult;
      try {
        applicantsResult = await client.query(`
          SELECT 
            ra.id,
            ra.user_id,
            ra.resume_id,
            ra.resume_slug,
            ra.status,
            ra.created_at,
            u.full_name,
            u.first_name,
            u.last_name,
            u.username,
            u.email,
            u.phone,
            u.location,
            u.position,
            u.bio,
            u.avatar_url,
            sr.resume_data
          FROM recruiter_applications ra
          LEFT JOIN users u ON u.id = ra.user_id
          LEFT JOIN saved_resumes sr ON sr.id = ra.resume_id
          WHERE ra.job_id = $1
          ORDER BY ra.created_at DESC
        `, [jobId]);
      } catch (queryError) {
        console.error('🔍 Query error:', queryError);
        console.error('🔍 Query error details:', queryError.message);
        
        // Try a simpler query without joins to see if the basic data exists
        const simpleResult = await client.query(`
          SELECT 
            id,
            user_id,
            resume_id,
            resume_slug,
            status,
            created_at
          FROM recruiter_applications 
          WHERE job_id = $1
          ORDER BY created_at DESC
        `, [jobId]);
        
        console.log('🔍 Simple query result:', simpleResult.rows.length);
        
        // Check if the user exists in the users table
        if (simpleResult.rows.length > 0) {
          const userId = simpleResult.rows[0].user_id;
          console.log('🔍 Checking if user exists:', userId);
          
          try {
            const userCheck = await client.query('SELECT id, full_name, username, avatar FROM users WHERE id = $1', [userId]);
            console.log('🔍 User check result:', userCheck.rows.length, 'rows');
            if (userCheck.rows.length > 0) {
              console.log('🔍 User data:', userCheck.rows[0]);
            }
          } catch (userError) {
            console.error('🔍 User check error:', userError);
          }
        }
        
        // Try to fetch user data individually for each application
        const applicants = [];
        for (const row of simpleResult.rows) {
          let userData = {
            fullName: 'User data unavailable',
            firstName: null,
            lastName: null,
            username: null,
            email: 'Email unavailable',
            phone: null,
            location: null,
            position: null,
            bio: null,
            avatar: null
          };
          
          try {
            const userResult = await client.query('SELECT full_name, first_name, last_name, username, email, phone, location, position, bio, avatar_url FROM users WHERE id = $1', [row.user_id]);
            if (userResult.rows.length > 0) {
              const user = userResult.rows[0];
              userData = {
                fullName: user.full_name || 'Unknown User',
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                location: user.location,
                position: user.position,
                bio: user.bio,
                avatar: user.avatar_url
              };
            }
          } catch (userError) {
            console.error('🔍 Error fetching user data for user_id:', row.user_id, userError);
          }
          
          applicants.push({
            id: row.id,
            userId: row.user_id,
            resumeId: row.resume_id,
            resumeSlug: row.resume_slug,
            status: row.status,
            appliedAt: row.created_at,
            ...userData,
            resumeData: null
          });
        }

        return NextResponse.json({
          job: {
            id: job.id,
            title: job.job_title
          },
          applicants,
          total: applicants.length,
          warning: 'Some user data could not be loaded due to database constraints'
        });
      }
      
      console.log('🔍 Found applicants:', applicantsResult.rows.length);

      const applicants = applicantsResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        resumeId: row.resume_id,
        resumeSlug: row.resume_slug,
        status: row.status,
        appliedAt: row.created_at,
        fullName: row.full_name,
        firstName: row.first_name,
        lastName: row.last_name,
        username: row.username,
        email: row.email,
        phone: row.phone,
        location: row.location,
        position: row.position,
        bio: row.bio,
        avatar: row.avatar_url,
        resumeData: row.resume_data
      }));

      console.log('🔍 Returning response with', applicants.length, 'applicants');
      
      return NextResponse.json({
        job: {
          id: job.id,
          title: job.job_title
        },
        applicants,
        total: applicants.length
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error fetching applicants:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a safe fallback response
    return NextResponse.json({ 
      job: {
        id: 'unknown',
        title: 'Unknown Job'
      },
      applicants: [],
      total: 0,
      error: 'Failed to fetch applicants',
      details: error.message
    }, { status: 500 });
  }
}