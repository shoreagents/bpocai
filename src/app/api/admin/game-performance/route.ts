import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(_request: NextRequest) {
  try {
    // Minimal placeholder using existing tables
    const typing = await pool.query(`SELECT COUNT(*)::int AS sessions FROM typing_hero_sessions`)
    const ultimate = await pool.query(`SELECT COUNT(*)::int AS sessions FROM ultimate_sessions`)
    const disc = await pool.query(`SELECT COUNT(*)::int AS sessions FROM disc_personality_sessions`)
    const bpoc = await pool.query(`SELECT COUNT(*)::int AS sessions FROM bpoc_cultural_sessions`)

    return NextResponse.json({
      game_performance: [
        { game: 'typing-hero', sessions: typing.rows[0]?.sessions ?? 0 },
        { game: 'ultimate', sessions: ultimate.rows[0]?.sessions ?? 0 },
        { game: 'disc-personality', sessions: disc.rows[0]?.sessions ?? 0 },
        { game: 'bpoc-cultural', sessions: bpoc.rows[0]?.sessions ?? 0 },
      ]
    })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
