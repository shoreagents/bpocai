# 🚀 Railway Environment Variables Setup

## Required Environment Variables for Production

Add these variables in your Railway project dashboard:

### 1. Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```
- Get this from your Railway PostgreSQL service
- Railway automatically provides SSL certificates

### 2. Supabase Authentication
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
- Get these from your Supabase project settings
- Keep service role key secret (server-side only)

### 3. API Keys
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key_here
CLAUDE_API_KEY=sk-ant-your_claude_api_key_here
```
- Rotate these keys regularly
- Monitor usage to prevent abuse

### 4. Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://www.bpoc.io
NODE_ENV=production
```
- Set NODE_ENV to production for security optimizations
- Use your custom domain URL

## How to Add Variables in Railway

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Select your project

2. **Navigate to Variables**
   - Click on your service
   - Go to "Variables" tab

3. **Add Each Variable**
   - Click "New Variable"
   - Enter variable name (e.g., `DATABASE_URL`)
   - Enter variable value
   - Click "Add"

4. **Verify Configuration**
   - Check that all variables are set
   - Ensure no typos in variable names
   - Test the application after deployment

## Security Checklist

- [ ] All API keys are set
- [ ] Database URL is correct
- [ ] Supabase credentials are valid
- [ ] NODE_ENV is set to production
- [ ] Custom domain is configured
- [ ] HTTPS is enabled
- [ ] No sensitive data in code
- [ ] Environment variables are not logged

## Testing Your Configuration

After setting up variables, test your security:

```bash
# Test environment variables
curl https://www.bpoc.io/api/test-env

# Test security headers
curl -I https://www.bpoc.io

# Test HTTPS enforcement
curl -I http://www.bpoc.io
```

## Troubleshooting

### Common Issues:
1. **"Missing environment variable"**: Check variable name spelling
2. **"Database connection failed"**: Verify DATABASE_URL format
3. **"Authentication failed"**: Check Supabase credentials
4. **"API key invalid"**: Verify API key format and permissions

### Debug Steps:
1. Check Railway logs for errors
2. Verify all variables are set
3. Test API endpoints individually
4. Check browser console for client-side errors

## Security Best Practices

1. **Never commit secrets** to Git
2. **Rotate API keys** every 3-6 months
3. **Monitor usage** for unusual activity
4. **Use different keys** for dev/prod
5. **Set up alerts** for failed auth attempts
6. **Regular security audits** using `/api/security-audit`

---

**Remember**: Keep your API keys secure and never share them publicly!
