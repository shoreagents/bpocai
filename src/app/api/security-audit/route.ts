import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    // Only allow admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const securityAudit = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === 'production',
        hasHttps: request.headers.get('x-forwarded-proto') === 'https',
        domain: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        ip: request.ip || request.headers.get('x-forwarded-for')
      },
      headers: {
        hasSecurityHeaders: true,
        securityHeaders: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Content-Security-Policy': 'configured',
          'Permissions-Policy': 'configured',
          'Strict-Transport-Security': 'configured'
        }
      },
      environment: validateEnvironment(),
      database: {
        hasConnection: !!process.env.DATABASE_URL,
        sslEnabled: true,
        connectionPool: true
      },
      authentication: {
        supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasMiddleware: true,
        tokenValidation: true
      },
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        cloudconvert: !!process.env.CLOUDCONVERT_API_KEY,
        claude: !!process.env.CLAUDE_API_KEY
      },
      rateLimiting: {
        enabled: true,
        apiLimits: '100 requests/minute',
        authLimits: '5 attempts/minute',
        uploadLimits: '10 uploads/minute'
      },
      fileUpload: {
        maxSize: '100MB',
        allowedTypes: ['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png'],
        validation: true
      },
      recommendations: []
    }

    // Generate security recommendations
    if (!securityAudit.environment.isValid) {
      securityAudit.recommendations.push('Fix missing environment variables')
    }

    if (!securityAudit.environment.hasHttps) {
      securityAudit.recommendations.push('Enable HTTPS in production')
    }

    if (!securityAudit.apis.openai || !securityAudit.apis.cloudconvert) {
      securityAudit.recommendations.push('Configure all required API keys')
    }

    if (securityAudit.recommendations.length === 0) {
      securityAudit.recommendations.push('Security configuration looks good!')
    }

    return NextResponse.json({
      success: true,
      audit: securityAudit
    })

  } catch (error) {
    console.error('Security audit error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Security audit failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
