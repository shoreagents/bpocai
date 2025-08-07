import { NextRequest } from 'next/server'

// Input sanitization
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

export function sanitizeFileName(filename: string): string {
  if (typeof filename !== 'string') return ''
  
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255) // Limit length
}

// File validation
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

// Request validation
export function validateRequestBody(body: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !body || !body[field])
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

// SQL injection prevention
export function containsSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false
  
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/i,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select)\b.*\b(from|where)\b)/i,
    /(--|\/\*|\*\/)/, // Comments
    /(\b(xp_|sp_)\b)/i, // Stored procedures
    /(\b(cast|convert)\b)/i,
    /(\b(sys\.|information_schema\.)\b)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// XSS prevention
export function containsXSS(input: string): boolean {
  if (typeof input !== 'string') return false
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

// Rate limiting validation
export function validateRateLimit(request: NextRequest, identifier: string): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /sqlmap/i, /nikto/i, /nmap/i, /wget/i, /curl/i
  ]
  
  return !suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

// API key validation
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false
  
  // Check for common patterns in API keys
  const validPatterns = [
    /^sk-[a-zA-Z0-9]{32,}$/, // OpenAI pattern
    /^[a-zA-Z0-9]{32,}$/, // Generic API key pattern
    /^[a-zA-Z0-9_-]{20,}$/ // Flexible pattern
  ]
  
  return validPatterns.some(pattern => pattern.test(apiKey))
}

// Environment validation
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'CLOUDCONVERT_API_KEY'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  }
}
