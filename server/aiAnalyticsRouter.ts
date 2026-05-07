/**
 * tRPC Router for AI Model Analytics
 * Provides endpoints for tracking and analyzing AI model usage
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './routers';
import { aiModelUsageTracker } from './aiModelUsageTracker';

export const aiAnalyticsRouter = router({
  /**
   * Record a model usage
   */
  recordUsage: protectedProcedure
    .input(
      z.object({
        model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']),
        prompt: z.string(),
        response: z.string(),
        tokensUsed: z.number(),
        responseTime: z.number(),
        success: z.boolean().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const record = aiModelUsageTracker.recordUsage({
        userId: ctx.user.id,
        model: input.model,
        prompt: input.prompt,
        response: input.response,
        tokensUsed: input.tokensUsed,
        responseTime: input.responseTime,
        timestamp: new Date(),
        success: input.success ?? true,
        errorMessage: input.errorMessage,
      });

      return record;
    }),

  /**
   * Get model statistics
   */
  getModelStats: publicProcedure
    .input(z.object({ model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']).optional() }))
    .query(({ input }) => {
      if (input.model) {
        return aiModelUsageTracker.getModelStats(input.model);
      }
      return aiModelUsageTracker.getAllModelStats();
    }),

  /**
   * Get user's model preferences
   */
  getUserPreferences: protectedProcedure.query(({ ctx }) => {
    return aiModelUsageTracker.getUserPreferences(ctx.user.id);
  }),

  /**
   * Get user's favorite model
   */
  getUserFavoriteModel: protectedProcedure.query(({ ctx }) => {
    return aiModelUsageTracker.getUserFavoriteModel(ctx.user.id);
  }),

  /**
   * Get total cost by model
   */
  getTotalCostByModel: publicProcedure.query(() => {
    return aiModelUsageTracker.getTotalCostByModel();
  }),

  /**
   * Get usage trend for a model
   */
  getUsageTrend: publicProcedure
    .input(
      z.object({
        model: z.enum(['chatgpt', 'gemini', 'claude', 'perplexity', 'grok']),
        days: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return aiModelUsageTracker.getUsageTrend(input.model, input.days);
    }),

  /**
   * Get most used models
   */
  getMostUsedModels: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      return aiModelUsageTracker.getMostUsedModels(input.limit);
    }),

  /**
   * Get most expensive models
   */
  getMostExpensiveModels: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      return aiModelUsageTracker.getMostExpensiveModels(input.limit);
    }),

  /**
   * Get fastest models
   */
  getFastestModels: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      return aiModelUsageTracker.getFastestModels(input.limit);
    }),

  /**
   * Get most reliable models
   */
  getMostReliableModels: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      return aiModelUsageTracker.getMostReliableModels(input.limit);
    }),

  /**
   * Get usage summary
   */
  getUsageSummary: publicProcedure.query(() => {
    return aiModelUsageTracker.getUsageSummary();
  }),

  /**
   * Export usage data
   */
  exportUsageData: protectedProcedure.query(({ ctx }) => {
    // Only admins can export
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can export usage data');
    }
    return aiModelUsageTracker.exportUsageData();
  }),

  /**
   * Get model performance comparison
   */
  getPerformanceComparison: publicProcedure.query(() => {
    const stats = aiModelUsageTracker.getAllModelStats();

    return stats.map((stat) => ({
      model: stat.model,
      requests: stat.totalRequests,
      tokens: stat.totalTokens,
      cost: stat.totalCost,
      avgResponseTime: Math.round(stat.averageResponseTime),
      successRate: Math.round(stat.successRate * 100) / 100,
      costPerRequest: stat.totalRequests > 0 ? stat.totalCost / stat.totalRequests : 0,
      tokensPerRequest: stat.totalRequests > 0 ? stat.totalTokens / stat.totalRequests : 0,
    }));
  }),

  /**
   * Get cost analysis
   */
  getCostAnalysis: publicProcedure.query(() => {
    const costs = aiModelUsageTracker.getTotalCostByModel();
    const stats = aiModelUsageTracker.getAllModelStats();

    const analysis = Object.entries(costs).map(([model, totalCost]) => {
      const stat = stats.find((s) => s.model === model);
      return {
        model,
        totalCost,
        totalRequests: stat?.totalRequests || 0,
        costPerRequest: stat?.totalRequests ? totalCost / stat.totalRequests : 0,
        percentageOfTotal:
          Object.values(costs).reduce((a, b) => a + b, 0) > 0
            ? (totalCost / Object.values(costs).reduce((a, b) => a + b, 0)) * 100
            : 0,
      };
    });

    return {
      breakdown: analysis,
      totalCost: Object.values(costs).reduce((a, b) => a + b, 0),
      mostExpensive: analysis.sort((a, b) => b.totalCost - a.totalCost)[0],
      mostCostEfficient: analysis.sort((a, b) => a.costPerRequest - b.costPerRequest)[0],
    };
  }),

  /**
   * Get daily statistics
   */
  getDailyStats: publicProcedure
    .input(z.object({ days: z.number().optional() }))
    .query(({ input }) => {
      const days = input.days || 7;
      const stats = aiModelUsageTracker.getAllModelStats();

      const dailyData: Record<string, any> = {};

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        dailyData[dateStr] = {
          date: dateStr,
          totalRequests: 0,
          totalTokens: 0,
          totalCost: 0,
          models: {},
        };

        stats.forEach((stat) => {
          const trend = aiModelUsageTracker.getUsageTrend(stat.model as any, days);
          if (trend[dateStr]) {
            dailyData[dateStr].totalRequests += trend[dateStr];
            dailyData[dateStr].models[stat.model] = trend[dateStr];
          }
        });
      }

      return Object.values(dailyData);
    }),

  /**
   * Get model recommendations
   */
  getRecommendations: publicProcedure.query(() => {
    const fastest = aiModelUsageTracker.getFastestModels(1)[0];
    const mostReliable = aiModelUsageTracker.getMostReliableModels(1)[0];
    const mostUsed = aiModelUsageTracker.getMostUsedModels(1)[0];

    return {
      fastestModel: fastest?.model,
      mostReliableModel: mostReliable?.model,
      mostPopularModel: mostUsed?.model,
      recommendations: [
        {
          title: 'Use for speed',
          model: fastest?.model,
          reason: `Fastest average response time: ${Math.round(fastest?.averageResponseTime || 0)}ms`,
        },
        {
          title: 'Use for reliability',
          model: mostReliable?.model,
          reason: `Highest success rate: ${Math.round(mostReliable?.successRate || 0)}%`,
        },
        {
          title: 'Most popular choice',
          model: mostUsed?.model,
          reason: `${mostUsed?.totalRequests || 0} total requests`,
        },
      ],
    };
  }),
});
