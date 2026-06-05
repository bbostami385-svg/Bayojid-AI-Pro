/**
 * Model Selection Router
 * Handles AI model selection, configuration, and routing
 */

import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

// Model configuration schema
const ModelConfigSchema = z.object({
  modelId: z.string(),
  name: z.string(),
  provider: z.string(),
  apiKey: z.string().optional(),
  isActive: z.boolean(),
  priority: z.number(),
  fallbackModels: z.array(z.string()),
  rateLimits: z.object({
    requestsPerMinute: z.number(),
    tokensPerDay: z.number(),
  }),
});

type ModelConfig = z.infer<typeof ModelConfigSchema>;

// Mock database for model configurations
const modelConfigs: Map<string, ModelConfig> = new Map([
  [
    "gpt-4",
    {
      modelId: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      isActive: true,
      priority: 1,
      fallbackModels: ["gpt-3.5-turbo", "claude-3-opus"],
      rateLimits: {
        requestsPerMinute: 100,
        tokensPerDay: 1000000,
      },
    },
  ],
  [
    "grok",
    {
      modelId: "grok",
      name: "Grok",
      provider: "xAI",
      isActive: true,
      priority: 2,
      fallbackModels: ["gpt-4", "claude-3-opus"],
      rateLimits: {
        requestsPerMinute: 80,
        tokensPerDay: 800000,
      },
    },
  ],
  [
    "claude-mythos",
    {
      modelId: "claude-mythos",
      name: "Claude Mythos",
      provider: "Anthropic",
      isActive: true,
      priority: 3,
      fallbackModels: ["gpt-4", "grok"],
      rateLimits: {
        requestsPerMinute: 90,
        tokensPerDay: 900000,
      },
    },
  ],
  [
    "perplexity",
    {
      modelId: "perplexity",
      name: "Perplexity",
      provider: "Perplexity AI",
      isActive: true,
      priority: 4,
      fallbackModels: ["gpt-4", "claude-3-opus"],
      rateLimits: {
        requestsPerMinute: 120,
        tokensPerDay: 1200000,
      },
    },
  ],
  [
    "gemini",
    {
      modelId: "gemini",
      name: "Gemini",
      provider: "Google",
      isActive: true,
      priority: 5,
      fallbackModels: ["gpt-4", "grok"],
      rateLimits: {
        requestsPerMinute: 110,
        tokensPerDay: 1100000,
      },
    },
  ],
  [
    "manus-ai",
    {
      modelId: "manus-ai",
      name: "Manus AI",
      provider: "Manus",
      isActive: true,
      priority: 0,
      fallbackModels: ["gpt-4", "claude-3-opus"],
      rateLimits: {
        requestsPerMinute: 200,
        tokensPerDay: 2000000,
      },
    },
  ],
]);

// User model preferences
const userModelPreferences: Map<string, string> = new Map();

export const modelSelectionRouter = router({
  // Get all available models
  getAllModels: publicProcedure.query(async () => {
    return Array.from(modelConfigs.values());
  }),

  // Get model configuration
  getModelConfig: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const config = modelConfigs.get(input.modelId);
      if (!config) {
        throw new Error(`Model ${input.modelId} not found`);
      }
      return config;
    }),

  // Get user's selected model
  getUserSelectedModel: protectedProcedure.query(async ({ ctx }) => {
    const selectedModelId = userModelPreferences.get(ctx.user.id) || "manus-ai";
    const config = modelConfigs.get(selectedModelId);
    return {
      userId: ctx.user.id,
      selectedModelId,
      config,
    };
  }),

  // Set user's selected model
  setUserSelectedModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = modelConfigs.get(input.modelId);
      if (!config) {
        throw new Error(`Model ${input.modelId} not found`);
      }

      userModelPreferences.set(ctx.user.id, input.modelId);

      return {
        success: true,
        userId: ctx.user.id,
        selectedModelId: input.modelId,
        message: `Successfully switched to ${config.name}`,
      };
    }),

  // Get model status and availability
  getModelStatus: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const config = modelConfigs.get(input.modelId);
      if (!config) {
        throw new Error(`Model ${input.modelId} not found`);
      }

      return {
        modelId: input.modelId,
        name: config.name,
        provider: config.provider,
        isActive: config.isActive,
        uptime: 99.9,
        responseTime: Math.random() * 2000 + 500, // ms
        successRate: 95 + Math.random() * 5,
        requestsProcessed: Math.floor(Math.random() * 100000),
        lastChecked: new Date(),
      };
    }),

  // Get fallback models for a model
  getFallbackModels: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const config = modelConfigs.get(input.modelId);
      if (!config) {
        throw new Error(`Model ${input.modelId} not found`);
      }

      return {
        primaryModel: input.modelId,
        fallbackModels: config.fallbackModels.map((id) => {
          const fallbackConfig = modelConfigs.get(id);
          return {
            modelId: id,
            name: fallbackConfig?.name || "Unknown",
            priority: config.fallbackModels.indexOf(id) + 1,
          };
        }),
      };
    }),

  // Route request to best available model
  routeToOptimalModel: protectedProcedure
    .input(
      z.object({
        requestType: z.enum(["fast", "accurate", "balanced"]),
        userPreferredModel: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let selectedModelId = input.userPreferredModel || userModelPreferences.get(ctx.user.id) || "manus-ai";

      // Check if selected model is available
      const selectedConfig = modelConfigs.get(selectedModelId);
      if (!selectedConfig || !selectedConfig.isActive) {
        // Use fallback model
        const fallbackId = selectedConfig?.fallbackModels[0] || "manus-ai";
        selectedModelId = fallbackId;
      }

      const config = modelConfigs.get(selectedModelId);

      return {
        selectedModelId,
        config,
        reason: "User preference",
        timestamp: new Date(),
      };
    }),

  // Update model configuration
  updateModelConfig: protectedProcedure
    .input(
      z.object({
        modelId: z.string(),
        updates: z.object({
          isActive: z.boolean().optional(),
          priority: z.number().optional(),
          rateLimits: z
            .object({
              requestsPerMinute: z.number().optional(),
              tokensPerDay: z.number().optional(),
            })
            .optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = modelConfigs.get(input.modelId);
      if (!config) {
        throw new Error(`Model ${input.modelId} not found`);
      }

      const updatedConfig = {
        ...config,
        ...input.updates,
        rateLimits: {
          ...config.rateLimits,
          ...input.updates.rateLimits,
        },
      };

      modelConfigs.set(input.modelId, updatedConfig);

      return {
        success: true,
        modelId: input.modelId,
        updatedConfig,
      };
    }),

  // Get model usage statistics
  getModelUsageStats: protectedProcedure
    .input(z.object({ modelId: z.string(), days: z.number().optional() }))
    .query(async ({ input }) => {
      const days = input.days || 7;
      const stats = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        stats.push({
          date: date.toISOString().split("T")[0],
          requests: Math.floor(Math.random() * 10000),
          tokens: Math.floor(Math.random() * 100000),
          avgLatency: Math.random() * 2000 + 500,
          successRate: 95 + Math.random() * 5,
          errors: Math.floor(Math.random() * 100),
        });
      }

      return {
        modelId: input.modelId,
        period: `${days} days`,
        stats,
        totalRequests: stats.reduce((sum, s) => sum + s.requests, 0),
        totalTokens: stats.reduce((sum, s) => sum + s.tokens, 0),
        avgSuccessRate: (stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length).toFixed(2),
      };
    }),

  // Compare models
  compareModels: publicProcedure
    .input(z.object({ modelIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const comparison = input.modelIds.map((id) => {
        const config = modelConfigs.get(id);
        return {
          modelId: id,
          name: config?.name || "Unknown",
          provider: config?.provider || "Unknown",
          priority: config?.priority || 999,
          isActive: config?.isActive || false,
          rateLimits: config?.rateLimits || { requestsPerMinute: 0, tokensPerDay: 0 },
        };
      });

      return {
        models: comparison,
        bestForSpeed: comparison.sort((a, b) => a.priority - b.priority)[0],
        bestForCapacity: comparison.sort((a, b) => b.rateLimits.tokensPerDay - a.rateLimits.tokensPerDay)[0],
      };
    }),

  // Get model recommendations
  getModelRecommendations: protectedProcedure
    .input(
      z.object({
        useCase: z.enum(["writing", "coding", "analysis", "creative", "research"]),
      })
    )
    .query(async ({ input }) => {
      const recommendations: Record<string, string[]> = {
        writing: ["claude-mythos", "gpt-4", "perplexity"],
        coding: ["gpt-4", "claude-mythos", "manus-ai"],
        analysis: ["gpt-4", "claude-mythos", "perplexity"],
        creative: ["gpt-4", "claude-mythos", "grok"],
        research: ["perplexity", "gpt-4", "claude-mythos"],
      };

      const recommendedIds = recommendations[input.useCase] || ["manus-ai"];
      const recommendedModels = recommendedIds
        .map((id) => modelConfigs.get(id))
        .filter((config) => config !== undefined) as ModelConfig[];

      return {
        useCase: input.useCase,
        recommendations: recommendedModels,
        topRecommendation: recommendedModels[0],
      };
    }),
});

export default modelSelectionRouter;
