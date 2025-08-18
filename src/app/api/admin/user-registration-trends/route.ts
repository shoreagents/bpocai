import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(_request: NextRequest) {
  try {
    const client = await pool.connect()
    
    try {
      // Get daily user registration counts for the last 7 days
      const userRegistrationTrendsQuery = `
        WITH date_series AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS date
        ),
        daily_registrations AS (
          SELECT 
            DATE(u.created_at) as registration_date,
            COUNT(*) as registration_count
          FROM users u
          WHERE u.created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(u.created_at)
        )
        SELECT 
          ds.date,
          COALESCE(dr.registration_count, 0) as registration_count,
          TO_CHAR(ds.date, 'Mon DD') as display_date
        FROM date_series ds
        LEFT JOIN daily_registrations dr ON ds.date = dr.registration_date
        ORDER BY ds.date ASC
      `

      const result = await client.query(userRegistrationTrendsQuery)
      
      // Transform the data for the chart
      const userRegistrationTrends = result.rows.map((row: any) => ({
        date: row.date,
        count: parseInt(row.registration_count),
        displayDate: row.display_date
      }))

      return NextResponse.json({ 
        user_registration_trends: userRegistrationTrends 
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error getting user registration trends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
