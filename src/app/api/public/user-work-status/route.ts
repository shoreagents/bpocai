import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// GET /api/public/user-work-status?userId=<uuid> OR ?slug=<resume_slug>
// Returns public-friendly work status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    const resumeSlug = searchParams.get('slug')

    let userId = userIdParam

    if (!userId && resumeSlug) {
      // Resolve userId from saved_resumes by resume slug
      const slugRes = await pool.query(
        `SELECT user_id FROM saved_resumes WHERE resume_slug = $1 LIMIT 1`,
        [resumeSlug]
      )
      if (slugRes.rows.length > 0) {
        userId = slugRes.rows[0].user_id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId or slug is required' }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT user_id, current_employer, current_position, current_salary, notice_period_days,
              salary_goal, current_mood, work_status, employment_type, created_at, updated_at
         FROM user_work_status
        WHERE user_id = $1`,
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
    console.error('Error fetching public work status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


