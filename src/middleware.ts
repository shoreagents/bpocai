import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, apiRateLimiter, authRateLimiter } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  // Security: Block suspicious requests
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /sqlmap/i, /nikto/i, /nmap/i, /wget/i, /curl/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.log('🚫 Blocked suspicious user agent:', userAgent)
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request, apiRateLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // Enhanced authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/api/save-resume') || 
      request.nextUrl.pathname.startsWith('/api/save-generated-resume') ||
      request.nextUrl.pathname.startsWith('/api/save-resume-to-profile') ||
      request.nextUrl.pathname.startsWith('/api/user/saved-resumes') ||
      request.nextUrl.pathname.startsWith('/api/admin/')) {
    
    console.log('🔍 Middleware: Processing authenticated API request')
    
    try {
      // Get the authorization header
      const authHeader = request.headers.get('authorization')
      console.log('🔑 Auth header present:', !!authHeader)
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Middleware: Missing or invalid authorization header')
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      console.log('🎫 Token length:', token.length)
      
      // Validate token format (basic check)
      if (token.length < 50) {
        console.log('❌ Middleware: Token too short')
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        )
      }
      
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      console.log('🔧 Middleware environment check:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey
      })

      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Middleware: Missing Supabase environment variables')
        return NextResponse.json(
          { error: 'Authentication configuration error' },
          { status: 500 }
        )
      }
      
      // Initialize Supabase client for token verification only
      console.log('🔌 Middleware: Initializing Supabase client for token verification...')
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Verify the token and get user
      console.log('🔍 Middleware: Verifying token...')
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error) {
        console.error('❌ Middleware: Token verification error:', error)
        return NextResponse.json(
          { error: 'Invalid or expired token', details: error.message },
          { status: 401 }
        )
      }

      if (!user) {
        console.log('❌ Middleware: No user found from token')
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      console.log('✅ Middleware: User authenticated:', user.id)

      // Clone the request and add user ID to headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      console.log('📋 Middleware: Added user ID to headers:', user.id)

      // Return the modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('❌ Middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 401 }
      )
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.redirect(new URL('/?error=admin_access_denied', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/save-resume', 
    '/api/save-generated-resume', 
    '/api/save-resume-to-profile', 
    '/api/user/saved-resumes',
    '/api/admin/:path*',
    '/admin/:path*'
  ],
} 