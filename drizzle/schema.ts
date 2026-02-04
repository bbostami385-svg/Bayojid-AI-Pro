import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Conversations table - stores chat sessions for each user
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull().default("নতুন কথোপকথন"),
  personality: mysqlEnum("personality", ["friendly", "professional", "teacher", "creative"]).default("friendly").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages table - stores individual messages in conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Conversation Shares table - stores shared links for conversations
 */
export const conversationShares = mysqlTable("conversationShares", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type ConversationShare = typeof conversationShares.$inferSelect;
export type InsertConversationShare = typeof conversationShares.$inferInsert;


/**
 * Premium Subscriptions table - stores user subscription information
 */
export const premiumSubscriptions = mysqlTable("premiumSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: mysqlEnum("plan", ["free", "pro", "premium"]).default("free").notNull(),
  messageLimit: int("messageLimit").default(50).notNull(),
  messagesUsed: int("messagesUsed").default(0).notNull(),
  customPromptAllowed: int("customPromptAllowed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
export type InsertPremiumSubscription = typeof premiumSubscriptions.$inferInsert;


/**
 * Message Reactions table - stores emoji reactions on messages
 */
export const messageReactions = mysqlTable("messageReactions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = typeof messageReactions.$inferInsert;


/**
 * Group Chats table - stores group chat information
 */
export const groupChats = mysqlTable("groupChats", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: int("isPublic").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GroupChat = typeof groupChats.$inferSelect;
export type InsertGroupChat = typeof groupChats.$inferInsert;

/**
 * Group Chat Members table - stores members of group chats
 */
export const groupChatMembers = mysqlTable("groupChatMembers", {
  id: int("id").autoincrement().primaryKey(),
  groupChatId: int("groupChatId").notNull().references(() => groupChats.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type GroupChatMember = typeof groupChatMembers.$inferSelect;
export type InsertGroupChatMember = typeof groupChatMembers.$inferInsert;

/**
 * Group Chat Messages table - stores messages in group chats
 */
export const groupChatMessages = mysqlTable("groupChatMessages", {
  id: int("id").autoincrement().primaryKey(),
  groupChatId: int("groupChatId").notNull().references(() => groupChats.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GroupChatMessage = typeof groupChatMessages.$inferSelect;
export type InsertGroupChatMessage = typeof groupChatMessages.$inferInsert;

/**
 * Bookmarks table - stores bookmarked messages
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").notNull().references(() => messages.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * File Uploads table - stores file information
 */
export const fileUploads = mysqlTable("fileUploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").references(() => messages.id, { onDelete: "cascade" }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;
