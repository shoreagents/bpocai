import { NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    const client = await pool.connect()
    
    try {
      // Simple test query
      const result = await client.query('SELECT NOW() as current_time, version() as db_version')
      
      console.log('✅ Database connection successful:', result.rows[0])
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        data: result.rows[0]
      })
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}