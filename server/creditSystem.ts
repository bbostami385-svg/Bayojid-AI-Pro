import { getDb } from "./db";
import { users, userCredits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Credit System Configuration
 * Daily credit allocation per tier
 */
export const CREDIT_CONFIG = {
  free: {
    dailyCredits: 100,
    price: 0,
    tier: "free",
  },
  pro: {
    dailyCredits: 1000,
    price: 9.99,
    tier: "pro",
  },
  premium: {
    dailyCredits: 5000,
    price: 29.99,
    tier: "premium",
  },
  enterprise: {
    dailyCredits: Infinity,
    price: 99.99,
    tier: "enterprise",
  },
};

/**
 * Credit costs for different operations
 */
export const CREDIT_COSTS = {
  // Chat operations
  "chat-free": 1, // Gemini Flash, DeepSeek, Qwen, GPT Mini
  "chat-pro": 5, // Pro models
  "chat-premium": 10, // Premium models

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
    // Initialize credits for new user
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userTier = (user[0].tier || "free") as keyof typeof CREDIT_CONFIG;
    const dailyCredits = CREDIT_CONFIG[userTier]?.dailyCredits || 100;

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

  // Check if we need to reset daily credits
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReset = new Date(credit.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);

  if (lastReset < today) {
    // Reset daily credits
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userTier = (user[0]?.tier || "free") as keyof typeof CREDIT_CONFIG;
    const dailyCredits = CREDIT_CONFIG[userTier]?.dailyCredits || 100;

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
 * Deduct credits from user's balance
 */
export async function deductCredits(userId: string, amount: number, reason: string) {
  const db = getDb();

  const currentCredits = await getUserCredits(userId);

  if (currentCredits.balance < amount) {
    return {
      success: false,
      message: `Insufficient credits. Required: ${amount}, Available: ${currentCredits.balance}`,
      balance: currentCredits.balance,
    };
  }

  const newBalance = currentCredits.balance - amount;

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
    })
    .where(eq(userCredits.userId, userId));

  // Log credit transaction
  console.log(`[CREDIT] User ${userId} deducted ${amount} credits for ${reason}. New balance: ${newBalance}`);

  return {
    success: true,
    message: `Successfully deducted ${amount} credits`,
    balance: newBalance,
    reason,
  };
}

/**
 * Add bonus credits to user
 */
export async function addBonusCredits(userId: string, amount: number, reason: string) {
  const db = getDb();

  const currentCredits = await getUserCredits(userId);
  const newBalance = currentCredits.balance + amount;

  await db
    .update(userCredits)
    .set({
      balance: newBalance,
    })
    .where(eq(userCredits.userId, userId));

  console.log(`[CREDIT] User ${userId} received ${amount} bonus credits for ${reason}. New balance: ${newBalance}`);

  return {
    success: true,
    message: `Successfully added ${amount} bonus credits`,
    balance: newBalance,
    reason,
  };
}

/**
 * Get credit cost for an operation
 */
export function getCreditCost(operation: string): number {
  return CREDIT_COSTS[operation as keyof typeof CREDIT_COSTS] || 0;
}

/**
 * Get tier info
 */
export function getTierInfo(tier: string) {
  const tierConfig = CREDIT_CONFIG[tier as keyof typeof CREDIT_CONFIG];
  if (!tierConfig) {
    return CREDIT_CONFIG.free;
  }
  return tierConfig;
}

/**
 * Calculate cost for model usage
 */
export function calculateModelCost(modelTier: "free" | "pro" | "premium", duration: number = 1): number {
  const costKey = `chat-${modelTier}` as keyof typeof CREDIT_COSTS;
  const baseCost = CREDIT_COSTS[costKey] || 1;
  return baseCost * duration;
}

/**
 * Get all credit transactions for user (if tracking is enabled)
 */
export async function getCreditTransactionHistory(userId: string, limit: number = 50) {
  // This would require a creditTransactions table
  // For now, returning mock data
  return {
    userId,
    transactions: [
      {
        id: "1",
        amount: 10,
        type: "deduct",
        reason: "Video editing",
        timestamp: new Date(),
      },
      {
        id: "2",
        amount: 100,
        type: "add",
        reason: "Daily reset",
        timestamp: new Date(),
      },
    ],
    total: limit,
  };
}
