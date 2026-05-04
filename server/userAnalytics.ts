/**
 * Advanced User Analytics Service
 * Tracks user behavior, engagement, and usage patterns
 */

export interface UserAnalyticsEvent {
  id: string;
  userId: number;
  eventType: 'login' | 'logout' | 'chat_start' | 'chat_end' | 'message_sent' | 'model_switch' | 'export' | 'share' | 'search' | 'template_use';
  eventData: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number; // in milliseconds
}

export interface UserAnalyticsMetrics {
  userId: number;
  totalLogins: number;
  totalChats: number;
  totalMessages: number;
  averageSessionDuration: number;
  favoriteModel: string;
  mostUsedFeature: string;
  lastActiveAt: Date;
  engagementScore: number; // 0-100
  retentionStatus: 'active' | 'inactive' | 'churned';
  preferences: {
    preferredModel: string;
    preferredLanguage: string;
    preferredTheme: 'light' | 'dark';
  };
}

export interface UserBehaviorPattern {
  userId: number;
  pattern: 'power_user' | 'casual_user' | 'inactive_user' | 'new_user';
  peakUsageTime: string; // e.g., "14:00-16:00"
  averageChatsPerDay: number;
  averageMessagesPerChat: number;
  conversionProbability: number; // 0-1
  churnRisk: number; // 0-1
}

// In-memory storage for analytics events
const analyticsEvents = new Map<string, UserAnalyticsEvent>();
const userMetrics = new Map<number, UserAnalyticsMetrics>();
const behaviorPatterns = new Map<number, UserBehaviorPattern>();

/**
 * Track a user analytics event
 */
export function trackEvent(event: Omit<UserAnalyticsEvent, 'id' | 'timestamp'>): UserAnalyticsEvent {
  const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const analyticsEvent: UserAnalyticsEvent = {
    ...event,
    id,
    timestamp: new Date(),
  };
  analyticsEvents.set(id, analyticsEvent);
  updateUserMetrics(event.userId);
  return analyticsEvent;
}

/**
 * Get user analytics metrics
 */
export function getUserMetrics(userId: number): UserAnalyticsMetrics | undefined {
  return userMetrics.get(userId);
}

/**
 * Get user behavior pattern
 */
export function getUserBehaviorPattern(userId: number): UserBehaviorPattern | undefined {
  return behaviorPatterns.get(userId);
}

/**
 * Update user metrics based on recent events
 */
function updateUserMetrics(userId: number): void {
  const userEvents = Array.from(analyticsEvents.values()).filter((e) => e.userId === userId);

  if (userEvents.length === 0) return;

  const logins = userEvents.filter((e) => e.eventType === 'login').length;
  const chats = userEvents.filter((e) => e.eventType === 'chat_start').length;
  const messages = userEvents.filter((e) => e.eventType === 'message_sent').length;

  const sessionDurations = userEvents
    .filter((e) => e.duration)
    .map((e) => e.duration || 0);
  const avgSessionDuration = sessionDurations.length > 0 ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length : 0;

  const modelEvents = userEvents.filter((e) => e.eventType === 'model_switch');
  const favoriteModel = modelEvents.length > 0 ? (modelEvents[modelEvents.length - 1].eventData.model as string) || 'unknown' : 'unknown';

  const featureUsage = {
    export: userEvents.filter((e) => e.eventType === 'export').length,
    share: userEvents.filter((e) => e.eventType === 'share').length,
    search: userEvents.filter((e) => e.eventType === 'search').length,
    template_use: userEvents.filter((e) => e.eventType === 'template_use').length,
  };

  const mostUsedFeature = Object.entries(featureUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'chat';

  const lastActiveAt = userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : new Date();

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, (messages * 2 + chats * 5 + logins * 3) / 2);

  // Determine retention status
  const daysSinceActive = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
  const retentionStatus: 'active' | 'inactive' | 'churned' = daysSinceActive < 1 ? 'active' : daysSinceActive < 7 ? 'inactive' : 'churned';

  const metrics: UserAnalyticsMetrics = {
    userId,
    totalLogins: logins,
    totalChats: chats,
    totalMessages: messages,
    averageSessionDuration: avgSessionDuration,
    favoriteModel,
    mostUsedFeature,
    lastActiveAt,
    engagementScore,
    retentionStatus,
    preferences: {
      preferredModel: favoriteModel,
      preferredLanguage: 'en',
      preferredTheme: 'dark',
    },
  };

  userMetrics.set(userId, metrics);
  updateBehaviorPattern(userId, metrics);
}

/**
 * Update user behavior pattern
 */
function updateBehaviorPattern(userId: number, metrics: UserAnalyticsMetrics): void {
  const userEvents = Array.from(analyticsEvents.values()).filter((e) => e.userId === userId);
  const daysSinceFirstEvent = userEvents.length > 0 ? (Date.now() - userEvents[0].timestamp.getTime()) / (1000 * 60 * 60 * 24) : 0;

  let pattern: 'power_user' | 'casual_user' | 'inactive_user' | 'new_user';
  if (daysSinceFirstEvent < 1) {
    pattern = 'new_user';
  } else if (metrics.engagementScore > 70) {
    pattern = 'power_user';
  } else if (metrics.engagementScore > 30) {
    pattern = 'casual_user';
  } else {
    pattern = 'inactive_user';
  }

  // Calculate peak usage time (simplified)
  const hourCounts = new Map<number, number>();
  userEvents.forEach((e) => {
    const hour = e.timestamp.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  let peakHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  const peakUsageTime = `${String(peakHour).padStart(2, '0')}:00-${String(peakHour + 1).padStart(2, '0')}:00`;

  const averageChatsPerDay = daysSinceFirstEvent > 0 ? metrics.totalChats / daysSinceFirstEvent : 0;
  const averageMessagesPerChat = metrics.totalChats > 0 ? metrics.totalMessages / metrics.totalChats : 0;

  // Conversion probability based on engagement
  const conversionProbability = Math.min(1, metrics.engagementScore / 100);

  // Churn risk (higher if inactive)
  const daysSinceActive = (Date.now() - metrics.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
  const churnRisk = Math.min(1, daysSinceActive / 30);

  const behaviorPattern: UserBehaviorPattern = {
    userId,
    pattern,
    peakUsageTime,
    averageChatsPerDay,
    averageMessagesPerChat,
    conversionProbability,
    churnRisk,
  };

  behaviorPatterns.set(userId, behaviorPattern);
}

/**
 * Get all analytics events for a user
 */
export function getUserEvents(userId: number, limit: number = 100): UserAnalyticsEvent[] {
  return Array.from(analyticsEvents.values())
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Get analytics summary for a user
 */
export function getAnalyticsSummary(userId: number) {
  const metrics = getUserMetrics(userId);
  const pattern = getUserBehaviorPattern(userId);
  const events = getUserEvents(userId, 50);

  return {
    metrics,
    pattern,
    recentEvents: events,
    summary: {
      totalEvents: Array.from(analyticsEvents.values()).filter((e) => e.userId === userId).length,
      uniqueSessions: new Set(
        Array.from(analyticsEvents.values())
          .filter((e) => e.userId === userId)
          .map((e) => e.sessionId)
      ).size,
      lastActiveAt: metrics?.lastActiveAt || new Date(),
      engagementTrend: calculateEngagementTrend(userId),
    },
  };
}

/**
 * Calculate engagement trend (last 7 days vs previous 7 days)
 */
function calculateEngagementTrend(userId: number): number {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const userEvents = Array.from(analyticsEvents.values()).filter((e) => e.userId === userId);

  const lastWeekEvents = userEvents.filter((e) => e.timestamp.getTime() > sevenDaysAgo).length;
  const previousWeekEvents = userEvents.filter((e) => e.timestamp.getTime() > fourteenDaysAgo && e.timestamp.getTime() <= sevenDaysAgo).length;

  if (previousWeekEvents === 0) return 0;
  return ((lastWeekEvents - previousWeekEvents) / previousWeekEvents) * 100;
}

/**
 * Get top users by engagement
 */
export function getTopUsersByEngagement(limit: number = 10): UserAnalyticsMetrics[] {
  return Array.from(userMetrics.values())
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit);
}

/**
 * Get users at risk of churn
 */
export function getUsersAtChurnRisk(riskThreshold: number = 0.7): UserBehaviorPattern[] {
  return Array.from(behaviorPatterns.values())
    .filter((p) => p.churnRisk > riskThreshold)
    .sort((a, b) => b.churnRisk - a.churnRisk);
}

/**
 * Clean up old analytics events
 */
export function cleanupOldEvents(daysOld: number = 90): number {
  const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  analyticsEvents.forEach((event, id) => {
    if (event.timestamp.getTime() < cutoffTime) {
      analyticsEvents.delete(id);
      deletedCount++;
    }
  });

  return deletedCount;
}

/**
 * Export analytics data
 */
export function exportAnalyticsData(userId?: number) {
  const events = userId ? getUserEvents(userId, 1000) : Array.from(analyticsEvents.values());

  return {
    exportDate: new Date(),
    totalEvents: events.length,
    events,
    metrics: userId ? [getUserMetrics(userId)] : Array.from(userMetrics.values()),
    patterns: userId ? [getUserBehaviorPattern(userId)] : Array.from(behaviorPatterns.values()),
  };
}
