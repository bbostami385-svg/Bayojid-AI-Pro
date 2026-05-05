/**
 * Analytics Database Service
 * Migrates user analytics from in-memory storage to Drizzle ORM
 */

import { db } from "./db";
import { userAnalytics } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface AnalyticsData {
  userId: number;
  totalSessions: number;
  totalMessages: number;
  totalConversations: number;
  averageSessionDuration: number;
  engagementScore: number;
  userPattern: "power_user" | "casual_user" | "inactive_user" | "new_user";
  churnRisk: boolean;
}

/**
 * Save user analytics to database
 */
export async function saveUserAnalytics(data: AnalyticsData) {
  try {
    const existing = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, data.userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userAnalytics)
        .set({
          totalSessions: data.totalSessions,
          totalMessages: data.totalMessages,
          totalConversations: data.totalConversations,
          averageSessionDuration: data.averageSessionDuration,
          engagementScore: data.engagementScore.toString(),
          userPattern: data.userPattern,
          churnRisk: data.churnRisk,
          updatedAt: new Date(),
        })
        .where(eq(userAnalytics.userId, data.userId));
    } else {
      // Insert new record
      await db.insert(userAnalytics).values({
        userId: data.userId,
        totalSessions: data.totalSessions,
        totalMessages: data.totalMessages,
        totalConversations: data.totalConversations,
        averageSessionDuration: data.averageSessionDuration,
        engagementScore: data.engagementScore.toString(),
        userPattern: data.userPattern,
        churnRisk: data.churnRisk,
      });
    }

    return { success: true, userId: data.userId };
  } catch (error) {
    console.error("Error saving user analytics:", error);
    throw error;
  }
}

/**
 * Get user analytics from database
 */
export async function getUserAnalytics(userId: number) {
  try {
    const result = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
}

/**
 * Get all analytics for admin dashboard
 */
export async function getAllAnalytics(limit: number = 100, offset: number = 0) {
  try {
    const results = await db
      .select()
      .from(userAnalytics)
      .limit(limit)
      .offset(offset);

    return results;
  } catch (error) {
    console.error("Error fetching all analytics:", error);
    throw error;
  }
}

/**
 * Get churn risk users
 */
export async function getChurnRiskUsers() {
  try {
    const results = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.churnRisk, true));

    return results;
  } catch (error) {
    console.error("Error fetching churn risk users:", error);
    throw error;
  }
}

/**
 * Update engagement score
 */
export async function updateEngagementScore(userId: number, score: number) {
  try {
    await db
      .update(userAnalytics)
      .set({
        engagementScore: score.toString(),
        updatedAt: new Date(),
      })
      .where(eq(userAnalytics.userId, userId));

    return { success: true, userId, score };
  } catch (error) {
    console.error("Error updating engagement score:", error);
    throw error;
  }
}

/**
 * Bulk save analytics for multiple users
 */
export async function bulkSaveAnalytics(analyticsArray: AnalyticsData[]) {
  try {
    const results = [];
    for (const data of analyticsArray) {
      const result = await saveUserAnalytics(data);
      results.push(result);
    }
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Error bulk saving analytics:", error);
    throw error;
  }
}

/**
 * Get analytics statistics
 */
export async function getAnalyticsStatistics() {
  try {
    const allAnalytics = await db.select().from(userAnalytics);

    const stats = {
      totalUsers: allAnalytics.length,
      averageEngagementScore:
        allAnalytics.reduce((sum, a) => sum + parseFloat(a.engagementScore || "0"), 0) /
        allAnalytics.length,
      churnRiskCount: allAnalytics.filter((a) => a.churnRisk).length,
      powerUsers: allAnalytics.filter((a) => a.userPattern === "power_user").length,
      casualUsers: allAnalytics.filter((a) => a.userPattern === "casual_user").length,
      inactiveUsers: allAnalytics.filter((a) => a.userPattern === "inactive_user").length,
      newUsers: allAnalytics.filter((a) => a.userPattern === "new_user").length,
    };

    return stats;
  } catch (error) {
    console.error("Error calculating analytics statistics:", error);
    throw error;
  }
}

/**
 * Delete user analytics
 */
export async function deleteUserAnalytics(userId: number) {
  try {
    await db.delete(userAnalytics).where(eq(userAnalytics.userId, userId));
    return { success: true, userId };
  } catch (error) {
    console.error("Error deleting user analytics:", error);
    throw error;
  }
}
