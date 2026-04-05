/**
 * Notification Center Service
 * Manages system-wide notifications across multiple channels
 */

export type NotificationType = 
  | 'team_invite'
  | 'message'
  | 'payment'
  | 'subscription'
  | 'system'
  | 'security'
  | 'collaboration'
  | 'achievement';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'dismissed';

export interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  status: NotificationStatus;
  actionUrl?: string;
  actionLabel?: string;
  metadata: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  readAt?: Date;
  expiresAt: Date;
}

export interface NotificationPreference {
  userId: number;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: Record<NotificationType, boolean>;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export interface NotificationStats {
  userId: number;
  unreadCount: number;
  totalCount: number;
  byType: Record<NotificationType, number>;
  lastNotificationAt?: Date;
}

const notifications: Map<string, Notification> = new Map();
const userNotifications: Map<number, string[]> = new Map();
const preferences: Map<number, NotificationPreference> = new Map();
const notificationQueue: Notification[] = [];

/**
 * Create notification
 */
export function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    channels?: NotificationChannel[];
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, unknown>;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    expiresInDays?: number;
  }
): Notification {
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (options?.expiresInDays || 30));

  const notification: Notification = {
    id: notificationId,
    userId,
    type,
    title,
    message,
    channels: options?.channels || ['in_app', 'email'],
    status: 'unread',
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel,
    metadata: options?.metadata || {},
    priority: options?.priority || 'medium',
    createdAt: new Date(),
    expiresAt,
  };

  notifications.set(notificationId, notification);

  // Add to user notifications
  if (!userNotifications.has(userId)) {
    userNotifications.set(userId, []);
  }
  userNotifications.get(userId)!.unshift(notificationId);

  // Add to queue for processing
  notificationQueue.push(notification);

  return notification;
}

/**
 * Get user notifications
 */
export function getUserNotifications(
  userId: number,
  options?: {
    status?: NotificationStatus;
    type?: NotificationType;
    limit?: number;
    offset?: number;
  }
): Notification[] {
  const notificationIds = userNotifications.get(userId) || [];
  let results: Notification[] = [];

  for (const id of notificationIds) {
    const notif = notifications.get(id);
    if (!notif) continue;

    // Filter by status
    if (options?.status && notif.status !== options.status) continue;

    // Filter by type
    if (options?.type && notif.type !== options.type) continue;

    results.push(notif);
  }

  // Apply pagination
  const offset = options?.offset || 0;
  const limit = options?.limit || 20;
  results = results.slice(offset, offset + limit);

  return results;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): Notification | undefined {
  const notif = notifications.get(notificationId);
  if (!notif) return undefined;

  notif.status = 'read';
  notif.readAt = new Date();

  return notif;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(userId: number): number {
  const notificationIds = userNotifications.get(userId) || [];
  let marked = 0;

  for (const id of notificationIds) {
    const notif = notifications.get(id);
    if (notif && notif.status === 'unread') {
      notif.status = 'read';
      notif.readAt = new Date();
      marked++;
    }
  }

  return marked;
}

/**
 * Archive notification
 */
export function archiveNotification(notificationId: string): Notification | undefined {
  const notif = notifications.get(notificationId);
  if (!notif) return undefined;

  notif.status = 'archived';
  return notif;
}

/**
 * Dismiss notification
 */
export function dismissNotification(notificationId: string): Notification | undefined {
  const notif = notifications.get(notificationId);
  if (!notif) return undefined;

  notif.status = 'dismissed';
  return notif;
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId: string): boolean {
  const notif = notifications.get(notificationId);
  if (!notif) return false;

  // Remove from user notifications
  const userNotifs = userNotifications.get(notif.userId);
  if (userNotifs) {
    const index = userNotifs.indexOf(notificationId);
    if (index > -1) {
      userNotifs.splice(index, 1);
    }
  }

  notifications.delete(notificationId);
  return true;
}

/**
 * Get notification statistics
 */
export function getNotificationStats(userId: number): NotificationStats {
  const notificationIds = userNotifications.get(userId) || [];
  const stats: NotificationStats = {
    userId,
    unreadCount: 0,
    totalCount: notificationIds.length,
    byType: {} as Record<NotificationType, number>,
  };

  const types: NotificationType[] = [
    'team_invite',
    'message',
    'payment',
    'subscription',
    'system',
    'security',
    'collaboration',
    'achievement',
  ];

  types.forEach((type) => {
    stats.byType[type] = 0;
  });

  let lastNotificationAt: Date | undefined;

  for (const id of notificationIds) {
    const notif = notifications.get(id);
    if (!notif) continue;

    if (notif.status === 'unread') {
      stats.unreadCount++;
    }

    stats.byType[notif.type]++;

    if (!lastNotificationAt || notif.createdAt > lastNotificationAt) {
      lastNotificationAt = notif.createdAt;
    }
  }

  if (lastNotificationAt) {
    stats.lastNotificationAt = lastNotificationAt;
  }

  return stats;
}

/**
 * Set notification preferences
 */
export function setNotificationPreferences(
  userId: number,
  prefs: Partial<NotificationPreference>
): NotificationPreference {
  const existing = preferences.get(userId) || {
    userId,
    channels: {
      inApp: true,
      email: true,
      push: false,
      sms: false,
    },
    types: {
      team_invite: true,
      message: true,
      payment: true,
      subscription: true,
      system: true,
      security: true,
      collaboration: true,
      achievement: true,
    },
  };

  const updated = { ...existing, ...prefs, userId };
  preferences.set(userId, updated);

  return updated;
}

/**
 * Get notification preferences
 */
export function getNotificationPreferences(userId: number): NotificationPreference {
  return (
    preferences.get(userId) || {
      userId,
      channels: {
        inApp: true,
        email: true,
        push: false,
        sms: false,
      },
      types: {
        team_invite: true,
        message: true,
        payment: true,
        subscription: true,
        system: true,
        security: true,
        collaboration: true,
        achievement: true,
      },
    }
  );
}

/**
 * Should send notification
 */
export function shouldSendNotification(
  userId: number,
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  const prefs = getNotificationPreferences(userId);

  // Check if type is enabled
  if (!prefs.types[type]) return false;

  // Check if channel is enabled
  if (channel === 'in_app' && !prefs.channels.inApp) return false;
  if (channel === 'email' && !prefs.channels.email) return false;
  if (channel === 'push' && !prefs.channels.push) return false;
  if (channel === 'sms' && !prefs.channels.sms) return false;

  // Check quiet hours
  if (prefs.quietHours?.enabled && channel !== 'in_app') {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (currentTime >= prefs.quietHours.startTime && currentTime <= prefs.quietHours.endTime) {
      return false;
    }
  }

  return true;
}

/**
 * Process notification queue
 */
export async function processNotificationQueue(): Promise<number> {
  let processed = 0;

  while (notificationQueue.length > 0) {
    const notif = notificationQueue.shift();
    if (!notif) break;

    const prefs = getNotificationPreferences(notif.userId);

    // Send through enabled channels
    for (const channel of notif.channels) {
      if (shouldSendNotification(notif.userId, notif.type, channel)) {
        // TODO: Implement actual sending logic
        // - Email: Use email service
        // - Push: Use push notification service
        // - SMS: Use SMS service
        // - In-app: Already stored in database
        
        console.log(`[Notification] Sending ${channel} notification to user ${notif.userId}`);
      }
    }

    processed++;
  }

  return processed;
}

/**
 * Cleanup expired notifications
 */
export function cleanupExpiredNotifications(): number {
  const now = new Date();
  let cleaned = 0;

  const idsToDelete: string[] = [];

  for (const [id, notif] of notifications) {
    if (now > notif.expiresAt) {
      idsToDelete.push(id);
      cleaned++;
    }
  }

  idsToDelete.forEach((id) => deleteNotification(id));
  console.log(`[Notification] Cleaned up ${cleaned} expired notifications`);

  return cleaned;
}

/**
 * Get notification by ID
 */
export function getNotification(notificationId: string): Notification | undefined {
  return notifications.get(notificationId);
}

/**
 * Bulk create notifications
 */
export function bulkCreateNotifications(
  userIds: number[],
  type: NotificationType,
  title: string,
  message: string,
  options?: Parameters<typeof createNotification>[4]
): Notification[] {
  const results: Notification[] = [];

  for (const userId of userIds) {
    const notif = createNotification(userId, type, title, message, options);
    results.push(notif);
  }

  return results;
}

/**
 * Get notification summary
 */
export function getNotificationSummary(userId: number): {
  unreadCount: number;
  byType: Record<string, number>;
  recentNotifications: Notification[];
} {
  const stats = getNotificationStats(userId);
  const recent = getUserNotifications(userId, { limit: 5 });

  return {
    unreadCount: stats.unreadCount,
    byType: stats.byType,
    recentNotifications: recent,
  };
}

/**
 * Export notifications
 */
export function exportNotifications(userId: number): string {
  const userNotifs = getUserNotifications(userId, { limit: 1000 });
  return JSON.stringify(userNotifs, null, 2);
}
