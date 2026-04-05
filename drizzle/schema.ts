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

/**
 * Stripe Customers table - stores Stripe customer IDs for users
 */
export const stripeCustomers = mysqlTable("stripeCustomers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;

/**
 * Stripe Products table - stores Stripe product information
 */
export const stripeProducts = mysqlTable("stripeProducts", {
  id: int("id").autoincrement().primaryKey(),
  stripeProductId: varchar("stripeProductId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["product", "subscription"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  metadata: json("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeProduct = typeof stripeProducts.$inferSelect;
export type InsertStripeProduct = typeof stripeProducts.$inferInsert;

/**
 * Stripe Prices table - stores Stripe price information
 */
export const stripePrices = mysqlTable("stripePrices", {
  id: int("id").autoincrement().primaryKey(),
  stripePriceId: varchar("stripePriceId", { length: 100 }).notNull().unique(),
  stripeProductId: varchar("stripeProductId", { length: 100 }).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["one_time", "month", "year"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StripePrice = typeof stripePrices.$inferSelect;
export type InsertStripePrice = typeof stripePrices.$inferInsert;

/**
 * Stripe Payment Intents table - stores payment intent records
 */
export const stripePaymentIntents = mysqlTable("stripePaymentIntents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  status: mysqlEnum("status", ["requires_payment_method", "requires_confirmation", "requires_action", "processing", "requires_capture", "canceled", "succeeded"]).notNull(),
  metadata: json("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripePaymentIntent = typeof stripePaymentIntents.$inferSelect;
export type InsertStripePaymentIntent = typeof stripePaymentIntents.$inferInsert;

/**
 * Stripe Subscriptions table - stores Stripe subscription records
 */
export const stripeSubscriptions = mysqlTable("stripeSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "incomplete_expired"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  endedAt: timestamp("endedAt"),
  metadata: json("metadata").$type<Record<string, string>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;
export type InsertStripeSubscription = typeof stripeSubscriptions.$inferInsert;

/**
 * Stripe Invoices table - stores Stripe invoice records
 */
export const stripeInvoices = mysqlTable("stripeInvoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 100 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "uncollectible", "void"]).notNull(),
  pdfUrl: text("pdfUrl"),
  hostedInvoiceUrl: text("hostedInvoiceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeInvoice = typeof stripeInvoices.$inferSelect;
export type InsertStripeInvoice = typeof stripeInvoices.$inferInsert;


/**
 * Notification Deliveries table - stores notification delivery records
 */
export const notificationDeliveries = mysqlTable("notificationDeliveries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  notificationId: varchar("notificationId", { length: 100 }).notNull(),
  channels: varchar("channels", { length: 255 }).notNull(), // comma-separated: email,push,sms,webhook
  recipient: varchar("recipient", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "retrying", "bounced"]).default("pending").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type InsertNotificationDelivery = typeof notificationDeliveries.$inferInsert;

/**
 * Scheduled Reports table - stores scheduled report configurations
 */
export const scheduledReports = mysqlTable("scheduledReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportId: varchar("reportId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", ["activity", "revenue", "performance", "team", "custom"]).notNull(),
  frequency: mysqlEnum("frequency", ["once", "daily", "weekly", "monthly", "quarterly"]).notNull(),
  recipients: json("recipients").$type<string[]>().default([]),
  metrics: json("metrics").$type<string[]>().default([]),
  filters: json("filters").$type<Record<string, unknown>>().default({}),
  template: varchar("template", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastGeneratedAt: timestamp("lastGeneratedAt"),
  nextScheduledAt: timestamp("nextScheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = typeof scheduledReports.$inferInsert;

/**
 * Report History table - stores generated reports
 */
export const reportHistory = mysqlTable("reportHistory", {
  id: int("id").autoincrement().primaryKey(),
  reportId: varchar("reportId", { length: 100 }).notNull().references(() => scheduledReports.reportId, { onDelete: "cascade" }),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  data: json("data").$type<Record<string, unknown>>().default({}),
  status: mysqlEnum("status", ["success", "failed", "partial"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
});

export type ReportHistory = typeof reportHistory.$inferSelect;
export type InsertReportHistory = typeof reportHistory.$inferInsert;

/**
 * API Usage Metrics table - stores API usage analytics
 */
export const apiUsageMetrics = mysqlTable("apiUsageMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  requests: int("requests").default(0).notNull(),
  successfulRequests: int("successfulRequests").default(0).notNull(),
  failedRequests: int("failedRequests").default(0).notNull(),
  avgLatency: int("avgLatency").default(0).notNull(), // in milliseconds
  minLatency: int("minLatency").default(0).notNull(),
  maxLatency: int("maxLatency").default(0).notNull(),
  errors: int("errors").default(0).notNull(),
  timeouts: int("timeouts").default(0).notNull(),
  throttled: int("throttled").default(0).notNull(),
  bytes: bigint("bytes", { mode: "number" }).default(0).notNull(),
  cost: decimal("cost", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type APIUsageMetric = typeof apiUsageMetrics.$inferSelect;
export type InsertAPIUsageMetric = typeof apiUsageMetrics.$inferInsert;

/**
 * Audit Logs table - stores user activity audit trail
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["success", "failure", "partial", "pending"]).default("success").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  resourceType: varchar("resourceType", { length: 100 }).notNull(),
  resourceId: varchar("resourceId", { length: 255 }).notNull(),
  resourceName: varchar("resourceName", { length: 255 }),
  details: json("details").$type<Record<string, unknown>>().default({}),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  duration: int("duration"), // in milliseconds
  errorMessage: text("errorMessage"),
  changedFields: json("changedFields").$type<Record<string, { before: unknown; after: unknown }>>().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Dashboard Layouts table - stores user dashboard configurations
 */
export const dashboardLayouts = mysqlTable("dashboardLayouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  layoutId: varchar("layoutId", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  widgets: json("widgets").$type<any[]>().default([]),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type InsertDashboardLayout = typeof dashboardLayouts.$inferInsert;
