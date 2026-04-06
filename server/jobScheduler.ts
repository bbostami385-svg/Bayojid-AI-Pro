/**
 * Background Job Scheduler
 * Uses node-cron to schedule recurring tasks
 */

import cron from 'node-cron';
import * as jobService from './backgroundJobs';
import * as reportService from './reportScheduling';
import * as analyticsService from './apiUsageAnalytics';
import * as auditService from './userActivityAuditLog';

interface ScheduledTask {
  name: string;
  cronExpression: string;
  handler: () => Promise<void>;
  enabled: boolean;
}

const scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

/**
 * Task: Generate Daily Reports
 * Runs every day at 2 AM
 */
async function generateDailyReports(): Promise<void> {
  console.log('[Scheduler] Starting daily report generation...');
  try {
    const dailyReports = reportService.getScheduledReportsByFrequency('daily');
    
    for (const report of dailyReports) {
      if (report.isActive) {
        const job = jobService.createJob(
          'report_generation',
          {
            reportId: report.reportId,
            userId: 0, // System job
          },
          {
            priority: 'normal',
            maxRetries: 3,
          }
        );
        
        console.log(`[Scheduler] Created report generation job: ${job.id} for report: ${report.reportId}`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Daily report generation failed:', error);
  }
}

/**
 * Task: Generate Weekly Reports
 * Runs every Monday at 3 AM
 */
async function generateWeeklyReports(): Promise<void> {
  console.log('[Scheduler] Starting weekly report generation...');
  try {
    const weeklyReports = reportService.getScheduledReportsByFrequency('weekly');
    
    for (const report of weeklyReports) {
      if (report.isActive) {
        const job = jobService.createJob(
          'report_generation',
          {
            reportId: report.reportId,
            userId: 0,
          },
          {
            priority: 'normal',
            maxRetries: 3,
          }
        );
        
        console.log(`[Scheduler] Created weekly report job: ${job.id}`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Weekly report generation failed:', error);
  }
}

/**
 * Task: Generate Monthly Reports
 * Runs on the first day of each month at 4 AM
 */
async function generateMonthlyReports(): Promise<void> {
  console.log('[Scheduler] Starting monthly report generation...');
  try {
    const monthlyReports = reportService.getScheduledReportsByFrequency('monthly');
    
    for (const report of monthlyReports) {
      if (report.isActive) {
        const job = jobService.createJob(
          'report_generation',
          {
            reportId: report.reportId,
            userId: 0,
          },
          {
            priority: 'normal',
            maxRetries: 3,
          }
        );
        
        console.log(`[Scheduler] Created monthly report job: ${job.id}`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Monthly report generation failed:', error);
  }
}

/**
 * Task: Generate Quarterly Reports
 * Runs on the first day of Q1, Q2, Q3, Q4 at 5 AM
 */
async function generateQuarterlyReports(): Promise<void> {
  console.log('[Scheduler] Starting quarterly report generation...');
  try {
    const quarterlyReports = reportService.getScheduledReportsByFrequency('quarterly');
    
    for (const report of quarterlyReports) {
      if (report.isActive) {
        const job = jobService.createJob(
          'report_generation',
          {
            reportId: report.reportId,
            userId: 0,
          },
          {
            priority: 'normal',
            maxRetries: 3,
          }
        );
        
        console.log(`[Scheduler] Created quarterly report job: ${job.id}`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Quarterly report generation failed:', error);
  }
}

/**
 * Task: Process Notification Queue
 * Runs every 5 minutes
 */
async function processNotificationQueue(): Promise<void> {
  console.log('[Scheduler] Processing notification queue...');
  try {
    const pendingNotifications = 10; // Placeholder - get from service
    
    if (pendingNotifications > 0) {
      console.log(`[Scheduler] Found ${pendingNotifications} pending notifications`);
      
      // Create batch job for notification delivery
      const job = jobService.createJob(
        'notification_delivery',
        {
          batchSize: 10,
          userId: 0,
        },
        {
          priority: 'high',
          maxRetries: 5,
        }
      );
      
      console.log(`[Scheduler] Created notification delivery job: ${job.id}`);
    }
  } catch (error) {
    console.error('[Scheduler] Notification queue processing failed:', error);
  }
}

/**
 * Task: Cleanup Old API Metrics
 * Runs daily at 1 AM
 */
async function cleanupOldMetrics(): Promise<void> {
  console.log('[Scheduler] Cleaning up old API metrics...');
  try {
    const job = jobService.createJob(
      'api_cleanup',
      {
        daysOld: 90, // Keep 90 days of data
      },
      {
        priority: 'low',
        maxRetries: 2,
      }
    );
    
    console.log(`[Scheduler] Created API cleanup job: ${job.id}`);
  } catch (error) {
    console.error('[Scheduler] API cleanup failed:', error);
  }
}

/**
 * Task: Cleanup Old Audit Logs
 * Runs daily at 1:30 AM
 */
async function cleanupOldAuditLogs(): Promise<void> {
  console.log('[Scheduler] Cleaning up old audit logs...');
  try {
    const job = jobService.createJob(
      'audit_cleanup',
      {
        daysOld: 365, // Keep 1 year of audit logs
      },
      {
        priority: 'low',
        maxRetries: 2,
      }
    );
    
    console.log(`[Scheduler] Created audit cleanup job: ${job.id}`);
  } catch (error) {
    console.error('[Scheduler] Audit cleanup failed:', error);
  }
}

/**
 * Task: Detect Suspicious Activity
 * Runs every 30 minutes
 */
async function detectSuspiciousActivity(): Promise<void> {
  console.log('[Scheduler] Analyzing for suspicious activity...');
  try {
    const suspiciousActivities = auditService.detectSuspiciousActivity();
    
    if (suspiciousActivities.length > 0) {
      console.log(`[Scheduler] Found ${suspiciousActivities.length} suspicious activities`);
      
      // Log each suspicious activity
      for (const activity of suspiciousActivities) {
        auditService.logAuditEntry(
          activity.userId,
          'suspicious_activity_detected',
          { type: 'security', id: activity.id },
          {
            status: 'warning',
            severity: 'high',
            details: activity,
          }
        );
      }
    }
  } catch (error) {
    console.error('[Scheduler] Suspicious activity detection failed:', error);
  }
}

/**
 * Task: Generate Analytics Summary
 * Runs daily at 6 AM
 */
async function generateAnalyticsSummary(): Promise<void> {
  console.log('[Scheduler] Generating analytics summary...');
  try {
    const summary = analyticsService.generateDailySummary();
    
    console.log('[Scheduler] Analytics summary generated:', {
      totalRequests: summary.totalRequests,
      successRate: summary.successRate,
      averageLatency: summary.averageLatency,
      totalCost: summary.totalCost,
    });
  } catch (error) {
    console.error('[Scheduler] Analytics summary generation failed:', error);
  }
}

/**
 * Register all scheduled tasks
 */
export function registerScheduledTasks(): void {
  const tasks: ScheduledTask[] = [
    {
      name: 'Daily Reports',
      cronExpression: '0 2 * * *', // 2 AM daily
      handler: generateDailyReports,
      enabled: true,
    },
    {
      name: 'Weekly Reports',
      cronExpression: '0 3 * * 1', // 3 AM Monday
      handler: generateWeeklyReports,
      enabled: true,
    },
    {
      name: 'Monthly Reports',
      cronExpression: '0 4 1 * *', // 4 AM first day of month
      handler: generateMonthlyReports,
      enabled: true,
    },
    {
      name: 'Quarterly Reports',
      cronExpression: '0 5 1 1,4,7,10 *', // 5 AM first day of Q1, Q2, Q3, Q4
      handler: generateQuarterlyReports,
      enabled: true,
    },
    {
      name: 'Notification Queue',
      cronExpression: '*/5 * * * *', // Every 5 minutes
      handler: processNotificationQueue,
      enabled: true,
    },
    {
      name: 'Cleanup Old Metrics',
      cronExpression: '0 1 * * *', // 1 AM daily
      handler: cleanupOldMetrics,
      enabled: true,
    },
    {
      name: 'Cleanup Old Audit Logs',
      cronExpression: '30 1 * * *', // 1:30 AM daily
      handler: cleanupOldAuditLogs,
      enabled: true,
    },
    {
      name: 'Detect Suspicious Activity',
      cronExpression: '*/30 * * * *', // Every 30 minutes
      handler: detectSuspiciousActivity,
      enabled: true,
    },
    {
      name: 'Analytics Summary',
      cronExpression: '0 6 * * *', // 6 AM daily
      handler: generateAnalyticsSummary,
      enabled: true,
    },
  ];

  console.log('[Scheduler] Registering scheduled tasks...');

  for (const task of tasks) {
    if (task.enabled) {
      try {
        const scheduledTask = cron.schedule(task.cronExpression, async () => {
          console.log(`[Scheduler] Executing task: ${task.name}`);
          try {
            await task.handler();
          } catch (error) {
            console.error(`[Scheduler] Task failed: ${task.name}`, error);
          }
        });

        scheduledTasks.set(task.name, scheduledTask);
        console.log(`[Scheduler] ✓ Registered: ${task.name} (${task.cronExpression})`);
      } catch (error) {
        console.error(`[Scheduler] Failed to register task: ${task.name}`, error);
      }
    }
  }

  console.log(`[Scheduler] Total tasks registered: ${scheduledTasks.size}`);
}

/**
 * Stop all scheduled tasks
 */
export function stopAllScheduledTasks(): void {
  console.log('[Scheduler] Stopping all scheduled tasks...');
  
  for (const [name, task] of scheduledTasks) {
    task.stop();
    console.log(`[Scheduler] ✓ Stopped: ${name}`);
  }
  
  scheduledTasks.clear();
  console.log('[Scheduler] All tasks stopped');
}

/**
 * Get scheduled tasks status
 */
export function getScheduledTasksStatus(): Array<{ name: string; enabled: boolean }> {
  return Array.from(scheduledTasks.entries()).map(([name]) => ({
    name,
    enabled: true,
  }));
}

/**
 * Pause a scheduled task
 */
export function pauseScheduledTask(taskName: string): boolean {
  const task = scheduledTasks.get(taskName);
  if (task) {
    task.stop();
    console.log(`[Scheduler] Paused: ${taskName}`);
    return true;
  }
  return false;
}

/**
 * Resume a scheduled task
 */
export function resumeScheduledTask(taskName: string): boolean {
  const task = scheduledTasks.get(taskName);
  if (task) {
    task.start();
    console.log(`[Scheduler] Resumed: ${taskName}`);
    return true;
  }
  return false;
}
