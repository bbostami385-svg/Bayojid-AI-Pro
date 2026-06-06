/**
 * Phase 157: Video Editing Router with Usage Enforcement
 * Handles video editing operations with usage limits based on user tier
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { userUsageStats } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getTierLimits, canPerformAction, getRemainingUsage } from "./usageLimits";

/**
 * Video editing input schema
 */
const videoEditInput = z.object({
  videoId: z.string(),
  duration: z.number().positive(), // in seconds
  operations: z.array(
    z.object({
      type: z.enum(["trim", "filter", "text_overlay", "transition", "effect"]),
      duration: z.number().optional(),
    })
  ),
  quality: z.enum(["low", "medium", "high", "4k"]).default("medium"),
  outputFormat: z.enum(["mp4", "mov", "webm", "mkv"]).default("mp4"),
});

export const videoEditingRouter = router({
  /**
   * Check if user can perform video editing
   */
  checkVideoEditingCapacity: protectedProcedure
    .input(
      z.object({
        durationMinutes: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get user's current usage
        const usageResult = await db
          .select()
          .from(userUsageStats)
          .where(eq(userUsageStats.userId, ctx.user.id))
          .limit(1);

        const usage = usageResult.length > 0 ? usageResult[0] : null;
        const currentUsage = usage?.videoEditingMinutesThisMonth || 0;

        // Get user's tier (default to 'free')
        const userTier = (usage?.tier as any) || "free";
        const limits = getTierLimits(userTier);

        // Check if user can perform action
        const canEdit = canPerformAction(
          userTier,
          "video_edit",
          currentUsage as number,
          input.durationMinutes as number
        );

        const remaining = getRemainingUsage(
          userTier,
          "video_edit",
          currentUsage as number
        );

        return {
          allowed: canEdit.allowed,
          reason: canEdit.reason,
          currentUsage,
          limit: limits.videoEditingMinutesPerMonth,
          remaining,
          tier: userTier,
          quality: limits.videoEditingQuality,
          formats: limits.videoExportFormats,
        };
      } catch (error) {
        console.error("Error checking video editing capacity:", error);
        throw new Error("Failed to check video editing capacity");
      }
    }),

  /**
   * Start video editing session
   */
  startVideoEditing: protectedProcedure
    .input(videoEditInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get user's current usage
        const usageResult = await db
          .select()
          .from(userUsageStats)
          .where(eq(userUsageStats.userId, ctx.user.id))
          .limit(1);

        const usage = usageResult.length > 0 ? usageResult[0] : null;
        const currentUsage = usage?.videoEditingMinutesThisMonth || 0;
        const userTier = (usage?.tier as any) || "free";

        // Convert duration from seconds to minutes
        const durationMinutes = input.duration / 60;

        // Check if user can perform action
        const canEdit = canPerformAction(
          userTier,
          "video_edit",
          currentUsage as number,
          durationMinutes as number
        );

        if (!canEdit.allowed) {
          return {
            success: false,
            error: canEdit.reason,
            requiresUpgrade: true,
            currentTier: userTier,
          };
        }

        // Check quality restrictions
        const limits = getTierLimits(userTier);
        const qualityMap = { low: 0, medium: 1, high: 2, "4k": 3 };
        const allowedQualityLevel = qualityMap[limits.videoEditingQuality];
        const requestedQualityLevel = qualityMap[input.quality];

        if (requestedQualityLevel > allowedQualityLevel) {
          return {
            success: false,
            error: `Your ${userTier} tier only supports ${limits.videoEditingQuality} quality. Upgrade to edit in ${input.quality}.`,
            requiresUpgrade: true,
            currentTier: userTier,
            maxQuality: limits.videoEditingQuality,
          };
        }

        // Check format support
        if (!limits.videoExportFormats.includes(input.outputFormat)) {
          return {
            success: false,
            error: `Your ${userTier} tier doesn't support ${input.outputFormat} format. Supported: ${limits.videoExportFormats.join(", ")}`,
            requiresUpgrade: true,
            currentTier: userTier,
            supportedFormats: limits.videoExportFormats,
          };
        }

        // Create session ID
        const sessionId = `video_${ctx.user.id}_${Date.now()}`;

        return {
          success: true,
          sessionId,
          durationMinutes,
          quality: input.quality,
          format: input.outputFormat,
          estimatedCredits: Math.ceil((durationMinutes as number) * 0.5), // 0.5 credits per minute
          message: `Video editing session started. You have ${getRemainingUsage(userTier, "video_edit", currentUsage as number)} minutes remaining this month.`,
        };
      } catch (error) {
        console.error("Error starting video editing:", error);
        throw new Error("Failed to start video editing session");
      }
    }),

  /**
   * Complete video editing and record usage
   */
  completeVideoEditing: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        actualDurationMinutes: z.number().positive(),
        success: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        if (!input.success) {
          return { success: true, message: "Session cancelled, no usage recorded" };
        }

        // Get user's current usage
        const usageResult = await db
          .select()
          .from(userUsageStats)
          .where(eq(userUsageStats.userId, ctx.user.id))
          .limit(1);

        if (usageResult.length === 0) {
          // Create new usage record
          await db.insert(userUsageStats).values({
            userId: ctx.user.id,
            tier: "free",
            videoEditingMinutesThisMonth: input.actualDurationMinutes,
            imageGenerationThisMonth: 0,
            totalCreditsUsed: Math.ceil(input.actualDurationMinutes * 0.5),
            lastResetDate: new Date(),
          });
        } else {
          // Update existing usage record
          const usage = usageResult[0];
          await db
            .update(userUsageStats)
            .set({
              videoEditingMinutesThisMonth:
                ((usage.videoEditingMinutesThisMonth || 0) as number) +
                (input.actualDurationMinutes as number),
              totalCreditsUsed:
                ((usage.totalCreditsUsed || 0) as number) +
                Math.ceil((input.actualDurationMinutes as number) * 0.5),
              lastActivityDate: new Date(),
            })
            .where(eq(userUsageStats.userId, ctx.user.id));
        }

        return {
          success: true,
          message: `Video editing completed. Used ${input.actualDurationMinutes} minutes.`,
          usageRecorded: input.actualDurationMinutes,
        };
      } catch (error) {
        console.error("Error completing video editing:", error);
        throw new Error("Failed to complete video editing session");
      }
    }),

  /**
   * Get video editing statistics for user
   */
  getVideoEditingStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's usage stats
      const usageResult = await db
        .select()
        .from(userUsageStats)
        .where(eq(userUsageStats.userId, ctx.user.id))
        .limit(1);

      const usage = usageResult.length > 0 ? usageResult[0] : null;
      const userTier = (usage?.tier as any) || "free";
      const currentUsage = usage?.videoEditingMinutesThisMonth || 0;

      const limits = getTierLimits(userTier);
      const remaining = getRemainingUsage(userTier, "video_edit", currentUsage as number);
      const usagePercentage = ((currentUsage as number) / ((limits?.videoEditingMinutesPerMonth || 1) as number)) * 100;

      return {
        tier: userTier,
        currentUsage,
        limit: limits.videoEditingMinutesPerMonth,
        remaining,
        usagePercentage: Math.min(100, usagePercentage),
        quality: limits.videoEditingQuality,
        formats: limits.videoExportFormats,
        resetDate: usage?.lastResetDate || new Date(),
      };
    } catch (error) {
      console.error("Error getting video editing stats:", error);
      throw new Error("Failed to get video editing statistics");
    }
  }),

  /**
   * Get upgrade recommendation for video editing
   */
  getVideoEditingUpgradeRecommendation: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get user's usage stats
        const usageResult = await db
          .select()
          .from(userUsageStats)
          .where(eq(userUsageStats.userId, ctx.user.id))
          .limit(1);

        const usage = usageResult.length > 0 ? usageResult[0] : null;
        const userTier = (usage?.tier as any) || "free";
        const currentUsage = usage?.videoEditingMinutesThisMonth || 0;

        const limits = getTierLimits(userTier);
        const usagePercentage = ((currentUsage as number) / ((limits?.videoEditingMinutesPerMonth || 1) as number)) * 100;

        // Recommend upgrade if at 80% usage
        if (usagePercentage >= 80) {
          const recommendations: Record<string, string> = {
            free: "starter",
            starter: "pro",
            pro: "enterprise",
            enterprise: "enterprise",
          };

          const recommendedTier = recommendations[userTier];
          const recommendedLimits = getTierLimits(recommendedTier as any);

          return {
            shouldUpgrade: true,
            reason: `You've used ${Math.round(usagePercentage)}% of your monthly video editing quota`,
            currentTier: userTier,
            currentLimit: (limits?.videoEditingMinutesPerMonth || 0) as number,
            recommendedTier,
            recommendedLimit: (recommendedLimits?.videoEditingMinutesPerMonth || 0) as number,
            usagePercentage: Math.round(usagePercentage),
          };
        }

        return {
          shouldUpgrade: false,
          usagePercentage: Math.round(usagePercentage),
          currentTier: userTier,
          currentLimit: (limits?.videoEditingMinutesPerMonth || 0) as number,
          remaining: ((limits?.videoEditingMinutesPerMonth || 0) as number) - (currentUsage as number),
        };
      } catch (error) {
        console.error("Error getting upgrade recommendation:", error);
        throw new Error("Failed to get upgrade recommendation");
      }
    }
  ),
});
