/**
 * Notification Testing Service
 * Provides endpoints for testing notification delivery across all channels
 */

import { notifyOwner } from './server/_core/notification';
import { sendEmail } from './server/_core/email';
import { sendPushNotification } from './server/_core/push';
import { sendSMS } from './server/_core/sms';

interface TestNotificationRequest {
  channels: ('email' | 'push' | 'sms' | 'webhook')[];
  recipient: string;
  subject: string;
  message: string;
  metadata?: Record<string, any>;
}

interface TestResult {
  channel: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
  deliveryId?: string;
}

/**
 * Test email notification delivery
 */
export async function testEmailNotification(
  recipient: string,
  subject: string,
  message: string
): Promise<TestResult> {
  try {
    const result = await sendEmail({
      to: recipient,
      subject: `[TEST] ${subject}`,
      html: `
        <h2>Notification Test</h2>
        <p>${message}</p>
        <hr/>
        <p style="color: #999; font-size: 12px;">
          This is a test notification sent at ${new Date().toISOString()}
        </p>
      `,
    });

    return {
      channel: 'email',
      status: 'success',
      message: `Email sent to ${recipient}`,
      timestamp: new Date(),
      deliveryId: result.messageId,
    };
  } catch (error) {
    return {
      channel: 'email',
      status: 'failed',
      message: `Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Test push notification delivery
 */
export async function testPushNotification(
  userId: string,
  subject: string,
  message: string
): Promise<TestResult> {
  try {
    const result = await sendPushNotification({
      userId,
      title: `[TEST] ${subject}`,
      body: message,
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    return {
      channel: 'push',
      status: 'success',
      message: `Push notification sent to user ${userId}`,
      timestamp: new Date(),
      deliveryId: result.notificationId,
    };
  } catch (error) {
    return {
      channel: 'push',
      status: 'failed',
      message: `Push notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Test SMS notification delivery
 */
export async function testSMSNotification(
  phoneNumber: string,
  message: string
): Promise<TestResult> {
  try {
    const result = await sendSMS({
      to: phoneNumber,
      body: `[TEST] ${message}`,
    });

    return {
      channel: 'sms',
      status: 'success',
      message: `SMS sent to ${phoneNumber}`,
      timestamp: new Date(),
      deliveryId: result.messageId,
    };
  } catch (error) {
    return {
      channel: 'sms',
      status: 'failed',
      message: `SMS delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Test webhook notification delivery
 */
export async function testWebhookNotification(
  webhookUrl: string,
  payload: Record<string, any>
): Promise<TestResult> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Notification': 'true',
        'X-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify({
        type: 'test',
        ...payload,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      channel: 'webhook',
      status: 'success',
      message: `Webhook delivered to ${webhookUrl}`,
      timestamp: new Date(),
      deliveryId: response.headers.get('x-delivery-id') || undefined,
    };
  } catch (error) {
    return {
      channel: 'webhook',
      status: 'failed',
      message: `Webhook delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Test owner notification
 */
export async function testOwnerNotification(
  title: string,
  content: string
): Promise<TestResult> {
  try {
    const result = await notifyOwner({
      title: `[TEST] ${title}`,
      content,
    });

    return {
      channel: 'owner-notification',
      status: result ? 'success' : 'pending',
      message: result ? 'Owner notification sent' : 'Owner notification queued',
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      channel: 'owner-notification',
      status: 'failed',
      message: `Owner notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
    };
  }
}

/**
 * Run comprehensive notification tests
 */
export async function runComprehensiveNotificationTest(
  request: TestNotificationRequest
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test each requested channel
  for (const channel of request.channels) {
    switch (channel) {
      case 'email':
        results.push(
          await testEmailNotification(
            request.recipient,
            request.subject,
            request.message
          )
        );
        break;

      case 'push':
        results.push(
          await testPushNotification(
            request.recipient,
            request.subject,
            request.message
          )
        );
        break;

      case 'sms':
        results.push(
          await testSMSNotification(request.recipient, request.message)
        );
        break;

      case 'webhook':
        if (request.metadata?.webhookUrl) {
          results.push(
            await testWebhookNotification(
              request.metadata.webhookUrl,
              {
                subject: request.subject,
                message: request.message,
                ...request.metadata,
              }
            )
          );
        }
        break;
    }
  }

  return results;
}

/**
 * Generate notification test report
 */
export function generateTestReport(results: TestResult[]): {
  summary: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
  details: TestResult[];
  timestamp: Date;
} {
  const summary = {
    total: results.length,
    successful: results.filter((r) => r.status === 'success').length,
    failed: results.filter((r) => r.status === 'failed').length,
    pending: results.filter((r) => r.status === 'pending').length,
  };

  return {
    summary,
    details: results,
    timestamp: new Date(),
  };
}
