/**
 * Credit Deduction Router
 * Handles credit deduction for AI model usage and feature access
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

export interface CreditDeductionRecord {
  userId: string;
  modelId: string;
  featureType: "chat" | "image-generation" | "video-editing" | "code-analysis";
  creditsDeducted: number;
  creditsRemaining: number;
  timestamp: Date;
  description: string;
}

// Credit costs per model and feature
export const CREDIT_COSTS = {
  "gemini-flash": { chat: 1, "image-generation": 5, "video-editing": 20, "code-analysis": 2 },
  deepseek: { chat: 1, "image-generation": 4, "video-editing": 15, "code-analysis": 2 },
  qwen: { chat: 2, "image-generation": 6, "video-editing": 25, "code-analysis": 3 },
  "gpt-mini": { chat: 3, "image-generation": 8, "video-editing": 30, "code-analysis": 4 },
  "gpt-5": { chat: 10, "image-generation": 20, "video-editing": 50, "code-analysis": 15 },
  "claude-mythos": { chat: 12, "image-generation": 25, "video-editing": 60, "code-analysis": 18 },
  grok: { chat: 8, "image-generation": 15, "video-editing": 40, "code-analysis": 10 },
  "gemini-3": { chat: 9, "image-generation": 18, "video-editing": 45, "code-analysis": 12 },
  perplexity: { chat: 7, "image-generation": 12, "video-editing": 35, "code-analysis": 8 },
  "manus-ai": { chat: 5, "image-generation": 10, "video-editing": 25, "code-analysis": 6 },
};

// Tier daily credit limits
export const TIER_DAILY_LIMITS = {
  free: 100,
  pro: 1000,
  premium: 5000,
  enterprise: Infinity,
};

// Tier monthly credit limits
export const TIER_MONTHLY_LIMITS = {
  free: 2000,
  pro: 20000,
  premium: 60000,
  enterprise: Infinity,
};

/**
 * Calculate credit cost for a feature
 */
export function calculateCreditCost(
  modelId: string,
  featureType: "chat" | "image-generation" | "video-editing" | "code-analysis",
  quantity: number = 1
): number {
  const modelCosts = CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS];
  if (!modelCosts) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  const baseCost = modelCosts[featureType];
  if (baseCost === undefined) {
    throw new Error(`Unknown feature: ${featureType}`);
  }

  return baseCost * quantity;
}

/**
 * Check if user has enough credits
 */
export function hasEnoughCredits(
  currentCredits: number,
  requiredCredits: number
): boolean {
  return currentCredits >= requiredCredits;
}

/**
 * Get credit cost multiplier based on GPT-5 usage
 */
export function getGPT5CostMultiplier(
  gpt5UsagePercentage: number
): number {
  if (gpt5UsagePercentage > 30) {
    return 2.0; // 2x cost if exceeding 30% usage
  }
  if (gpt5UsagePercentage > 20) {
    return 1.5; // 1.5x cost if exceeding 20% usage
  }
  return 1.0; // Normal cost
}

/**
 * Check if user is in safe zone for monthly credits
 */
export function isInSafeZone(
  monthlyCreditsUsed: number,
  tier: "free" | "pro" | "premium" | "enterprise"
): boolean {
  const limit = TIER_MONTHLY_LIMITS[tier];
  if (limit === Infinity) return true;

  const safeZoneMin = limit * 0.4; // 40% of limit
  const safeZoneMax = limit * 0.7; // 70% of limit

  return monthlyCreditsUsed >= safeZoneMin && monthlyCreditsUsed <= safeZoneMax;
}

/**
 * Get credit usage warning level
 */
export function getWarningLevel(
  creditsUsed: number,
  creditsLimit: number
): "safe" | "warning" | "critical" {
  const usagePercentage = (creditsUsed / creditsLimit) * 100;

  if (usagePercentage >= 90) return "critical";
  if (usagePercentage >= 70) return "warning";
  return "safe";
}

export const creditDeductionRouter = router({
  // Deduct credits for feature usage
  deductCredits: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        featureType: z.enum(["chat", "image-generation", "video-editing", "code-analysis"]),
        quantity: z.number().default(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }

      const creditCost = calculateCreditCost(input.modelId, input.featureType, input.quantity);

      // In production, this would:
      // 1. Check user's current credit balance
      // 2. Verify they have enough credits
      // 3. Deduct credits from database
      // 4. Log the transaction
      // 5. Return updated balance

      return {
        success: true,
        creditsDeducted: creditCost,
        creditsRemaining: 0, // Would be fetched from DB
        timestamp: new Date(),
        description: input.description || `${input.featureType} with ${input.modelId}`,
      };
    }),

  // Get credit cost estimate
  estimateCreditCost: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        featureType: z.enum(["chat", "image-generation", "video-editing", "code-analysis"]),
        quantity: z.number().default(1),
        gpt5UsagePercentage: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const baseCost = calculateCreditCost(input.modelId, input.featureType, input.quantity);
      const multiplier = getGPT5CostMultiplier(input.gpt5UsagePercentage);
      const finalCost = Math.round(baseCost * multiplier);

      return {
        baseCost,
        multiplier,
        finalCost,
        costBreakdown: {
          modelCost: baseCost,
          gpt5Surcharge: finalCost - baseCost,
        },
      };
    }),

  // Check credit availability
  checkCreditAvailability: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        featureType: z.enum(["chat", "image-generation", "video-editing", "code-analysis"]),
        quantity: z.number().default(1),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }

      const requiredCredits = calculateCreditCost(input.modelId, input.featureType, input.quantity);

      // In production, would fetch actual user balance from DB
      const userBalance = 100; // Mock value

      return {
        hasEnoughCredits: hasEnoughCredits(userBalance, requiredCredits),
        requiredCredits,
        currentBalance: userBalance,
        shortfall: Math.max(0, requiredCredits - userBalance),
      };
    }),

  // Get credit usage report
  getCreditUsageReport: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    // In production, would fetch from database
    const dailyUsed = 50;
    const monthlyUsed = 1000;
    const userTier = "free" as const;

    const dailyLimit = TIER_DAILY_LIMITS[userTier];
    const monthlyLimit = TIER_MONTHLY_LIMITS[userTier];

    return {
      daily: {
        used: dailyUsed,
        limit: dailyLimit,
        remaining: dailyLimit - dailyUsed,
        percentage: (dailyUsed / dailyLimit) * 100,
        warningLevel: getWarningLevel(dailyUsed, dailyLimit),
      },
      monthly: {
        used: monthlyUsed,
        limit: monthlyLimit,
        remaining: monthlyLimit - monthlyUsed,
        percentage: (monthlyUsed / monthlyLimit) * 100,
        warningLevel: getWarningLevel(monthlyUsed, monthlyLimit),
        inSafeZone: isInSafeZone(monthlyUsed, userTier),
      },
      tier: userTier,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    };
  }),

  // Get credit cost breakdown for all models
  getCreditCostBreakdown: protectedProcedure.query(async () => {
    const breakdown: Record<string, Record<string, number>> = {};

    for (const [modelId, costs] of Object.entries(CREDIT_COSTS)) {
      breakdown[modelId] = costs;
    }

    return breakdown;
  }),

  // Check if model usage is within fair usage policy
  checkFairUsagePolicy: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        usagePercentage: z.number(),
      })
    )
    .query(async ({ input }) => {
      const isGPT5 = input.modelId.includes("gpt-5") || input.modelId.includes("claude");
      const maxAllowedUsage = isGPT5 ? 30 : 100;

      return {
        modelId: input.modelId,
        currentUsage: input.usagePercentage,
        maxAllowed: maxAllowedUsage,
        isWithinPolicy: input.usagePercentage <= maxAllowedUsage,
        costMultiplier: getGPT5CostMultiplier(input.usagePercentage),
        message:
          input.usagePercentage > maxAllowedUsage
            ? `Model usage exceeds fair usage policy. Cost multiplier: ${getGPT5CostMultiplier(input.usagePercentage)}x`
            : "Model usage is within fair usage policy",
      };
    }),
});
