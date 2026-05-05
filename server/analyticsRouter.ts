/**
 * tRPC Router for User Analytics
 * Exposes analytics database services via /api/trpc
 */

import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as analyticsDb from "./analyticsDbService";

export const analyticsRouter = router({
  // Get current user's analytics
  getMyAnalytics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const analytics = await analyticsDb.getUserAnalytics(ctx.user.id);
      return analytics || { userId: ctx.user.id, totalSessions: 0, totalMessages: 0 };
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw new Error("Failed to fetch analytics");
    }
  }),

  // Update engagement score
  updateEngagementScore: protectedProcedure
    .input(z.object({ score: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await analyticsDb.updateEngagementScore(ctx.user.id, input.score);
        return result;
      } catch (error) {
        console.error("Error updating engagement score:", error);
        throw new Error("Failed to update engagement score");
      }
    }),

  // Get all analytics (admin only)
  getAllAnalytics: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const analytics = await analyticsDb.getAllAnalytics(input.limit, input.offset);
        return analytics;
      } catch (error) {
        console.error("Error fetching all analytics:", error);
        throw new Error("Failed to fetch analytics");
      }
    }),

  // Get churn risk users (admin only)
  getChurnRiskUsers: adminProcedure.query(async () => {
    try {
      const users = await analyticsDb.getChurnRiskUsers();
      return users;
    } catch (error) {
      console.error("Error fetching churn risk users:", error);
      throw new Error("Failed to fetch churn risk users");
    }
  }),

  // Get analytics statistics (admin only)
  getStatistics: adminProcedure.query(async () => {
    try {
      const stats = await analyticsDb.getAnalyticsStatistics();
      return stats;
    } catch (error) {
      console.error("Error calculating statistics:", error);
      throw new Error("Failed to calculate statistics");
    }
  }),
});
