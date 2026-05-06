/**
 * tRPC Router for User Segmentation
 * Exposes user segmentation functionality via tRPC endpoints
 */

import { router, publicProcedure, protectedProcedure } from './trpc';
import { userSegmentationService } from './userSegmentation';
import { z } from 'zod';

export const segmentationRouter = router({
  // Get all segments
  getAllSegments: publicProcedure.query(async () => {
    return userSegmentationService.getAllSegments();
  }),

  // Get specific segment
  getSegment: publicProcedure
    .input(z.object({ segmentId: z.string() }))
    .query(async ({ input }) => {
      return userSegmentationService.getSegment(input.segmentId);
    }),

  // Get user segments
  getUserSegments: protectedProcedure.query(async ({ ctx }) => {
    return userSegmentationService.getUserSegments(ctx.user.id);
  }),

  // Get segment users (admin only)
  getSegmentUsers: protectedProcedure
    .input(z.object({ segmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.getSegmentUsers(input.segmentId);
    }),

  // Create custom segment (admin only)
  createSegment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        criteria: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.createCustomSegment(input.name, input.description, input.criteria);
    }),

  // Update segment (admin only)
  updateSegment: protectedProcedure
    .input(
      z.object({
        segmentId: z.string(),
        updates: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.updateSegment(input.segmentId, input.updates);
    }),

  // Delete segment (admin only)
  deleteSegment: protectedProcedure
    .input(z.object({ segmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.deleteSegment(input.segmentId);
    }),

  // Get segment statistics
  getSegmentStats: protectedProcedure
    .input(z.object({ segmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.getSegmentStats(input.segmentId);
    }),

  // Compare segments
  compareSegments: protectedProcedure
    .input(z.object({ segmentIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return userSegmentationService.getSegmentComparison(input.segmentIds);
    }),

  // Bulk assign users to segment (admin only)
  bulkAssignUsers: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.number()),
        segmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const count = userSegmentationService.bulkAssignUsers(input.userIds, input.segmentId);
      return { assigned: count };
    }),
});
