/**
 * tRPC Router for Webhook Notification Delivery
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as notificationService from "./webhookNotificationDelivery";

export const notificationDeliveryRouter = router({
  // Create notification
  createNotification: protectedProcedure
    .input(
      z.object({
        channels: z.array(z.enum(["email", "push", "sms", "webhook"])),
        recipient: z.string(),
        subject: z.string(),
        message: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = notificationService.createNotification(
        ctx.user.id,
        input.channels,
        input.recipient,
        input.subject,
        input.message,
        input.metadata
      );
      return notification;
    }),

  // Get delivery status
  getDeliveryStatus: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .query(async ({ input }) => {
      const status = notificationService.getDeliveryStatus(input.notificationId);
      return status;
    }),

  // Get user delivery queue
  getUserDeliveryQueue: protectedProcedure.query(async ({ ctx }) => {
    const queue = notificationService.getUserDeliveryQueue(ctx.user.id);
    return queue;
  }),

  // Get delivery statistics
  getDeliveryStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = notificationService.getDeliveryStatistics(ctx.user.id);
    return stats;
  }),

  // Retry failed delivery
  retryDelivery: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }) => {
      const result = notificationService.retryFailedDelivery(input.notificationId);
      return result;
    }),

  // Get delivery history
  getDeliveryHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = notificationService.getDeliveryHistory(ctx.user.id, input.limit, input.offset);
      return history;
    }),

  // Bulk create notifications
  bulkCreateNotifications: protectedProcedure
    .input(
      z.object({
        notifications: z.array(
          z.object({
            channels: z.array(z.enum(["email", "push", "sms", "webhook"])),
            recipient: z.string(),
            subject: z.string(),
            message: z.string(),
            metadata: z.record(z.unknown()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = input.notifications.map((notif) =>
        notificationService.createNotification(
          ctx.user.id,
          notif.channels,
          notif.recipient,
          notif.subject,
          notif.message,
          notif.metadata
        )
      );
      return { created: results.length, notifications: results };
    }),
});
