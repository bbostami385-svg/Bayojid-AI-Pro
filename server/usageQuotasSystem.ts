/**
 * Usage Quotas System
 * Manages monthly usage limits for free and paid tier users
 */

import { getDb } from "./db";
import { userUsageStats } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface UserQuota {
  userId: string;
  tier: "free" | "starter" | "premium" | "enterprise";
  videoMinutesLimit: number;
  imageGenerationsLimit: number;
  videoMinutesUsed: number;
  imageGenerationsUsed: number;
  resetDate: Date;
}

// Monthly quotas by tier
export const TIER_QUOTAS = {
  free: {
    videoMinutesLimit: 10, // 10 minutes per month
    imageGenerationsLimit: 5, // 5 images per month
    description: "Free tier with basic limits",
  },
  starter: {
    videoMinutesLimit: 60, // 60 minutes per month
    imageGenerationsLimit: 50, // 50 images per month
    description: "Starter tier with moderate limits",
  },
  premium: {
    videoMinutesLimit: 500, // 500 minutes per month
    imageGenerationsLimit: 500, // 500 images per month
    description: "Premium tier with high limits",
  },
  enterprise: {
    videoMinutesLimit: Infinity, // Unlimited
    imageGenerationsLimit: Infinity, // Unlimited
    description: "Enterprise tier with unlimited usage",
  },
};

/**
 * Get user's current usage quota
 */
export async function getUserQuota(userId: string): Promise<UserQuota | null> {
  const db = await getDb();
  if (!db) return null;
  const stats = await db
    .select()
    .from(userUsageStats)
    .where(eq(userUsageStats.userId, userId))
    .limit(1);

  if (!stats || stats.length === 0) {
    return null;
  }

  const stat = stats[0];
  const now = new Date();
  const resetDate = stat.monthlyResetDate instanceof Date ? stat.monthlyResetDate : new Date(stat.monthlyResetDate as string | number);

  // Check if quota should be reset (new month)
  if (now > resetDate) {
    // Reset usage for new month
    await db
      .update(userUsageStats)
      .set({
        videoMinutesUsed: 0,
        imageGenerationsUsed: 0,
        monthlyResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) as any,
      })
      .where(eq(userUsageStats.userId, userId));

    return {
      userId,
      tier: (stat.userTier as any) || "free",
      videoMinutesLimit: TIER_QUOTAS[(stat.userTier as "free" | "starter" | "premium" | "enterprise") || "free"].videoMinutesLimit,
      imageGenerationsLimit: TIER_QUOTAS[(stat.userTier as "free" | "starter" | "premium" | "enterprise") || "free"].imageGenerationsLimit,
      videoMinutesUsed: 0,
      imageGenerationsUsed: 0,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) as any,
    };
  }

  return {
    userId,
    tier: (stat.userTier as any) || "free",
    videoMinutesLimit: TIER_QUOTAS[(stat.userTier as "free" | "starter" | "premium" | "enterprise") || "free"].videoMinutesLimit,
    imageGenerationsLimit: TIER_QUOTAS[(stat.userTier as "free" | "starter" | "premium" | "enterprise") || "free"].imageGenerationsLimit,
    videoMinutesUsed: (stat.videoMinutesUsed as number) || 0,
    imageGenerationsUsed: (stat.imageGenerationsUsed as number) || 0,
    resetDate,
  };
}

/**
 * Check if user can perform video editing
 */
export async function canUserEditVideo(userId: string, durationMinutes: number): Promise<boolean> {
  const quota = await getUserQuota(userId);
  if (!quota) return false;

  const remainingMinutes = quota.videoMinutesLimit - quota.videoMinutesUsed;
  return remainingMinutes >= durationMinutes;
}

/**
 * Check if user can generate image
 */
export async function canUserGenerateImage(userId: string): Promise<boolean> {
  const quota = await getUserQuota(userId);
  if (!quota) return false;

  const remainingGenerations = quota.imageGenerationsLimit - quota.imageGenerationsUsed;
  return remainingGenerations > 0;
}

/**
 * Record video editing usage
 */
export async function recordVideoUsage(userId: string, durationMinutes: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quota = await getUserQuota(userId);

  if (!quota) {
    // Create new quota record
    await db.insert(userUsageStats).values({
      userId,
      userTier: "free",
      videoMinutesUsed: durationMinutes,
      imageGenerationsUsed: 0,
      monthlyResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    });
  } else {
    // Update existing quota
    await db
      .update(userUsageStats)
      .set({
        videoMinutesUsed: (quota.videoMinutesUsed || 0) + durationMinutes,
      })
      .where(eq(userUsageStats.userId, userId));
  }
}

/**
 * Record image generation usage
 */
export async function recordImageUsage(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const quota = await getUserQuota(userId);

  if (!quota) {
    // Create new quota record
    await db.insert(userUsageStats).values({
      userId,
      userTier: "free",
      videoMinutesUsed: 0,
      imageGenerationsUsed: 1,
      monthlyResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    });
  } else {
    // Update existing quota
    await db
      .update(userUsageStats)
      .set({
        imageGenerationsUsed: (quota.imageGenerationsUsed || 0) + 1,
      })
      .where(eq(userUsageStats.userId, userId));
  }
}

/**
 * Get quota usage percentage
 */
export async function getQuotaUsagePercentage(userId: string): Promise<{
  videoUsagePercent: number;
  imageUsagePercent: number;
}> {
  const quota = await getUserQuota(userId);
  if (!quota) {
    return { videoUsagePercent: 0, imageUsagePercent: 0 };
  }

  const videoUsagePercent =
    quota.videoMinutesLimit === Infinity
      ? 0
      : (quota.videoMinutesUsed / quota.videoMinutesLimit) * 100;

  const imageUsagePercent =
    quota.imageGenerationsLimit === Infinity
      ? 0
      : (quota.imageGenerationsUsed / quota.imageGenerationsLimit) * 100;

  return {
    videoUsagePercent: Math.min(videoUsagePercent, 100),
    imageUsagePercent: Math.min(imageUsagePercent, 100),
  };
}

/**
 * Get upgrade recommendation based on usage
 */
export async function getUpgradeRecommendation(userId: string): Promise<string | null> {
  const { videoUsagePercent, imageUsagePercent } = await getQuotaUsagePercentage(userId);

  if (videoUsagePercent > 80 || imageUsagePercent > 80) {
    return "You're using 80%+ of your monthly quota. Consider upgrading to Premium for higher limits!";
  }

  if (videoUsagePercent > 50 || imageUsagePercent > 50) {
    return "You're using 50%+ of your monthly quota. Premium tier offers 10x more usage!";
  }

  return null;
}

/**
 * Upgrade user tier
 */
export async function upgradeUserTier(userId: string, newTier: "starter" | "premium" | "enterprise"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(userUsageStats)
    .set({
      userTier: newTier,
      videoMinutesUsed: 0,
      imageGenerationsUsed: 0,
      monthlyResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    })
    .where(eq(userUsageStats.userId, userId));
}
