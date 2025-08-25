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
      `SELECT user_id, current_employer, current_position, current_salary, notice_period_days, salary_goal, current_mood, work_status, employment_type, created_at, updated_at
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
      salaryGoal: row.salary_goal,
      currentMood: row.current_mood,
      workStatus: row.work_status,
      employmentType: row.employment_type,
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
      salaryGoal,
      currentMood,
      workStatus,
      employmentType,
    } = body || {}

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if exists
    const existing = await pool.query(
      `SELECT user_id FROM user_work_status WHERE user_id = $1`,
      [userId]
    )

    if (existing.rows.length > 0) {
      const updateRes = await pool.query(
        `UPDATE user_work_status
         SET current_employer = $2,
             current_position = $3,
             current_salary = $4,
             notice_period_days = $5,
             salary_goal = $6,
             current_mood = $7,
             work_status = $8,
             employment_type = $9,
             updated_at = NOW()
         WHERE user_id = $1
         RETURNING *`,
        [
          userId,
          currentEmployer ?? null,
          currentPosition ?? null,
          currentSalary ?? null,
          typeof noticePeriod === 'number' ? noticePeriod : (noticePeriod ? parseInt(String(noticePeriod)) : null),
          salaryGoal ?? null,
          currentMood ?? null,
          workStatus ?? null,
          employmentType ?? null,
        ]
      )
      return NextResponse.json({ saved: true, workStatus: updateRes.rows[0] })
    }

    const insertRes = await pool.query(
      `INSERT INTO user_work_status (
         user_id, current_employer, current_position, current_salary, notice_period_days, salary_goal, current_mood, work_status, employment_type, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
       ) RETURNING *`,
      [
        userId,
        currentEmployer ?? null,
        currentPosition ?? null,
        currentSalary ?? null,
        typeof noticePeriod === 'number' ? noticePeriod : (noticePeriod ? parseInt(String(noticePeriod)) : null),
        salaryGoal ?? null,
        currentMood ?? null,
        workStatus ?? null,
        employmentType ?? null,
      ]
    )
    return NextResponse.json({ saved: true, workStatus: insertRes.rows[0] })
  } catch (error) {
    console.error('Error saving work status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


