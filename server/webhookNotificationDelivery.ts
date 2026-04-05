/**
 * Webhook Notification Delivery Service
 * Handles email and push notification delivery with retry logic
 */

export type DeliveryChannel = 'email' | 'push' | 'sms' | 'webhook';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retrying' | 'bounced';

export interface NotificationDeliveryRecord {
  id: string;
  notificationId: string;
  userId: number;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  recipient: string;
  subject?: string;
  content: string;
  metadata: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  sentAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailConfig {
  from: string;
  replyTo?: string;
  template?: string;
  variables?: Record<string, unknown>;
}

export interface PushNotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

const deliveryRecords: Map<string, NotificationDeliveryRecord> = new Map();
const userDeliveryQueue: Map<number, string[]> = new Map();
const failedDeliveries: Map<string, NotificationDeliveryRecord> = new Map();
const retryQueue: NotificationDeliveryRecord[] = [];

/**
 * Create delivery record
 */
export function createDeliveryRecord(
  notificationId: string,
  userId: number,
  channel: DeliveryChannel,
  recipient: string,
  content: string,
  options?: {
    subject?: string;
    metadata?: Record<string, unknown>;
    maxAttempts?: number;
  }
): NotificationDeliveryRecord {
  const recordId = `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const record: NotificationDeliveryRecord = {
    id: recordId,
    notificationId,
    userId,
    channel,
    status: 'pending',
    recipient,
    subject: options?.subject,
    content,
    metadata: options?.metadata || {},
    attempts: 0,
    maxAttempts: options?.maxAttempts || 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  deliveryRecords.set(recordId, record);

  // Add to user delivery queue
  if (!userDeliveryQueue.has(userId)) {
    userDeliveryQueue.set(userId, []);
  }
  userDeliveryQueue.get(userId)!.push(recordId);

  // Add to retry queue
  retryQueue.push(record);

  return record;
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  recordId: string,
  emailConfig: EmailConfig
): Promise<boolean> {
  const record = deliveryRecords.get(recordId);
  if (!record) return false;

  try {
    record.attempts++;
    record.lastAttemptAt = new Date();
    record.updatedAt = new Date();

    // TODO: Implement actual email sending
    // - Use nodemailer or SendGrid
    // - Send to record.recipient
    // - Use emailConfig.template if provided
    // - Handle bounces and failures

    console.log(`[Email] Sending to ${record.recipient}`);
    console.log(`[Email] Subject: ${emailConfig.from}`);
    console.log(`[Email] Content: ${record.content.substring(0, 100)}...`);

    // Simulate success
    record.status = 'sent';
    record.sentAt = new Date();

    return true;
  } catch (error) {
    record.status = 'failed';
    record.failureReason = error instanceof Error ? error.message : 'Unknown error';

    // Schedule retry
    if (record.attempts < record.maxAttempts) {
      const backoffMs = Math.pow(2, record.attempts) * 1000; // Exponential backoff
      record.nextRetryAt = new Date(Date.now() + backoffMs);
      record.status = 'retrying';
    } else {
      failedDeliveries.set(recordId, record);
    }

    return false;
  }
}

/**
 * Send push notification
 */
export async function sendPushNotification(
  recordId: string,
  pushConfig: PushNotificationConfig
): Promise<boolean> {
  const record = deliveryRecords.get(recordId);
  if (!record) return false;

  try {
    record.attempts++;
    record.lastAttemptAt = new Date();
    record.updatedAt = new Date();

    // TODO: Implement actual push sending
    // - Use Firebase Cloud Messaging
    // - Use OneSignal
    // - Use Web Push API
    // - Handle device tokens

    console.log(`[Push] Sending to user ${record.userId}`);
    console.log(`[Push] Title: ${pushConfig.title}`);
    console.log(`[Push] Body: ${pushConfig.body}`);

    // Simulate success
    record.status = 'sent';
    record.sentAt = new Date();

    return true;
  } catch (error) {
    record.status = 'failed';
    record.failureReason = error instanceof Error ? error.message : 'Unknown error';

    // Schedule retry
    if (record.attempts < record.maxAttempts) {
      const backoffMs = Math.pow(2, record.attempts) * 1000;
      record.nextRetryAt = new Date(Date.now() + backoffMs);
      record.status = 'retrying';
    } else {
      failedDeliveries.set(recordId, record);
    }

    return false;
  }
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  recordId: string,
  webhookConfig: WebhookConfig
): Promise<boolean> {
  const record = deliveryRecords.get(recordId);
  if (!record) return false;

  try {
    record.attempts++;
    record.lastAttemptAt = new Date();
    record.updatedAt = new Date();

    const payload = {
      notificationId: record.notificationId,
      userId: record.userId,
      channel: record.channel,
      content: record.content,
      timestamp: new Date().toISOString(),
      metadata: record.metadata,
    };

    // TODO: Implement actual webhook sending
    // - Use fetch or axios
    // - Send to webhookConfig.url
    // - Include headers
    // - Handle timeouts and errors

    console.log(`[Webhook] Sending to ${webhookConfig.url}`);
    console.log(`[Webhook] Method: ${webhookConfig.method}`);
    console.log(`[Webhook] Payload: ${JSON.stringify(payload)}`);

    // Simulate success
    record.status = 'sent';
    record.sentAt = new Date();

    return true;
  } catch (error) {
    record.status = 'failed';
    record.failureReason = error instanceof Error ? error.message : 'Unknown error';

    // Schedule retry
    if (record.attempts < record.maxAttempts) {
      const backoffMs = Math.pow(2, record.attempts) * 1000;
      record.nextRetryAt = new Date(Date.now() + backoffMs);
      record.status = 'retrying';
    } else {
      failedDeliveries.set(recordId, record);
    }

    return false;
  }
}

/**
 * Process delivery queue
 */
export async function processDeliveryQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const stats = { processed: 0, succeeded: 0, failed: 0 };

  const now = new Date();
  const recordsToProcess: NotificationDeliveryRecord[] = [];

  // Find records ready for processing
  for (const [, record] of deliveryRecords) {
    if (record.status === 'pending' || (record.status === 'retrying' && record.nextRetryAt && record.nextRetryAt <= now)) {
      recordsToProcess.push(record);
    }
  }

  // Process each record
  for (const record of recordsToProcess) {
    let success = false;

    switch (record.channel) {
      case 'email':
        success = await sendEmailNotification(record.id, {
          from: 'noreply@bayojidai.com',
          replyTo: 'support@bayojidai.com',
        });
        break;
      case 'push':
        success = await sendPushNotification(record.id, {
          title: 'Notification',
          body: record.content,
        });
        break;
      case 'webhook':
        success = await sendWebhookNotification(record.id, {
          url: 'https://example.com/webhook',
          method: 'POST',
        });
        break;
    }

    stats.processed++;
    if (success) {
      stats.succeeded++;
    } else {
      stats.failed++;
    }
  }

  return stats;
}

/**
 * Get delivery records for user
 */
export function getUserDeliveryRecords(
  userId: number,
  options?: {
    status?: DeliveryStatus;
    channel?: DeliveryChannel;
    limit?: number;
    offset?: number;
  }
): NotificationDeliveryRecord[] {
  const recordIds = userDeliveryQueue.get(userId) || [];
  let results: NotificationDeliveryRecord[] = [];

  for (const id of recordIds) {
    const record = deliveryRecords.get(id);
    if (!record) continue;

    if (options?.status && record.status !== options.status) continue;
    if (options?.channel && record.channel !== options.channel) continue;

    results.push(record);
  }

  // Apply pagination
  const offset = options?.offset || 0;
  const limit = options?.limit || 20;
  results = results.slice(offset, offset + limit);

  return results;
}

/**
 * Get delivery statistics
 */
export function getDeliveryStats(): {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  retrying: number;
  byChannel: Record<DeliveryChannel, number>;
} {
  const stats = {
    total: deliveryRecords.size,
    pending: 0,
    sent: 0,
    failed: 0,
    retrying: 0,
    byChannel: {
      email: 0,
      push: 0,
      sms: 0,
      webhook: 0,
    },
  };

  for (const [, record] of deliveryRecords) {
    switch (record.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'sent':
        stats.sent++;
        break;
      case 'failed':
        stats.failed++;
        break;
      case 'retrying':
        stats.retrying++;
        break;
    }

    stats.byChannel[record.channel]++;
  }

  return stats;
}

/**
 * Retry failed delivery
 */
export function retryFailedDelivery(recordId: string): boolean {
  const record = failedDeliveries.get(recordId);
  if (!record) return false;

  record.status = 'pending';
  record.attempts = 0;
  record.nextRetryAt = undefined;
  record.failureReason = undefined;

  failedDeliveries.delete(recordId);
  retryQueue.push(record);

  return true;
}

/**
 * Get failed deliveries
 */
export function getFailedDeliveries(limit: number = 50): NotificationDeliveryRecord[] {
  return Array.from(failedDeliveries.values()).slice(0, limit);
}

/**
 * Mark delivery as bounced
 */
export function markAsBounced(recordId: string, reason: string): boolean {
  const record = deliveryRecords.get(recordId);
  if (!record) return false;

  record.status = 'bounced';
  record.failureReason = reason;
  record.updatedAt = new Date();

  failedDeliveries.set(recordId, record);

  return true;
}

/**
 * Cleanup old delivery records
 */
export function cleanupOldDeliveries(daysOld: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let cleaned = 0;
  const idsToDelete: string[] = [];

  for (const [id, record] of deliveryRecords) {
    if (record.createdAt < cutoffDate && record.status === 'sent') {
      idsToDelete.push(id);
      cleaned++;
    }
  }

  idsToDelete.forEach((id) => {
    deliveryRecords.delete(id);
    failedDeliveries.delete(id);
  });

  console.log(`[Delivery] Cleaned up ${cleaned} old delivery records`);

  return cleaned;
}

/**
 * Get delivery record by ID
 */
export function getDeliveryRecord(recordId: string): NotificationDeliveryRecord | undefined {
  return deliveryRecords.get(recordId);
}

/**
 * Bulk create delivery records
 */
export function bulkCreateDeliveryRecords(
  notificationId: string,
  userIds: number[],
  channels: DeliveryChannel[],
  recipients: Record<number, string>,
  content: string,
  options?: {
    subject?: string;
    metadata?: Record<string, unknown>;
    maxAttempts?: number;
  }
): NotificationDeliveryRecord[] {
  const results: NotificationDeliveryRecord[] = [];

  for (const userId of userIds) {
    for (const channel of channels) {
      const recipient = recipients[userId];
      if (!recipient) continue;

      const record = createDeliveryRecord(
        notificationId,
        userId,
        channel,
        recipient,
        content,
        options
      );
      results.push(record);
    }
  }

  return results;
}
