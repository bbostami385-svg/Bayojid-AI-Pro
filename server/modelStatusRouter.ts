/**
 * Model Status Router
 * Provides real-time API availability and status for all AI models
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export interface ModelStatus {
  modelId: string;
  name: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  responseTime: number; // ms
  uptime: number; // percentage
  lastChecked: Date;
  tier: "free" | "pro" | "premium" | "enterprise";
  isFree: boolean;
  costPerRequest: number; // credits
  rateLimit: number; // requests per minute
  maxTokens: number;
  supportedFeatures: string[];
  apiKey?: string;
  endpoint?: string;
}

// Model status cache
const modelStatusCache = new Map<string, ModelStatus>();

// Initialize model statuses
function initializeModelStatus() {
  const models: ModelStatus[] = [
    {
      modelId: "gemini-flash",
      name: "Gemini Flash",
      status: "online",
      responseTime: 250,
      uptime: 99.9,
      lastChecked: new Date(),
      tier: "free",
      isFree: true,
      costPerRequest: 1,
      rateLimit: 60,
      maxTokens: 32000,
      supportedFeatures: ["chat", "image-generation", "code-analysis"],
    },
    {
      modelId: "deepseek",
      name: "DeepSeek",
      status: "online",
      responseTime: 300,
      uptime: 99.8,
      lastChecked: new Date(),
      tier: "free",
      isFree: true,
      costPerRequest: 1,
      rateLimit: 50,
      maxTokens: 16000,
      supportedFeatures: ["chat", "code-analysis"],
    },
    {
      modelId: "qwen",
      name: "Qwen",
      status: "online",
      responseTime: 280,
      uptime: 99.7,
      lastChecked: new Date(),
      tier: "free",
      isFree: true,
      costPerRequest: 2,
      rateLimit: 40,
      maxTokens: 32000,
      supportedFeatures: ["chat", "code-analysis", "long-context"],
    },
    {
      modelId: "gpt-mini",
      name: "GPT Mini",
      status: "online",
      responseTime: 200,
      uptime: 99.95,
      lastChecked: new Date(),
      tier: "free",
      isFree: true,
      costPerRequest: 3,
      rateLimit: 30,
      maxTokens: 8000,
      supportedFeatures: ["chat", "limited-features"],
    },
    {
      modelId: "gpt-5",
      name: "GPT-5",
      status: "online",
      responseTime: 150,
      uptime: 99.99,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 10,
      rateLimit: 100,
      maxTokens: 128000,
      supportedFeatures: ["chat", "image-generation", "code-analysis", "advanced-reasoning"],
    },
    {
      modelId: "claude-mythos",
      name: "Claude Mythos",
      status: "online",
      responseTime: 180,
      uptime: 99.98,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 12,
      rateLimit: 80,
      maxTokens: 100000,
      supportedFeatures: ["chat", "code-analysis", "document-analysis"],
    },
    {
      modelId: "grok",
      name: "Grok",
      status: "online",
      responseTime: 220,
      uptime: 99.9,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 8,
      rateLimit: 60,
      maxTokens: 64000,
      supportedFeatures: ["chat", "real-time-info"],
    },
    {
      modelId: "gemini-3",
      name: "Gemini 3",
      status: "online",
      responseTime: 200,
      uptime: 99.95,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 9,
      rateLimit: 70,
      maxTokens: 100000,
      supportedFeatures: ["chat", "image-generation", "video-analysis"],
    },
    {
      modelId: "perplexity",
      name: "Perplexity",
      status: "online",
      responseTime: 300,
      uptime: 99.8,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 7,
      rateLimit: 50,
      maxTokens: 32000,
      supportedFeatures: ["chat", "web-search", "research"],
    },
    {
      modelId: "manus-ai",
      name: "Manus AI",
      status: "online",
      responseTime: 100,
      uptime: 99.99,
      lastChecked: new Date(),
      tier: "premium",
      isFree: false,
      costPerRequest: 5,
      rateLimit: 200,
      maxTokens: 256000,
      supportedFeatures: ["chat", "image-generation", "video-editing", "all-features"],
    },
  ];

  models.forEach((model) => {
    modelStatusCache.set(model.modelId, model);
  });
}

// Initialize on module load
initializeModelStatus();

/**
 * Check model API health
 */
async function checkModelHealth(modelId: string): Promise<ModelStatus | null> {
  const model = modelStatusCache.get(modelId);
  if (!model) return null;

  // Simulate API health check
  const startTime = Date.now();
  try {
    // In production, this would make actual API calls
    const responseTime = Math.random() * 500 + 50;
    const uptime = 99 + Math.random();

    return {
      ...model,
      responseTime: Math.round(responseTime),
      uptime: parseFloat(uptime.toFixed(2)),
      lastChecked: new Date(),
      status: responseTime > 1000 ? "degraded" : "online",
    };
  } catch (error) {
    return {
      ...model,
      status: "offline",
      lastChecked: new Date(),
    };
  }
}

export const modelStatusRouter = router({
  // Get all model statuses
  getAllModels: publicProcedure.query(async () => {
    const models = Array.from(modelStatusCache.values());
    return models.map((model) => ({
      ...model,
      apiKey: undefined, // Don't expose API keys
      endpoint: undefined,
    }));
  }),

  // Get specific model status
  getModelStatus: publicProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      const status = await checkModelHealth(input.modelId);
      if (!status) {
        throw new Error(`Model ${input.modelId} not found`);
      }
      return {
        ...status,
        apiKey: undefined,
        endpoint: undefined,
      };
    }),

  // Get free tier models
  getFreeModels: publicProcedure.query(async () => {
    const models = Array.from(modelStatusCache.values()).filter((m) => m.isFree);
    return models.map((model) => ({
      ...model,
      apiKey: undefined,
      endpoint: undefined,
    }));
  }),

  // Get premium models
  getPremiumModels: protectedProcedure.query(async ({ ctx }) => {
    const models = Array.from(modelStatusCache.values()).filter((m) => !m.isFree);
    return models.map((model) => ({
      ...model,
      apiKey: undefined,
      endpoint: undefined,
    }));
  }),

  // Get model by tier
  getModelsByTier: publicProcedure
    .input(z.object({ tier: z.enum(["free", "pro", "premium", "enterprise"]) }))
    .query(async ({ input }) => {
      const models = Array.from(modelStatusCache.values()).filter((m) => m.tier === input.tier);
      return models.map((model) => ({
        ...model,
        apiKey: undefined,
        endpoint: undefined,
      }));
    }),

  // Get model recommendations based on use case
  getRecommendedModels: publicProcedure
    .input(
      z.object({
        useCase: z.enum(["chat", "coding", "image-generation", "analysis", "research"]),
        tier: z.enum(["free", "pro", "premium", "enterprise"]).optional(),
      })
    )
    .query(async ({ input }) => {
      let models = Array.from(modelStatusCache.values());

      // Filter by tier if specified
      if (input.tier) {
        models = models.filter((m) => m.tier === input.tier);
      }

      // Filter by use case
      const useCaseFeatures: Record<string, string> = {
        chat: "chat",
        coding: "code-analysis",
        "image-generation": "image-generation",
        analysis: "document-analysis",
        research: "research",
      };

      const feature = useCaseFeatures[input.useCase];
      if (feature) {
        models = models.filter((m) => m.supportedFeatures.includes(feature));
      }

      // Sort by cost efficiency (lowest cost first)
      models.sort((a, b) => a.costPerRequest - b.costPerRequest);

      return models.slice(0, 5).map((model) => ({
        ...model,
        apiKey: undefined,
        endpoint: undefined,
      }));
    }),

  // Get model health report
  getHealthReport: publicProcedure.query(async () => {
    const models = Array.from(modelStatusCache.values());
    const onlineCount = models.filter((m) => m.status === "online").length;
    const averageUptime =
      models.reduce((sum, m) => sum + m.uptime, 0) / models.length;
    const averageResponseTime =
      models.reduce((sum, m) => sum + m.responseTime, 0) / models.length;

    return {
      totalModels: models.length,
      onlineModels: onlineCount,
      offlineModels: models.filter((m) => m.status === "offline").length,
      degradedModels: models.filter((m) => m.status === "degraded").length,
      averageUptime: parseFloat(averageUptime.toFixed(2)),
      averageResponseTime: Math.round(averageResponseTime),
      lastUpdated: new Date(),
    };
  }),
});
