import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting to fetch analysis results...')
    
    // Query analysis results with user information
    const result = await pool.query(`
      SELECT 
        a.id,
        a.user_id,
        a.resume_id,
        a.analysis_type,
        a.analysis_data,
        a.overall_score,
        a.confidence_level,
        a.model_used,
        a.processing_time_ms,
        a.status,
        a.error_message,
        a.created_at,
        a.updated_at,
        u.full_name as user_name,
        u.email as user_email,
        COALESCE(sr.resume_title, 'Unknown Resume') as resume_title
      FROM ai_analysis_results a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN saved_resumes sr ON a.resume_id = sr.id
      ORDER BY a.created_at DESC
    `)

    console.log('API: Raw analysis data:', result.rows)
    console.log('API: Number of analysis results found:', result.rows.length)

    const transformedResults = result.rows.map((analysis: any) => ({
      id: analysis.id,
      user_id: analysis.user_id,
      resume_id: analysis.resume_id,
      analysis_type: analysis.analysis_type,
      analysis_data: analysis.analysis_data,
      overall_score: analysis.overall_score,
      confidence_level: analysis.confidence_level,
      model_used: analysis.model_used,
      processing_time_ms: analysis.processing_time_ms,
      status: analysis.status,
      error_message: analysis.error_message,
      created_at: analysis.created_at,
      updated_at: analysis.updated_at,
      user_name: analysis.user_name || 'Unknown User',
      user_email: analysis.user_email || 'No email',
      resume_title: analysis.resume_title
    }))

    return NextResponse.json({
      analysisResults: transformedResults,
      total: transformedResults.length,
      completed: transformedResults.filter((r: any) => r.status === 'completed').length,
      failed: transformedResults.filter((r: any) => r.status === 'failed').length,
      processing: transformedResults.filter((r: any) => r.status === 'processing').length
    })

  } catch (error) {
    console.error('Error in analysis API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, analysisId, ...data } = body

    switch (action) {
      case 'update':
        const updateResult = await pool.query(
          'UPDATE ai_analysis_results SET analysis_data = $1, overall_score = $2, confidence_level = $3, status = $4, updated_at = NOW() WHERE id = $5',
          [data.analysis_data, data.overall_score, data.confidence_level, data.status, analysisId]
        )

        if (updateResult.rowCount === 0) {
          return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Analysis updated successfully' })

      case 'delete':
        const deleteResult = await pool.query(
          'DELETE FROM ai_analysis_results WHERE id = $1',
          [analysisId]
        )

        if (deleteResult.rowCount === 0) {
          return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Analysis deleted successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in analysis API POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
