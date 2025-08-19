import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/user/games-count called')
    const userId = request.headers.get('x-user-id')
    console.log('👤 User ID from headers:', userId)
    
    if (!userId) {
      console.log('❌ No user ID found in headers')
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 })
    }

    console.log('🔌 Connecting to database...')
    const client = await pool.connect()
    console.log('✅ Database connected')
    
    try {
      // Count completed sessions for each game type
      console.log('🔍 Counting typing hero sessions...')
      const typingHeroResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM typing_hero_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      console.log('📊 Typing hero completed sessions:', typingHeroResult.rows[0]?.count)
      
      console.log('🔍 Counting disc personality sessions...')
      const discPersonalityResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM disc_personality_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      console.log('📊 DISC personality completed sessions:', discPersonalityResult.rows[0]?.count)
      
      console.log('🔍 Counting ultimate sessions...')
      const ultimateResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM ultimate_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      console.log('📊 Ultimate completed sessions:', ultimateResult.rows[0]?.count)
      
      console.log('🔍 Counting BPOC cultural sessions...')
      const bpocCulturalResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM bpoc_cultural_sessions 
         WHERE user_id = $1 AND finished_at IS NOT NULL`,
        [userId]
      )
      console.log('📊 BPOC cultural completed sessions:', bpocCulturalResult.rows[0]?.count)

      // Handle case where bpoc_cultural_results table might not exist
      let bpocCulturalResultsCount = 0
      try {
        console.log('🔍 Checking bpoc_cultural_results table...')
        const bpocCulturalResultsTable = await client.query(
          `SELECT COUNT(*) as count
           FROM bpoc_cultural_results
           WHERE user_id = $1`,
          [userId]
        )
        bpocCulturalResultsCount = parseInt(bpocCulturalResultsTable.rows[0]?.count || '0')
        console.log('📊 BPOC cultural results count:', bpocCulturalResultsCount)
      } catch (error) {
        // Table doesn't exist, use 0 as fallback
        console.log('⚠️ bpoc_cultural_results table not found, using 0 as fallback')
        bpocCulturalResultsCount = 0
      }

      // Total sessions across all games (finished or not)
      console.log('🔍 Counting total sessions...')
      const [typingHeroTotalRes, discPersonalityTotalRes, ultimateTotalRes, bpocCulturalTotalRes] = await Promise.all([
        client.query(
          `SELECT COUNT(*) as count FROM typing_hero_sessions WHERE user_id = $1`,
          [userId]
        ),
        client.query(
          `SELECT COUNT(*) as count FROM disc_personality_sessions WHERE user_id = $1`,
          [userId]
        ),
        client.query(
          `SELECT COUNT(*) as count FROM ultimate_sessions WHERE user_id = $1`,
          [userId]
        ),
        client.query(
          `SELECT COUNT(*) as count FROM bpoc_cultural_sessions WHERE user_id = $1`,
          [userId]
        ),
      ])

      // Achievement points (engagement score)
      console.log('🔍 Getting engagement score...')
      const engagementScoreRes = await client.query(
        `SELECT score FROM leaderboard_engagement_scores WHERE period = 'all' AND user_id = $1 LIMIT 1`,
        [userId]
      )
      const achievementPoints = parseInt(engagementScoreRes.rows[0]?.score ?? '0') || 0
      console.log('📊 Achievement points:', achievementPoints)
      
      // Calculate total completed games
      const typingHeroCount = parseInt(typingHeroResult.rows[0]?.count || '0')
      const discPersonalityCount = parseInt(discPersonalityResult.rows[0]?.count || '0')
      const ultimateCount = parseInt(ultimateResult.rows[0]?.count || '0')

      const bpocCulturalCount = Math.max(
        parseInt(bpocCulturalResult.rows[0]?.count || '0'),
        bpocCulturalResultsCount
      )

      // Compute total sessions across all games
      const totalSessions =
        parseInt(typingHeroTotalRes.rows[0]?.count || '0') +
        parseInt(discPersonalityTotalRes.rows[0]?.count || '0') +
        parseInt(ultimateTotalRes.rows[0]?.count || '0') +
        parseInt(bpocCulturalTotalRes.rows[0]?.count || '0')

      console.log('📊 Total sessions:', totalSessions)
      
      const totalCompleted = (typingHeroCount > 0 ? 1 : 0) + 
                           (discPersonalityCount > 0 ? 1 : 0) + 
                           (ultimateCount > 0 ? 1 : 0) +
                           (bpocCulturalCount > 0 ? 1 : 0)
      
      console.log('📊 Total completed games:', totalCompleted)
      
      const response = { 
        hasData: true,
        gamesCount: totalCompleted,
        totalSessions,
        achievementPoints,
        breakdown: {
          typingHero: typingHeroCount,
          discPersonality: discPersonalityCount,
          ultimate: ultimateCount,
          bpocCultural: bpocCulturalCount
        }
      }
      
      console.log('✅ Sending response:', response)
      return NextResponse.json(response)

    } finally {
      client.release()
      console.log('🔌 Database connection released')
    }
  } catch (error) {
    console.error('❌ Error fetching games count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games count', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
