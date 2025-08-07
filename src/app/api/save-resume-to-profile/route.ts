import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting save-resume-to-profile API call...')
    
    const { 
      resumeData, 
      templateUsed, 
      resumeTitle,
      originalResumeId 
    } = await request.json()
    
    console.log('📥 Received data:', { 
      hasResumeData: !!resumeData, 
      templateUsed,
      resumeTitle
    })

    if (!resumeData || !templateUsed || !resumeTitle) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: resumeData, templateUsed, resumeTitle' },
        { status: 400 }
      )
    }

    // Get the user from the request headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    console.log('👤 User ID from headers:', userId)
    
    if (!userId) {
      console.log('❌ No user ID found in headers')
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL
    
    console.log('🔧 Environment check:', {
      hasDatabaseUrl: !!databaseUrl,
      databaseUrl: databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'missing'
    })

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

      // Check if user exists and get user info
      const userCheck = await client.query(
        'SELECT id, first_name, last_name, full_name FROM users WHERE id = $1',
        [userId]
      )

      if (userCheck.rows.length === 0) {
        console.log('❌ User not found in database:', userId)
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        )
      }

      const user = userCheck.rows[0]
      console.log('✅ User found in database:', user.full_name)

      // Generate a URL-friendly slug from the full name
      const generateSlug = (fullName: string) => {
        // Create slug directly from full name
        let slug = fullName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
        
        // Add "-resume" suffix if not already present
        if (!slug.endsWith('-resume')) {
          slug += '-resume'
        }
        
        return slug
      }

      const baseSlug = generateSlug(user.full_name)
      let finalSlug = baseSlug
      let counter = 1

      // Check if slug already exists and generate a unique one
      while (true) {
        const slugCheck = await client.query(
          'SELECT id FROM saved_resumes WHERE resume_slug = $1',
          [finalSlug]
        )
        
        if (slugCheck.rows.length === 0) {
          break // Slug is unique
        }
        
        // Add counter to make it unique
        finalSlug = `${baseSlug}-${counter}`
        counter++
      }

      console.log('🔗 Generated unique slug:', finalSlug)

      // Insert the saved resume data into the database
      console.log('💾 Saving resume to profile...')
      const insertResult = await client.query(
        `INSERT INTO saved_resumes (user_id, resume_slug, resume_title, resume_data, template_used, original_resume_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, resume_slug`,
        [
          userId,
          finalSlug,
          resumeTitle,
          JSON.stringify(resumeData),
          templateUsed,
          originalResumeId || null
        ]
      )

      const savedResumeId = insertResult.rows[0].id
      const resumeSlug = insertResult.rows[0].resume_slug
      
      console.log(`💾 Resume saved to profile: ${savedResumeId}`)
      console.log(`🔗 Resume slug: ${resumeSlug}`)
      console.log(`👤 User ID: ${userId}`)
      console.log(`📁 Resume title: ${resumeTitle}`)

      return NextResponse.json({
        success: true,
        savedResumeId: savedResumeId,
        resumeSlug: resumeSlug,
        resumeUrl: `/${resumeSlug}`,
        message: 'Resume saved to profile successfully'
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error('❌ Error saving resume to profile:', error)
    return NextResponse.json(
      {
        error: 'Failed to save resume to profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
