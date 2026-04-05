/**
 * tRPC Router for User Activity Audit Log
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as auditService from "./userActivityAuditLog";

export const auditLogRouter = router({
  // Log audit entry
  logEntry: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        resourceType: z.string(),
        resourceId: z.string(),
        resourceName: z.string().optional(),
        status: z.enum(["success", "failure", "partial", "pending"]).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        details: z.record(z.unknown()).optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        duration: z.number().optional(),
        errorMessage: z.string().optional(),
        changedFields: z.record(z.object({ before: z.unknown(), after: z.unknown() })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = auditService.logAuditEntry(
        ctx.user.id,
        input.action as any,
        {
          type: input.resourceType,
          id: input.resourceId,
          name: input.resourceName,
        },
        {
          status: input.status,
          severity: input.severity,
          details: input.details,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          duration: input.duration,
          errorMessage: input.errorMessage,
          changedFields: input.changedFields,
        }
      );
      return entry;
    }),

  // Get audit logs with filtering
  getLogs: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        status: z.enum(["success", "failure", "partial", "pending"]).optional(),
        severity: z.enum(["info", "warning", "critical"]).optional(),
        resourceType: z.string().optional(),
        from: z.date().optional(),
        to: z.date().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const logs = auditService.getAuditLogs({
        userId: input.userId,
        action: input.action as any,
        status: input.status,
        severity: input.severity,
        resourceType: input.resourceType,
        dateRange: input.from && input.to ? { from: input.from, to: input.to } : undefined,
        limit: input.limit,
        offset: input.offset,
      });
      return logs;
    }),

  // Get user activity summary
  getUserActivitySummary: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const summary = auditService.getUserActivitySummary(input.userId);
      return summary;
    }),

  // Get audit statistics
  getStatistics: protectedProcedure
    .input(
      z.object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const stats = auditService.getAuditStatistics(
        input.from && input.to ? { from: input.from, to: input.to } : undefined
      );
      return stats;
    }),

  // Get resource audit trail
  getResourceAuditTrail: protectedProcedure
    .input(
      z.object({
        resourceType: z.string(),
        resourceId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const trail = auditService.getResourceAuditTrail(
        input.resourceType,
        input.resourceId,
        input.limit
      );
      return trail;
    }),

  // Detect suspicious activity
  detectSuspiciousActivity: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const result = auditService.detectSuspiciousActivity(input.userId);
      return result;
    }),

  // Export audit logs
  exportLogs: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        format: z.enum(["csv", "json"]).default("csv"),
      })
    )
    .query(async ({ input }) => {
      const exported = auditService.exportAuditLogs(
        { userId: input.userId },
        input.format
      );
      return { data: exported, format: input.format };
    }),

  // Get action statistics
  getActionStatistics: protectedProcedure.query(async () => {
    const stats = auditService.getActionStatistics();
    return stats;
  }),

  // Compare user activity
  compareUserActivity: protectedProcedure
    .input(z.object({ userIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      const comparison = auditService.compareUserActivity(input.userIds);
      return comparison;
    }),

  // Cleanup old audit logs
  cleanupOldLogs: protectedProcedure
    .input(z.object({ daysOld: z.number().default(365) }))
    .mutation(async ({ input }) => {
      const cleaned = auditService.cleanupOldAuditLogs(input.daysOld);
      return { cleaned };
    }),
});
