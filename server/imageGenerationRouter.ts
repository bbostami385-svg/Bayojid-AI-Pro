/**
 * Phase 158: Image Generation Router with Usage Enforcement
 * Handles image generation operations with usage limits based on user tier
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { userUsageStats } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getTierLimits, canPerformAction, getRemainingUsage } from "./usageLimits";

/**
 * Image generation input schema
 */
const imageGenerationInput = z.object({
  prompt: z.string().min(10).max(1000),
  quantity: z.number().int().min(1).max(10).default(1),
  quality: z.enum(["low", "medium", "high", "ultra"]).default("medium"),
  style: z.enum(["realistic", "anime", "cartoon", "abstract", "oil_painting"]).optional(),
  size: z.enum(["512x512", "1024x1024", "2048x2048"]).default("1024x1024"),
});

export const imageGenerationRouter = router({
  /**
   * Check if user can generate images
   */
  checkImageGenerationCapacity: protectedProcedure
    .input(
      z.object({
        quantity: z.number().int().positive().default(1),
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
        const currentUsage = usage?.imageGenerationThisMonth || 0;

        // Get user's tier (default to 'free')
        const userTier = (usage?.tier as any) || "free";
        const limits = getTierLimits(userTier);

        // Check if user can perform action
        const canGenerate = canPerformAction(
          userTier,
          "image_generate",
          currentUsage,
          input.quantity
        );

        const remaining = getRemainingUsage(
          userTier,
          "image_generate",
          currentUsage
        );

        return {
          allowed: canGenerate.allowed,
          reason: canGenerate.reason,
          currentUsage,
          limit: limits.imageGenerationPerMonth,
          remaining,
          tier: userTier,
          quality: limits.imageGenerationQuality,
          formats: limits.imageExportFormats,
        };
      } catch (error) {
        console.error("Error checking image generation capacity:", error);
        throw new Error("Failed to check image generation capacity");
      }
    }),

  /**
   * Generate images
   */
  generateImages: protectedProcedure
    .input(imageGenerationInput)
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
        const currentUsage = usage?.imageGenerationThisMonth || 0;
        const userTier = (usage?.tier as any) || "free";

        // Check if user can perform action
        const canGenerate = canPerformAction(
          userTier,
          "image_generate",
          currentUsage,
          input.quantity
        );

        if (!canGenerate.allowed) {
          return {
            success: false,
            error: canGenerate.reason,
            requiresUpgrade: true,
            currentTier: userTier,
          };
        }

        // Check quality restrictions
        const limits = getTierLimits(userTier);
        const qualityMap = { low: 0, medium: 1, high: 2, ultra: 3 };
        const allowedQualityLevel = qualityMap[limits.imageGenerationQuality];
        const requestedQualityLevel = qualityMap[input.quality];

        if (requestedQualityLevel > allowedQualityLevel) {
          return {
            success: false,
            error: `Your ${userTier} tier only supports ${limits.imageGenerationQuality} quality. Upgrade to generate ${input.quality} quality images.`,
            requiresUpgrade: true,
            currentTier: userTier,
            maxQuality: limits.imageGenerationQuality,
          };
        }

        // Check size restrictions (higher tiers get higher resolution)
        const sizeMap = { "512x512": 0, "1024x1024": 1, "2048x2048": 2 };
        const allowedSizeLevel = sizeMap[limits.imageGenerationQuality === "ultra" ? "2048x2048" : limits.imageGenerationQuality === "high" ? "1024x1024" : "512x512"];
        const requestedSizeLevel = sizeMap[input.size];

        if (requestedSizeLevel > allowedSizeLevel) {
          return {
            success: false,
            error: `Your ${userTier} tier doesn't support ${input.size} resolution. Upgrade to generate larger images.`,
            requiresUpgrade: true,
            currentTier: userTier,
          };
        }

        // Create generation session ID
        const sessionId = `image_${ctx.user.id}_${Date.now()}`;

        // Estimate credits (1 credit per image, higher quality = more credits)
        const qualityMultiplier = {
          low: 1,
          medium: 1.5,
          high: 2,
          ultra: 3,
        };
        const estimatedCredits = Math.ceil(
          input.quantity * (qualityMultiplier[input.quality] || 1)
        );

        return {
          success: true,
          sessionId,
          quantity: input.quantity,
          quality: input.quality,
          size: input.size,
          style: input.style,
          estimatedCredits,
          message: `Image generation started. You have ${getRemainingUsage(userTier, "image_generate", currentUsage)} images remaining this month.`,
        };
      } catch (error) {
        console.error("Error generating images:", error);
        throw new Error("Failed to generate images");
      }
    }),

  /**
   * Complete image generation and record usage
   */
  completeImageGeneration: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        imagesGenerated: z.number().int().positive(),
        success: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        if (!input.success) {
          return { success: true, message: "Generation cancelled, no usage recorded" };
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
            videoEditingMinutesThisMonth: 0,
            imageGenerationThisMonth: input.imagesGenerated,
            totalCreditsUsed: input.imagesGenerated,
            lastResetDate: new Date(),
          });
        } else {
          // Update existing usage record
          const usage = usageResult[0];
          await db
            .update(userUsageStats)
            .set({
              imageGenerationThisMonth:
                (usage.imageGenerationThisMonth || 0) + input.imagesGenerated,
              totalCreditsUsed:
                (usage.totalCreditsUsed || 0) + input.imagesGenerated,
              lastActivityDate: new Date(),
            })
            .where(eq(userUsageStats.userId, ctx.user.id));
        }

        return {
          success: true,
          message: `Image generation completed. Generated ${input.imagesGenerated} images.`,
          usageRecorded: input.imagesGenerated,
        };
      } catch (error) {
        console.error("Error completing image generation:", error);
        throw new Error("Failed to complete image generation");
      }
    }),

  /**
   * Get image generation statistics for user
   */
  getImageGenerationStats: protectedProcedure.query(async ({ ctx }) => {
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
      const currentUsage = usage?.imageGenerationThisMonth || 0;

      const limits = getTierLimits(userTier);
      const remaining = getRemainingUsage(userTier, "image_generate", currentUsage);
      const usagePercentage = (currentUsage / limits.imageGenerationPerMonth) * 100;

      return {
        tier: userTier,
        currentUsage,
        limit: limits.imageGenerationPerMonth,
        remaining,
        usagePercentage: Math.min(100, usagePercentage),
        quality: limits.imageGenerationQuality,
        formats: limits.imageExportFormats,
        resetDate: usage?.lastResetDate || new Date(),
      };
    } catch (error) {
      console.error("Error getting image generation stats:", error);
      throw new Error("Failed to get image generation statistics");
    }
  }),

  /**
   * Get upgrade recommendation for image generation
   */
  getImageGenerationUpgradeRecommendation: protectedProcedure.query(
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
        const currentUsage = usage?.imageGenerationThisMonth || 0;

        const limits = getTierLimits(userTier);
        const usagePercentage = (currentUsage / limits.imageGenerationPerMonth) * 100;

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
            reason: `You've used ${Math.round(usagePercentage)}% of your monthly image generation quota`,
            currentTier: userTier,
            currentLimit: limits.imageGenerationPerMonth,
            recommendedTier,
            recommendedLimit: recommendedLimits.imageGenerationPerMonth,
            usagePercentage: Math.round(usagePercentage),
          };
        }

        return {
          shouldUpgrade: false,
          usagePercentage: Math.round(usagePercentage),
          currentTier: userTier,
          currentLimit: limits.imageGenerationPerMonth,
          remaining: limits.imageGenerationPerMonth - currentUsage,
        };
      } catch (error) {
        console.error("Error getting upgrade recommendation:", error);
        throw new Error("Failed to get upgrade recommendation");
      }
    }
  ),
});
