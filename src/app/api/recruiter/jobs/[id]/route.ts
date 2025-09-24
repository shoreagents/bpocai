import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 API called: PATCH /api/recruiter/jobs/[id]');
  
  try {
    const jobId = params.id;
    const body = await request.json();
    const { status } = body;

    console.log('🔍 Request params:', { jobId, status });

    if (!jobId) {
      console.log('❌ No job ID provided');
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Extract user ID from Authorization header
    const authHeader = request.headers.get('Authorization');
    let recruiterId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          console.log('❌ Invalid token:', error?.message);
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        recruiterId = user.id;
        console.log('🔍 Extracted user ID from token:', recruiterId);
      } catch (tokenError) {
        console.log('❌ Token validation error:', tokenError);
        return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
      }
    } else {
      // Fallback to x-user-id header for backward compatibility
      recruiterId = request.headers.get('x-user-id');
      console.log('🔍 Using x-user-id header:', recruiterId);
    }

    if (!recruiterId) {
      console.log('❌ No recruiter ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!status) {
      console.log('❌ No status provided');
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Valid status values
    const validStatuses = [
      'new_request', 'active', 'inactive', 'closed'
    ];

    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status);
      return NextResponse.json({ 
        error: 'Invalid status', 
        validStatuses 
      }, { status: 400 });
    }

    console.log('🔍 Connecting to database...');
    const client = await pool.connect();
    console.log('🔍 Database connected successfully');
    
    try {
      // First, verify that the recruiter owns this job
      console.log('🔍 Verifying recruiter ownership of job...');
      const ownershipCheck = await client.query(
        'SELECT id, job_title FROM recruiter_jobs WHERE id = $1 AND recruiter_id = $2',
        [jobId, recruiterId]
      );

      console.log('🔍 Ownership check result:', ownershipCheck.rows.length);

      if (ownershipCheck.rows.length === 0) {
        console.log('❌ Job not found or access denied');
        return NextResponse.json({ 
          error: 'Job not found or access denied' 
        }, { status: 404 });
      }

      const job = ownershipCheck.rows[0];
      console.log('🔍 Found job:', job.job_title);

      // Update the job status
      console.log('🔍 Updating job status...');
      const updateResult = await client.query(
        'UPDATE recruiter_jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, updated_at',
        [status, jobId]
      );

      if (updateResult.rows.length === 0) {
        console.log('❌ Failed to update job status');
        return NextResponse.json({ 
          error: 'Failed to update job status' 
        }, { status: 500 });
      }

      const updatedJob = updateResult.rows[0];
      console.log('✅ Successfully updated job status:', updatedJob.status);

      return NextResponse.json({
        success: true,
        message: 'Job status updated successfully',
        data: {
          id: updatedJob.id,
          status: updatedJob.status,
          updatedAt: updatedJob.updated_at
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error updating job status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('❌ Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });
    
    return NextResponse.json({ 
      error: 'Failed to update job status',
      details: errorMessage
    }, { status: 500 });
  }
}