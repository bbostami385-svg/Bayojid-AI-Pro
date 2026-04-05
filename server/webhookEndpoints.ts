/**
 * Webhook Endpoints
 * Express routes for webhook handling, testing, and monitoring
 */

import { Router, Request, Response } from 'express';
import * as notificationService from './webhookNotificationDelivery';
import * as jobService from './backgroundJobs';
import * as auditService from './userActivityAuditLog';

const router = Router();

/**
 * Health Check Endpoint
 * GET /webhooks/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Webhook Test Endpoint
 * POST /webhooks/test
 * Test webhook delivery without actually sending
 */
router.post('/test', (req: Request, res: Response) => {
  try {
    const { channels, recipient, subject, message } = req.body;

    if (!channels || !recipient || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: channels, recipient, subject, message',
      });
    }

    // Validate channels
    const validChannels = ['email', 'push', 'sms', 'webhook'];
    const invalidChannels = channels.filter((c: string) => !validChannels.includes(c));

    if (invalidChannels.length > 0) {
      return res.status(400).json({
        error: `Invalid channels: ${invalidChannels.join(', ')}`,
      });
    }

    // Simulate webhook test
    const testResults: Record<string, any> = {
      timestamp: new Date().toISOString(),
      channels: {},
    };

    for (const channel of channels) {
      testResults.channels[channel] = {
        status: 'success',
        latency: Math.floor(Math.random() * 2000) + 'ms',
        message: `Test ${channel} delivery successful`,
      };
    }

    res.json({
      success: true,
      message: 'Webhook test completed',
      results: testResults,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Delivery Callback
 * POST /webhooks/delivery-callback
 * Receive delivery status from external services
 */
router.post('/delivery-callback', (req: Request, res: Response) => {
  try {
    const { notificationId, channel, status, metadata } = req.body;

    if (!notificationId || !channel || !status) {
      return res.status(400).json({
        error: 'Missing required fields: notificationId, channel, status',
      });
    }

    console.log(`[Webhook] Received delivery callback: ${notificationId} via ${channel} - ${status}`);

    // Update notification status
    if (status === 'delivered') {
      notificationService.markAsDelivered(notificationId);
    } else if (status === 'failed') {
      notificationService.markAsFailed(notificationId);
    } else if (status === 'bounced') {
      notificationService.markAsBounced(notificationId);
    }

    // Log audit entry
    auditService.logAuditEntry(
      0, // System user
      'webhook_callback_received',
      { type: 'webhook', id: notificationId },
      {
        status: 'success',
        severity: 'info',
        details: { channel, deliveryStatus: status, metadata },
      }
    );

    res.json({
      success: true,
      message: 'Callback processed successfully',
      notificationId,
    });
  } catch (error) {
    console.error('[Webhook] Callback processing error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Retry Endpoint
 * POST /webhooks/retry/:notificationId
 * Manually retry failed webhook delivery
 */
router.post('/retry/:notificationId', (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = notificationService.getDeliveryStatus(notificationId);
    if (!notification) {
      return res.status(404).json({
        error: `Notification not found: ${notificationId}`,
      });
    }

    // Create retry job
    const job = jobService.createJob(
      'notification_delivery',
      {
        notificationId,
        userId: 0, // System job
      },
      {
        priority: 'high',
        maxRetries: 3,
      }
    );

    console.log(`[Webhook] Created retry job for notification: ${notificationId}`);

    res.json({
      success: true,
      message: 'Retry job created',
      jobId: job.id,
      notificationId,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Status Endpoint
 * GET /webhooks/status/:notificationId
 * Get current delivery status
 */
router.get('/status/:notificationId', (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = notificationService.getDeliveryStatus(notificationId);
    if (!notification) {
      return res.status(404).json({
        error: `Notification not found: ${notificationId}`,
      });
    }

    res.json({
      success: true,
      notification: {
        id: notification.id,
        status: notification.status,
        channels: notification.channels,
        recipient: notification.recipient,
        subject: notification.subject,
        attempts: notification.attempts,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Statistics Endpoint
 * GET /webhooks/stats
 * Get delivery statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = notificationService.getDeliveryStats();

    res.json({
      success: true,
      stats: {
        total: stats.total,
        sent: stats.sent,
        failed: stats.failed,
        retrying: stats.retrying,
        bounced: stats.bounced,
        successRate: ((stats.sent / stats.total) * 100).toFixed(2) + '%',
        averageAttempts: (
          (stats.sent * 1 + stats.failed * 3 + stats.retrying * 2) /
          stats.total
        ).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Queue Endpoint
 * GET /webhooks/queue
 * Get current job queue status
 */
router.get('/queue', (req: Request, res: Response) => {
  try {
    const stats = jobService.getJobStats();

    res.json({
      success: true,
      queue: {
        pending: stats.pending,
        processing: stats.processing,
        completed: stats.completed,
        failed: stats.failed,
        totalJobs: stats.total,
        averageProcessingTime: stats.avgProcessingTime + 'ms',
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Logs Endpoint
 * GET /webhooks/logs
 * Get recent webhook logs
 */
router.get('/logs', (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    // Get audit logs for webhook events
    const logs = auditService.getAuditLogs({
      action: 'webhook_callback_received',
      limit,
      offset,
    });

    res.json({
      success: true,
      logs,
      pagination: {
        limit,
        offset,
        total: logs.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Configuration Endpoint
 * GET /webhooks/config
 * Get webhook configuration
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        webhookUrl: process.env.WEBHOOK_URL || 'https://your-domain.com/webhooks',
        supportedChannels: ['email', 'push', 'sms', 'webhook'],
        maxRetries: 3,
        retryDelay: 5000,
        timeout: 30000,
        endpoints: {
          test: 'POST /webhooks/test',
          callback: 'POST /webhooks/delivery-callback',
          retry: 'POST /webhooks/retry/:notificationId',
          status: 'GET /webhooks/status/:notificationId',
          stats: 'GET /webhooks/stats',
          queue: 'GET /webhooks/queue',
          logs: 'GET /webhooks/logs',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Simulate Error Endpoint
 * POST /webhooks/simulate-error
 * Simulate webhook errors for testing
 */
router.post('/simulate-error', (req: Request, res: Response) => {
  try {
    const { errorType, channel } = req.body;

    if (!errorType || !channel) {
      return res.status(400).json({
        error: 'Missing required fields: errorType, channel',
      });
    }

    const validErrorTypes = ['timeout', 'invalid_recipient', 'rate_limit', 'service_down'];
    if (!validErrorTypes.includes(errorType)) {
      return res.status(400).json({
        error: `Invalid error type. Valid types: ${validErrorTypes.join(', ')}`,
      });
    }

    console.log(`[Webhook] Simulating error: ${errorType} on channel: ${channel}`);

    // Log simulated error
    auditService.logAuditEntry(
      0,
      'webhook_error_simulated',
      { type: 'webhook', channel },
      {
        status: 'success',
        severity: 'warning',
        details: { errorType, channel },
      }
    );

    res.json({
      success: true,
      message: `Error simulation triggered: ${errorType}`,
      channel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
