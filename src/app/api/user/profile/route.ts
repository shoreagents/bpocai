import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch user profile from Railway
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔍 API: Fetching profile for user:', userId)

    // Base query (avoid selecting optional columns that may not exist across envs)
    const query = `
      SELECT id, email, first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday, slug, gender, created_at, updated_at
      FROM users 
      WHERE id = $1
    `
    
    const result = await pool.query(query, [userId])

    if (result.rows.length === 0) {
      console.log('❌ API: User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = result.rows[0]
    
    // Try to get gender separately if column exists
    let gender = null
    try {
      const genderResult = await pool.query(`
        SELECT gender FROM users WHERE id = $1
      `, [userId])
      gender = genderResult.rows[0]?.gender || null
    } catch (error) {
      console.log('⚠️ Gender column does not exist yet, defaulting to null')
    }
    
    // Try to get gender_custom separately if column exists
    let genderCustom: string | null = null
    try {
      const gcRes = await pool.query(`SELECT gender_custom FROM users WHERE id = $1`, [userId])
      genderCustom = gcRes.rows?.[0]?.gender_custom ?? null
    } catch (e) {
      console.log('⚠️ gender_custom column not found, defaulting to null')
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      location: user.location,
      avatar_url: user.avatar_url,
      phone: user.phone,
      bio: user.bio,
      position: user.position,
      completed_data: user.completed_data,
      birthday: user.birthday,
      slug: user.slug,
      gender: gender,
      gender_custom: genderCustom,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
    
    console.log('✅ API: User profile loaded:', userProfile)

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('❌ API: Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

// PUT - Update user profile in Railway
export async function PUT(request: NextRequest) {
  try {
    const { userId, ...updateData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log('🔄 API: Updating profile for user:', userId)
    console.log('📊 API: Update data received:', updateData)

    // Load existing values to avoid overwriting with nulls when not provided
    const existingRes = await pool.query(
      `SELECT first_name, last_name, full_name, location, avatar_url, phone, bio, position, completed_data, birthday, gender, gender_custom FROM users WHERE id = $1`,
      [userId]
    )
    
    // Try to get existing gender separately
    let existingGender = null
    try {
      const genderRes = await pool.query(`SELECT gender FROM users WHERE id = $1`, [userId])
      existingGender = genderRes.rows[0]?.gender || null
    } catch (error) {
      console.log('⚠️ Gender column does not exist yet')
    }

    if (existingRes.rows.length === 0) {
      console.log('❌ API: User not found for update:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = existingRes.rows[0]

    const firstName = updateData.first_name ?? existing.first_name
    const lastName = updateData.last_name ?? existing.last_name
    const location = updateData.location ?? existing.location
    const avatarUrl = updateData.avatar_url ?? existing.avatar_url
    const phone = updateData.phone ?? existing.phone
    const bio = updateData.bio ?? existing.bio
    const position = updateData.position ?? existing.position

    const gender = updateData.gender ?? existing.gender
    const genderCustom = updateData.gender_custom ?? existing.gender_custom


    // Handle completed_data and birthday, preserving ability to clear birthday
    const completedData = Object.prototype.hasOwnProperty.call(updateData, 'completed_data')
      ? updateData.completed_data
      : existing.completed_data
    let birthday = Object.prototype.hasOwnProperty.call(updateData, 'birthday')
      ? updateData.birthday
      : existing.birthday
    // Normalize birthday: empty strings -> null to satisfy DATE type
    if (typeof birthday === 'string' && birthday.trim() === '') {
      birthday = null
    }

    // Recompute full_name from first/last when applicable, otherwise keep existing
    const recomputedFullName = `${firstName || ''} ${lastName || ''}`.trim()
    const fullName = recomputedFullName || existing.full_name

    // Dynamically build UPDATE based on available columns to avoid env drift
    const colsRes = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users'`
    )
    const available = new Set<string>(colsRes.rows.map((r: any) => r.column_name))

    type Field = { col: string, val: any }
    const baseFields: Field[] = [
      { col: 'first_name', val: firstName },
      { col: 'last_name', val: lastName },
      { col: 'full_name', val: fullName },
      { col: 'location', val: location },
      { col: 'avatar_url', val: avatarUrl },
      { col: 'phone', val: phone },
      { col: 'bio', val: bio },
      { col: 'position', val: position }
    ]
    const optionalFields: Field[] = []
    if (available.has('completed_data')) optionalFields.push({ col: 'completed_data', val: completedData })
    if (available.has('birthday')) optionalFields.push({ col: 'birthday', val: birthday })
    if (available.has('gender')) optionalFields.push({ col: 'gender', val: gender })
    if (available.has('gender_custom')) optionalFields.push({ col: 'gender_custom', val: genderCustom })

    const allFields = [...baseFields, ...optionalFields]
    const setClauses: string[] = []
    const params: any[] = [userId]
    let i = 2
    for (const f of allFields) {
      setClauses.push(`${f.col} = $${i}`)
      params.push(f.val)
      i++
    }
    setClauses.push('updated_at = NOW()')

    const updateSql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`
    console.log('🔧 UPDATE users dynamic SQL:', updateSql)
    const result = await pool.query(updateSql, params)
    
    // Try to update gender separately if column exists and gender is provided
    if (updateData.gender && gender) {
      try {
        await pool.query(`UPDATE users SET gender = $1 WHERE id = $2`, [gender, userId])
        console.log('✅ Gender updated successfully')
      } catch (error) {
        console.log('⚠️ Gender column does not exist yet, skipping gender update')
      }
    }
    if (typeof updateData.gender_custom !== 'undefined') {
      try {
        await pool.query(`UPDATE users SET gender_custom = $1 WHERE id = $2`, [genderCustom, userId])
        console.log('✅ Gender custom updated successfully')
      } catch (error) {
        console.log('⚠️ gender_custom column does not exist yet, skipping gender_custom update')
      }
    }

    if (result.rows.length === 0) {
      console.log('❌ API: User not found for update:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = result.rows[0]
    console.log('✅ API: User profile updated:', {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      avatar_url: updatedUser.avatar_url
    })

    // Also update Supabase auth user metadata so future syncs won't revert names
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && serviceKey) {
        const supabaseAdmin = createClient(supabaseUrl, serviceKey)
        const adminRes = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            location,
            phone,
            position
          }
        })
        if (adminRes.error) {
          console.log('⚠️ Supabase admin metadata update failed:', adminRes.error.message)
        } else {
          console.log('✅ Supabase metadata updated for user:', userId)
        }
      } else {
        console.log('⚠️ Skipping Supabase metadata update - missing env vars')
      }
    } catch (e) {
      console.log('⚠️ Error updating Supabase metadata (non-fatal):', e instanceof Error ? e.message : String(e))
    }

    // Ensure saved resume slug reflects the updated first/last name
    let resumeSlugUpdated = false
    let newResumeSlug: string | null = null
    try {
      // Find the most recent saved resume for this user (if any)
      const savedRes = await pool.query(
        `SELECT id, resume_slug FROM saved_resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [userId]
      )
      if (savedRes.rows.length > 0) {
        const resumeId: string = savedRes.rows[0].id
        const currentSlug: string = savedRes.rows[0].resume_slug

        // Build base slug from updated full name and ensure it ends with -resume
        const baseFromFullName = String(fullName || '').toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
        let baseSlug = baseFromFullName || 'user'
        if (!baseSlug.endsWith('-resume')) {
          baseSlug += '-resume'
        }

        // If slug is already correct, skip
        if (currentSlug !== baseSlug) {
          // Ensure uniqueness
          let candidate = baseSlug
          let counter = 1
          // Avoid conflicting with other rows (excluding this resume id)
          // Try a reasonable number of attempts; collisions unlikely
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const check = await pool.query(
              `SELECT 1 FROM saved_resumes WHERE resume_slug = $1 AND id <> $2 LIMIT 1`,
              [candidate, resumeId]
            )
            if (check.rows.length === 0) break
            candidate = `${baseSlug}-${counter}`
            counter++
          }

          // Update saved_resumes slug
          await pool.query(
            `UPDATE saved_resumes SET resume_slug = $1, updated_at = NOW() WHERE id = $2`,
            [candidate, resumeId]
          )

          // Keep applications table in sync for convenience
          try {
            await pool.query(
              `UPDATE applications SET resume_slug = $1 WHERE resume_id = $2`,
              [candidate, resumeId]
            )
          } catch {}

          resumeSlugUpdated = true
          newResumeSlug = candidate
        }
      }
    } catch (e) {
      console.log('⚠️ Skipping resume slug update:', e instanceof Error ? e.message : String(e))
    }

    return NextResponse.json({ user: updatedUser, resumeSlugUpdated, newResumeSlug })
  } catch (error) {
    console.error('❌ API: Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 