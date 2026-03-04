import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const suggestionsRouter = router({
  getNextMessage: protectedProcedure
    .input(
      z.object({
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        personality: z.string(),
        count: z.number().min(1).max(5).default(3),
      })
    )
    .query(async ({ input }) => {
      try {
        const personalityPrompts: Record<string, string> = {
          friendly: "আপনি একজন বন্ধুত্বপূর্ণ এবং উষ্ণ AI সহায়ক। কথোপকথনমূলক এবং প্রাপ্য হন।",
          professional: "আপনি একজন পেশাদার এবং আনুষ্ঠানিক AI সহায়ক। সংক্ষিপ্ত এবং সুনির্দিষ্ট হন।",
          creative: "আপনি একজন সৃজনশীল এবং কল্পনাপ্রবণ AI সহায়ক। অনন্য এবং আকর্ষণীয় উত্তর প্রদান করুন।",
          technical: "আপনি একজন প্রযুক্তিগত বিশেষজ্ঞ AI সহায়ক। বিস্তারিত এবং নির্ভুল তথ্য প্রদান করুন।",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `${personalityPrompts[input.personality] || personalityPrompts.friendly}
              
              ব্যবহারকারীর পরবর্তী বার্তার জন্য ${input.count}টি সম্ভাব্য সাজেশন প্রদান করুন।
              প্রতিটি সাজেশন সংক্ষিপ্ত এবং প্রাসঙ্গিক হওয়া উচিত।
              JSON ফরম্যাটে উত্তর দিন: {"suggestions": ["suggestion1", "suggestion2", ...]}`,
            },
            ...input.conversationHistory.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "suggestions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "পরবর্তী বার্তার জন্য সাজেশনের তালিকা",
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        return {
          suggestions: parsed.suggestions || [],
          personality: input.personality,
        };
      } catch (error) {
        console.error("Failed to generate suggestions:", error);
        return {
          suggestions: [],
          personality: input.personality,
        };
      }
    }),

  autocomplete: protectedProcedure
    .input(
      z.object({
        partialMessage: z.string().min(1),
        conversationHistory: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        personality: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `ব্যবহারকারী যা লিখতে শুরু করেছেন তার ভিত্তিতে বার্তা সম্পূর্ণ করুন।
              শুধুমাত্র সম্পূর্ণ করার অংশ প্রদান করুন, সম্পূর্ণ বার্তা নয়।
              সংক্ষিপ্ত এবং প্রাসঙ্গিক হন।
              শুধুমাত্র সম্পূর্ণকরণ টেক্সট ফেরত দিন, অন্য কিছু নয়।`,
            },
            ...input.conversationHistory.slice(-4).map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            {
              role: "user",
              content: `সম্পূর্ণ করুন: "${input.partialMessage}"`,
            },
          ],
        });

        const completion = response.choices[0].message.content;

        return {
          completion: typeof completion === "string" ? completion : "",
          partialMessage: input.partialMessage,
        };
      } catch (error) {
        console.error("Failed to generate autocomplete:", error);
        return {
          completion: "",
          partialMessage: input.partialMessage,
        };
      }
    }),

  smartReply: protectedProcedure
    .input(
      z.object({
        messageToReply: z.string(),
        personality: z.string(),
        tone: z.enum(["casual", "formal", "humorous", "empathetic"]).default("casual"),
      })
    )
    .query(async ({ input }) => {
      try {
        const toneDescriptions: Record<string, string> = {
          casual: "নৈমিত্তিক এবং বন্ধুত্বপূর্ণ",
          formal: "আনুষ্ঠানিক এবং পেশাদার",
          humorous: "হাস্যরস এবং মজাদার",
          empathetic: "সহানুভূতিশীল এবং যত্নশীল",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `এই বার্তার জন্য 3টি স্মার্ট রিপ্লাই সাজেশন প্রদান করুন।
              টোন: ${toneDescriptions[input.tone]}
              প্রতিটি রিপ্লাই সংক্ষিপ্ত এবং প্রাসঙ্গিক হওয়া উচিত।
              JSON ফরম্যাটে উত্তর দিন: {"replies": ["reply1", "reply2", "reply3"]}`,
            },
            {
              role: "user",
              content: input.messageToReply,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "smart_replies",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  replies: {
                    type: "array",
                    items: { type: "string" },
                    description: "স্মার্ট রিপ্লাই সাজেশনের তালিকা",
                  },
                },
                required: ["replies"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        return {
          replies: parsed.replies || [],
          tone: input.tone,
        };
      } catch (error) {
        console.error("Failed to generate smart replies:", error);
        return {
          replies: [],
          tone: input.tone,
        };
      }
    }),
});
