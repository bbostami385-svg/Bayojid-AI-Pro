import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getConversationMessages } from "./db";

export const searchRouter = router({
  /**
   * Smart search using AI to understand intent
   */
  smartSearch: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        conversationId: z.number().optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get conversation messages
        const messages = input.conversationId ? await getConversationMessages(input.conversationId) : [];

        if (!messages || messages.length === 0) {
          return {
            success: true,
            results: [],
            query: input.query,
          };
        }

        // Use AI to understand search intent and find relevant messages
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `আপনি একজন স্মার্ট সার্চ ইঞ্জিন। ব্যবহারকারীর অনুসন্ধান প্রশ্নের উদ্দেশ্য বুঝুন এবং প্রাসঙ্গিক বার্তা খুঁজে বের করুন।
              
              প্রাসঙ্গিক বার্তাগুলির সূচকাঙ্ক (0-ভিত্তিক) এবং প্রাসঙ্গিকতা স্কোর (0-100) সহ JSON ফরম্যাটে উত্তর দিন।
              {"results": [{"index": 0, "relevance": 95}, ...]}`,
            },
            {
              role: "user",
              content: `এই কথোপকথনে "${input.query}" সম্পর্কিত বার্তা খুঁজুন।
              
              কথোপকথন:
              ${messages
                .map(
                  (msg, idx) =>
                    `[${idx}] ${msg.role === "user" ? "ব্যবহারকারী" : "AI"}: ${msg.content}`
                )
                .join("\n")}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "search_results",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        relevance: { type: "number" },
                      },
                      required: ["index", "relevance"],
                    },
                  },
                },
                required: ["results"],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        // Map results to actual messages
        const results = (parsed.results || [])
          .sort((a: any, b: any) => b.relevance - a.relevance)
          .slice(0, input.limit)
          .map((result: any) => ({
            index: result.index,
            message: messages[result.index],
            relevance: result.relevance,
          }));

        return {
          success: true,
          results,
          query: input.query,
          totalFound: results.length,
        };
      } catch (error) {
        console.error("Smart search failed:", error);
        throw new Error("স্মার্ট অনুসন্ধান ব্যর্থ / Smart search failed");
      }
    }),

  /**
   * Semantic search using embeddings
   */
  semanticSearch: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        conversationId: z.number().optional(),
        threshold: z.number().min(0).max(1).default(0.5),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get conversation messages
        const messages = input.conversationId ? await getConversationMessages(input.conversationId) : [];

        if (!messages || messages.length === 0) {
          return {
            success: true,
            results: [],
            query: input.query,
          };
        }

        // Use AI to calculate semantic similarity
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `আপনি একজন সিমান্টিক সার্চ ইঞ্জিন। প্রতিটি বার্তার সাথে প্রশ্নের শব্দার্থগত সাদৃশ্য গণনা করুন (0-1 স্কেলে)।
              
              JSON ফরম্যাটে উত্তর দিন: {"results": [{"index": 0, "similarity": 0.95}, ...]}`,
            },
            {
              role: "user",
              content: `প্রশ্ন: "${input.query}"
              
              এই বার্তাগুলির সাথে সাদৃশ্য গণনা করুন:
              ${messages
                .map(
                  (msg, idx) =>
                    `[${idx}] ${msg.role === "user" ? "ব্যবহারকারী" : "AI"}: ${msg.content}`
                )
                .join("\n")}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "semantic_search_results",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        similarity: { type: "number" },
                      },
                      required: ["index", "similarity"],
                    },
                  },
                },
                required: ["results"],
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        // Filter by threshold and sort by similarity
        const results = (parsed.results || [])
          .filter((r: any) => r.similarity >= input.threshold)
          .sort((a: any, b: any) => b.similarity - a.similarity)
          .slice(0, input.limit)
          .map((result: any) => ({
            index: result.index,
            message: messages[result.index],
            similarity: result.similarity,
          }));

        return {
          success: true,
          results,
          query: input.query,
          threshold: input.threshold,
          totalFound: results.length,
        };
      } catch (error) {
        console.error("Semantic search failed:", error);
        throw new Error("সিমান্টিক অনুসন্ধান ব্যর্থ / Semantic search failed");
      }
    }),

  /**
   * Search with filters
   */
  filteredSearch: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        conversationId: z.number().optional(),
        filters: z.object({
          role: z.enum(["user", "assistant"]).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
          sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
        }),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get conversation messages
        const messages = input.conversationId ? await getConversationMessages(input.conversationId) : [];

        if (!messages || messages.length === 0) {
          return {
            success: true,
            results: [],
            query: input.query,
            filters: input.filters,
          };
        }

        // Apply filters
        let filtered = messages;

        if (input.filters.role) {
          filtered = filtered.filter((m) => m.role === input.filters.role);
        }

        // Use AI to analyze sentiment if needed
        if (input.filters.sentiment) {
          const sentimentAnalysis = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `প্রতিটি বার্তার সেন্টিমেন্ট বিশ্লেষণ করুন (positive, negative, neutral)।
                JSON ফরম্যাটে উত্তর দিন: {"sentiments": ["positive", "negative", ...]}`,
              },
              {
                role: "user",
                content: `এই বার্তাগুলি বিশ্লেষণ করুন:\n${filtered.map((m) => m.content).join("\n")}`,
              },
            ],
          });

          const content = sentimentAnalysis.choices[0].message.content;
          const parsed = typeof content === "string" ? JSON.parse(content) : content;

          filtered = filtered.filter((_, idx) => parsed.sentiments?.[idx] === input.filters.sentiment);
        }

        // Text search
        const results = filtered
          .filter((m) => m.content.toLowerCase().includes(input.query.toLowerCase()))
          .slice(0, input.limit)
          .map((m, idx) => ({
            index: messages.indexOf(m),
            message: m,
            matchPosition: m.content.toLowerCase().indexOf(input.query.toLowerCase()),
          }));

        return {
          success: true,
          results,
          query: input.query,
          filters: input.filters,
          totalFound: results.length,
        };
      } catch (error) {
        console.error("Filtered search failed:", error);
        throw new Error("ফিল্টার করা অনুসন্ধান ব্যর্থ / Filtered search failed");
      }
    }),
});
