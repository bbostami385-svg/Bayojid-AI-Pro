import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  addMessage,
  updateConversationTitle,
  deleteConversation,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    // Get all conversations for the current user
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return getUserConversations(ctx.user.id);
    }),

    // Create a new conversation
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const result = await createConversation(
          ctx.user.id,
          input.title || "নতুন কথোপকথন"
        );
        return result;
      }),

    // Get messages for a specific conversation
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return getConversationMessages(input.conversationId);
      }),

    // Send a message and get AI response
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Store user message
        await addMessage(input.conversationId, "user", input.message);

        // Get conversation history
        const messages = await getConversationMessages(input.conversationId);

        // Prepare messages for LLM
        const llmMessages = messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

        // Add current user message
        llmMessages.push({
          role: "user" as const,
          content: input.message,
        });

        // Call LLM
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "আপনি একজন সহায়ক AI অ্যাসিস্ট্যান্ট। বাংলায় উত্তর দিন এবং সাহায্যকর হন।",
            },
            ...llmMessages,
          ],
        });

        const assistantMessage = (() => {
          const content = response.choices[0]?.message?.content;
          if (typeof content === 'string') {
            return content;
          }
          return "মাফি করলাম, প্রপ্তিরায় কোনো সমস্যা হয়েছে।";
        })();

        // Store assistant response
        if (typeof assistantMessage === 'string') {
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
        return updateConversationTitle(input.conversationId, input.title);
      }),

    // Delete a conversation
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input }) => {
        return deleteConversation(input.conversationId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
