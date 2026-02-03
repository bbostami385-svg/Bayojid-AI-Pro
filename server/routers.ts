import { z } from "zod";
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
} from "./db";
import { invokeLLM } from "./_core/llm";

const personalityPrompts: Record<string, string> = {
  friendly: "You are a friendly and warm AI assistant. Be conversational and approachable.",
  professional: "You are a professional and formal AI assistant. Be concise and business-like.",
  teacher: "You are an educational AI assistant. Explain concepts clearly and provide examples.",
  creative: "You are a creative and imaginative AI assistant. Think outside the box and be innovative.",
};

export const appRouter = router({
  system: systemRouter,
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
    // Create a new conversation
    createConversation: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await createConversation(ctx.user.id, input.title);
      }),

    // List user's conversations
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserConversations(ctx.user.id);
    }),

    // Get messages in a conversation
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationMessages(input.conversationId);
      }),

    // Send a message and get AI response
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
          personality: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Store user message
        await addMessage(input.conversationId, "user", input.message);

        // Get conversation history
        const messages = await getConversationMessages(input.conversationId);

        // Prepare messages for LLM
        const llmMessages = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Get personality prompt
        const personalityPrompt =
          personalityPrompts[input.personality || "friendly"] ||
          personalityPrompts.friendly;

        // Get AI response
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

        // Store assistant response
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

    // Update conversation title
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

    // Delete a conversation
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteConversationDB(input.conversationId);
      }),

    // Search conversations
    searchConversations: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        const conversations = await getUserConversations(ctx.user.id);
        return conversations.filter((conv) =>
          conv.title.toLowerCase().includes(input.query.toLowerCase())
        );
      }),

    // Generate conversation title from first message
    generateTitle: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        const firstMessage = messages.find((m) => m.role === "user");

        if (!firstMessage) return { success: false };

        // Generate title from first message (first 50 chars)
        const title = firstMessage.content.substring(0, 50).trim();
        if (title.length > 0) {
          await updateConversationTitle(input.conversationId, title);
          return { success: true, title };
        }
        return { success: false };
      }),

    // Export conversation as text
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

    // Export conversation as JSON
    exportAsJSON: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const messages = await getConversationMessages(input.conversationId);
        return JSON.stringify(messages, null, 2);
      }),

    // Get personality options
    getPersonalities: publicProcedure.query(() => {
      return [
        { id: "friendly", name: "বন্ধুত্বপূর্ণ / Friendly", description: "উষ্ণ এবং কথোপকথনমূলক" },
        { id: "professional", name: "পেশাদার / Professional", description: "আনুষ্ঠানিক এবং সংক্ষিপ্ত" },
        { id: "teacher", name: "শিক্ষক / Teacher", description: "শিক্ষামূলক এবং ব্যাখ্যামূলক" },
        { id: "creative", name: "সৃজনশীল / Creative", description: "কল্পনাপ্রবণ এবং উদ্ভাবনী" },
      ];
    }),
  }),
});

export type AppRouter = typeof appRouter;
