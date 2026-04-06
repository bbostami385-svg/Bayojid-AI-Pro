# Webhook Configuration Guide

## Overview

Bayojid AI Pro includes a comprehensive webhook system for notification delivery, report generation, and system event handling. This guide explains how to configure and use webhooks in production.

## Environment Variables

Add the following environment variables to your production `.env` file:

```bash
# Webhook Configuration
WEBHOOK_URL=https://your-domain.com/api/webhooks
WEBHOOK_SECRET=your-webhook-secret-key
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY_MS=1000

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@your-domain.com
SMTP_FROM_NAME=Bayojid AI Pro

# Push Notification Configuration
PUSH_NOTIFICATION_SERVICE_URL=https://push-service.example.com
PUSH_NOTIFICATION_API_KEY=your-push-api-key

# SMS Configuration
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your-twilio-account-sid
SMS_AUTH_TOKEN=your-twilio-auth-token
SMS_FROM_NUMBER=+1234567890

# Background Job Configuration
JOB_SCHEDULER_ENABLED=true
JOB_SCHEDULER_TIMEZONE=UTC
JOB_SCHEDULER_LOG_LEVEL=info

# Report Configuration
REPORT_GENERATION_TIMEOUT_MS=30000
REPORT_MAX_RECORDS=10000
REPORT_STORAGE_DAYS=90

# API Rate Limiting
API_RATE_LIMIT_ENABLED=true
API_RATE_LIMIT_WINDOW_MS=60000
API_RATE_LIMIT_MAX_REQUESTS=100

# Audit Logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_RETENTION_DAYS=365
AUDIT_LOG_LEVEL=info
```

## Webhook Endpoints

### 1. Health Check
**Endpoint:** `GET /api/webhooks/health`

Check if the webhook service is running.

```bash
curl https://your-domain.com/api/webhooks/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-06T12:00:00.000Z",
  "uptime": 3600000
}
```

### 2. Test Webhook
**Endpoint:** `POST /api/webhooks/test`

Test webhook delivery without actually sending notifications.

```bash
curl -X POST https://your-domain.com/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "notification",
    "channel": "email",
    "recipient": "user@example.com",
    "subject": "Test Notification",
    "content": "This is a test notification"
  }'
```

### 3. Delivery Callback
**Endpoint:** `POST /api/webhooks/delivery-callback`

Receive delivery status from external services (email, SMS, push).

```bash
curl -X POST https://your-domain.com/api/webhooks/delivery-callback \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "notif_123",
    "status": "delivered",
    "timestamp": "2026-04-06T12:00:00.000Z",
    "metadata": {
      "messageId": "msg_456",
      "provider": "sendgrid"
    }
  }'
```

### 4. Retry Failed Delivery
**Endpoint:** `POST /api/webhooks/retry/:notificationId`

Manually retry a failed notification delivery.

```bash
curl -X POST https://your-domain.com/api/webhooks/retry/notif_123
```

### 5. Get Delivery Status
**Endpoint:** `GET /api/webhooks/status/:notificationId`

Get the current delivery status of a notification.

```bash
curl https://your-domain.com/api/webhooks/status/notif_123
```

**Response:**
```json
{
  "notificationId": "notif_123",
  "status": "delivered",
  "channel": "email",
  "recipient": "user@example.com",
  "attempts": 1,
  "lastAttempt": "2026-04-06T12:00:00.000Z",
  "nextRetry": null
}
```

### 6. Get Delivery Statistics
**Endpoint:** `GET /api/webhooks/stats`

Get overall webhook delivery statistics.

```bash
curl https://your-domain.com/api/webhooks/stats
```

**Response:**
```json
{
  "total": 1000,
  "delivered": 950,
  "failed": 30,
  "pending": 20,
  "successRate": 95.0,
  "averageDeliveryTime": 1250,
  "byChannel": {
    "email": { "total": 600, "delivered": 580, "failed": 20 },
    "push": { "total": 300, "delivered": 300, "failed": 0 },
    "sms": { "total": 100, "delivered": 70, "failed": 10 }
  }
}
```

### 7. Get Job Queue Status
**Endpoint:** `GET /api/webhooks/queue`

Get the current job queue status.

```bash
curl https://your-domain.com/api/webhooks/queue
```

**Response:**
```json
{
  "pending": 5,
  "processing": 2,
  "failed": 1,
  "completed": 1000,
  "scheduledTasks": 9,
  "activeSchedules": [
    "Daily Reports",
    "Weekly Reports",
    "Notification Queue",
    "Cleanup Old Metrics"
  ]
}
```

### 8. Get Recent Logs
**Endpoint:** `GET /api/webhooks/logs`

Get recent webhook logs.

```bash
curl https://your-domain.com/api/webhooks/logs?limit=50&offset=0
```

### 9. Get Webhook Configuration
**Endpoint:** `GET /api/webhooks/config`

Get current webhook configuration (admin only).

```bash
curl https://your-domain.com/api/webhooks/config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Simulate Error
**Endpoint:** `POST /api/webhooks/simulate-error`

Simulate a webhook error for testing retry logic.

```bash
curl -X POST https://your-domain.com/api/webhooks/simulate-error \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "notif_123",
    "errorType": "timeout",
    "errorMessage": "Connection timeout"
  }'
```

## Background Job Scheduler

The application includes 9 scheduled tasks that run automatically:

| Task | Schedule | Purpose |
|------|----------|---------|
| Daily Reports | 2 AM daily | Generate daily reports for active subscriptions |
| Weekly Reports | 3 AM Monday | Generate weekly reports |
| Monthly Reports | 4 AM 1st day | Generate monthly reports |
| Quarterly Reports | 5 AM Q1/Q2/Q3/Q4 | Generate quarterly reports |
| Notification Queue | Every 5 minutes | Process pending notifications |
| Cleanup Old Metrics | 1 AM daily | Delete API metrics older than 90 days |
| Cleanup Old Audit Logs | 1:30 AM daily | Delete audit logs older than 365 days |
| Detect Suspicious Activity | Every 30 minutes | Analyze for suspicious user activity |
| Analytics Summary | 6 AM daily | Generate daily analytics summary |

## Setting Up External Services

### Email (Gmail SMTP)

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Set environment variables:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

### Push Notifications

Configure your push notification service (Firebase Cloud Messaging, Apple Push Notification, etc.):

```bash
PUSH_NOTIFICATION_SERVICE_URL=https://fcm.googleapis.com/fcm/send
PUSH_NOTIFICATION_API_KEY=your-fcm-server-key
```

### SMS (Twilio)

1. Create a Twilio account: https://www.twilio.com
2. Get your Account SID and Auth Token
3. Set environment variables:
   ```bash
   SMS_PROVIDER=twilio
   SMS_ACCOUNT_SID=your-account-sid
   SMS_AUTH_TOKEN=your-auth-token
   SMS_FROM_NUMBER=+1234567890
   ```

## Webhook Security

### Signature Verification

All webhook payloads include an `X-Webhook-Signature` header. Verify it using:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

### Best Practices

1. **Use HTTPS** - Always use HTTPS for webhook endpoints
2. **Verify Signatures** - Always verify webhook signatures
3. **Idempotency** - Handle duplicate webhook events gracefully
4. **Timeouts** - Implement request timeouts (30 seconds recommended)
5. **Logging** - Log all webhook events for debugging
6. **Rate Limiting** - Implement rate limiting on webhook endpoints
7. **Secrets** - Never commit webhook secrets to version control

## Monitoring

Monitor webhook health using the provided endpoints:

```bash
# Check service health
curl https://your-domain.com/api/webhooks/health

# Get statistics
curl https://your-domain.com/api/webhooks/stats

# Get queue status
curl https://your-domain.com/api/webhooks/queue

# Get recent logs
curl https://your-domain.com/api/webhooks/logs
```

## Troubleshooting

### Notifications Not Sending

1. Check webhook health: `GET /api/webhooks/health`
2. Check queue status: `GET /api/webhooks/queue`
3. Review logs: `GET /api/webhooks/logs`
4. Verify environment variables are set correctly
5. Check external service credentials (SMTP, SMS, Push)

### High Failure Rate

1. Check delivery statistics: `GET /api/webhooks/stats`
2. Review recent logs for error patterns
3. Verify external service connectivity
4. Check rate limits on external services
5. Increase retry attempts if needed

### Scheduled Tasks Not Running

1. Verify `JOB_SCHEDULER_ENABLED=true`
2. Check server logs for scheduler initialization
3. Verify timezone setting: `JOB_SCHEDULER_TIMEZONE`
4. Check for JavaScript errors in scheduler
5. Verify cron expressions in jobScheduler.ts

## Support

For issues or questions about webhook configuration, please refer to:
- Server logs: `/home/ubuntu/ai-chat-app/.manus-logs/`
- Webhook logs: `GET /api/webhooks/logs`
- GitHub Issues: https://github.com/bbostami385-svg/Bayojid-AI-Pro/issues
