import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const documentRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        base64Content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate file size (max 10MB)
        if (input.fileSize > 10 * 1024 * 1024) {
          throw new Error("ফাইল সাইজ ১০ এমবি এর বেশি / File size exceeds 10MB");
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Content, "base64");

        // Upload to S3
        const fileKey = `documents/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          url,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          uploadedAt: new Date(),
        };
      } catch (error) {
        console.error("Document upload failed:", error);
        throw new Error("ডকুমেন্ট আপলোড ব্যর্থ / Document upload failed");
      }
    }),

  analyze: protectedProcedure
    .input(
      z.object({
        documentUrl: z.string().url(),
        analysisType: z.enum(["summary", "keywords", "sentiment", "entities", "full"]),
        language: z.string().optional().default("bn"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const analysisPrompts: Record<string, string> = {
          summary: "এই ডকুমেন্টের একটি সংক্ষিপ্ত সারসংক্ষেপ প্রদান করুন / Provide a brief summary of this document",
          keywords: "এই ডকুমেন্টের মূল কীওয়ার্ডগুলি চিহ্নিত করুন / Identify the key keywords from this document",
          sentiment: "এই ডকুমেন্টের সেন্টিমেন্ট বিশ্লেষণ করুন / Analyze the sentiment of this document",
          entities: "এই ডকুমেন্ট থেকে নামযুক্ত সত্তা (ব্যক্তি, স্থান, সংস্থা) নিষ্কাশন করুন / Extract named entities from this document",
          full: "এই ডকুমেন্টের একটি সম্পূর্ণ বিশ্লেষণ প্রদান করুন / Provide a comprehensive analysis of this document",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "আপনি একজন বিশেষজ্ঞ ডকুমেন্ট বিশ্লেষক। ব্যবহারকারীর অনুরোধ অনুযায়ী ডকুমেন্ট বিশ্লেষণ করুন।",
            },
            {
              role: "user",
              content: [
                {
                  type: "file_url",
                  file_url: {
                    url: input.documentUrl,
                  },
                },
                {
                  type: "text",
                  text: analysisPrompts[input.analysisType],
                },
              ],
            },
          ],
        });

        const analysis = response.choices[0].message.content;

        return {
          success: true,
          analysis,
          analysisType: input.analysisType,
          documentUrl: input.documentUrl,
          analyzedAt: new Date(),
        };
      } catch (error) {
        console.error("Document analysis failed:", error);
        throw new Error("ডকুমেন্ট বিশ্লেষণ ব্যর্থ / Document analysis failed");
      }
    }),

  extractText: protectedProcedure
    .input(
      z.object({
        documentUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "আপনি একজন OCR বিশেষজ্ঞ। ডকুমেন্ট থেকে সমস্ত পাঠ্য নিষ্কাশন করুন।",
            },
            {
              role: "user",
              content: [
                {
                  type: "file_url",
                  file_url: {
                    url: input.documentUrl,
                  },
                },
                {
                  type: "text",
                  text: "এই ডকুমেন্ট থেকে সমস্ত পাঠ্য নিষ্কাশন করুন / Extract all text from this document",
                },
              ],
            },
          ],
        });

        const extractedText = response.choices[0].message.content;

        return {
          success: true,
          text: extractedText,
          documentUrl: input.documentUrl,
          extractedAt: new Date(),
        };
      } catch (error) {
        console.error("Text extraction failed:", error);
        throw new Error("টেক্সট নিষ্কাশন ব্যর্থ / Text extraction failed");
      }
    }),
});
