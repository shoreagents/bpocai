import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      // Get recent game performance data from multiple game tables
      const gamePerformanceQuery = `
        (
          -- Recent Typing Hero performance
          SELECT 
            'typing_hero' as game_type,
            u.full_name as user_name,
            ths.wpm as score,
            ths.accuracy as accuracy,
            ths.finished_at as timestamp,
            'WPM: ' || ths.wpm || ' | Accuracy: ' || ths.accuracy || '%' as display_text
          FROM typing_hero_sessions ths
          JOIN users u ON ths.user_id = u.id
          WHERE ths.finished_at IS NOT NULL
          ORDER BY ths.finished_at DESC
          LIMIT 5
        )
        UNION ALL
        (
          -- Recent BPOC Cultural performance
          SELECT 
            'bpoc_cultural' as game_type,
            u.full_name as user_name,
            bcs.survival_status as score,
            bcs.cultural_score as accuracy,
            bcs.created_at as timestamp,
            'Survival: ' || bcs.survival_status || '% | Score: ' || bcs.cultural_score as display_text
          FROM bpoc_cultural_stats bcs
          JOIN users u ON bcs.user_id = u.id
          ORDER BY bcs.created_at DESC
          LIMIT 5
        )
        UNION ALL
        (
          -- Recent Ultimate Game performance
          SELECT 
            'ultimate' as game_type,
            u.full_name as user_name,
            us.score as score,
            us.level_reached as accuracy,
            us.created_at as timestamp,
            'Score: ' || us.score || ' | Level: ' || us.level_reached as display_text
          FROM ultimate_stats us
          JOIN users u ON us.user_id = u.id
          ORDER BY us.created_at DESC
          LIMIT 5
        )
        ORDER BY timestamp DESC
        LIMIT 15
      `

      const result = await client.query(gamePerformanceQuery)
      console.log('🎮 Game performance query result:', {
        rowCount: result.rows.length,
        rows: result.rows
      })
      
      // Transform the data for the chart
      const gamePerformance = result.rows.map((row: any) => ({
        gameType: row.game_type,
        userName: row.user_name,
        score: row.score,
        accuracy: row.accuracy,
        timestamp: row.timestamp,
        displayText: row.display_text
      }))

      console.log('🎮 Transformed game performance data:', gamePerformance)

      return NextResponse.json({ 
        game_performance: gamePerformance 
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error getting game performance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
