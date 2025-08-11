import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = params
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const res = await client.query(
        'DELETE FROM saved_resumes WHERE user_id = $1 AND resume_slug = $2 RETURNING id',
        [userId, slug]
      )
      if (res.rowCount === 0) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}


