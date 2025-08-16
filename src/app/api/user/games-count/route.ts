import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Count completed sessions for each game type
      const typingHeroResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM typing_hero_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      
      const discPersonalityResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM disc_personality_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      
      const ultimateResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM ultimate_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      
      // Calculate total completed games
      const typingHeroCount = parseInt(typingHeroResult.rows[0]?.count || '0')
      const discPersonalityCount = parseInt(discPersonalityResult.rows[0]?.count || '0')
      const ultimateCount = parseInt(ultimateResult.rows[0]?.count || '0')
      
      const totalCompleted = (typingHeroCount > 0 ? 1 : 0) + 
                           (discPersonalityCount > 0 ? 1 : 0) + 
                           (ultimateCount > 0 ? 1 : 0)
      
      return NextResponse.json({ 
        hasData: true,
        gamesCount: totalCompleted,
        breakdown: {
          typingHero: typingHeroCount,
          discPersonality: discPersonalityCount,
          ultimate: ultimateCount
        }
      })

    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Error fetching games count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games count', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
