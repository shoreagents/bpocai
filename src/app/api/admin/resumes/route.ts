import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting to fetch resumes...')
    
    const result = await pool.query(
      'SELECT * FROM resumes ORDER BY created_at DESC'
    )

    console.log('API: Raw resumes data:', result.rows)
    console.log('API: Number of resumes found:', result.rows.length)

    const transformedResumes = result.rows.map((resume: any) => ({
      id: resume.id,
      user_id: resume.user_id,
      title: resume.title,
      status: resume.status || 'active',
      created_at: resume.created_at,
      updated_at: resume.updated_at,
      file_url: resume.file_url,
      file_size: resume.file_size,
      file_type: resume.file_type,
      user_name: resume.user_name || 'Unknown User',
      user_email: resume.user_email || 'No email'
    }))

    return NextResponse.json({
      resumes: transformedResumes,
      total: transformedResumes.length,
      active: transformedResumes.filter((r: any) => r.status === 'active').length,
      draft: transformedResumes.filter((r: any) => r.status === 'draft').length
    })

  } catch (error) {
    console.error('Error in resumes API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, resumeId, ...data } = body

    switch (action) {
      case 'update':
        const updateResult = await pool.query(
          'UPDATE resumes SET title = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [data.title, data.status, resumeId]
        )

        if (updateResult.rowCount === 0) {
          return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Resume updated successfully' })

      case 'delete':
        const deleteResult = await pool.query(
          'DELETE FROM resumes WHERE id = $1',
          [resumeId]
        )

        if (deleteResult.rowCount === 0) {
          return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Resume deleted successfully' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in resumes API POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 