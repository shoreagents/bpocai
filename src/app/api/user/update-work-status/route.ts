import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      current_employer, 
      current_position, 
      current_salary, 
      notice_period_days, 
      current_mood, 
      work_status, 
      preferred_shift, 
      expected_salary, 
      work_setup 
    } = body;

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify the user is updating their own profile
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the user work status in the database
    const updateQuery = `
      UPDATE user_work_status 
      SET 
        current_employer = COALESCE($1, current_employer),
        current_position = COALESCE($2, current_position),
        current_salary = COALESCE($3, current_salary),
        notice_period_days = COALESCE($4, notice_period_days),
        current_mood = COALESCE($5, current_mood),
        work_status = COALESCE($6, work_status),
        preferred_shift = COALESCE($7, preferred_shift),
        expected_salary = COALESCE($8, expected_salary),
        work_setup = COALESCE($9, work_setup),
        updated_at = NOW()
      WHERE user_id = $10
      RETURNING *
    `;

    const values = [
      current_employer || null,
      current_position || null,
      current_salary || null,
      notice_period_days || null,
      current_mood || null,
      work_status || null,
      preferred_shift || null,
      expected_salary || null,
      work_setup || null,
      userId
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User work status not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      workStatus: result.rows[0] 
    });

  } catch (error) {
    console.error('Error updating user work status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
