import { z } from "zod";
import Stripe from "stripe";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import {
  getUserConversations,
  createConversation,
  getConversationMessages,
  addMessage,
  deleteConversation as deleteConversationDB,
  updateConversationTitle,
  createShareLink,
  getSharedConversation,
  deleteShareLink,
  getUserSubscription,
  createOrUpdateSubscription,
  getUserProfile,
  createOrUpdateUserProfile,
  updateUserProfile,
  deleteUserProfile,
  createChatTemplate,
  getUserChatTemplates,
  getChatTemplate,
  updateChatTemplate,
  deleteChatTemplate,
} from "./db";
import { imageRouter } from "./imageGeneration";
import { documentRouter } from "./documentAnalysis";
import { suggestionsRouter } from "./suggestions";
import { encryptionRouter } from "./encryption";
import { translationRouter } from "./translation";
import { searchRouter } from "./search";
import { mediaGenerationRouter } from "./mediaGeneration";
import { subscriptionRouter } from "./subscription";
import { moderationRouter } from "./moderation";
import { reputationRouter } from "./reputation";
import { usageTrackingRouter } from "./usageTracking";
import { socialSharingRouter } from "./socialSharing";
import { conversationRatingRouter } from "./conversationRating";
import { customAIModelRouter } from "./customAIModel";
import { videoEditorRouter } from "./videoEditor";
import { notificationsRouter } from "./notifications";
import { communityRouter } from "./community";
import { analyticsExportRouter } from "./analyticsExport";
import { challengesRouter } from "./challenges";
import { challengeNotificationsRouter } from "./challengeNotifications";
import { leaderboardSharingRouter } from "./leaderboardSharing";
import { stripePaymentRouter } from "./stripePayment";
import { conversationMemoryRouter } from "./conversationMemory";
import { sslcommerzPaymentRouter } from "./sslcommerzPaymentRouter";
import { refundRouter } from "./refundRouter";
import { invokeLLM } from "./_core/llm";
import { aiModelsRouter } from "./aiModelsRouter";
import { stripeRouter } from "./stripeRouter";

const personalityPrompts: Record<string, string> = {
  friendly: "You are a friendly and warm AI assistant. Be conversational and approachable.",
  professional: "You are a professional and formal AI assistant. Be concise and business-like.",
  teacher: "You are an educational AI assistant. Explain concepts clearly and provide examples.",
  creative: "You are a creative and imaginative AI assistant. Think outside the box and be innovative.",
};

export const appRouter = router({
  system: systemRouter,
  aiModels: aiModelsRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await createConversation(ctx.user.id, input.title);
      }),

    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
          personality: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addMessage(input.conversationId, "user", input.message);

        const messages = await getConversationMessages(input.conversationId);

        const llmMessages = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        const personalityPrompt =
          personalityPrompts[input.personality || "friendly"] ||
          personalityPrompts.friendly;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `${personalityPrompt} Respond in the same language as the user (Bengali or English).`,
            },
            ...llmMessages,
          ],
        });

        const assistantMessage = (() => {
          const content = response.choices[0]?.message?.content;
          if (typeof content === "string") {
            return content;
          }
          return "Sorry, there was an issue processing your request. / মাফি করলাম, আপনার অনুরোধ প্রক্রিয়া করতে সমস্যা হয়েছে।";
        })();

        if (typeof assistantMessage === "string") {
          await addMessage(
            input.conversationId,
            "assistant",
            assistantMessage
          );
        }

        return {
          userMessage: input.message,
          assistantMessage,
        };
      }),

    updateTitle: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          title: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateConversationTitle(
          input.conversationId,
          input.title
        );
      }),

    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteConversationDB(input.conversationId);
      }),

    searchConversations: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        const conversations = await getUserConversations(ctx.user.id);
        return conversations.filter((conv) =>
          conv.title.toLowerCase().includes(input.query.toLowerCase())
        );
      }),

    generateTitle: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        const firstMessage = messages.find((m) => m.role === "user");

        if (!firstMessage) return { success: false };

        const title = firstMessage.content.substring(0, 50).trim();
        if (title.length > 0) {
          await updateConversationTitle(input.conversationId, title);
          return { success: true, title };
        }
        return { success: false };
      }),

    exportAsText: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        const textContent = messages
          .map((msg) =>
            `${msg.role === "user" ? "আপনি" : "AI"}: ${msg.content}`
          )
          .join("\n\n");
        return textContent;
      }),

    exportAsJSON: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        return JSON.stringify(messages, null, 2);
      }),

    createShareLink: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        await createShareLink(input.conversationId);
        return { success: true };
      }),

    getSharedConversation: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        const share = await getSharedConversation(input.shareToken);
        if (!share) return null;
        
        const messages = await getConversationMessages(share.conversationId);
        return { messages };
      }),

    deleteShareLink: protectedProcedure
      .input(z.object({ shareToken: z.string() }))
      .mutation(async ({ input }) => {
        await deleteShareLink(input.shareToken);
        return { success: true };
      }),

    getPersonalities: publicProcedure.query(() => {
      return [
        { id: "friendly", name: "বন্ধুত্বপূর্ণ / Friendly", description: "উষ্ণ এবং কথোপকথনমূলক" },
        { id: "professional", name: "পেশাদার / Professional", description: "আনুষ্ঠানিক এবং সংক্ষিপ্ত" },
        { id: "teacher", name: "শিক্ষক / Teacher", description: "শিক্ষামূলক এবং ব্যাখ্যামূলক" },
        { id: "creative", name: "সৃজনশীল / Creative", description: "কল্পনাপ্রবণ এবং উদ্ভাবনী" },
      ];
    }),
  }),

  premium: router({
    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      return await getUserSubscription(ctx.user.id);
    }),

    upgradeSubscription: protectedProcedure
      .input(z.object({ plan: z.enum(["free", "pro", "premium"]) }))
      .mutation(async ({ ctx, input }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await createOrUpdateSubscription(ctx.user.id, input.plan, expiresAt);
        return { success: true, plan: input.plan };
      }),

    canSendMessage: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await getUserSubscription(ctx.user.id);

      if (!subscription) {
        return { allowed: true, remaining: 50 };
      }

      const remaining = subscription.messageLimit - subscription.messagesUsed;
      return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }),

    getPricingPlans: publicProcedure.query(() => {
      return [
        {
          id: "free",
          name: "বিনামূল্যে / Free",
          price: "0 টাকা",
          messages: "50 বার্তা/মাস",
          features: ["মৌলিক চ্যাট", "একটি AI ব্যক্তিত্ব"],
        },
        {
          id: "pro",
          name: "প্রো / Pro",
          price: "৯৯ টাকা/মাস",
          messages: "500 বার্তা/মাস",
          features: ["সীমাহীন চ্যাট", "সমস্ত AI ব্যক্তিত্ব", "কথোপকথন শেয়ারিং"],
        },
        {
          id: "premium",
          name: "প্রিমিয়াম / Premium",
          price: "২৯৯ টাকা/মাস",
          messages: "10,000 বার্তা/মাস",
          features: ["সীমাহীন সবকিছু", "কাস্টম AI প্রম্পট", "অগ্রাধিকার সহায়তা"],
        },
      ];
    }),
  }),

  reactions: router({
    addReaction: protectedProcedure
      .input(z.object({ messageId: z.number(), emoji: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { addReaction } = await import("./db");
        await addReaction(input.messageId, ctx.user.id, input.emoji);
        return { success: true };
      }),

    getReactions: publicProcedure
      .input(z.object({ messageId: z.number() }))
      .query(async ({ input }) => {
        const { getMessageReactions } = await import("./db");
        return await getMessageReactions(input.messageId);
      }),

    removeReaction: protectedProcedure
      .input(z.object({ messageId: z.number(), emoji: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { removeReaction } = await import("./db");
        await removeReaction(input.messageId, ctx.user.id, input.emoji);
        return { success: true };
      }),
  }),

  groupChat: router({
    createGroupChat: protectedProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { createGroupChat, addGroupChatMember } = await import("./db");
        const result = await createGroupChat(input.name, ctx.user.id, input.description);
        await addGroupChatMember((result as any).insertId, ctx.user.id);
        return { success: true, groupChatId: (result as any).insertId };
      }),

    addMember: protectedProcedure
      .input(z.object({ groupChatId: z.number(), userId: z.number() }))
      .mutation(async ({ input }) => {
        const { addGroupChatMember } = await import("./db");
        await addGroupChatMember(input.groupChatId, input.userId);
        return { success: true };
      }),

    getMessages: publicProcedure
      .input(z.object({ groupChatId: z.number() }))
      .query(async ({ input }) => {
        const { getGroupChatMessages } = await import("./db");
        return await getGroupChatMessages(input.groupChatId);
      }),

    sendMessage: protectedProcedure
      .input(z.object({ groupChatId: z.number(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { addGroupChatMessage } = await import("./db");
        await addGroupChatMessage(input.groupChatId, ctx.user.id, input.content);
        return { success: true };
      }),
  }),

  bookmarks: router({
    create: protectedProcedure
      .input(z.object({ messageId: z.number(), title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { createBookmark } = await import("./db");
        await createBookmark(ctx.user.id, input.messageId, input.title);
        return { success: true };
      }),

    getBookmarks: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserBookmarks } = await import("./db");
        return await getUserBookmarks(ctx.user.id);
      }),

    remove: protectedProcedure
      .input(z.object({ bookmarkId: z.number() }))
      .mutation(async ({ input }) => {
        const { removeBookmark } = await import("./db");
        await removeBookmark(input.bookmarkId);
        return { success: true };
      }),
  }),

  files: router({
    upload: protectedProcedure
      .input(z.object({ fileName: z.string(), fileUrl: z.string(), fileSize: z.number(), mimeType: z.string(), messageId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { createFileUpload } = await import("./db");
        await createFileUpload(ctx.user.id, input.fileName, input.fileUrl, input.fileSize, input.mimeType, input.messageId);
        return { success: true };
      }),

    getMessageFiles: publicProcedure
      .input(z.object({ messageId: z.number() }))
      .query(async ({ input }) => {
        const { getMessageFiles } = await import("./db");
        return await getMessageFiles(input.messageId);
      }),
  }),

  profile: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfile(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          avatar: z.string().optional(),
          bio: z.string().optional(),
          status: z.string().optional(),

        })
      )
      .mutation(async ({ ctx, input }) => {
        await createOrUpdateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    deleteProfile: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteUserProfile(ctx.user.id);
      return { success: true };
    }),
  }),

  image: imageRouter,
  document: documentRouter,
  suggestions: suggestionsRouter,
  encryption: encryptionRouter,
  translation: translationRouter,
  search: searchRouter,
  media: mediaGenerationRouter,
  subscription: subscriptionRouter,
  usage: usageTrackingRouter,
  moderation: moderationRouter,
  reputation: reputationRouter,
  sharing: socialSharingRouter,
  rating: conversationRatingRouter,
  customModels: customAIModelRouter,
  videoEditor: videoEditorRouter,
  notifications: notificationsRouter,
  community: communityRouter,
  export: analyticsExportRouter,
  challenges: challengesRouter,
  challengeNotifications: challengeNotificationsRouter,
  leaderboardSharing: leaderboardSharingRouter,
  payment: stripePaymentRouter,
  sslcommerzPayment: sslcommerzPaymentRouter,
  refund: refundRouter,
  conversationMemory: conversationMemoryRouter,
  stripe: stripeRouter,

  templates: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createChatTemplate(ctx.user.id, input.title, input.content, input.category);
        return { success: true };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserChatTemplates(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .query(async ({ input }) => {
        return await getChatTemplate(input.templateId);
      }),

    update: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await updateChatTemplate(input.templateId, {
          title: input.title,
          content: input.content,
          category: input.category,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteChatTemplate(input.templateId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
