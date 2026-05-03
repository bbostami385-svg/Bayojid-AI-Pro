/**
 * Webhook Endpoints - Minimal Working Version
 * Express routes for webhook handling and testing
 */

import { Router, Request, Response } from 'express';

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
 */
router.post('/test', (req: Request, res: Response) => {
  try {
    const { channels, recipient, subject, message } = req.body;

    if (!channels || !recipient || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: channels, recipient, subject, message',
      });
    }

    res.json({
      success: true,
      message: 'Webhook test received',
      data: {
        channels,
        recipient,
        subject,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * Webhook Status Endpoint
 * GET /webhooks/status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      status: 'operational',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
