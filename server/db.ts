import { asc, desc, eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversations, messages, conversationShares, premiumSubscriptions, messageReactions, groupChats, groupChatMembers, groupChatMessages, bookmarks, fileUploads, userProfiles, UserProfile, InsertUserProfile, chatTemplates, ChatTemplate, InsertChatTemplate, sslcommerzTransactions, paymentInvoices, subscriptionPlans, userSubscriptions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Chat-related database helpers
 */
export async function createConversation(
  userId: number,
  title: string = "নতুন কথোপকথন"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values({
    userId,
    title,
  });

  return result;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function addMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(messages).values({
    conversationId,
    role,
    content,
  });
}

export async function updateConversationTitle(
  conversationId: number,
  title: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function deleteConversation(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(conversations).where(eq(conversations.id, conversationId));
}


/**
 * Conversation Sharing helpers
 */
export async function createShareLink(conversationId: number, expiresAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return db.insert(conversationShares).values({
    conversationId,
    shareToken,
    expiresAt,
  });
}

export async function getSharedConversation(shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const share = await db
    .select()
    .from(conversationShares)
    .where(eq(conversationShares.shareToken, shareToken))
    .limit(1);

  if (share.length === 0) return null;

  const shareRecord = share[0];
  if (shareRecord.expiresAt && new Date() > shareRecord.expiresAt) {
    return null;
  }

  return shareRecord;
}

export async function deleteShareLink(shareToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(conversationShares).where(eq(conversationShares.shareToken, shareToken));
}


/**
 * Premium Subscription helpers
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateSubscription(
  userId: number,
  plan: "free" | "pro" | "premium",
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserSubscription(userId);
  
  if (existing) {
    return db
      .update(premiumSubscriptions)
      .set({ plan, expiresAt, updatedAt: new Date() })
      .where(eq(premiumSubscriptions.userId, userId));
  } else {
    const messageLimits: Record<string, number> = {
      free: 50,
      pro: 500,
      premium: 10000,
    };

    return db.insert(premiumSubscriptions).values({
      userId,
      plan,
      messageLimit: messageLimits[plan],
      expiresAt,
    });
  }
}

export async function incrementMessageUsage(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(premiumSubscriptions)
    .set({ messagesUsed: sql`${premiumSubscriptions.messagesUsed} + 1` })
    .where(eq(premiumSubscriptions.userId, userId));
}

export async function resetMonthlyUsage() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(premiumSubscriptions)
    .set({ messagesUsed: 0 });
}


export async function addReaction(messageId: number, userId: number, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(messageReactions).values({
    messageId,
    userId,
    emoji,
  });
}

export async function getMessageReactions(messageId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messageReactions).where(eq(messageReactions.messageId, messageId));
}

export async function removeReaction(messageId: number, userId: number, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(messageReactions)
    .where(
      and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji)
      )
    );
}


// Group Chat Functions
export async function createGroupChat(name: string, creatorId: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(groupChats).values({
    name,
    creatorId,
    description,
    isPublic: 1,
  });
  return result;
}

export async function addGroupChatMember(groupChatId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(groupChatMembers).values({
    groupChatId,
    userId,
  });
}

export async function getGroupChatMembers(groupChatId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groupChatMembers).where(eq(groupChatMembers.groupChatId, groupChatId));
}

export async function getGroupChatMessages(groupChatId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(groupChatMessages).where(eq(groupChatMessages.groupChatId, groupChatId)).orderBy(asc(groupChatMessages.createdAt));
}

export async function addGroupChatMessage(groupChatId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(groupChatMessages).values({
    groupChatId,
    userId,
    content,
  });
}

// Bookmark Functions
export async function createBookmark(userId: number, messageId: number, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(bookmarks).values({
    userId,
    messageId,
    title,
  });
}

export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
}

export async function removeBookmark(bookmarkId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));
}

// File Upload Functions
export async function createFileUpload(userId: number, fileName: string, fileUrl: string, fileSize: number, mimeType: string, messageId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(fileUploads).values({
    userId,
    messageId,
    fileName,
    fileUrl,
    fileSize,
    mimeType,
  });
}

export async function getMessageFiles(messageId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(fileUploads).where(eq(fileUploads.messageId, messageId));
}


// User Profile Functions
export async function getUserProfile(userId: number): Promise<UserProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserProfile(userId);
  
  if (existing) {
    return db.update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId));
  } else {
    return db.insert(userProfiles).values({
      userId,
      ...data,
    });
  }
}

export async function updateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(userProfiles)
    .set(data)
    .where(eq(userProfiles.userId, userId));
}

export async function deleteUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(userProfiles).where(eq(userProfiles.userId, userId));
}

// Chat Template Functions
export async function createChatTemplate(userId: number, title: string, content: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(chatTemplates).values({
    userId,
    title,
    content,
    category,
  });
}

export async function getUserChatTemplates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(chatTemplates).where(eq(chatTemplates.userId, userId)).orderBy(desc(chatTemplates.createdAt));
}

export async function getChatTemplate(templateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(chatTemplates).where(eq(chatTemplates.id, templateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateChatTemplate(templateId: number, data: Partial<InsertChatTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(chatTemplates).set(data).where(eq(chatTemplates.id, templateId));
}

export async function deleteChatTemplate(templateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(chatTemplates).where(eq(chatTemplates.id, templateId));
}
