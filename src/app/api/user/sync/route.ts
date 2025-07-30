import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { syncUserToDatabaseServer } from '@/lib/user-sync-server'

// POST - Sync user to Railway database
export async function POST(req: NextRequest) {
  try {
    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, email, first_name, last_name, full_name, location, avatar_url } = await req.json()

    // Verify the user is syncing their own data
    if (id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sync user to Railway database
    await syncUserToDatabaseServer({
      id,
      email,
      first_name,
      last_name,
      full_name,
      location,
      avatar_url
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing user to Railway:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 