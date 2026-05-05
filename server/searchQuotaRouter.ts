/**
 * tRPC Router for Search & Quota Management
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as searchQuotaDb from "./searchQuotaDbService";

export const searchQuotaRouter = router({
  // ===== SEARCH =====

  // Search user's conversations
  searchConversations: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const results = await searchQuotaDb.searchUserConversations(
          ctx.user.id,
          input.query,
          input.limit
        );
        return results;
      } catch (error) {
        console.error("Error searching conversations:", error);
        throw new Error("Failed to search conversations");
      }
    }),

  // Get trending topics
  getTrendingTopics: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      try {
        const topics = await searchQuotaDb.getTrendingTopics(input.limit);
        return topics;
      } catch (error) {
        console.error("Error fetching trending topics:", error);
        throw new Error("Failed to fetch trending topics");
      }
    }),

  // ===== QUOTAS =====

  // Get user's quota
  getMyQuota: protectedProcedure.query(async ({ ctx }) => {
    try {
      const quota = await searchQuotaDb.getUserQuota(ctx.user.id);
      return quota;
    } catch (error) {
      console.error("Error fetching quota:", error);
      throw new Error("Failed to fetch quota");
    }
  }),

  // Check if quota exceeded
  hasExceededQuota: protectedProcedure
    .input(z.object({ quotaType: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const exceeded = await searchQuotaDb.hasExceededQuota(ctx.user.id, input.quotaType);
        return { exceeded };
      } catch (error) {
        console.error("Error checking quota:", error);
        throw new Error("Failed to check quota");
      }
    }),

  // Increment quota usage
  incrementQuotaUsage: protectedProcedure
    .input(
      z.object({
        quotaType: z.string(),
        amount: z.number().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await searchQuotaDb.incrementQuotaUsage(
          ctx.user.id,
          input.quotaType,
          input.amount
        );
        return result;
      } catch (error) {
        console.error("Error incrementing quota:", error);
        throw new Error("Failed to increment quota");
      }
    }),

  // ===== USER PREFERENCES =====

  // Get user preferences
  getMyPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const preferences = await searchQuotaDb.getUserPreferences(ctx.user.id);
      return preferences || { userId: ctx.user.id, theme: "auto", language: "en" };
    } catch (error) {
      console.error("Error fetching preferences:", error);
      throw new Error("Failed to fetch preferences");
    }
  }),

  // Save user preferences
  savePreferences: protectedProcedure
    .input(
      z.object({
        theme: z.enum(["light", "dark", "auto"]).optional(),
        language: z.string().optional(),
        fontSize: z.string().optional(),
        borderRadius: z.string().optional(),
        notifications: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await searchQuotaDb.saveUserPreferences({
          userId: ctx.user.id,
          theme: input.theme || "auto",
          language: input.language || "en",
          fontSize: input.fontSize || "medium",
          borderRadius: input.borderRadius || "medium",
          notifications: input.notifications ?? true,
          emailNotifications: input.emailNotifications ?? true,
        });
        return result;
      } catch (error) {
        console.error("Error saving preferences:", error);
        throw new Error("Failed to save preferences");
      }
    }),
});
