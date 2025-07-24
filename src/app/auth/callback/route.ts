import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=auth_error', request.url))
  }

  if (code) {
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(new URL('/?error=session_error', request.url))
      }
    } catch (err) {
      console.error('Unexpected error during auth:', err)
      return NextResponse.redirect(new URL('/?error=unexpected_error', request.url))
    }
  }

  // Force redirect to production URL if we're in production environment
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL_URL || 
                       process.env.RAILWAY_PUBLIC_DOMAIN ||
                       request.url.includes('railway.app')
  
  if (isProduction) {
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bpocai-production.up.railway.app'
    return NextResponse.redirect(new URL('/', productionUrl))
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(new URL('/', request.url))
} 