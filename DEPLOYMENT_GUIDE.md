# Bayojid AI Pro - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying Bayojid AI Pro to production environments. The application is designed to work with platforms like Render, Railway, Vercel, or any Node.js hosting provider.

## Prerequisites

- Node.js 22.x or higher
- MySQL/TiDB database
- Git repository (GitHub, GitLab, Bitbucket)
- Domain name (optional but recommended)
- SSL certificate (auto-provisioned by most platforms)

## Platform-Specific Deployment

### Option 1: Render.com (Recommended)

#### Step 1: Connect Repository

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (bbostami385-svg/Bayojid-AI-Pro)
4. Select the repository and branch (main)

#### Step 2: Configure Build Settings

- **Name:** bayojid-ai-pro
- **Environment:** Node
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Plan:** Standard (or higher for production)

#### Step 3: Set Environment Variables

Click "Environment" and add all required variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/bayojid_ai_pro

# Authentication
JWT_SECRET=your-secure-jwt-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your-app-id

# Owner Information
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASS=your-store-password

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Application
VITE_APP_TITLE=Bayojid AI Pro
VITE_APP_LOGO=https://your-domain.com/logo.png

# Webhook Configuration
WEBHOOK_URL=https://your-render-url.onrender.com/api/webhooks
WEBHOOK_SECRET=your-webhook-secret-key
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY_MS=1000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@your-domain.com
SMTP_FROM_NAME=Bayojid AI Pro

# Background Jobs
JOB_SCHEDULER_ENABLED=true
JOB_SCHEDULER_TIMEZONE=UTC
JOB_SCHEDULER_LOG_LEVEL=info

# Node Environment
NODE_ENV=production
PORT=3000
```

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for build and deployment to complete
3. Your app will be live at `https://bayojid-ai-pro.onrender.com`

#### Step 5: Custom Domain (Optional)

1. Go to Settings → Custom Domain
2. Add your domain (e.g., `app.yourdomain.com`)
3. Follow DNS configuration instructions

### Option 2: Railway.app

#### Step 1: Create Project

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository

#### Step 2: Configure Services

- **Web Service:** Node.js application
- **Database:** MySQL (Railway provides managed MySQL)
- **Redis:** Optional (for caching)

#### Step 3: Set Environment Variables

In Railway dashboard, add all environment variables from the Render section above.

#### Step 4: Deploy

Railway automatically deploys on push to main branch.

### Option 3: Vercel (Frontend Only)

If you want to deploy just the frontend to Vercel:

1. Create `vercel.json` in root:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "client/dist",
  "env": {
    "VITE_APP_ID": "@app_id",
    "VITE_OAUTH_PORTAL_URL": "@oauth_url"
  }
}
```

2. Deploy via Vercel CLI or GitHub integration

## Post-Deployment Setup

### 1. Database Migration

```bash
# SSH into your deployment environment
pnpm db:push

# Verify database connection
pnpm db:studio
```

### 2. Webhook Configuration

Update webhook URLs in external services:

**Stripe Webhooks:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/webhooks/delivery-callback`
- Select events: `payment_intent.succeeded`, `invoice.paid`

**Email Service (Gmail):**
- Verify SMTP credentials are correct
- Test with: `curl -X POST https://your-domain.com/api/webhooks/test`

**SMS Service (Twilio):**
- Update webhook URL in Twilio Console
- Test SMS delivery

### 3. SSL Certificate

Most platforms auto-provision SSL. Verify:
```bash
curl -I https://your-domain.com
# Should return 200 OK with HTTPS
```

### 4. Monitoring & Logs

**Render:**
- Logs: Dashboard → Logs
- Metrics: Dashboard → Metrics

**Railway:**
- Logs: Project → Service → Logs
- Metrics: Project → Metrics

**Monitor webhook health:**
```bash
curl https://your-domain.com/api/webhooks/health
```

## Health Checks

### Application Health
```bash
curl https://your-domain.com/api/health
# Response: {"status":"ok","timestamp":"2026-04-06T12:00:00.000Z"}
```

### Webhook Health
```bash
curl https://your-domain.com/api/webhooks/health
# Response: {"status":"ok","uptime":3600000}
```

### Database Connection
```bash
# SSH into deployment
pnpm db:studio
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer:** Use platform's built-in or external (CloudFlare, AWS ALB)
2. **Database Replication:** Set up read replicas for analytics queries
3. **Caching:** Add Redis for session/cache storage
4. **CDN:** Use CloudFlare or AWS CloudFront for static assets

### Vertical Scaling

Start with:
- **Development:** 512MB RAM, 0.5 CPU
- **Production:** 2GB RAM, 1 CPU (minimum)
- **High Traffic:** 4GB+ RAM, 2+ CPU

## Troubleshooting

### Application Won't Start

1. Check logs: `pnpm logs` or platform dashboard
2. Verify environment variables are set
3. Check database connection: `DATABASE_URL` is valid
4. Rebuild: `pnpm install && pnpm build`

### Webhook Delivery Failing

1. Check webhook logs: `GET /api/webhooks/logs`
2. Verify external service credentials (SMTP, SMS)
3. Check firewall/network policies
4. Test manually: `POST /api/webhooks/test`

### High CPU/Memory Usage

1. Check background job queue: `GET /api/webhooks/queue`
2. Review logs for errors
3. Increase resource allocation
4. Optimize database queries

### Database Connection Issues

1. Verify `DATABASE_URL` format
2. Check database server is running
3. Verify firewall allows connections
4. Test connection: `pnpm db:studio`

## Backup & Recovery

### Database Backups

**Render MySQL:**
- Automatic daily backups
- Manual backup: Dashboard → Database → Backup

**Railway MySQL:**
- Automatic backups enabled
- Export: Railway CLI → `railway db:backup`

### Code Backup

- GitHub is your primary backup
- Enable branch protection on main
- Tag releases: `git tag v1.0.0`

## Monitoring & Alerts

### Set Up Alerts

**Render:**
1. Dashboard → Settings → Alerts
2. Add email for critical errors
3. Set thresholds for CPU/Memory

**Railway:**
1. Project → Settings → Notifications
2. Configure Slack/Email alerts
3. Set deployment notifications

### Log Aggregation

For production, consider:
- **LogRocket:** Frontend error tracking
- **Sentry:** Backend error tracking
- **DataDog:** Comprehensive monitoring
- **New Relic:** Performance monitoring

## Security Checklist

- [ ] All environment variables are set
- [ ] Database credentials are strong
- [ ] JWT_SECRET is secure and unique
- [ ] WEBHOOK_SECRET is configured
- [ ] SSL certificate is valid
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Audit logging is enabled
- [ ] Backup strategy is in place
- [ ] Monitoring is configured

## Performance Optimization

### Frontend

1. Enable gzip compression
2. Minify CSS/JS
3. Use CDN for static assets
4. Implement lazy loading
5. Cache static files (1 year)

### Backend

1. Enable database query caching
2. Use connection pooling
3. Implement API rate limiting
4. Compress API responses
5. Use Redis for sessions

### Database

1. Add indexes on frequently queried columns
2. Archive old audit logs
3. Optimize report queries
4. Use read replicas for analytics

## Maintenance

### Regular Tasks

- **Weekly:** Check logs for errors
- **Monthly:** Review performance metrics
- **Quarterly:** Update dependencies
- **Annually:** Security audit

### Update Process

```bash
# 1. Test locally
git pull origin main
pnpm install
pnpm build
pnpm test

# 2. Deploy
git push origin main
# Platform auto-deploys

# 3. Verify
curl https://your-domain.com/api/health
```

## Support

For deployment issues:
1. Check logs: Platform dashboard or `pnpm logs`
2. Review WEBHOOK_CONFIG.md for webhook setup
3. Check GitHub Issues: https://github.com/bbostami385-svg/Bayojid-AI-Pro/issues
4. Contact platform support (Render, Railway, etc.)

## Next Steps

1. ✅ Deploy to production
2. ✅ Configure custom domain
3. ✅ Set up monitoring
4. ✅ Configure backups
5. ✅ Test all features
6. ✅ Monitor logs and metrics
7. ✅ Plan scaling strategy
