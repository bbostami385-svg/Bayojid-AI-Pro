/**
 * Webhook Retry Service
 * Handles failed webhook deliveries with exponential backoff
 */

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  nextRetryTime?: Date;
  lastError?: string;
  status: "pending" | "delivered" | "failed" | "abandoned";
}

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 3600000, // 1 hour
  backoffMultiplier: 2,
};

const webhookStore: Map<string, WebhookEvent> = new Map();

/**
 * Calculate next retry delay using exponential backoff
 */
export function calculateNextRetryDelay(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount);
  const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Create webhook event for retry
 */
export function createWebhookEvent(
  type: string,
  data: any,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): WebhookEvent {
  return {
    id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: new Date(),
    retryCount: 0,
    maxRetries: config.maxRetries,
    status: "pending",
  };
}

/**
 * Schedule webhook for retry
 */
export function scheduleWebhookRetry(
  event: WebhookEvent,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): WebhookEvent {
  if (event.retryCount >= config.maxRetries) {
    event.status = "abandoned";
    console.log(`[Webhook] Event ${event.id} abandoned after ${event.retryCount} retries`);
    return event;
  }

  const delay = calculateNextRetryDelay(event.retryCount, config);
  event.nextRetryTime = new Date(Date.now() + delay);
  event.retryCount++;
  event.status = "pending";

  console.log(
    `[Webhook] Scheduled retry for event ${event.id} in ${Math.round(delay / 1000)}s (attempt ${event.retryCount}/${config.maxRetries})`
  );

  return event;
}

/**
 * Store webhook event
 */
export function storeWebhookEvent(event: WebhookEvent): void {
  webhookStore.set(event.id, event);
}

/**
 * Get webhook event
 */
export function getWebhookEvent(id: string): WebhookEvent | undefined {
  return webhookStore.get(id);
}

/**
 * Get pending webhooks for retry
 */
export function getPendingWebhooksForRetry(): WebhookEvent[] {
  const now = Date.now();
  const pending: WebhookEvent[] = [];

  webhookStore.forEach((event) => {
    if (
      event.status === "pending" &&
      event.nextRetryTime &&
      event.nextRetryTime.getTime() <= now
    ) {
      pending.push(event);
    }
  });

  return pending;
}

/**
 * Mark webhook as delivered
 */
export function markWebhookDelivered(id: string): WebhookEvent | undefined {
  const event = webhookStore.get(id);
  if (event) {
    event.status = "delivered";
    event.retryCount = 0;
    console.log(`[Webhook] Event ${id} delivered successfully`);
  }
  return event;
}

/**
 * Mark webhook as failed with error
 */
export function markWebhookFailed(
  id: string,
  error: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): WebhookEvent | undefined {
  const event = webhookStore.get(id);
  if (event) {
    event.lastError = error;
    console.log(`[Webhook] Event ${id} failed: ${error}`);

    if (event.retryCount < config.maxRetries) {
      scheduleWebhookRetry(event, config);
    } else {
      event.status = "abandoned";
      console.log(`[Webhook] Event ${id} abandoned after max retries`);
    }
  }
  return event;
}

/**
 * Get webhook statistics
 */
export function getWebhookStats() {
  const stats: Record<string, number> = {
    total: webhookStore.size,
    pending: 0,
    delivered: 0,
    failed: 0,
    abandoned: 0,
  };

  webhookStore.forEach((event) => {
    if (event.status in stats) {
      stats[event.status]++;
    }
  });

  return stats;
}

/**
 * Clean up old webhook records (older than 7 days)
 */
export function cleanupOldWebhooks(daysOld: number = 7): number {
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  let cleaned = 0;
  const idsToDelete: string[] = [];

  webhookStore.forEach((event, id) => {
    if (event.timestamp.getTime() < cutoffTime && event.status !== "pending") {
      idsToDelete.push(id);
      cleaned++;
    }
  });

  idsToDelete.forEach(id => webhookStore.delete(id));

  console.log(`[Webhook] Cleaned up ${cleaned} old webhook records`);
  return cleaned;
}

/**
 * Schedule automatic cleanup every 24 hours
 */
setInterval(() => cleanupOldWebhooks(), 24 * 60 * 60 * 1000);

/**
 * Process pending webhooks (call periodically)
 */
export async function processPendingWebhooks(
  handler: (event: WebhookEvent) => Promise<void>
): Promise<void> {
  const pending = getPendingWebhooksForRetry();

  for (const event of pending) {
    try {
      await handler(event);
      markWebhookDelivered(event.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      markWebhookFailed(event.id, errorMessage);
    }
  }
}

/**
 * Retry webhook immediately (for testing)
 */
export async function retryWebhookNow(
  id: string,
  handler: (event: WebhookEvent) => Promise<void>
): Promise<WebhookEvent | undefined> {
  const event = webhookStore.get(id);
  if (!event) return undefined;

  try {
    await handler(event);
    return markWebhookDelivered(id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return markWebhookFailed(id, errorMessage);
  }
}
