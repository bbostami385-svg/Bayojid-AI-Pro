import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  checkGPT5Usage,
  checkModelAllowance,
  checkMonthlySafeZone,
  getRecommendedModel,
  calculateEffectiveCost,
  generateFairUsageReport,
} from "./fairUsagePolicy";
import { getUserCredits } from "./creditSystemV2";

export const fairUsageIntegrationRouter = router({
  /**
   * Validate model before use
   */
  validateModel: protectedProcedure
    .input(
      z.object({
        modelName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      const allowance = checkModelAllowance(input.modelName, credits.tier);

      return {
        modelName: input.modelName,
        tier: credits.tier,
        allowed: allowance.allowed,
        warning: allowance.warning,
        message: allowance.message,
        recommendation: allowance.recommendation,
      };
    }),

  /**
   * Check GPT-5 usage before operation
   */
  checkGPT5: protectedProcedure
    .input(
      z.object({
        gpt5UsagePercentage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      const check = checkGPT5Usage(credits.tier, input.gpt5UsagePercentage);

      return {
        tier: credits.tier,
        ...check,
      };
    }),

  /**
   * Check monthly safe zone
   */
  checkSafeZone: protectedProcedure
    .input(
      z.object({
        monthlyUsedCredits: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      const check = checkMonthlySafeZone(credits.tier, input.monthlyUsedCredits);

      return {
        tier: credits.tier,
        ...check,
      };
    }),

  /**
   * Get recommended model for use case
   */
  getRecommendedModelForUseCase: protectedProcedure
    .input(
      z.object({
        useCase: z.enum(["chat", "coding", "analysis", "creative"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      const recommended = getRecommendedModel(credits.tier, input.useCase);

      return {
        tier: credits.tier,
        useCase: input.useCase,
        recommendedModel: recommended,
      };
    }),

  /**
   * Calculate effective cost with fair usage multiplier
   */
  calculateEffectiveCostForOperation: protectedProcedure
    .input(
      z.object({
        operation: z.string(),
        baseCredits: z.number(),
        monthlyUsagePercentage: z.number(),
      })
    )
    .query(({ input }) => {
      const effectiveCost = calculateEffectiveCost(
        input.operation,
        input.baseCredits,
        input.monthlyUsagePercentage
      );

      const multiplier = effectiveCost / input.baseCredits;

      return {
        operation: input.operation,
        baseCredits: input.baseCredits,
        monthlyUsagePercentage: input.monthlyUsagePercentage,
        effectiveCost,
        multiplier: multiplier.toFixed(2),
        costIncrease: effectiveCost - input.baseCredits,
      };
    }),

  /**
   * Get comprehensive fair usage report
   */
  getFairUsageReport: protectedProcedure
    .input(
      z.object({
        monthlyUsedCredits: z.number(),
        gpt5UsagePercentage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);
      const report = generateFairUsageReport(
        credits.tier,
        input.monthlyUsedCredits,
        input.gpt5UsagePercentage
      );

      return report;
    }),

  /**
   * Pre-check before operation (comprehensive validation)
   */
  preCheckOperation: protectedProcedure
    .input(
      z.object({
        modelName: z.string(),
        operationType: z.enum(["chat", "video", "image", "workflow"]),
        estimatedCost: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const credits = await getUserCredits(ctx.user.id);

      // Check model allowance
      const modelCheck = checkModelAllowance(input.modelName, credits.tier);

      // Check if user can afford
      const canAfford = credits.balance >= input.estimatedCost;

      // Check if operation would exceed limits
      const wouldExceedLimit = credits.balance - input.estimatedCost < 0;

      return {
        modelAllowed: modelCheck.allowed,
        modelWarning: modelCheck.warning,
        modelMessage: modelCheck.message,
        canAfford,
        wouldExceedLimit,
        currentBalance: credits.balance,
        estimatedCost: input.estimatedCost,
        balanceAfterOperation: Math.max(0, credits.balance - input.estimatedCost),
        tier: credits.tier,
        operationType: input.operationType,
        approved: modelCheck.allowed && canAfford,
      };
    }),

  /**
   * Get all policy information for display
   */
  getPolicyInfo: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.user.id);

    return {
      tier: credits.tier,
      currentBalance: credits.balance,
      dailyLimit: credits.dailyLimit,
      policies: {
        gpt5: {
          free: "Not allowed",
          pro: "Not allowed",
          premium: "Max 25% usage",
          enterprise: "Max 30% usage",
        },
        heavyModels: {
          restricted: ["GPT-5", "Claude Mythos", "Grok", "Gemini 3"],
          allowedFor: ["Pro", "Premium", "Enterprise"],
        },
        costMultiplier: {
          "0-80%": "1x",
          "80-85%": "1.2x",
          "85-90%": "1.5x",
          "90%+": "2x",
        },
        safeZone: {
          premium: "40,000 - 70,000 credits/month",
          enterprise: "Soft limit (contact support)",
        },
      },
    };
  }),
});
