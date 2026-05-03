/**
 * Report Scheduling Service - Minimal Working Version
 */

export interface ScheduledReport {
  id: string;
  userId: number;
  name: string;
  description: string;
  type: string;
  frequency: string;
  status: 'active' | 'paused';
  recipients: string[];
  metrics: string[];
  filters?: Record<string, unknown>;
  nextScheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedReport {
  id: string;
  userId: number;
  scheduledReportId: string;
  name: string;
  type: string;
  metrics: Record<string, unknown>;
  generatedAt: Date;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  deliveryChannels: string[];
}

const scheduledReports = new Map<string, ScheduledReport>();
const generatedReports = new Map<string, GeneratedReport>();

export function createScheduledReport(data: {
  userId: number;
  name: string;
  description: string;
  type: string;
  frequency: string;
  recipients: string[];
  metrics: string[];
  filters?: Record<string, unknown>;
}): ScheduledReport {
  const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const report: ScheduledReport = {
    id,
    userId: data.userId,
    name: data.name,
    description: data.description,
    type: data.type,
    frequency: data.frequency,
    status: 'active',
    recipients: data.recipients,
    metrics: data.metrics,
    filters: data.filters || {},
    nextScheduledAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  scheduledReports.set(id, report);
  return report;
}

export function getUserScheduledReports(userId: number): ScheduledReport[] {
  const results: ScheduledReport[] = [];
  for (const [, report] of scheduledReports) {
    if (report.userId === userId) {
      results.push(report);
    }
  }
  return results;
}

export function getScheduledReport(reportId: string): ScheduledReport | null {
  return scheduledReports.get(reportId) || null;
}

export function updateScheduledReport(
  reportId: string,
  updates: Partial<ScheduledReport>
): ScheduledReport | null {
  const report = scheduledReports.get(reportId);
  if (!report) return null;

  Object.assign(report, updates, { updatedAt: new Date() });
  return report;
}

export function deleteScheduledReport(reportId: string): boolean {
  return scheduledReports.delete(reportId);
}

export function getGeneratedReports(
  userId: number,
  limit: number = 50,
  offset: number = 0
): GeneratedReport[] {
  const results: GeneratedReport[] = [];
  let count = 0;

  for (const [, report] of generatedReports) {
    if (report.userId === userId) {
      if (count >= offset && results.length < limit) {
        results.push(report);
      }
      count++;
    }
  }

  return results;
}

export function getReportStatistics(userId: number) {
  const stats = {
    totalScheduled: 0,
    activeSchedules: 0,
    pausedSchedules: 0,
    totalGenerated: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
  };

  for (const [, report] of scheduledReports) {
    if (report.userId === userId) {
      stats.totalScheduled++;
      if (report.status === 'active') stats.activeSchedules++;
      if (report.status === 'paused') stats.pausedSchedules++;
    }
  }

  for (const [, report] of generatedReports) {
    if (report.userId === userId) {
      stats.totalGenerated++;
      if (report.deliveryStatus === 'sent') stats.successfulDeliveries++;
      if (report.deliveryStatus === 'failed') stats.failedDeliveries++;
    }
  }

  return stats;
}

export function generateReport(data: {
  userId: number;
  scheduledReportId: string;
  name: string;
  type: string;
  metrics: Record<string, unknown>;
  deliveryChannels: string[];
}): GeneratedReport {
  const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const report: GeneratedReport = {
    id,
    userId: data.userId,
    scheduledReportId: data.scheduledReportId,
    name: data.name,
    type: data.type,
    metrics: data.metrics,
    generatedAt: new Date(),
    deliveryStatus: 'pending',
    deliveryChannels: data.deliveryChannels,
  };

  generatedReports.set(id, report);
  return report;
}
