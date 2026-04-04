import { TRPCError } from "@trpc/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  stripe: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  sslcommerz: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },
  payment: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute per user
  },
  checkout: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute per user
  },
};

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  key: string,
  limitType: keyof typeof DEFAULT_CONFIGS = "payment"
): boolean {
  const config = DEFAULT_CONFIGS[limitType];
  const now = Date.now();

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return true;
  }

  const record = rateLimitStore[key];

  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + config.windowMs;
    return true;
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return false;
  }

  // Increment counter
  record.count++;
  return true;
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(
  key: string,
  limitType: keyof typeof DEFAULT_CONFIGS = "payment"
): number {
  const config = DEFAULT_CONFIGS[limitType];
  const now = Date.now();

  if (!rateLimitStore[key]) {
    return config.maxRequests;
  }

  const record = rateLimitStore[key];

  // Reset if window has passed
  if (now > record.resetTime) {
    return config.maxRequests;
  }

  return Math.max(0, config.maxRequests - record.count);
}

/**
 * Get reset time for a key
 */
export function getResetTime(
  key: string,
  limitType: keyof typeof DEFAULT_CONFIGS = "payment"
): number {
  if (!rateLimitStore[key]) {
    return Date.now();
  }

  return rateLimitStore[key].resetTime;
}

/**
 * Rate limit middleware for tRPC procedures
 */
export function createRateLimitMiddleware(
  limitType: keyof typeof DEFAULT_CONFIGS = "payment"
) {
  return async ({ ctx, next }: any) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be authenticated",
      });
    }

    const key = `${limitType}:${userId}`;

    if (!checkRateLimit(key, limitType)) {
      const resetTime = getResetTime(key, limitType);
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      });
    }

    // Add rate limit info to context
    return next({
      ctx: {
        ...ctx,
        rateLimit: {
          remaining: getRemainingRequests(key, limitType),
          resetTime: getResetTime(key, limitType),
        },
      },
    });
  };
}

/**
 * IP-based rate limiting for public endpoints
 */
export function checkIPRateLimit(
  ip: string,
  limitType: keyof typeof DEFAULT_CONFIGS = "payment"
): boolean {
  const key = `ip:${ip}`;
  return checkRateLimit(key, limitType);
}

/**
 * Clean up old rate limit records (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;

  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
      cleaned++;
    }
  }

  console.log(`[RateLimit] Cleaned up ${cleaned} expired records`);
}

/**
 * Schedule cleanup every 5 minutes
 */
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
