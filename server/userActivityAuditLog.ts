/**
 * User Activity Audit Log Service
 * Comprehensive audit trail system for tracking all user activities
 */

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'share'
  | 'unshare'
  | 'download'
  | 'upload'
  | 'payment'
  | 'subscription'
  | 'permission_change'
  | 'settings_change'
  | 'api_call'
  | 'error'
  | 'security_event';

export type AuditStatus = 'success' | 'failure' | 'partial' | 'pending';
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  userId: number;
  action: AuditAction;
  status: AuditStatus;
  severity: AuditSeverity;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  duration?: number;
  errorMessage?: string;
  changedFields?: Record<string, { before: unknown; after: unknown }>;
}

export interface AuditLogFilter {
  userId?: number;
  action?: AuditAction;
  status?: AuditStatus;
  severity?: AuditSeverity;
  resourceType?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  offset?: number;
}

export interface AuditStatistics {
  totalEntries: number;
  byAction: Record<AuditAction, number>;
  bySeverity: Record<AuditSeverity, number>;
  byStatus: Record<AuditStatus, number>;
  successRate: number;
  criticalEvents: number;
  lastActivityTime: Date | null;
}

export interface UserActivitySummary {
  userId: number;
  totalActions: number;
  lastLogin?: Date;
  lastActivity?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  resourcesCreated: number;
  resourcesDeleted: number;
  securityEvents: number;
}

const auditLogs: Map<string, AuditLogEntry> = new Map();
const userActivityIndex: Map<number, string[]> = new Map();
const actionIndex: Map<AuditAction, string[]> = new Map();
const resourceIndex: Map<string, string[]> = new Map();

/**
 * Log audit entry
 */
export function logAuditEntry(
  userId: number,
  action: AuditAction,
  resource: { type: string; id: string; name?: string },
  options?: {
    status?: AuditStatus;
    severity?: AuditSeverity;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    errorMessage?: string;
    changedFields?: Record<string, { before: unknown; after: unknown }>;
  }
): AuditLogEntry {
  const entryId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const entry: AuditLogEntry = {
    id: entryId,
    userId,
    action,
    status: options?.status || 'success',
    severity: options?.severity || 'info',
    resource,
    details: options?.details || {},
    ipAddress: options?.ipAddress || 'unknown',
    userAgent: options?.userAgent || 'unknown',
    timestamp: new Date(),
    duration: options?.duration,
    errorMessage: options?.errorMessage,
    changedFields: options?.changedFields,
  };

  auditLogs.set(entryId, entry);

  // Index by user
  if (!userActivityIndex.has(userId)) {
    userActivityIndex.set(userId, []);
  }
  userActivityIndex.get(userId)!.push(entryId);

  // Index by action
  if (!actionIndex.has(action)) {
    actionIndex.set(action, []);
  }
  actionIndex.get(action)!.push(entryId);

  // Index by resource
  const resourceKey = `${resource.type}:${resource.id}`;
  if (!resourceIndex.has(resourceKey)) {
    resourceIndex.set(resourceKey, []);
  }
  resourceIndex.get(resourceKey)!.push(entryId);

  console.log(`[Audit] ${action} on ${resource.type}:${resource.id} by user ${userId}`);

  return entry;
}

/**
 * Get audit logs with filtering
 */
export function getAuditLogs(filter: AuditLogFilter): AuditLogEntry[] {
  let results: AuditLogEntry[] = [];

  if (filter.userId) {
    const userLogs = userActivityIndex.get(filter.userId) || [];
    results = userLogs.map((id) => auditLogs.get(id)!).filter((log) => log !== undefined);
  } else {
    results = Array.from(auditLogs.values());
  }

  // Apply filters
  if (filter.action) {
    results = results.filter((log) => log.action === filter.action);
  }

  if (filter.status) {
    results = results.filter((log) => log.status === filter.status);
  }

  if (filter.severity) {
    results = results.filter((log) => log.severity === filter.severity);
  }

  if (filter.resourceType) {
    results = results.filter((log) => log.resource.type === filter.resourceType);
  }

  if (filter.dateRange) {
    results = results.filter(
      (log) => log.timestamp >= filter.dateRange!.from && log.timestamp <= filter.dateRange!.to
    );
  }

  // Sort by timestamp descending
  results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply pagination
  const offset = filter.offset || 0;
  const limit = filter.limit || 50;

  return results.slice(offset, offset + limit);
}

/**
 * Get user activity summary
 */
export function getUserActivitySummary(userId: number): UserActivitySummary {
  const userLogs = userActivityIndex.get(userId) || [];
  const logs = userLogs.map((id) => auditLogs.get(id)!).filter((log) => log !== undefined);

  const summary: UserActivitySummary = {
    userId,
    totalActions: logs.length,
    loginCount: logs.filter((log) => log.action === 'login' && log.status === 'success').length,
    failedLoginAttempts: logs.filter((log) => log.action === 'login' && log.status === 'failure').length,
    resourcesCreated: logs.filter((log) => log.action === 'create' && log.status === 'success').length,
    resourcesDeleted: logs.filter((log) => log.action === 'delete' && log.status === 'success').length,
    securityEvents: logs.filter((log) => log.action === 'security_event').length,
  };

  // Get last login
  const lastLogin = logs.find((log) => log.action === 'login' && log.status === 'success');
  if (lastLogin) {
    summary.lastLogin = lastLogin.timestamp;
  }

  // Get last activity
  if (logs.length > 0) {
    summary.lastActivity = logs[0].timestamp;
  }

  return summary;
}

/**
 * Get audit statistics
 */
export function getAuditStatistics(dateRange?: { from: Date; to: Date }): AuditStatistics {
  let logs = Array.from(auditLogs.values());

  if (dateRange) {
    logs = logs.filter(
      (log) => log.timestamp >= dateRange.from && log.timestamp <= dateRange.to
    );
  }

  const stats: AuditStatistics = {
    totalEntries: logs.length,
    byAction: {} as Record<AuditAction, number>,
    bySeverity: { info: 0, warning: 0, critical: 0 },
    byStatus: { success: 0, failure: 0, partial: 0, pending: 0 },
    successRate: 0,
    criticalEvents: 0,
    lastActivityTime: logs.length > 0 ? logs[logs.length - 1].timestamp : null,
  };

  for (const log of logs) {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    stats.bySeverity[log.severity]++;
    stats.byStatus[log.status]++;

    if (log.severity === 'critical') {
      stats.criticalEvents++;
    }
  }

  const successCount = stats.byStatus.success;
  stats.successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

  return stats;
}

/**
 * Get resource audit trail
 */
export function getResourceAuditTrail(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): AuditLogEntry[] {
  const resourceKey = `${resourceType}:${resourceId}`;
  const logs = resourceIndex.get(resourceKey) || [];

  return logs
    .map((id) => auditLogs.get(id)!)
    .filter((log) => log !== undefined)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Detect suspicious activity
 */
export function detectSuspiciousActivity(userId: number): {
  suspicious: boolean;
  reason?: string;
  severity: AuditSeverity;
  events: AuditLogEntry[];
} {
  const userLogs = userActivityIndex.get(userId) || [];
  const logs = userLogs
    .map((id) => auditLogs.get(id)!)
    .filter((log) => log !== undefined)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Check for multiple failed logins
  const recentFailedLogins = logs
    .filter((log) => log.action === 'login' && log.status === 'failure')
    .filter((log) => Date.now() - log.timestamp.getTime() < 3600000) // Last hour
    .length;

  if (recentFailedLogins >= 5) {
    return {
      suspicious: true,
      reason: `${recentFailedLogins} failed login attempts in the last hour`,
      severity: 'critical',
      events: logs.filter((log) => log.action === 'login' && log.status === 'failure').slice(0, 5),
    };
  }

  // Check for bulk deletion
  const recentDeletions = logs
    .filter((log) => log.action === 'delete' && log.status === 'success')
    .filter((log) => Date.now() - log.timestamp.getTime() < 300000) // Last 5 minutes
    .length;

  if (recentDeletions >= 10) {
    return {
      suspicious: true,
      reason: `${recentDeletions} deletions in the last 5 minutes`,
      severity: 'warning',
      events: logs.filter((log) => log.action === 'delete').slice(0, 10),
    };
  }

  // Check for permission changes
  const recentPermissionChanges = logs
    .filter((log) => log.action === 'permission_change')
    .filter((log) => Date.now() - log.timestamp.getTime() < 3600000) // Last hour
    .length;

  if (recentPermissionChanges >= 5) {
    return {
      suspicious: true,
      reason: `${recentPermissionChanges} permission changes in the last hour`,
      severity: 'warning',
      events: logs.filter((log) => log.action === 'permission_change').slice(0, 5),
    };
  }

  return {
    suspicious: false,
    severity: 'info',
    events: [],
  };
}

/**
 * Export audit logs
 */
export function exportAuditLogs(
  filter: AuditLogFilter,
  format: 'csv' | 'json' = 'csv'
): string {
  const logs = getAuditLogs(filter);

  if (format === 'json') {
    return JSON.stringify(logs, null, 2);
  }

  // CSV format
  const headers = [
    'ID',
    'User ID',
    'Action',
    'Status',
    'Severity',
    'Resource Type',
    'Resource ID',
    'IP Address',
    'Timestamp',
    'Error Message',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.userId,
    log.action,
    log.status,
    log.severity,
    log.resource.type,
    log.resource.id,
    log.ipAddress,
    log.timestamp.toISOString(),
    log.errorMessage || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return csv;
}

/**
 * Get audit log by ID
 */
export function getAuditLogById(id: string): AuditLogEntry | undefined {
  return auditLogs.get(id);
}

/**
 * Cleanup old audit logs
 */
export function cleanupOldAuditLogs(daysOld: number = 365): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let cleaned = 0;
  const idsToDelete: string[] = [];

  for (const [id, log] of auditLogs) {
    if (log.timestamp < cutoffDate) {
      idsToDelete.push(id);
      cleaned++;
    }
  }

  idsToDelete.forEach((id) => {
    const log = auditLogs.get(id)!;

    // Remove from user index
    const userLogs = userActivityIndex.get(log.userId);
    if (userLogs) {
      const idx = userLogs.indexOf(id);
      if (idx > -1) {
        userLogs.splice(idx, 1);
      }
    }

    // Remove from action index
    const actionLogs = actionIndex.get(log.action);
    if (actionLogs) {
      const idx = actionLogs.indexOf(id);
      if (idx > -1) {
        actionLogs.splice(idx, 1);
      }
    }

    // Remove from resource index
    const resourceKey = `${log.resource.type}:${log.resource.id}`;
    const resourceLogs = resourceIndex.get(resourceKey);
    if (resourceLogs) {
      const idx = resourceLogs.indexOf(id);
      if (idx > -1) {
        resourceLogs.splice(idx, 1);
      }
    }

    auditLogs.delete(id);
  });

  console.log(`[Audit] Cleaned up ${cleaned} old audit logs`);

  return cleaned;
}

/**
 * Get action statistics
 */
export function getActionStatistics(): Record<AuditAction, { count: number; successRate: number }> {
  const stats: Record<string, { count: number; success: number }> = {};

  for (const [, log] of auditLogs) {
    if (!stats[log.action]) {
      stats[log.action] = { count: 0, success: 0 };
    }
    stats[log.action].count++;
    if (log.status === 'success') {
      stats[log.action].success++;
    }
  }

  const result: Record<string, any> = {};
  for (const [action, data] of Object.entries(stats)) {
    result[action] = {
      count: data.count,
      successRate: (data.success / data.count) * 100,
    };
  }

  return result;
}

/**
 * Get user comparison
 */
export function compareUserActivity(userIds: number[]): {
  userId: number;
  totalActions: number;
  lastActivity?: Date;
  riskLevel: 'low' | 'medium' | 'high';
}[] {
  return userIds.map((userId) => {
    const summary = getUserActivitySummary(userId);
    const suspicious = detectSuspiciousActivity(userId);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (suspicious.suspicious) {
      riskLevel = suspicious.severity === 'critical' ? 'high' : 'medium';
    }

    return {
      userId,
      totalActions: summary.totalActions,
      lastActivity: summary.lastActivity,
      riskLevel,
    };
  });
}
