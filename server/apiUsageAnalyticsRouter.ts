/**
 * tRPC Router for API Usage Analytics
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as analyticsService from "./apiUsageAnalytics";

export const apiUsageAnalyticsRouter = router({
  // Record API usage
  recordUsage: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        latency: z.number(),
        success: z.boolean(),
        bytes: z.number().optional(),
        cost: z.number().optional(),
        error: z.boolean().optional(),
        timeout: z.boolean().optional(),
        throttled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const metric = analyticsService.recordAPIUsage(
        input.endpoint,
        input.latency,
        input.success,
        {
          bytes: input.bytes,
          cost: input.cost,
          error: input.error,
          timeout: input.timeout,
          throttled: input.throttled,
        }
      );
      return metric;
    }),

  // Get API trend analysis
  getTrendAnalysis: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        from: z.date(),
        to: z.date(),
        granularity: z.enum(["minute", "hour", "day", "week", "month"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const analysis = analyticsService.getAPITrendAnalysis(
        input.endpoint,
        { from: input.from, to: input.to },
        input.granularity || "day"
      );
      return analysis;
    }),

  // Compare endpoints
  compareEndpoints: protectedProcedure
    .input(
      z.object({
        endpoints: z.array(z.string()),
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ input }) => {
      const comparison = analyticsService.compareEndpoints(input.endpoints, {
        from: input.from,
        to: input.to,
      });
      return comparison;
    }),

  // Get cost analysis
  getCostAnalysis: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
      })
    )
    .query(async ({ input }) => {
      const analysis = analyticsService.getCostAnalysis({
        from: input.from,
        to: input.to,
      });
      return analysis;
    }),

  // Get endpoint statistics
  getEndpointStats: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .query(async ({ input }) => {
      const stats = analyticsService.getEndpointStats(input.endpoint);
      return stats;
    }),

  // Get all endpoints
  getAllEndpoints: protectedProcedure.query(async () => {
    const endpoints = analyticsService.getAllEndpoints();
    return endpoints;
  }),

  // Get usage by time range
  getUsageByTimeRange: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        granularity: z.enum(["minute", "hour", "day", "week", "month"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const usage = analyticsService.getUsageByTimeRange(
        { from: input.from, to: input.to },
        input.granularity || "day"
      );
      return usage;
    }),

  // Cleanup old metrics
  cleanupOldMetrics: protectedProcedure
    .input(z.object({ daysOld: z.number().default(90) }))
    .mutation(async ({ input }) => {
      const cleaned = analyticsService.cleanupOldMetrics(input.daysOld);
      return { cleaned };
    }),
});
