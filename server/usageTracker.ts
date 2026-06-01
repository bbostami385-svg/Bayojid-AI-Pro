/**
 * Usage Tracker Service
 * Tracks video editing and image generation usage per user
 */

import { getDb } from "./db";
import { userQuotas, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getTierLimits, canPerformAction, getRemainingUsage, getUsagePercentage } from "./usageLimits";
import type { UserTier } from "./usageLimits";

export interface UsageRecord {
  userId: number;
  action: "video_edit" | "image_generate";
  amount: number; // minutes for video, count for images
  timestamp: Date;
}

export interface UserUsage {
  userId: number;
  tier: UserTier;
  videoEditingMinutesUsed: number;
  videoEditingMinutesLimit: number;
  imageGenerationUsed: number;
  imageGenerationLimit: number;
  videoEditingPercentage: number;
  imageGenerationPercentage: number;
  videoEditingRemaining: number;
  imageGenerationRemaining: number;
}

/**
 * Get user's current usage
 */
export async function getUserUsage(userId: number): Promise<UserUsage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!userResult || userResult.length === 0) {
    throw new Error(`User ${userId} not found`);
  }

  // Get or create user quota record
  let quotaResult = await db.select().from(userQuotas).where(eq(userQuotas.userId, userId)).limit(1);
  let quota = quotaResult.length > 0 ? quotaResult[0] : null;

  if (!quota) {
    // Create default quota for free tier
    await db
      .insert(userQuotas)
      .values({
        userId,
        tier: "free",
        messagesUsed: 0,
        messagesLimit: 100,
        apiCallsUsed: 0,
        apiCallsLimit: 1000,
        exportsUsed: 0,
        exportsLimit: 10,
        storageUsed: 0,
        storageLimit: 1073741824, // 1GB
        collaborationsUsed: 0,
        collaborationsLimit: 0,
      });

    quotaResult = await db.select().from(userQuotas).where(eq(userQuotas.userId, userId)).limit(1);
    quota = quotaResult[0];
  }

  const tier = (quota.tier as UserTier) || "free";
  const limits = getTierLimits(tier);

  // For now, we'll track usage in memory or via a separate tracking table
  // In production, you'd query from a usage_logs table
  const videoEditingUsed = 0; // TODO: Query from usage logs
  const imageGenerationUsed = 0; // TODO: Query from usage logs

  return {
    userId,
    tier,
    videoEditingMinutesUsed: videoEditingUsed,
    videoEditingMinutesLimit: limits.videoEditingMinutesPerMonth,
    imageGenerationUsed,
    imageGenerationLimit: limits.imageGenerationPerMonth,
    videoEditingPercentage: getUsagePercentage(tier, "video_edit", videoEditingUsed),
    imageGenerationPercentage: getUsagePercentage(tier, "image_generate", imageGenerationUsed),
    videoEditingRemaining: getRemainingUsage(tier, "video_edit", videoEditingUsed),
    imageGenerationRemaining: getRemainingUsage(tier, "image_generate", imageGenerationUsed),
  };
}

/**
 * Check if user can perform action
 */
export async function checkUsageLimit(
  userId: number,
  action: "video_edit" | "image_generate",
  amount: number
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  const usage = await getUserUsage(userId);

  if (action === "video_edit") {
    const result = canPerformAction(
      usage.tier,
      action,
      usage.videoEditingMinutesUsed,
      amount
    );
    return {
      ...result,
      remaining: usage.videoEditingRemaining,
    };
  }

  if (action === "image_generate") {
    const result = canPerformAction(
      usage.tier,
      action,
      usage.imageGenerationUsed,
      amount
    );
    return {
      ...result,
      remaining: usage.imageGenerationRemaining,
    };
  }

  return { allowed: false, reason: "Unknown action" };
}

/**
 * Record usage
 */
export async function recordUsage(record: UsageRecord): Promise<void> {
  // TODO: Insert into usage_logs table
  console.log(`[Usage] User ${record.userId}: ${record.action} +${record.amount}`);
}

/**
 * Get usage statistics for admin
 */
export async function getUsageStatistics(tier?: UserTier) {
  // TODO: Query usage logs and aggregate statistics
  return {
    totalUsers: 0,
    averageVideoEditingUsage: 0,
    averageImageGenerationUsage: 0,
    peakUsageTime: "",
  };
}

/**
 * Reset monthly usage
 */
export async function resetMonthlyUsage(userId: number): Promise<void> {
  // TODO: Reset usage counters at the start of each month
  console.log(`[Usage] Monthly reset for user ${userId}`);
}

/**
 * Upgrade user tier
 */
export async function upgradeUserTier(userId: number, newTier: UserTier): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userQuotas)
    .set({ tier: newTier })
    .where(eq(userQuotas.userId, userId));

  console.log(`[Usage] User ${userId} upgraded to ${newTier}`);
}

/**
 * Get tier upgrade recommendation
 */
export async function getUpgradeRecommendation(userId: number): Promise<UserTier | null> {
  const usage = await getUserUsage(userId);

  // If using more than 80% of free tier limits, recommend upgrade
  if (
    usage.tier === "free" &&
    (usage.videoEditingPercentage > 80 || usage.imageGenerationPercentage > 80)
  ) {
    return "starter";
  }

  // If using more than 80% of starter tier limits, recommend pro
  if (
    usage.tier === "starter" &&
    (usage.videoEditingPercentage > 80 || usage.imageGenerationPercentage > 80)
  ) {
    return "pro";
  }

  // If using more than 80% of pro tier limits, recommend enterprise
  if (
    usage.tier === "pro" &&
    (usage.videoEditingPercentage > 80 || usage.imageGenerationPercentage > 80)
  ) {
    return "enterprise";
  }

  return null;
}
