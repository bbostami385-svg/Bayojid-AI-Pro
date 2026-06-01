/**
 * Templates & Sharing Database Service
 * Migrates prompt templates and conversation shares from in-memory to Drizzle ORM
 */

import { getDb } from "./db";
import { promptTemplates, conversationShares } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ===== PROMPT TEMPLATES =====

export interface TemplateData {
  userId: number;
  templateId: string;
  name: string;
  description?: string;
  category: string;
  template: string;
  variables: string[];
  isPublic: boolean;
  rating: number;
}

/**
 * Save prompt template to database
 */
export async function savePromptTemplate(data: TemplateData) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.templateId, data.templateId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(promptTemplates)
        .set({
          name: data.name,
          description: data.description,
          category: data.category,
          template: data.template,
          variables: JSON.stringify(data.variables),
          isPublic: data.isPublic,
          rating: data.rating.toString(),
          updatedAt: new Date(),
        })
        .where(eq(promptTemplates.templateId, data.templateId));
    } else {
      await db.insert(promptTemplates).values({
        userId: data.userId,
        templateId: data.templateId,
        name: data.name,
        description: data.description,
        category: data.category,
        template: data.template,
        variables: JSON.stringify(data.variables),
        isPublic: data.isPublic,
        rating: data.rating.toString(),
      });
    }

    return { success: true, templateId: data.templateId };
  } catch (error) {
    console.error("Error saving prompt template:", error);
    throw error;
  }
}

/**
 * Get user's prompt templates
 */
export async function getUserTemplates(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.userId, userId));

    return results;
  } catch (error) {
    console.error("Error fetching user templates:", error);
    throw error;
  }
}

/**
 * Get public templates
 */
export async function getPublicTemplates(limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.isPublic, true))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("Error fetching public templates:", error);
    throw error;
  }
}

/**
 * Delete prompt template
 */
export async function deletePromptTemplate(templateId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(promptTemplates)
      .where(eq(promptTemplates.templateId, templateId));

    return { success: true, templateId };
  } catch (error) {
    console.error("Error deleting prompt template:", error);
    throw error;
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const template = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.templateId, templateId))
      .limit(1);

    if (template.length > 0) {
      await db
        .update(promptTemplates)
        .set({
          usageCount: (template[0].usageCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(promptTemplates.templateId, templateId));
    }

    return { success: true, templateId };
  } catch (error) {
    console.error("Error incrementing template usage:", error);
    throw error;
  }
}

// ===== CONVERSATION SHARES =====

export interface ShareData {
  shareId: string;
  conversationId: number;
  ownerId: number;
  sharedWithUserId?: number;
  permission: "view" | "comment" | "edit" | "admin";
  expiresAt?: Date;
  isPublic: boolean;
}

/**
 * Save conversation share to database
 */
export async function saveConversationShare(data: ShareData) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.shareId, data.shareId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(conversationShares)
        .set({
          permission: data.permission,
          expiresAt: data.expiresAt,
          isPublic: data.isPublic,
          updatedAt: new Date(),
        })
        .where(eq(conversationShares.shareId, data.shareId));
    } else {
      await db.insert(conversationShares).values({
        shareId: data.shareId,
        conversationId: data.conversationId,
        ownerId: data.ownerId,
        sharedWithUserId: data.sharedWithUserId,
        permission: data.permission,
        expiresAt: data.expiresAt,
        isPublic: data.isPublic,
      });
    }

    return { success: true, shareId: data.shareId };
  } catch (error) {
    console.error("Error saving conversation share:", error);
    throw error;
  }
}

/**
 * Get shares for a conversation
 */
export async function getConversationShares(conversationId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.conversationId, conversationId));

    return results;
  } catch (error) {
    console.error("Error fetching conversation shares:", error);
    throw error;
  }
}

/**
 * Get shares shared with user
 */
export async function getSharedWithUser(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.sharedWithUserId, userId));

    return results;
  } catch (error) {
    console.error("Error fetching shares with user:", error);
    throw error;
  }
}

/**
 * Get public shares
 */
export async function getPublicShares(limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.isPublic, true))
      .limit(limit);

    return results;
  } catch (error) {
    console.error("Error fetching public shares:", error);
    throw error;
  }
}

/**
 * Delete conversation share
 */
export async function deleteConversationShare(shareId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .delete(conversationShares)
      .where(eq(conversationShares.shareId, shareId));

    return { success: true, shareId };
  } catch (error) {
    console.error("Error deleting conversation share:", error);
    throw error;
  }
}

/**
 * Increment share access count
 */
export async function incrementShareAccess(shareId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const share = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.shareId, shareId))
      .limit(1);

    if (share.length > 0) {
      await db
        .update(conversationShares)
        .set({
          accessCount: (share[0].accessCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(conversationShares.shareId, shareId));
    }

    return { success: true, shareId };
  } catch (error) {
    console.error("Error incrementing share access:", error);
    throw error;
  }
}

/**
 * Check if share has expired
 */
export async function isShareExpired(shareId: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const share = await db
      .select()
      .from(conversationShares)
      .where(eq(conversationShares.shareId, shareId))
      .limit(1);

    if (share.length === 0) return true;

    if (share[0].expiresAt && share[0].expiresAt < new Date()) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking share expiration:", error);
    throw error;
  }
}
