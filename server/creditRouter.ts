import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserCredits,
  deductCredits,
  addBonusCredits,
  getCreditCost,
  getTierInfo,
  calculateModelCost,
  CREDIT_CONFIG,
  CREDIT_COSTS,
} from "./creditSystem";

export const creditRouter = router({
  /**
   * Get user's current credit balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);
    const tierInfo = getTierInfo(credits.tier);

    return {
      balance: credits.balance,
      dailyLimit: credits.dailyLimit,
      tier: credits.tier,
      tierName: tierInfo.tier,
      dailyCredits: tierInfo.dailyCredits,
      price: tierInfo.price,
      percentageUsed: Math.round((1 - credits.balance / credits.dailyLimit) * 100),
    };
  }),

  /**
   * Get credit cost for an operation
   */
  getCost: protectedProcedure
    .input(
      z.object({
        operation: z.string(),
      })
    )
    .query(({ input }) => {
      const cost = getCreditCost(input.operation);
      return {
        operation: input.operation,
        cost,
      };
    }),

  /**
   * Calculate cost for model usage
   */
  calculateModelCost: protectedProcedure
    .input(
      z.object({
        modelTier: z.enum(["free", "pro", "premium"]),
        duration: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const cost = calculateModelCost(input.modelTier, input.duration);
      return {
        modelTier: input.modelTier,
        duration: input.duration || 1,
        cost,
      };
    }),

  /**
   * Deduct credits for an operation
   */
  deductCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await deductCredits(ctx.user.id, input.amount, input.reason);
    }),

  /**
   * Add bonus credits (admin only)
   */
  addBonusCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can add bonus credits");
      }

      return await addBonusCredits(ctx.user.id, input.amount, input.reason);
    }),

  /**
   * Get all tier information
   */
  getTierInfo: protectedProcedure
    .input(
      z.object({
        tier: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const tier = input.tier || "free";
      const tierInfo = getTierInfo(tier);

      return {
        tier,
        ...tierInfo,
      };
    }),

  /**
   * Get all available tiers
   */
  getAllTiers: protectedProcedure.query(() => {
    return Object.entries(CREDIT_CONFIG).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }),

  /**
   * Get all credit costs
   */
  getAllCosts: protectedProcedure.query(() => {
    return Object.entries(CREDIT_COSTS).map(([operation, cost]) => ({
      operation,
      cost,
    }));
  }),

  /**
   * Check if user can afford an operation
   */
  canAfford: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      return {
        canAfford: credits.balance >= input.amount,
        required: input.amount,
        available: credits.balance,
        shortfall: Math.max(0, input.amount - credits.balance),
      };
    }),

  /**
   * Get credit usage summary
   */
  getUsageSummary: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);

    return {
      tier: credits.tier,
      dailyLimit: credits.dailyLimit,
      currentBalance: credits.balance,
      usedToday: credits.dailyLimit - credits.balance,
      percentageUsed: Math.round((1 - credits.balance / credits.dailyLimit) * 100),
      remainingPercentage: Math.round((credits.balance / credits.dailyLimit) * 100),
      status:
        credits.balance === 0
          ? "exhausted"
          : credits.balance < credits.dailyLimit * 0.2
            ? "low"
            : credits.balance < credits.dailyLimit * 0.5
              ? "medium"
              : "healthy",
    };
  }),

  /**
   * Get upgrade recommendations
   */
  getUpgradeRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);
    const percentageUsed = (1 - credits.balance / credits.dailyLimit) * 100;

    const recommendations = [];

    if (percentageUsed > 80 && credits.tier === "free") {
      recommendations.push({
        tier: "pro",
        reason: "You're using 80%+ of your daily credits",
        benefit: "10x more credits (1000/day)",
        price: 9.99,
      });
    }

    if (percentageUsed > 80 && credits.tier === "pro") {
      recommendations.push({
        tier: "premium",
        reason: "You're using 80%+ of your daily credits",
        benefit: "5x more credits (5000/day)",
        price: 29.99,
      });
    }

    if (credits.tier !== "enterprise" && percentageUsed > 90) {
      recommendations.push({
        tier: "enterprise",
        reason: "You're using 90%+ of your daily credits",
        benefit: "Unlimited credits",
        price: 99.99,
      });
    }

    return {
      currentTier: credits.tier,
      percentageUsed,
      recommendations,
    };
  }),
});
