/**
 * tRPC Router for Custom Report Scheduling
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as reportService from "./reportScheduling";

export const reportSchedulingRouter = router({
  // Create scheduled report
  createScheduledReport: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        reportType: z.enum(["activity", "revenue", "performance", "team", "custom"]),
        frequency: z.enum(["once", "daily", "weekly", "monthly", "quarterly"]),
        recipients: z.array(z.string()),
        metrics: z.array(z.string()).optional(),
        filters: z.record(z.unknown()).optional(),
        template: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = reportService.createScheduledReport(
        ctx.user.id,
        input.name,
        input.reportType,
        input.frequency,
        input.recipients,
        input.metrics,
        input.filters,
        input.template
      );
      return report;
    }),

  // Get user's scheduled reports
  getScheduledReports: protectedProcedure.query(async ({ ctx }) => {
    const reports = reportService.getUserScheduledReports(ctx.user.id);
    return reports;
  }),

  // Get report details
  getReportDetails: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ input }) => {
      const report = reportService.getScheduledReport(input.reportId);
      return report;
    }),

  // Update scheduled report
  updateScheduledReport: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        name: z.string().optional(),
        frequency: z.enum(["once", "daily", "weekly", "monthly", "quarterly"]).optional(),
        recipients: z.array(z.string()).optional(),
        metrics: z.array(z.string()).optional(),
        filters: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = reportService.updateScheduledReport(input.reportId, {
        name: input.name,
        frequency: input.frequency,
        recipients: input.recipients,
        metrics: input.metrics,
        filters: input.filters,
      });
      return updated;
    }),

  // Delete scheduled report
  deleteScheduledReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ input }) => {
      reportService.deleteScheduledReport(input.reportId);
      return { success: true };
    }),

  // Get report history
  getReportHistory: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const history = reportService.getReportHistory(input.reportId, input.limit);
      return history;
    }),

  // Generate report manually
  generateReportManually: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ input }) => {
      const report = reportService.generateReport(input.reportId);
      return report;
    }),

  // Get available templates
  getReportTemplates: protectedProcedure.query(async () => {
    const templates = reportService.getAvailableTemplates();
    return templates;
  }),

  // Get report statistics
  getReportStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = reportService.getReportStatistics(ctx.user.id);
    return stats;
  }),
});
