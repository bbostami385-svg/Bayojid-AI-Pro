/**
 * Search & Quota Database Service
 * Migrates search index and user quotas from in-memory to Drizzle ORM
 */

import { db } from "./db";
import { searchIndex, userQuotas, userPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ===== SEARCH INDEX =====

export interface SearchIndexData {
  userId: number;
  conversationId: number;
  messageId: number;
  keywords: string;
  content: string;
  relevanceScore: number;
}

/**
 * Save search index entry to database
 */
export async function saveSearchIndex(data: SearchIndexData) {
  try {
    await db.insert(searchIndex).values({
      userId: data.userId,
      conversationId: data.conversationId,
      messageId: data.messageId,
      keywords: data.keywords,
      content: data.content,
      relevanceScore: data.relevanceScore.toString(),
    });

    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Error saving search index:", error);
    throw error;
  }
}

/**
 * Search user's conversations
 */
export async function searchUserConversations(userId: number, query: string, limit: number = 20) {
  try {
    const results = await db
      .select()
      .from(searchIndex)
      .where(eq(searchIndex.userId, userId))
      .limit(limit);

    // Filter by query (simple text matching)
    return results.filter(
      (r) =>
        r.keywords?.includes(query.toLowerCase()) ||
        r.content?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching conversations:", error);
    throw error;
  }
}

/**
 * Get trending topics
 */
export async function getTrendingTopics(limit: number = 10) {
  try {
    const allResults = await db.select().from(searchIndex);

    // Count keyword frequencies
    const keywordCounts: Record<string, number> = {};
    allResults.forEach((result) => {
      if (result.keywords) {
        const keywords = result.keywords.split(",");
        keywords.forEach((kw) => {
          const key = kw.trim().toLowerCase();
          keywordCounts[key] = (keywordCounts[key] || 0) + 1;
        });
      }
    });

    // Sort by frequency
    const trending = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));

    return trending;
  } catch (error) {
    console.error("Error getting trending topics:", error);
    throw error;
  }
}

/**
 * Delete search index for user
 */
export async function deleteUserSearchIndex(userId: number) {
  try {
    await db.delete(searchIndex).where(eq(searchIndex.userId, userId));
    return { success: true, userId };
  } catch (error) {
    console.error("Error deleting search index:", error);
    throw error;
  }
}

// ===== USER QUOTAS =====

export interface QuotaData {
  userId: number;
  tier: "free" | "pro" | "enterprise";
  messagesUsed: number;
  messagesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  exportsUsed: number;
  exportsLimit: number;
  storageUsed: number;
  storageLimit: number;
  collaborationsUsed: number;
  collaborationsLimit: number;
}

/**
 * Save or update user quota
 */
export async function saveUserQuota(data: QuotaData) {
  try {
    const existing = await db
      .select()
      .from(userQuotas)
      .where(eq(userQuotas.userId, data.userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userQuotas)
        .set({
          tier: data.tier,
          messagesUsed: data.messagesUsed,
          messagesLimit: data.messagesLimit,
          apiCallsUsed: data.apiCallsUsed,
          apiCallsLimit: data.apiCallsLimit,
          exportsUsed: data.exportsUsed,
          exportsLimit: data.exportsLimit,
          storageUsed: data.storageUsed,
          storageLimit: data.storageLimit,
          collaborationsUsed: data.collaborationsUsed,
          collaborationsLimit: data.collaborationsLimit,
          updatedAt: new Date(),
        })
        .where(eq(userQuotas.userId, data.userId));
    } else {
      await db.insert(userQuotas).values({
        userId: data.userId,
        tier: data.tier,
        messagesUsed: data.messagesUsed,
        messagesLimit: data.messagesLimit,
        apiCallsUsed: data.apiCallsUsed,
        apiCallsLimit: data.apiCallsLimit,
        exportsUsed: data.exportsUsed,
        exportsLimit: data.exportsLimit,
        storageUsed: data.storageUsed,
        storageLimit: data.storageLimit,
        collaborationsUsed: data.collaborationsUsed,
        collaborationsLimit: data.collaborationsLimit,
      });
    }

    return { success: true, userId: data.userId };
  } catch (error) {
    console.error("Error saving user quota:", error);
    throw error;
  }
}

/**
 * Get user quota
 */
export async function getUserQuota(userId: number) {
  try {
    const result = await db
      .select()
      .from(userQuotas)
      .where(eq(userQuotas.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user quota:", error);
    throw error;
  }
}

/**
 * Check if user has exceeded quota
 */
export async function hasExceededQuota(userId: number, quotaType: string): Promise<boolean> {
  try {
    const quota = await getUserQuota(userId);
    if (!quota) return false;

    const quotaMap: Record<string, { used: number; limit: number }> = {
      messages: { used: quota.messagesUsed || 0, limit: quota.messagesLimit || 100 },
      api_calls: { used: quota.apiCallsUsed || 0, limit: quota.apiCallsLimit || 1000 },
      exports: { used: quota.exportsUsed || 0, limit: quota.exportsLimit || 10 },
      storage: { used: quota.storageUsed || 0, limit: quota.storageLimit || 1073741824 },
      collaborations: { used: quota.collaborationsUsed || 0, limit: quota.collaborationsLimit || 0 },
    };

    const current = quotaMap[quotaType];
    if (!current) return false;

    return current.limit > 0 && current.used >= current.limit;
  } catch (error) {
    console.error("Error checking quota:", error);
    throw error;
  }
}

/**
 * Increment quota usage
 */
export async function incrementQuotaUsage(userId: number, quotaType: string, amount: number = 1) {
  try {
    const quota = await getUserQuota(userId);
    if (!quota) return { success: false };

    const updates: Record<string, any> = { updatedAt: new Date() };

    switch (quotaType) {
      case "messages":
        updates.messagesUsed = (quota.messagesUsed || 0) + amount;
        break;
      case "api_calls":
        updates.apiCallsUsed = (quota.apiCallsUsed || 0) + amount;
        break;
      case "exports":
        updates.exportsUsed = (quota.exportsUsed || 0) + amount;
        break;
      case "storage":
        updates.storageUsed = (quota.storageUsed || 0) + amount;
        break;
      case "collaborations":
        updates.collaborationsUsed = (quota.collaborationsUsed || 0) + amount;
        break;
    }

    await db.update(userQuotas).set(updates).where(eq(userQuotas.userId, userId));

    return { success: true, userId, quotaType, newUsage: updates[`${quotaType}Used`] };
  } catch (error) {
    console.error("Error incrementing quota:", error);
    throw error;
  }
}

/**
 * Reset monthly quotas
 */
export async function resetMonthlyQuotas() {
  try {
    const allQuotas = await db.select().from(userQuotas);

    for (const quota of allQuotas) {
      await db
        .update(userQuotas)
        .set({
          messagesUsed: 0,
          apiCallsUsed: 0,
          exportsUsed: 0,
          resetDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userQuotas.userId, quota.userId));
    }

    return { success: true, count: allQuotas.length };
  } catch (error) {
    console.error("Error resetting quotas:", error);
    throw error;
  }
}

// ===== USER PREFERENCES =====

export interface PreferencesData {
  userId: number;
  theme: "light" | "dark" | "auto";
  language: string;
  fontSize: string;
  borderRadius: string;
  notifications: boolean;
  emailNotifications: boolean;
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(data: PreferencesData) {
  try {
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, data.userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set({
          theme: data.theme,
          language: data.language,
          fontSize: data.fontSize,
          borderRadius: data.borderRadius,
          notifications: data.notifications,
          emailNotifications: data.emailNotifications,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, data.userId));
    } else {
      await db.insert(userPreferences).values({
        userId: data.userId,
        theme: data.theme,
        language: data.language,
        fontSize: data.fontSize,
        borderRadius: data.borderRadius,
        notifications: data.notifications,
        emailNotifications: data.emailNotifications,
      });
    }

    return { success: true, userId: data.userId };
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: number) {
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    throw error;
  }
}
