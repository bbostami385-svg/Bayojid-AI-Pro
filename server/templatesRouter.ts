/**
 * tRPC Router for Prompt Templates & Conversation Sharing
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as templatesDb from "./templatesDbService";

export const templatesRouter = router({
  // ===== PROMPT TEMPLATES =====

  // Create prompt template
  createTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        category: z.string().default("general"),
        template: z.string(),
        variables: z.array(z.string()).default([]),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await templatesDb.savePromptTemplate({
          userId: ctx.user.id,
          ...input,
          rating: 0,
        });
        return result;
      } catch (error) {
        console.error("Error creating template:", error);
        throw new Error("Failed to create template");
      }
    }),

  // Get user's templates
  getMyTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const templates = await templatesDb.getUserTemplates(ctx.user.id);
      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw new Error("Failed to fetch templates");
    }
  }),

  // Get public templates
  getPublicTemplates: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const templates = await templatesDb.getPublicTemplates(input.limit);
        return templates;
      } catch (error) {
        console.error("Error fetching public templates:", error);
        throw new Error("Failed to fetch public templates");
      }
    }),

  // Delete template
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await templatesDb.deletePromptTemplate(input.templateId);
        return result;
      } catch (error) {
        console.error("Error deleting template:", error);
        throw new Error("Failed to delete template");
      }
    }),

  // Increment template usage
  useTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await templatesDb.incrementTemplateUsage(input.templateId);
        return result;
      } catch (error) {
        console.error("Error incrementing template usage:", error);
        throw new Error("Failed to increment usage");
      }
    }),

  // ===== CONVERSATION SHARING =====

  // Create conversation share
  shareConversation: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        conversationId: z.number(),
        sharedWithUserId: z.number().optional(),
        permission: z.enum(["view", "comment", "edit", "admin"]).default("view"),
        expiresAt: z.date().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await templatesDb.saveConversationShare({
          shareId: input.shareId,
          conversationId: input.conversationId,
          ownerId: ctx.user.id,
          sharedWithUserId: input.sharedWithUserId,
          permission: input.permission,
          expiresAt: input.expiresAt,
          isPublic: input.isPublic,
        });
        return result;
      } catch (error) {
        console.error("Error sharing conversation:", error);
        throw new Error("Failed to share conversation");
      }
    }),

  // Get conversation shares
  getConversationShares: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      try {
        const shares = await templatesDb.getConversationShares(input.conversationId);
        return shares;
      } catch (error) {
        console.error("Error fetching shares:", error);
        throw new Error("Failed to fetch shares");
      }
    }),

  // Get shares shared with me
  getSharedWithMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      const shares = await templatesDb.getSharedWithUser(ctx.user.id);
      return shares;
    } catch (error) {
      console.error("Error fetching shared conversations:", error);
      throw new Error("Failed to fetch shared conversations");
    }
  }),

  // Get public shares
  getPublicShares: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      try {
        const shares = await templatesDb.getPublicShares(input.limit);
        return shares;
      } catch (error) {
        console.error("Error fetching public shares:", error);
        throw new Error("Failed to fetch public shares");
      }
    }),

  // Delete share
  deleteShare: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await templatesDb.deleteConversationShare(input.shareId);
        return result;
      } catch (error) {
        console.error("Error deleting share:", error);
        throw new Error("Failed to delete share");
      }
    }),

  // Check if share is expired
  isShareExpired: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input }) => {
      try {
        const expired = await templatesDb.isShareExpired(input.shareId);
        return { expired };
      } catch (error) {
        console.error("Error checking share expiration:", error);
        throw new Error("Failed to check share expiration");
      }
    }),
});
