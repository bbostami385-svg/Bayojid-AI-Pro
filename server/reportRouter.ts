/**
 * tRPC Router for Automated Reports
 * Exposes report scheduling and management via tRPC endpoints
 */

import { router, protectedProcedure } from './trpc';
import { getEmailService } from './emailService';
import { getReportScheduler, initializeReportScheduler } from './reportScheduler';
import { z } from 'zod';

export const reportRouter = router({
  // Get all scheduled reports (admin only)
  getAllReports: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const scheduler = getReportScheduler();
    if (!scheduler) {
      return [];
    }
    return scheduler.getAllScheduledReports();
  }),

  // Get specific report (admin only)
  getReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const scheduler = getReportScheduler();
      if (!scheduler) {
        return null;
      }
      return scheduler.getScheduledReport(input.reportId);
    }),

  // Create new scheduled report (admin only)
  createReport: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        templateId: z.string(),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
        recipients: z.array(z.string().email()),
        enabled: z.boolean().optional(),
        includeAttachments: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const emailService = getEmailService();
      const scheduler = getReportScheduler() || initializeReportScheduler(emailService);

      const report = scheduler.createScheduledReport({
        id: `report_${Date.now()}`,
        name: input.name,
        templateId: input.templateId,
        frequency: input.frequency,
        recipients: input.recipients,
        enabled: input.enabled ?? true,
        includeAttachments: input.includeAttachments ?? true,
        nextRunAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return report;
    }),

  // Update scheduled report (admin only)
  updateReport: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        updates: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const scheduler = getReportScheduler();
      if (!scheduler) {
        throw new Error('Report scheduler not initialized');
      }

      return scheduler.updateScheduledReport(input.reportId, input.updates);
    }),

  // Delete scheduled report (admin only)
  deleteReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const scheduler = getReportScheduler();
      if (!scheduler) {
        throw new Error('Report scheduler not initialized');
      }

      return scheduler.deleteScheduledReport(input.reportId);
    }),

  // Trigger report immediately (admin only)
  triggerReportNow: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const scheduler = getReportScheduler();
      if (!scheduler) {
        throw new Error('Report scheduler not initialized');
      }

      const success = await scheduler.triggerReportNow(input.reportId);
      return { success };
    }),

  // Get schedule status (admin only)
  getScheduleStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const scheduler = getReportScheduler();
    if (!scheduler) {
      return null;
    }

    return scheduler.getScheduleStatus();
  }),

  // Get available email templates
  getEmailTemplates: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const emailService = getEmailService();
    return emailService.getAllTemplates();
  }),

  // Test email connection (admin only)
  testEmailConnection: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const emailService = getEmailService();
    const success = await emailService.testConnection();
    return { success };
  }),

  // Get email queue status (admin only)
  getEmailQueueStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const emailService = getEmailService();
    return {
      queueSize: emailService.getQueueSize(),
      queuedEmails: emailService.getQueuedEmails(),
    };
  }),

  // Retry failed emails (admin only)
  retryFailedEmails: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const emailService = getEmailService();
    const retried = await emailService.retryFailedEmails();
    return { retried };
  }),
});
