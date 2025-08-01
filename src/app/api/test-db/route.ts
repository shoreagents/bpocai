import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    console.log('🧪 Testing database connection...')
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Database connection successful')
    return NextResponse.json({ 
      success: true, 
      time: result.rows[0].current_time,
      message: 'Database connection successful'
    })
  } catch (error) {
    console.error('❌ Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
} 