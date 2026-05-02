# Bayojid AI Pro - Render Deployment Step-by-Step Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Prepare Your GitHub Repository

1. Ensure your code is pushed to GitHub: `https://github.com/bbostami385-svg/Bayojid-AI-Pro`
2. Make sure the `main` branch contains all your latest code
3. Verify all files are committed: `git status` should show nothing

```bash
cd /home/ubuntu/ai-chat-app
git add -A
git commit -m "Final deployment ready"
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Sign up" → Choose "Sign up with GitHub"
3. Authorize Render to access your GitHub account
4. Complete your profile setup

### Step 3: Create Web Service

1. In Render dashboard, click "New +" → "Web Service"
2. Select "Deploy an existing repository"
3. Search for and select: `bbostami385-svg/Bayojid-AI-Pro`
4. Click "Connect"

### Step 4: Configure Build Settings

Fill in the following fields:

| Field | Value |
|-------|-------|
| **Name** | `bayojid-ai-pro` |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Plan** | `Standard` (recommended) |

### Step 5: Add Environment Variables

Click "Environment" and add these variables one by one:

#### Database Configuration
```
DATABASE_URL = mysql://user:password@host:3306/bayojid_ai_pro
```

#### Authentication
```
JWT_SECRET = your-very-secure-random-string-here
OAUTH_SERVER_URL = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://oauth.manus.im
VITE_APP_ID = your-app-id-from-manus
```

#### Owner Information
```
OWNER_NAME = Your Name
OWNER_OPEN_ID = your-open-id-from-manus
```

#### Manus APIs
```
BUILT_IN_FORGE_API_URL = https://api.manus.im
BUILT_IN_FORGE_API_KEY = your-forge-api-key
VITE_FRONTEND_FORGE_API_URL = https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY = your-frontend-forge-api-key
```

#### Payment Processing (Optional)
```
STRIPE_SECRET_KEY = sk_live_your-stripe-secret-key
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your-stripe-public-key
STRIPE_WEBHOOK_SECRET = whsec_your-webhook-secret

SSLCOMMERZ_STORE_ID = your-store-id
SSLCOMMERZ_STORE_PASS = your-store-password
```

#### Analytics
```
VITE_ANALYTICS_ENDPOINT = https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID = your-website-id
```

#### Application
```
VITE_APP_TITLE = Bayojid AI Pro
VITE_APP_LOGO = https://your-domain.com/logo.png
```

#### Webhook Configuration
```
WEBHOOK_URL = https://bayojid-ai-pro.onrender.com/api/webhooks
WEBHOOK_SECRET = your-webhook-secret-key
WEBHOOK_RETRY_ATTEMPTS = 3
WEBHOOK_RETRY_DELAY_MS = 1000
```

#### Email Configuration
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = your-app-password
SMTP_FROM_EMAIL = noreply@your-domain.com
SMTP_FROM_NAME = Bayojid AI Pro
```

#### Background Jobs
```
JOB_SCHEDULER_ENABLED = true
JOB_SCHEDULER_TIMEZONE = UTC
JOB_SCHEDULER_LOG_LEVEL = info
```

#### Node Environment
```
NODE_ENV = production
PORT = 3000
```

### Step 6: Deploy

1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)
3. You'll see "Your service is live" message
4. Your app is now live at: `https://bayojid-ai-pro.onrender.com`

---

## 🔧 Post-Deployment Setup

### Step 7: Verify Deployment

```bash
# Test if your app is running
curl https://bayojid-ai-pro.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-05-02T12:00:00.000Z"}
```

### Step 8: Configure Custom Domain (Optional)

1. In Render dashboard → Settings → Custom Domain
2. Add your domain (e.g., `app.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (usually 5 minutes)

### Step 9: Test Notification Delivery

```bash
# Test email notification
curl -X POST https://bayojid-ai-pro.onrender.com/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "recipient": "your-email@example.com",
    "subject": "Test Notification",
    "message": "This is a test notification"
  }'

# Expected response:
# {"status":"success","message":"Test notification sent"}
```

### Step 10: Monitor Logs

1. In Render dashboard → Logs
2. You should see application startup messages
3. Check for any errors

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# In Render dashboard
Dashboard → bayojid-ai-pro → Logs
```

### Monitor Performance

1. Dashboard → Metrics
2. Check CPU, Memory, and Disk usage
3. Monitor request rate and response times

### Set Up Alerts

1. Settings → Notifications
2. Add email for critical errors
3. Enable deployment notifications

---

## 🐛 Troubleshooting

### Build Failed

**Error:** `pnpm: command not found`

**Solution:**
1. Go to Settings → Build & Deploy
2. Change Build Command to: `npm install -g pnpm && pnpm install && pnpm build`

**Error:** `Cannot find module 'node-cron'`

**Solution:**
1. Run locally: `pnpm install`
2. Verify `package.json` has all dependencies
3. Push changes: `git push origin main`
4. Render will auto-redeploy

### Application Won't Start

**Error:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find package`

**Solution:**
1. Check all environment variables are set
2. Verify DATABASE_URL is correct
3. Check logs for detailed error message
4. Restart service: Dashboard → Manual Restart

### Database Connection Failed

**Error:** `Error: connect ECONNREFUSED`

**Solution:**
1. Verify DATABASE_URL format: `mysql://user:pass@host:port/db`
2. Check database server is running
3. Verify firewall allows connections
4. Test connection locally first

### High Memory Usage

**Solution:**
1. Check for memory leaks in logs
2. Increase plan: Settings → Plan
3. Optimize database queries
4. Clear old logs: `GET /api/webhooks/logs?clear=true`

---

## 🔐 Security Checklist

Before going live, verify:

- [ ] All environment variables are set (no empty values)
- [ ] JWT_SECRET is unique and secure (32+ characters)
- [ ] WEBHOOK_SECRET is configured
- [ ] Database credentials are strong
- [ ] SSL certificate is valid (green lock in browser)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Audit logging is enabled
- [ ] Backups are configured

---

## 📈 Scaling Your Application

### When to Scale

- **CPU > 80%:** Upgrade plan or optimize code
- **Memory > 80%:** Increase RAM or optimize queries
- **Request queue building:** Add more instances

### Scaling Options

1. **Vertical Scaling:** Upgrade to Pro/Standard plan
2. **Horizontal Scaling:** Use Render's load balancer
3. **Database Optimization:** Add read replicas

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

1. Render automatically deploys when you push to `main`
2. Monitor deployment status in dashboard
3. Rollback if needed: Settings → Deploys

### Manual Deployment

1. Dashboard → Manual Deploy
2. Select branch and commit
3. Click "Deploy"

---

## 📞 Support

If you encounter issues:

1. **Check Logs:** Dashboard → Logs
2. **Review Documentation:** DEPLOYMENT_GUIDE.md
3. **Test Locally:** `pnpm dev`
4. **Contact Render Support:** https://render.com/support

---

## ✅ Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] All code is committed and pushed
- [ ] Render account is created
- [ ] Web Service is created
- [ ] All environment variables are set
- [ ] Build command is correct
- [ ] Start command is correct
- [ ] Deployment is successful
- [ ] App is accessible at public URL
- [ ] Health check endpoint works
- [ ] Notification testing passes
- [ ] Custom domain is configured (optional)
- [ ] Monitoring is set up
- [ ] Backups are configured

---

## 🎉 You're Done!

Your Bayojid AI Pro application is now live on Render!

**Next Steps:**
1. Share your app URL with users
2. Monitor logs and metrics regularly
3. Set up automated backups
4. Configure monitoring alerts
5. Plan for scaling as you grow

**Your Live URL:** `https://bayojid-ai-pro.onrender.com`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
- [Monitoring & Logs](https://render.com/docs/monitoring)
