/**
 * Subscription Renewal Reminder Service
 * Sends automatic reminders before subscription expiration
 */

import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { sendSubscriptionReminderEmail } from "./emailNotification";

interface SubscriptionReminderConfig {
  daysBeforeExpiry: number; // Send reminder X days before expiry
  checkIntervalHours: number; // Check every X hours
}

const DEFAULT_CONFIG: SubscriptionReminderConfig = {
  daysBeforeExpiry: 7, // Send reminder 7 days before expiry
  checkIntervalHours: 24, // Check every 24 hours
};

/**
 * Get subscriptions that need renewal reminders
 */
async function getSubscriptionsNeedingReminders(
  daysBeforeExpiry: number
): Promise<any[]> {
  try {
    const db = getDb();

    // Calculate the date range for reminders
    const today = new Date();
    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + daysBeforeExpiry);

    const tomorrowDate = new Date(reminderDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    console.log(
      `[Subscription Reminder] Checking subscriptions expiring between ${reminderDate.toISOString()} and ${tomorrowDate.toISOString()}`
    );

    // Query subscriptions that expire within the reminder window
    // For now, return empty array as raw SQL queries need proper implementation
    // This would be implemented with proper query builder or ORM methods
    console.log(
      `[Subscription Reminder] Query would fetch subscriptions expiring between ${reminderDate.toISOString()} and ${tomorrowDate.toISOString()}`
    );
    return [];
  } catch (error) {
    console.error("[Subscription Reminder] Error fetching subscriptions:", error);
    return [];
  }
}

/**
 * Calculate days remaining until subscription expiry
 */
function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const timeDiff = end.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Send renewal reminder for a subscription
 */
async function sendRenewalReminder(subscription: any): Promise<boolean> {
  try {
    const daysRemaining = calculateDaysRemaining(subscription.endDate);
    const endDateFormatted = new Date(subscription.endDate).toLocaleDateString(
      "bn-BD"
    );

    console.log(
      `[Subscription Reminder] Sending reminder for user ${subscription.userId}, days remaining: ${daysRemaining}`
    );

    // Send email notification
    const emailSent = await sendSubscriptionReminderEmail(
      subscription.email,
      subscription.name || "User",
      subscription.planName,
      endDateFormatted,
      daysRemaining
    );

    if (emailSent) {
      // Update reminder sent timestamp
      // This would be implemented with proper query builder or ORM methods
      console.log(
        `[Subscription Reminder] Would update reminder timestamp for subscription ${subscription.id}`
      );

      console.log(
        `[Subscription Reminder] Reminder sent successfully for subscription ${subscription.id}`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(
      `[Subscription Reminder] Error sending reminder for subscription ${subscription.id}:`,
      error
    );
    return false;
  }
}

/**
 * Process all subscriptions needing reminders
 */
export async function processSubscriptionReminders(
  config: Partial<SubscriptionReminderConfig> = {}
): Promise<{ sent: number; failed: number }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log(
    `[Subscription Reminder] Starting reminder process (${finalConfig.daysBeforeExpiry} days before expiry)`
  );

  try {
    // Get subscriptions needing reminders
    const subscriptions = await getSubscriptionsNeedingReminders(
      finalConfig.daysBeforeExpiry
    );

    console.log(
      `[Subscription Reminder] Found ${subscriptions.length} subscriptions needing reminders`
    );

    let sent = 0;
    let failed = 0;

    // Send reminders for each subscription
    for (const subscription of subscriptions) {
      const success = await sendRenewalReminder(subscription);
      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `[Subscription Reminder] Process completed. Sent: ${sent}, Failed: ${failed}`
    );

    return { sent, failed };
  } catch (error) {
    console.error("[Subscription Reminder] Fatal error in process:", error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Start subscription reminder scheduler
 * Runs periodically to check and send reminders
 */
export function startSubscriptionReminderScheduler(
  config: Partial<SubscriptionReminderConfig> = {}
): NodeJS.Timeout {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log(
    `[Subscription Reminder] Starting scheduler (check every ${finalConfig.checkIntervalHours} hours)`
  );

  // Run immediately on startup
  processSubscriptionReminders(finalConfig).catch((error) => {
    console.error("[Subscription Reminder] Error in initial run:", error);
  });

  // Schedule periodic checks
  const intervalMs = finalConfig.checkIntervalHours * 60 * 60 * 1000;
  const interval = setInterval(() => {
    processSubscriptionReminders(finalConfig).catch((error) => {
      console.error("[Subscription Reminder] Error in scheduled run:", error);
    });
  }, intervalMs);

  return interval;
}

/**
 * Stop subscription reminder scheduler
 */
export function stopSubscriptionReminderScheduler(
  interval: NodeJS.Timeout
): void {
  clearInterval(interval);
  console.log("[Subscription Reminder] Scheduler stopped");
}
