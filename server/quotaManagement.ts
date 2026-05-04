/**
 * Rate Limiting & Quota Management Service
 * Manages per-user API quotas and rate limiting
 */

export type QuotaType = 'messages' | 'api_calls' | 'exports' | 'storage' | 'collaborations';

export interface UserQuota {
  userId: number;
  quotas: Record<QuotaType, {
    limit: number;
    used: number;
    resetDate: Date;
    warningThreshold: number;
  }>;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export interface RateLimitRecord {
  userId: number;
  endpoint: string;
  requestCount: number;
  resetTime: Date;
}

const DEFAULT_QUOTAS: Record<string, Record<QuotaType, number>> = {
  free: {
    messages: 100,
    api_calls: 1000,
    exports: 10,
    storage: 100,
    collaborations: 5,
  },
  pro: {
    messages: 10000,
    api_calls: 100000,
    exports: 1000,
    storage: 10000,
    collaborations: 100,
  },
  enterprise: {
    messages: Infinity,
    api_calls: Infinity,
    exports: Infinity,
    storage: Infinity,
    collaborations: Infinity,
  },
};

const userQuotas = new Map<number, UserQuota>();
const rateLimitRecords = new Map<string, RateLimitRecord>();

export function initializeQuota(userId: number, tier: 'free' | 'pro' | 'enterprise' = 'free'): UserQuota {
  const now = new Date();
  const quotaLimits = DEFAULT_QUOTAS[tier];

  const quota: UserQuota = {
    userId,
    quotas: {
      messages: {
        limit: quotaLimits.messages,
        used: 0,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        warningThreshold: 80,
      },
      api_calls: {
        limit: quotaLimits.api_calls,
        used: 0,
        resetDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        warningThreshold: 80,
      },
      exports: {
        limit: quotaLimits.exports,
        used: 0,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        warningThreshold: 80,
      },
      storage: {
        limit: quotaLimits.storage,
        used: 0,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        warningThreshold: 90,
      },
      collaborations: {
        limit: quotaLimits.collaborations,
        used: 0,
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        warningThreshold: 80,
      },
    },
    tier,
    createdAt: now,
    updatedAt: now,
  };

  userQuotas.set(userId, quota);
  return quota;
}

export function getQuota(userId: number): UserQuota | undefined {
  return userQuotas.get(userId);
}

export function hasQuota(userId: number, quotaType: QuotaType, amount: number = 1): boolean {
  const quota = userQuotas.get(userId);
  if (!quota) return false;

  const typeQuota = quota.quotas[quotaType];
  if (!typeQuota) return false;

  if (new Date() > typeQuota.resetDate) {
    resetQuota(userId, quotaType);
    return hasQuota(userId, quotaType, amount);
  }

  return typeQuota.used + amount <= typeQuota.limit;
}

export function useQuota(userId: number, quotaType: QuotaType, amount: number = 1): boolean {
  if (!hasQuota(userId, quotaType, amount)) {
    return false;
  }

  const quota = userQuotas.get(userId);
  if (!quota) return false;

  quota.quotas[quotaType].used += amount;
  quota.updatedAt = new Date();

  return true;
}

export function getQuotaUsage(userId: number, quotaType: QuotaType): number {
  const quota = userQuotas.get(userId);
  if (!quota) return 0;

  const typeQuota = quota.quotas[quotaType];
  if (!typeQuota || typeQuota.limit === Infinity) return 0;

  return (typeQuota.used / typeQuota.limit) * 100;
}

export function isQuotaWarning(userId: number, quotaType: QuotaType): boolean {
  const usage = getQuotaUsage(userId, quotaType);
  const quota = userQuotas.get(userId);
  if (!quota) return false;

  return usage >= quota.quotas[quotaType].warningThreshold;
}

export function resetQuota(userId: number, quotaType: QuotaType): void {
  const quota = userQuotas.get(userId);
  if (!quota) return;

  const typeQuota = quota.quotas[quotaType];
  if (!typeQuota) return;

  typeQuota.used = 0;
  typeQuota.resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function upgradeTier(userId: number, newTier: 'free' | 'pro' | 'enterprise'): UserQuota | undefined {
  let quota = userQuotas.get(userId);
  if (!quota) {
    quota = initializeQuota(userId, newTier);
  } else {
    quota.tier = newTier;
    const quotaLimits = DEFAULT_QUOTAS[newTier];

    Object.keys(quota.quotas).forEach((key) => {
      const quotaType = key as QuotaType;
      quota!.quotas[quotaType].limit = quotaLimits[quotaType];
    });

    quota.updatedAt = new Date();
  }

  return quota;
}

export function checkRateLimit(userId: number, endpoint: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  let record = rateLimitRecords.get(key);

  if (!record || now > record.resetTime.getTime()) {
    record = {
      userId,
      endpoint,
      requestCount: 1,
      resetTime: new Date(now + config.windowMs),
    };
    rateLimitRecords.set(key, record);
    return { allowed: true };
  }

  if (record.requestCount >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime.getTime() - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.requestCount++;
  return { allowed: true };
}

export function getRateLimitStatus(userId: number, endpoint: string, config: RateLimitConfig) {
  const key = `${userId}:${endpoint}`;
  const record = rateLimitRecords.get(key);

  if (!record) {
    return {
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - record.requestCount),
    limit: config.maxRequests,
    resetTime: record.resetTime,
  };
}

export function getQuotaSummary(userId: number) {
  const quota = userQuotas.get(userId);
  if (!quota) return null;

  const summary: Record<QuotaType, any> = {} as any;

  Object.entries(quota.quotas).forEach(([key, value]) => {
    const quotaType = key as QuotaType;
    const percentage = value.limit === Infinity ? 0 : (value.used / value.limit) * 100;

    summary[quotaType] = {
      limit: value.limit,
      used: value.used,
      remaining: value.limit === Infinity ? Infinity : value.limit - value.used,
      percentage,
      isWarning: percentage >= value.warningThreshold,
    };
  });

  return {
    tier: quota.tier,
    quotas: summary,
    createdAt: quota.createdAt,
    updatedAt: quota.updatedAt,
  };
}

export function cleanupExpiredRecords(): number {
  const now = Date.now();
  let deletedCount = 0;

  rateLimitRecords.forEach((record, key) => {
    if (now > record.resetTime.getTime()) {
      rateLimitRecords.delete(key);
      deletedCount++;
    }
  });

  return deletedCount;
}

export function getAllUserQuotas(): UserQuota[] {
  return Array.from(userQuotas.values());
}

export function getQuotaStatistics() {
  const allQuotas = Array.from(userQuotas.values());

  const tierCounts = { free: 0, pro: 0, enterprise: 0 };
  let totalUsedMessages = 0;
  let totalUsedAPICalls = 0;

  allQuotas.forEach((quota) => {
    tierCounts[quota.tier]++;
    totalUsedMessages += quota.quotas.messages.used;
    totalUsedAPICalls += quota.quotas.api_calls.used;
  });

  return {
    totalUsers: allQuotas.length,
    tierDistribution: tierCounts,
    totalUsedMessages,
    totalUsedAPICalls,
    averageMessageUsagePerUser: allQuotas.length > 0 ? totalUsedMessages / allQuotas.length : 0,
  };
}
