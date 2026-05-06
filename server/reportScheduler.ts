/**
 * Report Scheduler Service
 * Schedules and manages automated report generation and email delivery
 */

import { EmailService } from './emailService';
import { userSegmentationService } from './userSegmentation';

export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  frequency: ReportFrequency;
  recipients: string[];
  enabled: boolean;
  nextRunAt: Date;
  lastRunAt?: Date;
  customSchedule?: string; // cron expression
  includeAttachments: boolean;
  segmentId?: string; // For segment-specific reports
  createdAt: Date;
  updatedAt: Date;
}

export class ReportScheduler {
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private activeSchedules: Map<string, NodeJS.Timeout> = new Map();
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
    this.initializeDefaultSchedules();
  }

  private initializeDefaultSchedules() {
    // Daily Analytics Report
    this.createScheduledReport({
      id: 'daily_analytics_report',
      name: 'Daily Analytics Report',
      templateId: 'daily_analytics',
      frequency: 'daily',
      recipients: ['admin@example.com'],
      enabled: true,
      nextRunAt: this.getNextRunTime('daily'),
      includeAttachments: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Weekly Performance Report
    this.createScheduledReport({
      id: 'weekly_performance_report',
      name: 'Weekly Performance Report',
      templateId: 'weekly_performance',
      frequency: 'weekly',
      recipients: ['admin@example.com', 'team@example.com'],
      enabled: true,
      nextRunAt: this.getNextRunTime('weekly'),
      includeAttachments: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Monthly Segmentation Report
    this.createScheduledReport({
      id: 'monthly_segmentation_report',
      name: 'Monthly User Segmentation Report',
      templateId: 'segmentation_report',
      frequency: 'monthly',
      recipients: ['admin@example.com'],
      enabled: true,
      nextRunAt: this.getNextRunTime('monthly'),
      includeAttachments: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public createScheduledReport(report: ScheduledReport): ScheduledReport {
    this.scheduledReports.set(report.id, report);

    if (report.enabled) {
      this.scheduleReport(report.id);
    }

    return report;
  }

  public getScheduledReport(reportId: string): ScheduledReport | undefined {
    return this.scheduledReports.get(reportId);
  }

  public getAllScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  public updateScheduledReport(reportId: string, updates: Partial<ScheduledReport>): ScheduledReport | undefined {
    const report = this.scheduledReports.get(reportId);
    if (report) {
      const updated = { ...report, ...updates, updatedAt: new Date() };
      this.scheduledReports.set(reportId, updated);

      // Reschedule if enabled status changed
      if (updates.enabled !== undefined) {
        if (updates.enabled) {
          this.scheduleReport(reportId);
        } else {
          this.unscheduleReport(reportId);
        }
      }

      return updated;
    }
    return undefined;
  }

  public deleteScheduledReport(reportId: string): boolean {
    this.unscheduleReport(reportId);
    return this.scheduledReports.delete(reportId);
  }

  private scheduleReport(reportId: string) {
    const report = this.scheduledReports.get(reportId);
    if (!report) return;

    // Clear existing schedule if any
    if (this.activeSchedules.has(reportId)) {
      clearTimeout(this.activeSchedules.get(reportId)!);
    }

    const scheduleNext = () => {
      const now = new Date();
      const delay = report.nextRunAt.getTime() - now.getTime();

      if (delay > 0) {
        const timeout = setTimeout(async () => {
          await this.executeReport(reportId);
          // Update next run time and reschedule
          const updated = this.scheduledReports.get(reportId);
          if (updated) {
            updated.nextRunAt = this.getNextRunTime(updated.frequency);
            scheduleNext();
          }
        }, delay);

        this.activeSchedules.set(reportId, timeout);
      } else {
        // If next run time is in the past, execute immediately and reschedule
        this.executeReport(reportId).then(() => {
          const updated = this.scheduledReports.get(reportId);
          if (updated) {
            updated.nextRunAt = this.getNextRunTime(updated.frequency);
            scheduleNext();
          }
        });
      }
    };

    scheduleNext();
  }

  private unscheduleReport(reportId: string) {
    if (this.activeSchedules.has(reportId)) {
      clearTimeout(this.activeSchedules.get(reportId)!);
      this.activeSchedules.delete(reportId);
    }
  }

  private async executeReport(reportId: string): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report || !report.enabled) return;

    try {
      console.log(`[ReportScheduler] Executing report: ${report.name}`);

      // Generate report data
      const reportData = await this.generateReportData(report);

      // Generate attachments if needed
      let attachments: Array<{ filename: string; content: string | Buffer; contentType?: string }> = [];
      if (report.includeAttachments) {
        attachments = this.generateAttachments(report, reportData);
      }

      // Send report to recipients
      const result = await this.emailService.sendBulkEmails(
        report.recipients.map((email) => ({
          email,
          data: reportData,
        })),
        report.templateId,
        attachments
      );

      // Update last run time
      report.lastRunAt = new Date();

      console.log(`[ReportScheduler] Report executed: ${report.name} (Sent: ${result.sent}, Failed: ${result.failed})`);
    } catch (error) {
      console.error(`[ReportScheduler] Error executing report ${report.name}:`, error);
    }
  }

  private async generateReportData(report: ScheduledReport): Promise<Record<string, any>> {
    const now = new Date();

    // Base data
    const data: Record<string, any> = {
      date: now.toLocaleDateString(),
      timestamp: now.toISOString(),
      totalUsers: 1250,
      activeUsers: 890,
      avgEngagement: 72,
      newUsers: 45,
    };

    // Template-specific data
    if (report.templateId === 'daily_analytics') {
      data.topActivities = [
        { name: 'Chat Messages', count: 5420 },
        { name: 'File Uploads', count: 1230 },
        { name: 'Model Training', count: 340 },
      ];
    } else if (report.templateId === 'weekly_performance') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      data.startDate = weekAgo.toLocaleDateString();
      data.endDate = now.toLocaleDateString();
      data.userChange = 8.5;
      data.engagementRate = 72;
      data.engagementChange = 5.2;
      data.churnRate = 2.3;
      data.churnChange = -0.8;
    } else if (report.templateId === 'segmentation_report') {
      data.segments = [
        { name: 'High Engagement', userCount: 450, avgEngagement: 85, churnRate: 1.2 },
        { name: 'Medium Engagement', userCount: 600, avgEngagement: 55, churnRate: 3.5 },
        { name: 'Low Engagement', userCount: 200, avgEngagement: 25, churnRate: 8.9 },
      ];
    }

    return data;
  }

  private generateAttachments(
    report: ScheduledReport,
    data: Record<string, any>
  ): Array<{ filename: string; content: string | Buffer; contentType?: string }> {
    const attachments: Array<{ filename: string; content: string | Buffer; contentType?: string }> = [];

    // Generate CSV attachment
    const csvData = this.generateCSVData(report, data);
    if (csvData.length > 0) {
      const csv = this.emailService.generateCSVAttachment(csvData, `${report.id}_${new Date().toISOString().split('T')[0]}.csv`);
      attachments.push(csv);
    }

    return attachments;
  }

  private generateCSVData(report: ScheduledReport, data: Record<string, any>): any[] {
    if (report.templateId === 'daily_analytics') {
      return [
        { metric: 'Total Users', value: data.totalUsers },
        { metric: 'Active Users', value: data.activeUsers },
        { metric: 'Average Engagement', value: `${data.avgEngagement}%` },
        { metric: 'New Users', value: data.newUsers },
      ];
    } else if (report.templateId === 'segmentation_report') {
      return data.segments || [];
    }

    return [];
  }

  private getNextRunTime(frequency: ReportFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        // Next day at 9 AM
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;

      case 'weekly':
        // Next Monday at 9 AM
        const nextMonday = new Date(now);
        nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;

      case 'monthly':
        // First day of next month at 9 AM
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(9, 0, 0, 0);
        return nextMonth;

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  public getScheduleStatus(): Record<string, any> {
    const reports = Array.from(this.scheduledReports.values());
    const enabled = reports.filter((r) => r.enabled).length;
    const disabled = reports.filter((r) => !r.enabled).length;

    return {
      totalReports: reports.length,
      enabledReports: enabled,
      disabledReports: disabled,
      activeSchedules: this.activeSchedules.size,
      nextReports: reports
        .filter((r) => r.enabled)
        .sort((a, b) => a.nextRunAt.getTime() - b.nextRunAt.getTime())
        .slice(0, 5)
        .map((r) => ({
          name: r.name,
          nextRunAt: r.nextRunAt,
          frequency: r.frequency,
        })),
    };
  }

  public async triggerReportNow(reportId: string): Promise<boolean> {
    const report = this.scheduledReports.get(reportId);
    if (!report) return false;

    try {
      await this.executeReport(reportId);
      return true;
    } catch (error) {
      console.error(`Failed to trigger report ${reportId}:`, error);
      return false;
    }
  }

  public startAllSchedules() {
    this.scheduledReports.forEach((report) => {
      if (report.enabled) {
        this.scheduleReport(report.id);
      }
    });
    console.log('[ReportScheduler] All schedules started');
  }

  public stopAllSchedules() {
    this.activeSchedules.forEach((timeout) => clearTimeout(timeout));
    this.activeSchedules.clear();
    console.log('[ReportScheduler] All schedules stopped');
  }
}

// Export singleton instance
let reportScheduler: ReportScheduler | null = null;

export function initializeReportScheduler(emailService: EmailService): ReportScheduler {
  if (!reportScheduler) {
    reportScheduler = new ReportScheduler(emailService);
  }
  return reportScheduler;
}

export function getReportScheduler(): ReportScheduler | null {
  return reportScheduler;
}
