/**
 * Background Job System
 * Handles scheduled tasks like report generation and notification delivery
 */

export type JobType = 'report_generation' | 'notification_delivery' | 'api_cleanup' | 'audit_cleanup' | 'custom';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'retrying';

export interface BackgroundJob {
  id: string;
  type: JobType;
  status: JobStatus;
  data: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  lastRunAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSchedule {
  jobId: string;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastRunAt?: Date;
  nextRunAt: Date;
  isActive: boolean;
}

const jobs: Map<string, BackgroundJob> = new Map();
const schedules: Map<string, JobSchedule> = new Map();
const jobHandlers: Map<JobType, (job: BackgroundJob) => Promise<void>> = new Map();

/**
 * Register job handler
 */
export function registerJobHandler(
  type: JobType,
  handler: (job: BackgroundJob) => Promise<void>
): void {
  jobHandlers.set(type, handler);
  console.log(`[Jobs] Registered handler for job type: ${type}`);
}

/**
 * Create a new job
 */
export function createJob(
  type: JobType,
  data: Record<string, unknown>,
  options?: {
    maxAttempts?: number;
    runAt?: Date;
  }
): BackgroundJob {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const job: BackgroundJob = {
    id: jobId,
    type,
    status: 'pending',
    data,
    attempts: 0,
    maxAttempts: options?.maxAttempts || 3,
    nextRunAt: options?.runAt || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(jobId, job);

  console.log(`[Jobs] Created job: ${jobId} (type: ${type})`);

  return job;
}

/**
 * Schedule a job
 */
export function scheduleJob(
  jobId: string,
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly',
  startAt?: Date
): JobSchedule {
  const schedule: JobSchedule = {
    jobId,
    frequency,
    nextRunAt: startAt || calculateNextRun(frequency),
    isActive: true,
  };

  schedules.set(jobId, schedule);

  console.log(`[Jobs] Scheduled job: ${jobId} (frequency: ${frequency})`);

  return schedule;
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): BackgroundJob | undefined {
  return jobs.get(jobId);
}

/**
 * Get all pending jobs
 */
export function getPendingJobs(): BackgroundJob[] {
  const now = new Date();
  return Array.from(jobs.values()).filter(
    (job) => job.status === 'pending' && job.nextRunAt <= now
  );
}

/**
 * Execute job
 */
export async function executeJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  if (job.status === 'running') {
    throw new Error(`Job already running: ${jobId}`);
  }

  if (job.attempts >= job.maxAttempts) {
    job.status = 'failed';
    job.updatedAt = new Date();
    console.log(`[Jobs] Job failed after ${job.attempts} attempts: ${jobId}`);
    return;
  }

  job.status = 'running';
  job.attempts++;
  job.updatedAt = new Date();

  try {
    const handler = jobHandlers.get(job.type);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${job.type}`);
    }

    await handler(job);

    job.status = 'completed';
    job.lastRunAt = new Date();
    job.updatedAt = new Date();

    console.log(`[Jobs] Job completed: ${jobId}`);

    // Update schedule if recurring
    const schedule = schedules.get(jobId);
    if (schedule && schedule.frequency !== 'once') {
      schedule.lastRunAt = new Date();
      schedule.nextRunAt = calculateNextRun(schedule.frequency, new Date());
      console.log(`[Jobs] Rescheduled job: ${jobId}`);
    }
  } catch (error) {
    job.status = 'retrying';
    job.lastError = error instanceof Error ? error.message : String(error);
    job.nextRunAt = calculateRetryTime(job.attempts);
    job.updatedAt = new Date();

    console.error(`[Jobs] Job failed (attempt ${job.attempts}): ${jobId}`, error);
  }
}

/**
 * Process all pending jobs
 */
export async function processPendingJobs(): Promise<void> {
  const pendingJobs = getPendingJobs();

  console.log(`[Jobs] Processing ${pendingJobs.length} pending jobs`);

  for (const job of pendingJobs) {
    try {
      await executeJob(job.id);
    } catch (error) {
      console.error(`[Jobs] Error processing job ${job.id}:`, error);
    }
  }
}

/**
 * Cancel job
 */
export function cancelJob(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'failed';
    job.updatedAt = new Date();
    console.log(`[Jobs] Cancelled job: ${jobId}`);
  }
}

/**
 * Delete job
 */
export function deleteJob(jobId: string): void {
  jobs.delete(jobId);
  schedules.delete(jobId);
  console.log(`[Jobs] Deleted job: ${jobId}`);
}

/**
 * Get job statistics
 */
export function getJobStatistics(): {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  retrying: number;
} {
  const allJobs = Array.from(jobs.values());

  return {
    total: allJobs.length,
    pending: allJobs.filter((j) => j.status === 'pending').length,
    running: allJobs.filter((j) => j.status === 'running').length,
    completed: allJobs.filter((j) => j.status === 'completed').length,
    failed: allJobs.filter((j) => j.status === 'failed').length,
    retrying: allJobs.filter((j) => j.status === 'retrying').length,
  };
}

/**
 * Get all jobs
 */
export function getAllJobs(): BackgroundJob[] {
  return Array.from(jobs.values());
}

/**
 * Cleanup completed jobs
 */
export function cleanupCompletedJobs(olderThanDays: number = 7): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  let cleaned = 0;
  const idsToDelete: string[] = [];

  for (const [id, job] of jobs) {
    if (job.status === 'completed' && job.updatedAt < cutoffDate) {
      idsToDelete.push(id);
      cleaned++;
    }
  }

  idsToDelete.forEach((id) => {
    jobs.delete(id);
    schedules.delete(id);
  });

  console.log(`[Jobs] Cleaned up ${cleaned} completed jobs`);

  return cleaned;
}

/**
 * Start background job processor
 */
export function startJobProcessor(intervalMs: number = 60000): NodeJS.Timer {
  console.log(`[Jobs] Starting background job processor (interval: ${intervalMs}ms)`);

  return setInterval(async () => {
    try {
      await processPendingJobs();
    } catch (error) {
      console.error('[Jobs] Error in job processor:', error);
    }
  }, intervalMs);
}

/**
 * Stop background job processor
 */
export function stopJobProcessor(timer: NodeJS.Timer): void {
  clearInterval(timer);
  console.log('[Jobs] Stopped background job processor');
}

// Helper functions

function calculateNextRun(frequency: string, from: Date = new Date()): Date {
  const next = new Date(from);

  switch (frequency) {
    case 'hourly':
      next.setHours(next.getHours() + 1);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'once':
    default:
      return from;
  }

  return next;
}

function calculateRetryTime(attempt: number): Date {
  // Exponential backoff: 1 min, 5 min, 15 min
  const backoffMs = Math.min(1000 * 60 * Math.pow(2, attempt - 1), 15 * 60 * 1000);
  const next = new Date();
  next.setTime(next.getTime() + backoffMs);
  return next;
}

/**
 * Create report generation job
 */
export function createReportGenerationJob(
  reportId: string,
  userId: number,
  runAt?: Date
): BackgroundJob {
  return createJob(
    'report_generation',
    { reportId, userId },
    { maxAttempts: 3, runAt }
  );
}

/**
 * Create notification delivery job
 */
export function createNotificationDeliveryJob(
  notificationId: string,
  userId: number,
  runAt?: Date
): BackgroundJob {
  return createJob(
    'notification_delivery',
    { notificationId, userId },
    { maxAttempts: 5, runAt }
  );
}

/**
 * Create API cleanup job
 */
export function createAPICleanupJob(daysOld: number = 90): BackgroundJob {
  return createJob(
    'api_cleanup',
    { daysOld },
    { maxAttempts: 1 }
  );
}

/**
 * Create audit cleanup job
 */
export function createAuditCleanupJob(daysOld: number = 365): BackgroundJob {
  return createJob(
    'audit_cleanup',
    { daysOld },
    { maxAttempts: 1 }
  );
}
