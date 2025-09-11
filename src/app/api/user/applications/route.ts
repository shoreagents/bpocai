import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

export async function DELETE(request: NextRequest) {
  const client = await pool.connect()
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Delete all applications for this user
    await client.query('DELETE FROM applications WHERE user_id = $1', [userId])
    
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete applications' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const jobId = Number(body?.jobId)
    const resumeId = String(body?.resumeId || '')
    const resumeSlug = String(body?.resumeSlug || '')
    if (!jobId || Number.isNaN(jobId)) return NextResponse.json({ error: 'jobId required' }, { status: 400 })
    if (!resumeId || !resumeSlug) return NextResponse.json({ error: 'resumeId and resumeSlug required' }, { status: 400 })

    await client.query('BEGIN')

    // Ensure resume belongs to user
    const r = await client.query('SELECT id, user_id FROM saved_resumes WHERE id = $1', [resumeId])
    if (r.rows.length === 0 || String(r.rows[0].user_id) !== String(userId)) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Invalid resume' }, { status: 400 })
    }

    // Upsert-like behavior: return existing application if present
    const existing = await client.query('SELECT * FROM applications WHERE user_id = $1 AND job_id = $2 LIMIT 1', [userId, jobId])
    if (existing.rows.length > 0) {
      await client.query('COMMIT')
      return NextResponse.json({ application: existing.rows[0], created: false })
    }

    // Insert new application with default status 'submitted'
    const ins = await client.query(
      `INSERT INTO applications (user_id, job_id, resume_id, resume_slug, status)
       VALUES ($1, $2, $3, $4, 'submitted')
       RETURNING *`,
      [userId, jobId, resumeId, resumeSlug]
    )

    await client.query('COMMIT')
    return NextResponse.json({ application: ins.rows[0], created: true })
  } catch (e) {
    await client.query('ROLLBACK')
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  } finally {
    client.release()
  }
}


