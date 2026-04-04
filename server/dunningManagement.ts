/**
 * Dunning Management Service
 * Handles failed payment retries and customer communication
 */

export type DunningStatus = "active" | "paused" | "resolved" | "failed";

export interface DunningEvent {
  id: string;
  subscriptionId: string;
  userId: number;
  userEmail: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  failureReason: string;
  attemptCount: number;
  maxAttempts: number;
  status: DunningStatus;
  nextRetryDate?: Date;
  lastAttemptDate: Date;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DunningConfig {
  maxRetries: number;
  retrySchedule: number[]; // days between retries
  notificationSchedule: number[]; // days to send notifications
  actionOnFailure: "cancel" | "pause" | "notify";
  enableAutoRetry: boolean;
}

const DEFAULT_DUNNING_CONFIG: DunningConfig = {
  maxRetries: 4,
  retrySchedule: [1, 3, 5, 7], // Retry on days 1, 3, 5, 7
  notificationSchedule: [0, 2, 4, 6], // Notify on days 0, 2, 4, 6
  actionOnFailure: "pause",
  enableAutoRetry: true,
};

const dunningEvents: Map<string, DunningEvent> = new Map();

/**
 * Create dunning event for failed payment
 */
export function createDunningEvent(
  subscriptionId: string,
  userId: number,
  userEmail: string,
  paymentIntentId: string,
  amount: number,
  currency: string,
  failureReason: string
): DunningEvent {
  const event: DunningEvent = {
    id: `dunning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subscriptionId,
    userId,
    userEmail,
    paymentIntentId,
    amount,
    currency,
    failureReason,
    attemptCount: 1,
    maxAttempts: DEFAULT_DUNNING_CONFIG.maxRetries,
    status: "active",
    lastAttemptDate: new Date(),
    createdAt: new Date(),
  };

  dunningEvents.set(event.id, event);
  return event;
}

/**
 * Get next retry date
 */
export function getNextRetryDate(
  attemptCount: number,
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): Date | null {
  if (attemptCount >= config.maxRetries) {
    return null;
  }

  const daysUntilRetry = config.retrySchedule[attemptCount] || config.retrySchedule[config.retrySchedule.length - 1];
  return new Date(Date.now() + daysUntilRetry * 24 * 60 * 60 * 1000);
}

/**
 * Schedule next retry attempt
 */
export function scheduleNextRetry(
  eventId: string,
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): DunningEvent | undefined {
  const event = dunningEvents.get(eventId);
  if (!event) return undefined;

  if (event.attemptCount >= config.maxRetries) {
    event.status = "failed";
    return event;
  }

  event.attemptCount++;
  event.nextRetryDate = getNextRetryDate(event.attemptCount, config);

  return event;
}

/**
 * Mark dunning event as resolved
 */
export function resolveDunningEvent(eventId: string): DunningEvent | undefined {
  const event = dunningEvents.get(eventId);
  if (event) {
    event.status = "resolved";
    event.resolvedAt = new Date();
  }
  return event;
}

/**
 * Get dunning events for retry
 */
export function getDunningEventsForRetry(
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): DunningEvent[] {
  const now = Date.now();
  const events: DunningEvent[] = [];

  dunningEvents.forEach((event) => {
    if (
      event.status === "active" &&
      event.nextRetryDate &&
      event.nextRetryDate.getTime() <= now &&
      event.attemptCount < config.maxRetries
    ) {
      events.push(event);
    }
  });

  return events;
}

/**
 * Get dunning events needing notification
 */
export function getDunningEventsForNotification(
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): DunningEvent[] {
  const events: DunningEvent[] = [];

  dunningEvents.forEach((event) => {
    if (event.status === "active") {
      const daysSinceCreation = Math.floor(
        (Date.now() - event.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (config.notificationSchedule.includes(daysSinceCreation)) {
        events.push(event);
      }
    }
  });

  return events;
}

/**
 * Generate dunning notification email
 */
export function generateDunningNotification(event: DunningEvent): {
  subject: string;
  body: string;
} {
  const daysRemaining = Math.ceil(
    (event.nextRetryDate?.getTime() || Date.now() - event.createdAt.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    subject: `Payment Failed - Action Required for Your Subscription`,
    body: `
Dear Customer,

We attempted to process a payment of $${event.amount.toFixed(2)} ${event.currency.toUpperCase()} for your subscription on ${event.lastAttemptDate.toLocaleDateString()}, but it failed due to: ${event.failureReason}

**What happens next:**
- We will automatically retry your payment in ${daysRemaining} day(s)
- Your subscription will remain active during this time
- If payment continues to fail, your subscription may be paused

**How to fix this:**
1. Update your payment method in your account settings
2. Ensure your card has sufficient funds
3. Contact your bank if you see any issues

**Update Payment Method:**
[Click here to update your payment method](https://app.example.com/settings/payment)

If you have any questions, please contact our support team.

Best regards,
Bayojid AI Pro Team
    `,
  };
}

/**
 * Get dunning event by subscription
 */
export function getDunningEventBySubscription(subscriptionId: string): DunningEvent | undefined {
  for (const [_, event] of dunningEvents) {
    if (event.subscriptionId === subscriptionId && event.status === "active") {
      return event;
    }
  }
  return undefined;
}

/**
 * Get dunning statistics
 */
export function getDunningStats() {
  const stats = {
    total: dunningEvents.size,
    active: 0,
    paused: 0,
    resolved: 0,
    failed: 0,
    totalAttempts: 0,
    totalAmount: 0,
  };

  dunningEvents.forEach((event) => {
    stats[event.status]++;
    stats.totalAttempts += event.attemptCount;
    stats.totalAmount += event.amount;
  });

  return stats;
}

/**
 * Clean up old dunning events
 */
export function cleanupOldDunningEvents(daysOld: number = 30): number {
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  let cleaned = 0;

  const idsToDelete: string[] = [];
  dunningEvents.forEach((event, id) => {
    if (
      event.createdAt.getTime() < cutoffTime &&
      (event.status === "resolved" || event.status === "failed")
    ) {
      idsToDelete.push(id);
      cleaned++;
    }
  });

  idsToDelete.forEach(id => dunningEvents.delete(id));

  console.log(`[Dunning] Cleaned up ${cleaned} old dunning events`);
  return cleaned;
}

/**
 * Get dunning event details
 */
export function getDunningEvent(eventId: string): DunningEvent | undefined {
  return dunningEvents.get(eventId);
}

/**
 * Get all active dunning events
 */
export function getAllActiveDunningEvents(): DunningEvent[] {
  const events: DunningEvent[] = [];
  dunningEvents.forEach((event) => {
    if (event.status === "active") {
      events.push(event);
    }
  });
  return events;
}

/**
 * Calculate success probability based on retry history
 */
export function calculateRetrySuccessProbability(event: DunningEvent): number {
  // Based on industry data
  const successRates = [0.95, 0.85, 0.75, 0.65]; // Decreases with each retry
  return successRates[Math.min(event.attemptCount - 1, successRates.length - 1)] || 0.5;
}

/**
 * Should pause subscription on dunning failure
 */
export function shouldPauseSubscription(
  event: DunningEvent,
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): boolean {
  return (
    event.attemptCount >= config.maxRetries &&
    config.actionOnFailure === "pause"
  );
}

/**
 * Should cancel subscription on dunning failure
 */
export function shouldCancelSubscription(
  event: DunningEvent,
  config: DunningConfig = DEFAULT_DUNNING_CONFIG
): boolean {
  return (
    event.attemptCount >= config.maxRetries &&
    config.actionOnFailure === "cancel"
  );
}
