import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    console.log('🔍 Getting saved resume for slug:', slug)

    if (!slug) {
      return NextResponse.json(
        { error: 'Resume slug is required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      console.log('❌ Missing DATABASE_URL environment variable')
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Test database connection first
    console.log('🧪 Testing database connection...')
    const client = await pool.connect()
    
    try {
      // Test the connection
      const testResult = await client.query('SELECT NOW()')
      console.log('✅ Database connection successful:', testResult.rows[0])

      // Get the saved resume with user info
      const resumeResult = await client.query(
        `SELECT 
          sr.id,
          sr.resume_slug,
          sr.resume_title,
          sr.resume_data,
          sr.template_used,
          sr.is_public,
          sr.view_count,
          sr.created_at,
          sr.updated_at,
          u.full_name,
          u.avatar_url
         FROM saved_resumes sr
         JOIN users u ON sr.user_id = u.id
         WHERE sr.resume_slug = $1`,
        [slug]
      )

      if (resumeResult.rows.length === 0) {
        console.log('❌ Resume not found for slug:', slug)
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        )
      }

      const resume = resumeResult.rows[0]
      console.log('✅ Resume found:', resume.resume_title)

      // Increment view count
      await client.query(
        'UPDATE saved_resumes SET view_count = view_count + 1 WHERE id = $1',
        [resume.id]
      )

      return NextResponse.json({
        success: true,
        resume: {
          id: resume.id,
          slug: resume.resume_slug,
          title: resume.resume_title,
          data: resume.resume_data,
          template: resume.template_used,
          isPublic: resume.is_public,
          viewCount: resume.view_count + 1, // Return incremented count
          createdAt: resume.created_at,
          updatedAt: resume.updated_at,
          user: {
            fullName: resume.full_name,
            avatarUrl: resume.avatar_url
          }
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error getting saved resume:', error)
    return NextResponse.json(
      {
        error: 'Failed to get saved resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
