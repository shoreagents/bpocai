import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET - Fetch work status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT user_id, current_employer, current_position, current_salary, notice_period_days, expected_salary, current_mood, work_status, preferred_shift, work_setup, completed_data, created_at, updated_at
       FROM user_work_status WHERE user_id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ found: false })
    }

    const row = result.rows[0]
    const workStatus = {
      userId: row.user_id,
      currentEmployer: row.current_employer,
      currentPosition: row.current_position,
      currentSalary: row.current_salary,
      noticePeriod: row.notice_period_days,
      expectedSalary: row.expected_salary,
      currentMood: row.current_mood,
      workStatus: row.work_status,
      preferredShift: row.preferred_shift,
      workSetup: row.work_setup,
      completedData: row.completed_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return NextResponse.json({ found: true, workStatus })
  } catch (error) {
    console.error('Error fetching work status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Upsert work status for a user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      currentEmployer,
      currentPosition,
      currentSalary,
      noticePeriod,
      expectedSalary,
      currentMood,
      workStatus,
      preferredShift,
      workSetup,
      completedData,
      completed_data,
    } = body || {}

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if exists
    const existing = await pool.query(
      `SELECT user_id FROM user_work_status WHERE user_id = $1`,
      [userId]
    )

    // Normalize to allowed moods: Happy, Satisfied, Sad, Undecided
    const moodMap: Record<string, string> = {
      happy: 'Happy',
      excited: 'Happy',
      satisfied: 'Satisfied',
      content: 'Satisfied',
      okay: 'Satisfied',
      sad: 'Sad',
      frustrated: 'Sad',
      stressed: 'Sad',
      unhappy: 'Sad',
      neutral: 'Undecided',
      bored: 'Undecided',
      undecided: 'Undecided',
      unknown: 'Undecided',
    }
    const statusMap: Record<string, string> = {
      unemployed: 'unemployed-looking-for-work',
      'unemployed-looking-for-work': 'unemployed-looking-for-work',
      employed: 'employed',
      freelancer: 'freelancer',
      'part-time': 'part-time',
      'on-leave': 'on-leave',
      retired: 'retired',
      student: 'student',
      'career-break': 'career-break',
      transitioning: 'transitioning',
      'remote-worker': 'remote-worker',
    }
    const sanitizedMood = currentMood ? (moodMap[String(currentMood).toLowerCase()] || null) : null
    const sanitizedStatus = workStatus ? (statusMap[String(workStatus)] || workStatus) : null

    if (existing.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE user_work_status
         SET current_employer = $2,
             current_position = $3,
             current_salary = $4,
             notice_period_days = $5,
             expected_salary = $6,
             current_mood = $7,
             work_status = $8,
             preferred_shift = $9,
             work_setup = $10,
                           completed_data = $11,
             updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [
          userId,
          currentEmployer ?? null,
          currentPosition ?? null,
          currentSalary ?? null,
          typeof noticePeriod === 'number' ? noticePeriod : (noticePeriod ? parseInt(String(noticePeriod)) : null),
          expectedSalary ?? null,
          sanitizedMood,
          sanitizedStatus,
          preferredShift ?? null,
          workSetup ?? null,
          typeof (completedData || completed_data) === 'boolean' ? (completedData || completed_data) : null,
        ]
      )
      
      // Sync current_position changes to users table
      if (currentPosition !== undefined) {
        try {
          console.log('🔄 Syncing current_position to users table:', currentPosition)
          await pool.query(
            `UPDATE users SET position = $1, updated_at = NOW() WHERE id = $2`,
            [currentPosition, userId]
          )
          console.log('✅ Current position synced to users table')
        } catch (error) {
          console.log('⚠️ Failed to sync current_position to users (non-fatal):', error instanceof Error ? error.message : String(error))
        }
      }
      
      return NextResponse.json({ saved: true, workStatus: updateRes.rows[0] })
    }

    const insertRes = await pool.query(
      `INSERT INTO user_work_status (
         user_id, current_employer, current_position, current_salary, notice_period_days, expected_salary, current_mood, work_status, preferred_shift, work_setup, completed_data, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
       ) RETURNING *`,
      [
        userId,
        currentEmployer ?? null,
        currentPosition ?? null,
        currentSalary ?? null,
        typeof noticePeriod === 'number' ? noticePeriod : (noticePeriod ? parseInt(String(noticePeriod)) : null),
        expectedSalary ?? null,
        sanitizedMood,
        sanitizedStatus,
        preferredShift ?? null,
        workSetup ?? null,
        typeof (completedData || completed_data) === 'boolean' ? (completedData || completed_data) : null,
      ]
    )
    
    // Sync current_position changes to users table for new records too
    if (currentPosition !== undefined) {
      try {
        console.log('🔄 Syncing current_position to users table (new record):', currentPosition)
        await pool.query(
          `UPDATE users SET position = $1, updated_at = NOW() WHERE id = $2`,
          [currentPosition, userId]
        )
        console.log('✅ Current position synced to users table (new record)')
      } catch (error) {
        console.log('⚠️ Failed to sync current_position to users (non-fatal):', error instanceof Error ? error.message : String(error))
      }
    }
    
    return NextResponse.json({ saved: true, workStatus: insertRes.rows[0] })
  } catch (error) {
    console.error('Error saving work status:', error)
    const details = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Internal server error', details }, { status: 500 })
  }
}


