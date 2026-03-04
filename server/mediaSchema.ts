import { mysqlTable, int, varchar, text, datetime, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Subscription tiers
export const subscriptionTiers = mysqlTable("subscription_tiers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(), // 'free', 'pro', 'premium'
  videoMaxDuration: int("video_max_duration").notNull(), // seconds
  videoQuality: varchar("video_quality", { length: 10 }).notNull(), // '480p', '720p', '1080p'
  imageLimit: int("image_limit").notNull(), // -1 for unlimited
  videoLimit: int("video_limit").notNull(), // -1 for unlimited
  price: int("price").notNull(), // in cents
  createdAt: datetime("created_at").default(new Date()),
});

// User subscriptions
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  tierId: int("tier_id").notNull(),
  startDate: datetime("start_date").default(new Date()),
  endDate: datetime("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(new Date()),
});

// Media generation history
export const mediaGenerationHistory = mysqlTable("media_generation_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["text-to-image", "image-to-video", "text-to-video"]).notNull(),
  prompt: text("prompt").notNull(),
  inputImageUrl: varchar("input_image_url", { length: 500 }),
  outputUrl: varchar("output_url", { length: 500 }),
  duration: int("duration"), // for videos, in seconds
  quality: varchar("quality", { length: 10 }), // '480p', '720p'
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  errorMessage: text("error_message"),
  createdAt: datetime("created_at").default(new Date()),
  completedAt: datetime("completed_at"),
});

// Daily usage tracking
export const dailyUsageTracking = mysqlTable("daily_usage_tracking", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  date: datetime("date").default(new Date()),
  imagesGenerated: int("images_generated").default(0),
  videosGenerated: int("videos_generated").default(0),
  totalDuration: int("total_duration").default(0), // seconds
  createdAt: datetime("created_at").default(new Date()),
});

// Relations
export const subscriptionTiersRelations = relations(subscriptionTiers, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  tier: one(subscriptionTiers, {
    fields: [userSubscriptions.tierId],
    references: [subscriptionTiers.id],
  }),
}));

export const mediaGenerationHistoryRelations = relations(mediaGenerationHistory, ({ one }) => ({
  user: one(userSubscriptions, {
    fields: [mediaGenerationHistory.userId],
    references: [userSubscriptions.userId],
  }),
}));
