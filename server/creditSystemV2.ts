import { getDb } from "./db";
import { users, userCredits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Credit System Configuration - Updated with Fair Usage Policy
 * Daily credit allocation per tier + Monthly safe zone
 */
export const CREDIT_CONFIG = {
  free: {
    dailyCredits: 100,
    monthlyCredits: 2000,
    price: 0,
    tier: "free",
    gpt5Limit: 0, // Not allowed
    fairUsagePolicy: true,
    softLimit: false,
  },
  pro: {
    dailyCredits: 1000,
    monthlyCredits: 20000,
    price: 9.99,
    tier: "pro",
    gpt5Limit: 0, // Not allowed
    fairUsagePolicy: true,
    softLimit: false,
  },
  premium: {
    dailyCredits: 5000,
    monthlyCredits: 60000, // Safe zone: 40,000-70,000
    price: 29.99,
    tier: "premium",
    gpt5Limit: 25, // 20-30% usage allowed
    fairUsagePolicy: true,
    softLimit: true, // Soft limit instead of hard limit
    safeZoneMin: 40000,
    safeZoneMax: 70000,
  },
  enterprise: {
    dailyCredits: 50000, // Soft limit, not unlimited
    monthlyCredits: 1500000, // Soft limit
    price: 99.99,
    tier: "enterprise",
    gpt5Limit: 30, // Max 30% usage
    fairUsagePolicy: true,
    softLimit: true,
    fairUsageThreshold: 80, // Warn at 80% usage
  },
};

/**
 * Credit costs for different operations
 */
export const CREDIT_COSTS = {
  // Chat operations - Free models
  "chat-gemini-flash": 1,
  "chat-deepseek": 1,
  "chat-qwen": 1,
  "chat-gpt-mini": 1,

  // Chat operations - Pro models
  "chat-pro": 5,

  // Chat operations - Premium models (GPT-5 restricted)
  "chat-gpt5": 30, // Heavy usage cost
  "chat-claude-mythos": 10,
  "chat-grok": 10,
  "chat-gemini3": 10,
  "chat-perplexity": 8,

  // Video editing
  "video-edit-free": 10,
  "video-edit-pro": 50,
  "video-edit-premium": 100,

  // Image generation
  "image-gen-free": 5,
  "image-gen-pro": 20,
  "image-gen-premium": 50,

  // Website builder
  "website-create": 20,
  "website-publish": 50,

  // AI agent creation
  "agent-create": 30,
  "agent-deploy": 100,

  // Automation workflow
  "workflow-create": 15,
  "workflow-execute": 5,

  // Custom model upload
  "model-upload": 200,
  "model-train": 500,

  // Analytics
  "analytics-export": 10,
  "report-generate": 20,
};

/**
 * Deduct credits from user's balance with Fair Usage Policy
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  modelType?: string
) {
  const db = getDb();

  const currentCredits = await getUserCredits(userId);
  const tierConfig = CREDIT_CONFIG[currentCredits.tier as keyof typeof CREDIT_CONFIG];

  // Check GPT-5 usage restrictions
  if (modelType === "gpt5" && tierConfig.gpt5Limit && tierConfig.gpt5Limit < 30) {
    return {
      success: false,
      message: `GPT-5 is not available for ${currentCredits.tier} tier. Upgrade to Premium or Enterprise.`,
      balance: currentCredits.balance,
      restricted: true,
    };
  }

  // Fair Usage Policy: Check if user is exceeding limits
  if (tierConfig.fairUsagePolicy && tierConfig.softLimit) {
    const monthlyUsagePercentage =
      ((tierConfig.monthlyCredits - currentCredits.balance) / tierConfig.monthlyCredits) * 100;

    if (monthlyUsagePercentage > 90) {
      return {
        success: false,
        message: `Fair Usage Policy: You've reached 90% of your monthly limit. Please wait for next month or upgrade.`,
        balance: currentCredits.balance,
        fairUsageViolation: true,
      };
    }

    if (monthlyUsagePercentage > 80) {
      console.warn(`[FAIR-USE-WARNING] User ${userId} at ${monthlyUsagePercentage.toFixed(1)}% monthly usage`);
    }
  }

  // Soft limit: Allow overdraft but warn
  if (currentCredits.balance < amount && !tierConfig.softLimit) {
    return {
      success: false,
      message: `Insufficient credits. Required: ${amount}, Available: ${currentCredits.balance}`,
      balance: currentCredits.balance,
    };
  }

  const newBalance = Math.max(0, currentCredits.balance - amount);

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
    })
    .where(eq(userCredits.userId, userId));

  console.log(`[CREDIT] User ${userId} deducted ${amount} credits for ${reason}. New balance: ${newBalance}`);

  return {
    success: true,
    message: `Successfully deducted ${amount} credits`,
    balance: newBalance,
    reason,
    modelType,
  };
}

/**
 * Calculate cost for model usage with restrictions
 */
export function calculateModelCost(
  modelName: string,
  userTier: string,
  duration: number = 1
): { cost: number; allowed: boolean; reason?: string } {
  const tierConfig = CREDIT_CONFIG[userTier as keyof typeof CREDIT_CONFIG];

  // Check GPT-5 restrictions
  if (modelName === "gpt5" || modelName === "GPT-5") {
    if (!tierConfig.gpt5Limit || tierConfig.gpt5Limit === 0) {
      return {
        cost: 0,
        allowed: false,
        reason: `GPT-5 is not available for ${userTier} tier. Upgrade to Premium or Enterprise.`,
      };
    }

    if (tierConfig.gpt5Limit < 30) {
      return {
        cost: 0,
        allowed: false,
        reason: `GPT-5 usage is limited to ${tierConfig.gpt5Limit}% for ${userTier} tier.`,
      };
    }
  }

  const costKey = `chat-${modelName.toLowerCase()}` as keyof typeof CREDIT_COSTS;
  const baseCost = CREDIT_COSTS[costKey] || CREDIT_COSTS["chat-pro"] || 5;

  return {
    cost: baseCost * duration,
    allowed: true,
  };
}

/**
 * Check if model usage is allowed for tier
 */
export function isModelAllowedForTier(
  modelName: string,
  tier: string
): { allowed: boolean; reason?: string } {
  const tierConfig = CREDIT_CONFIG[tier as keyof typeof CREDIT_CONFIG];

  // GPT-5 restrictions
  if (modelName === "gpt5" || modelName === "GPT-5") {
    if (!tierConfig.gpt5Limit || tierConfig.gpt5Limit === 0) {
      return {
        allowed: false,
        reason: `GPT-5 is not available for ${tier} tier. Upgrade to Premium or Enterprise.`,
      };
    }
  }

  // Heavy models auto-restricted for free tier
  const heavyModels = ["gpt5", "claude-mythos", "grok"];
  if (tier === "free" && heavyModels.some((m) => modelName.toLowerCase().includes(m))) {
    return {
      allowed: false,
      reason: `Heavy models are not available for free tier. Upgrade to Pro or Premium.`,
    };
  }

  return { allowed: true };
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string) {
  const db = getDb();

  const creditRecord = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (!creditRecord.length) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userTier = (user[0].tier || "free") as keyof typeof CREDIT_CONFIG;
    const tierConfig = CREDIT_CONFIG[userTier];
    const dailyCredits = tierConfig.dailyCredits;

    await db.insert(userCredits).values({
      userId,
      balance: dailyCredits,
      dailyLimit: dailyCredits,
      lastResetDate: new Date(),
      tier: userTier,
    });

    return {
      userId,
      balance: dailyCredits,
      dailyLimit: dailyCredits,
      tier: userTier,
    };
  }

  const credit = creditRecord[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(credit.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);

  if (lastReset < today) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userTier = (user[0]?.tier || "free") as keyof typeof CREDIT_CONFIG;
    const tierConfig = CREDIT_CONFIG[userTier];
    const dailyCredits = tierConfig.dailyCredits;

    await db
      .update(userCredits)
      .set({
        balance: dailyCredits,
        dailyLimit: dailyCredits,
        lastResetDate: today,
      })
      .where(eq(userCredits.userId, userId));

    return {
      userId,
      balance: dailyCredits,
      dailyLimit: dailyCredits,
      tier: userTier,
    };
  }

  return {
    userId: credit.userId,
    balance: credit.balance,
    dailyLimit: credit.dailyLimit,
    tier: credit.tier,
  };
}

/**
 * Get tier info with monthly credit calculation
 */
export function getTierInfo(tier: string) {
  const tierConfig = CREDIT_CONFIG[tier as keyof typeof CREDIT_CONFIG];
  if (!tierConfig) {
    return CREDIT_CONFIG.free;
  }
  return {
    ...tierConfig,
    monthlyCredits: tierConfig.monthlyCredits || tierConfig.dailyCredits * 20,
  };
}

/**
 * Check if user is in safe zone for monthly usage
 */
export function checkSafeZone(tier: string, currentBalance: number): {
  inSafeZone: boolean;
  status: "healthy" | "warning" | "critical";
  message: string;
} {
  const tierConfig = CREDIT_CONFIG[tier as keyof typeof CREDIT_CONFIG];

  if (!tierConfig.safeZoneMin || !tierConfig.safeZoneMax) {
    return {
      inSafeZone: true,
      status: "healthy",
      message: "No safe zone defined for this tier",
    };
  }

  if (currentBalance >= tierConfig.safeZoneMin && currentBalance <= tierConfig.safeZoneMax) {
    return {
      inSafeZone: true,
      status: "healthy",
      message: `You're in the safe zone (${tierConfig.safeZoneMin}-${tierConfig.safeZoneMax} credits)`,
    };
  }

  if (currentBalance < tierConfig.safeZoneMin) {
    return {
      inSafeZone: false,
      status: "critical",
      message: `Below safe zone. Current: ${currentBalance}, Min: ${tierConfig.safeZoneMin}`,
    };
  }

  return {
    inSafeZone: false,
    status: "warning",
    message: `Above safe zone. Current: ${currentBalance}, Max: ${tierConfig.safeZoneMax}`,
  };
}
