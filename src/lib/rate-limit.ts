import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(private config: RateLimitConfig) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return true
    }

    if (record.count >= this.config.maxRequests) {
      return false
    }

    record.count++
    return true
  }

  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return this.config.maxRequests
    return Math.max(0, this.config.maxRequests - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record?.resetTime || Date.now()
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Create rate limiters for different endpoints
const apiRateLimiter = new RateLimiter({ maxRequests: 100, windowMs: 60 * 1000 }) // 100 requests per minute
const authRateLimiter = new RateLimiter({ maxRequests: 5, windowMs: 60 * 1000 }) // 5 auth attempts per minute
const uploadRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60 * 1000 }) // 10 uploads per minute

export function rateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): NextResponse | null {
  // Clean up expired entries
  limiter.cleanup()

  // Get identifier (IP address or user ID)
  const id = identifier || request.ip || request.headers.get('x-forwarded-for') || 'unknown'

  if (!limiter.isAllowed(id)) {
    const resetTime = limiter.getResetTime(id)
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': limiter.getRemaining(id).toString(),
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  }

  return null
}

export { apiRateLimiter, authRateLimiter, uploadRateLimiter }
