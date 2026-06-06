/**
 * Model Enforcement Router
 * Validates user tier and enforces model access restrictions
 */

import { router, protectedProcedure } from "./trpc";
import { z } from "zod";
import { getFreeTierModels, getPremiumTierModels, AI_MODELS_CONFIG } from "./aiIntegration";
import { getUserQuota } from "./usageQuotasSystem";

export const modelEnforcementRouter = router({
  /**
   * Check if user can access a specific model
   */
  canAccessModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const modelId = input.modelId;

      // Get user quota/tier
      const quota = await getUserQuota(userId);
      if (!quota) {
        return {
          canAccess: false,
          reason: "User quota not found",
          tier: "free",
          model: modelId,
        };
      }

      // Get model info
      const model = AI_MODELS_CONFIG[modelId];
      if (!model) {
        return {
          canAccess: false,
          reason: "Model not found",
          tier: quota.tier,
          model: modelId,
        };
      }

      // Check if model is configured
      if (!model.isConfigured) {
        return {
          canAccess: false,
          reason: `Model ${model.name} is not configured. API key missing.`,
          tier: quota.tier,
          model: modelId,
          configured: false,
        };
      }

      // Check tier restrictions
      const freeModels = getFreeTierModels();
      const premiumModels = getPremiumTierModels();

      const freeModelIds = freeModels.map((m) => m.id);
      const premiumModelIds = premiumModels.map((m) => m.id);

      if (quota.tier === "free") {
        // Free tier users can only access free models
        if (!freeModelIds.includes(modelId)) {
          return {
            canAccess: false,
            reason: "This model is only available for Premium users. Upgrade to access.",
            tier: quota.tier,
            model: modelId,
            requiresUpgrade: true,
          };
        }
      }

      // All tiers can access their respective models
      return {
        canAccess: true,
        reason: "Access granted",
        tier: quota.tier,
        model: modelId,
        modelName: model.name,
        configured: true,
      };
    }),

  /**
   * Get available models for user's tier
   */
  getAvailableModels: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Get user quota/tier
    const quota = await getUserQuota(userId);
    if (!quota) {
      return {
        tier: "free",
        models: getFreeTierModels().map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          capabilities: m.capabilities,
          configured: m.isConfigured,
        })),
      };
    }

    let availableModels;
    if (quota.tier === "free") {
      availableModels = getFreeTierModels();
    } else if (quota.tier === "starter") {
      availableModels = [...getFreeTierModels(), ...getPremiumTierModels()];
    } else {
      // Premium and Enterprise
      availableModels = [...getFreeTierModels(), ...getPremiumTierModels()];
    }

    return {
      tier: quota.tier,
      models: availableModels.map((m) => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        capabilities: m.capabilities,
        configured: m.isConfigured,
        costPerMillion: m.costPerMillion,
      })),
    };
  }),

  /**
   * Get model status for user
   */
  getModelStatus: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const modelId = input.modelId;

      // Check access first
      const accessCheck = await modelEnforcementRouter.createCaller(ctx).canAccessModel({ modelId });

      const model = AI_MODELS_CONFIG[modelId];
      if (!model) {
        return {
          modelId,
          status: "not_found",
          canAccess: false,
        };
      }

      return {
        modelId,
        name: model.name,
        provider: model.provider,
        status: model.isConfigured ? "ready" : "not_configured",
        canAccess: accessCheck.canAccess,
        configured: model.isConfigured,
        capabilities: model.capabilities,
        costPerMillion: model.costPerMillion,
        maxTokens: model.maxTokens,
      };
    }),

  /**
   * Validate model selection before use
   */
  validateModelSelection: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        action: z.enum(["chat", "video_edit", "image_generate"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { modelId, action } = input;

      // Check if user can access model
      const accessCheck = await modelEnforcementRouter.createCaller(ctx).canAccessModel({ modelId });

      if (!accessCheck.canAccess) {
        return {
          valid: false,
          reason: accessCheck.reason,
          requiresUpgrade: accessCheck.requiresUpgrade || false,
        };
      }

      // Check usage quota for specific actions
      const quota = await getUserQuota(userId);
      if (!quota) {
        return {
          valid: false,
          reason: "User quota not found",
        };
      }

      // Action-specific checks
      if (action === "video_edit") {
        const videoUsagePercent = (quota.videoMinutesUsed / quota.videoMinutesLimit) * 100;
        if (videoUsagePercent >= 100) {
          return {
            valid: false,
            reason: "You have reached your monthly video editing limit. Upgrade to continue.",
            requiresUpgrade: true,
          };
        }
      }

      if (action === "image_generate") {
        const imageUsagePercent = (quota.imageGenerationsUsed / quota.imageGenerationsLimit) * 100;
        if (imageUsagePercent >= 100) {
          return {
            valid: false,
            reason: "You have reached your monthly image generation limit. Upgrade to continue.",
            requiresUpgrade: true,
          };
        }
      }

      return {
        valid: true,
        reason: "Model selection valid",
        tier: quota.tier,
        modelName: accessCheck.modelName,
      };
    }),

  /**
   * Get tier upgrade options
   */
  getUpgradeOptions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const quota = await getUserQuota(userId);

    const currentTier = quota?.tier || "free";

    const tiers = {
      free: {
        name: "Free",
        price: 0,
        videoMinutes: 10,
        imageGenerations: 5,
        models: getFreeTierModels().length,
        features: ["4 Free AI Models", "10 min video/month", "5 images/month", "Community support"],
        canUpgrade: true,
        nextTier: "starter",
      },
      starter: {
        name: "Starter",
        price: 9.99,
        videoMinutes: 60,
        imageGenerations: 50,
        models: 10,
        features: ["All 10 AI Models", "60 min video/month", "50 images/month", "Email support"],
        canUpgrade: currentTier === "free",
        nextTier: "premium",
      },
      premium: {
        name: "Premium",
        price: 29.99,
        videoMinutes: 500,
        imageGenerations: 500,
        models: 10,
        features: ["All 10 AI Models", "500 min video/month", "500 images/month", "Priority support"],
        canUpgrade: currentTier === "free" || currentTier === "starter",
        nextTier: "enterprise",
      },
      enterprise: {
        name: "Enterprise",
        price: 99.99,
        videoMinutes: Infinity,
        imageGenerations: Infinity,
        models: 10,
        features: ["All 10 AI Models", "Unlimited usage", "Dedicated support", "Custom integrations"],
        canUpgrade: false,
        nextTier: null,
      },
    };

    return {
      currentTier,
      tiers,
      recommendations: {
        videoUsage: quota?.videoMinutesUsed || 0,
        imageUsage: quota?.imageGenerationsUsed || 0,
      },
    };
  }),
});

export type ModelEnforcementRouter = typeof modelEnforcementRouter;
