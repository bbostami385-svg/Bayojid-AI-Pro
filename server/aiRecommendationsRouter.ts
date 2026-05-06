/**
 * tRPC Router for AI Recommendations
 * Exposes AI-powered optimization recommendations via tRPC
 */

import { router, protectedProcedure } from './trpc';
import { getAIRecommendationService } from './aiRecommendations';
import { z } from 'zod';

export const aiRecommendationsRouter = router({
  // Generate recommendations (admin only)
  generateRecommendations: protectedProcedure
    .input(
      z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        avgEngagement: z.number(),
        churnRate: z.number(),
        topActivities: z.array(z.object({ name: z.string(), count: z.number() })),
        userSegments: z.array(z.object({ name: z.string(), size: z.number(), engagement: z.number() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      const recommendations = await service.generateRecommendations({
        totalUsers: input.totalUsers,
        activeUsers: input.activeUsers,
        avgEngagement: input.avgEngagement,
        churnRate: input.churnRate,
        topActivities: input.topActivities,
        userSegments: input.userSegments,
        reportMetrics: {},
      });

      return recommendations;
    }),

  // Get all recommendations (admin only)
  getAllRecommendations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const service = getAIRecommendationService();
    return service.getAllRecommendations();
  }),

  // Get pending recommendations (admin only)
  getPendingRecommendations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const service = getAIRecommendationService();
    return service.getPendingRecommendations();
  }),

  // Get high-priority recommendations (admin only)
  getHighPriorityRecommendations: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const service = getAIRecommendationService();
    return service.getHighPriorityRecommendations();
  }),

  // Get report scheduling suggestions (admin only)
  getReportSchedulingSuggestions: protectedProcedure
    .input(
      z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        avgEngagement: z.number(),
        churnRate: z.number(),
        topActivities: z.array(z.object({ name: z.string(), count: z.number() })),
        userSegments: z.array(z.object({ name: z.string(), size: z.number(), engagement: z.number() })),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      const suggestions = await service.getReportSchedulingSuggestions({
        totalUsers: input.totalUsers,
        activeUsers: input.activeUsers,
        avgEngagement: input.avgEngagement,
        churnRate: input.churnRate,
        topActivities: input.topActivities,
        userSegments: input.userSegments,
        reportMetrics: {},
      });

      return { suggestions };
    }),

  // Get segment optimization suggestions (admin only)
  getSegmentOptimizationSuggestions: protectedProcedure
    .input(
      z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        avgEngagement: z.number(),
        churnRate: z.number(),
        topActivities: z.array(z.object({ name: z.string(), count: z.number() })),
        userSegments: z.array(z.object({ name: z.string(), size: z.number(), engagement: z.number() })),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      const suggestions = await service.getSegmentOptimizationSuggestions({
        totalUsers: input.totalUsers,
        activeUsers: input.activeUsers,
        avgEngagement: input.avgEngagement,
        churnRate: input.churnRate,
        topActivities: input.topActivities,
        userSegments: input.userSegments,
        reportMetrics: {},
      });

      return { suggestions };
    }),

  // Get engagement optimization suggestions (admin only)
  getEngagementOptimizationSuggestions: protectedProcedure
    .input(
      z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        avgEngagement: z.number(),
        churnRate: z.number(),
        topActivities: z.array(z.object({ name: z.string(), count: z.number() })),
        userSegments: z.array(z.object({ name: z.string(), size: z.number(), engagement: z.number() })),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      const suggestions = await service.getEngagementOptimizationSuggestions({
        totalUsers: input.totalUsers,
        activeUsers: input.activeUsers,
        avgEngagement: input.avgEngagement,
        churnRate: input.churnRate,
        topActivities: input.topActivities,
        userSegments: input.userSegments,
        reportMetrics: {},
      });

      return { suggestions };
    }),

  // Get quota optimization suggestions (admin only)
  getQuotaOptimizationSuggestions: protectedProcedure
    .input(
      z.object({
        totalUsers: z.number(),
        activeUsers: z.number(),
        avgEngagement: z.number(),
        churnRate: z.number(),
        topActivities: z.array(z.object({ name: z.string(), count: z.number() })),
        userSegments: z.array(z.object({ name: z.string(), size: z.number(), engagement: z.number() })),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      const suggestions = await service.getQuotaOptimizationSuggestions({
        totalUsers: input.totalUsers,
        activeUsers: input.activeUsers,
        avgEngagement: input.avgEngagement,
        churnRate: input.churnRate,
        topActivities: input.topActivities,
        userSegments: input.userSegments,
        reportMetrics: {},
      });

      return { suggestions };
    }),

  // Mark recommendation as implemented (admin only)
  markAsImplemented: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const service = getAIRecommendationService();
      service.markAsImplemented(input.recommendationId);
      return { success: true };
    }),

  // Get analysis history (admin only)
  getAnalysisHistory: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const service = getAIRecommendationService();
    return service.getAnalysisHistory();
  }),
});
