import { generateImage } from "./_core/imageGeneration";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

export const imageRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        style: z.enum(["realistic", "artistic", "cartoon", "abstract"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: input.prompt,
        });

        return {
          success: true,
          url: result.url,
          prompt: input.prompt,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("ইমেজ জেনারেশন ব্যর্থ / Image generation failed");
      }
    }),

  generateWithStyle: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        style: z.enum(["realistic", "artistic", "cartoon", "abstract"]),
        count: z.number().min(1).max(4).optional().default(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const stylePrompts: Record<string, string> = {
          realistic: "photorealistic, high quality, detailed",
          artistic: "artistic, painting style, creative",
          cartoon: "cartoon style, colorful, fun",
          abstract: "abstract art, modern, geometric",
        };

        const enhancedPrompt = `${input.prompt}, ${stylePrompts[input.style]}`;

        const results = [];
        for (let i = 0; i < (input.count || 1); i++) {
          const result = await generateImage({
            prompt: enhancedPrompt,
          });
          results.push({
            url: result.url,
            prompt: enhancedPrompt,
          });
        }

        return {
          success: true,
          images: results,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("ইমেজ জেনারেশন ব্যর্থ / Image generation failed");
      }
    }),

  edit: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(1000),
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateImage({
          prompt: input.prompt,
          originalImages: [
            {
              url: input.imageUrl,
              mimeType: "image/jpeg",
            },
          ],
        });

        return {
          success: true,
          url: result.url,
          prompt: input.prompt,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Image editing failed:", error);
        throw new Error("ইমেজ সম্পাদনা ব্যর্থ / Image editing failed");
      }
    }),
});
