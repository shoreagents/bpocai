# 🔒 Security Guide for BPOC.AI

## Overview
This guide outlines the security measures implemented for www.bpoc.io hosted on Railway with a Namecheap domain.

## 🛡️ Security Features Implemented

### 1. **Security Headers**
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `1; mode=block` - Enables XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Content-Security-Policy**: Comprehensive CSP to prevent XSS and injection attacks
- **Permissions-Policy**: Restricts browser features (camera, microphone, etc.)
- **Strict-Transport-Security**: Forces HTTPS with preload

### 2. **Rate Limiting**
- **API Routes**: 100 requests per minute
- **Authentication**: 5 attempts per minute
- **File Uploads**: 10 uploads per minute
- **Automatic cleanup** of expired rate limit entries

### 3. **Input Validation & Sanitization**
- **SQL Injection Prevention**: Pattern detection and blocking
- **XSS Prevention**: HTML tag and script removal
- **File Upload Validation**: Type and size restrictions
- **Email Validation**: Format and sanitization
- **String Sanitization**: Length limits and special character handling

### 4. **Authentication & Authorization**
- **Supabase Auth**: Secure token-based authentication
- **Middleware Protection**: All sensitive routes protected
- **Admin Role System**: Separate admin access control
- **Token Validation**: Format and length verification

### 5. **Database Security**
- **SSL Connections**: All database connections use SSL
- **Connection Pooling**: Efficient and secure connection management
- **Parameterized Queries**: Prevents SQL injection
- **User Isolation**: Users can only access their own data

## 🔧 Environment Variables Security

### Required Variables (Railway Dashboard)
```bash
# Database
DATABASE_URL=postgresql://...

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
OPENAI_API_KEY=sk-...
CLOUDCONVERT_API_KEY=your_cloudconvert_key
CLAUDE_API_KEY=sk-ant-...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.bpoc.io
NODE_ENV=production
```

### Security Best Practices
1. **Never commit API keys** to version control
2. **Rotate keys regularly** (every 3-6 months)
3. **Use different keys** for development and production
4. **Monitor API usage** for unusual activity
5. **Set up alerts** for failed authentication attempts

## 🚀 Railway Deployment Security

### HTTPS Configuration
- Railway automatically provides SSL certificates
- Custom domain (www.bpoc.io) configured with HTTPS
- HSTS headers force HTTPS usage

### Environment Variables in Railway
1. Go to your Railway project dashboard
2. Navigate to "Variables" tab
3. Add all required environment variables
4. Ensure `NODE_ENV=production` is set

### Domain Configuration
- **Namecheap DNS**: CNAME record pointing to Railway
- **Railway Domain**: Custom domain configured with SSL
- **Automatic HTTPS**: Railway handles certificate renewal

## 🔍 Security Monitoring

### Security Audit Endpoint
Access: `GET /api/security-audit` (Admin only)
- Checks environment variables
- Validates security headers
- Monitors API configurations
- Provides security recommendations

### Logging & Monitoring
- **Console Logging**: Detailed request/response logging
- **Error Tracking**: Comprehensive error handling
- **Rate Limit Monitoring**: Track abuse attempts
- **Authentication Logs**: Monitor login attempts

## 🛠️ Security Testing

### Manual Testing Checklist
- [ ] HTTPS redirects work correctly
- [ ] Security headers are present
- [ ] Rate limiting blocks excessive requests
- [ ] File upload validation works
- [ ] Admin routes are protected
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized

### Automated Security Tools
```bash
# Test security headers
curl -I https://www.bpoc.io

# Test rate limiting
for i in {1..110}; do curl https://www.bpoc.io/api/test-env; done

# Test HTTPS enforcement
curl -I http://www.bpoc.io
```

## 🚨 Incident Response

### Security Breach Response
1. **Immediate Actions**:
   - Rotate all API keys
   - Check Railway logs for suspicious activity
   - Review recent deployments for changes

2. **Investigation**:
   - Check `/api/security-audit` endpoint
   - Review authentication logs
   - Monitor database access patterns

3. **Recovery**:
   - Update compromised credentials
   - Implement additional security measures
   - Notify users if necessary

### Emergency Contacts
- **Railway Support**: Available through Railway dashboard
- **Namecheap Support**: For domain-related issues
- **API Providers**: OpenAI, CloudConvert, Anthropic support

## 📊 Security Metrics

### Key Performance Indicators
- **Uptime**: Target 99.9%
- **Response Time**: < 2 seconds average
- **Error Rate**: < 1% of requests
- **Security Incidents**: 0 per month

### Monitoring Tools
- **Railway Dashboard**: Real-time metrics
- **Custom Logging**: Application-specific monitoring
- **Security Headers**: Regular validation
- **Rate Limiting**: Abuse detection

## 🔄 Regular Security Maintenance

### Monthly Tasks
- [ ] Review security audit results
- [ ] Check for dependency updates
- [ ] Rotate API keys if needed
- [ ] Review access logs
- [ ] Update security documentation

### Quarterly Tasks
- [ ] Comprehensive security review
- [ ] Penetration testing
- [ ] Update security policies
- [ ] Train team on security best practices

## 📚 Additional Resources

### Security Documentation
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Railway Security](https://docs.railway.app/deploy/security)
- [Supabase Security](https://supabase.com/docs/guides/security)

### Security Tools
- [Security Headers Checker](https://securityheaders.com)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintainer**: BPOC.AI Team
