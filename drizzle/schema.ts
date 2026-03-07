import { int, mysqlTable, varchar, text, timestamp, mysqlEnum, decimal, json, boolean } from "drizzle-orm/mysql-core";

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

/**
 * User Profiles table - stores user profile customization
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  avatar: text("avatar"),
  bio: text("bio"),
  status: varchar("status", { length: 100 }),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Chat Templates table - stores quick response templates for common questions
 */
export const chatTemplates = mysqlTable("chatTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatTemplate = typeof chatTemplates.$inferSelect;
export type InsertChatTemplate = typeof chatTemplates.$inferInsert;


/**
 * SSLCommerz Payment Transactions table - stores payment transaction records
 */
export const sslcommerzTransactions = mysqlTable("sslcommerzTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionId: varchar("transactionId", { length: 100 }).notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro", "premium"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  sslcommerzRef: varchar("sslcommerzRef", { length: 100 }),
  bankTransactionId: varchar("bankTransactionId", { length: 100 }),
  cardBrand: varchar("cardBrand", { length: 50 }),
  cardNumber: varchar("cardNumber", { length: 20 }),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SslcommerzTransaction = typeof sslcommerzTransactions.$inferSelect;
export type InsertSslcommerzTransaction = typeof sslcommerzTransactions.$inferInsert;

/**
 * Payment Invoices table - stores invoice records for transactions
 */
export const paymentInvoices = mysqlTable("paymentInvoices", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull().references(() => sslcommerzTransactions.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  invoiceDate: timestamp("invoiceDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  pdfUrl: text("pdfUrl"),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "paid", "overdue"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentInvoice = typeof paymentInvoices.$inferSelect;
export type InsertPaymentInvoice = typeof paymentInvoices.$inferInsert;

/**
 * Subscription Plans table - stores available subscription plans
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).notNull(),
  features: json("features").$type<string[]>().default([]),
  videoLimit: int("videoLimit").default(0),
  videoDuration: int("videoDuration").default(0), // in seconds
  videoQuality: varchar("videoQuality", { length: 20 }).default("480p"),
  imageLimit: int("imageLimit").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User Subscriptions table - stores active subscriptions for users
 */
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  planId: int("planId").notNull().references(() => subscriptionPlans.id),
  transactionId: int("transactionId").references(() => sslcommerzTransactions.id),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "suspended"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
