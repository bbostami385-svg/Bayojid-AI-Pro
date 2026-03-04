import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { generateImage } from "./_core/imageGeneration";
import { generateVideoFromImage, generateVideoFromText } from "./_core/videoGeneration";
import { invokeLLM } from "./_core/llm";

// Subscription tier limits
const SUBSCRIPTION_LIMITS = {
  free: {
    videoMaxDuration: 8, // seconds
    videoQuality: "480p",
    imageLimit: -1, // unlimited
    videoLimit: 3, // 3 videos per day
  },
  pro: {
    videoMaxDuration: 10,
    videoQuality: "720p",
    imageLimit: -1,
    videoLimit: 10,
  },
  premium: {
    videoMaxDuration: 60,
    videoQuality: "1080p",
    imageLimit: -1,
    videoLimit: -1, // unlimited
  },
};

export const mediaGenerationRouter = router({
  /**
   * Generate image from text prompt
   * Unlimited for all users
   */
  generateImageFromText: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(500),
        style: z.enum(["realistic", "artistic", "cartoon", "abstract", "photographic"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const enhancedPrompt = input.style ? `${input.prompt} in ${input.style} style` : input.prompt;

        const { url } = await generateImage({
          prompt: enhancedPrompt,
        });

        return {
          success: true,
          imageUrl: url,
          prompt: input.prompt,
          style: input.style,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Image generation failed:", error);
        throw new Error("ছবি তৈরি ব্যর্থ / Image generation failed");
      }
    }),

  /**
   * Generate video from image
   * Subject to subscription limits
   */
  generateVideoFromImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        prompt: z.string().min(5).max(200),
        duration: z.number().min(1).max(60).optional(),
        quality: z.enum(["480p", "720p", "1080p"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user subscription tier (default to 'free')
        const userTier = "free"; // TODO: Fetch from database

        const limits = SUBSCRIPTION_LIMITS[userTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

        // Check duration limit
        const requestedDuration = input.duration || limits.videoMaxDuration;
        if (requestedDuration > limits.videoMaxDuration) {
          throw new Error(
            `ভিডিও সময়কাল সীমা অতিক্রম করেছে / Video duration exceeds limit of ${limits.videoMaxDuration} seconds`
          );
        }

        // Check quality limit
        const requestedQuality = input.quality || limits.videoQuality;
        const qualityLevels = { "480p": 1, "720p": 2, "1080p": 3 };
        if (qualityLevels[requestedQuality as keyof typeof qualityLevels] > qualityLevels[limits.videoQuality as keyof typeof qualityLevels]) {
          throw new Error(
            `ভিডিও গুণমান সীমা অতিক্রম করেছে / Video quality exceeds limit of ${limits.videoQuality}`
          );
        }

        // Generate video from image
        const videoResult = await generateVideoFromImage({
          imageUrl: input.imageUrl,
          prompt: input.prompt,
          duration: requestedDuration,
          quality: requestedQuality as "480p" | "720p" | "1080p",
        });

        return {
          success: true,
          videoUrl: videoResult.url,
          prompt: input.prompt,
          duration: requestedDuration,
          quality: requestedQuality,
          tier: userTier,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Video generation failed:", error);
        throw new Error("ভিডিও তৈরি ব্যর্থ / Video generation failed");
      }
    }),

  /**
   * Generate video from text
   * Subject to subscription limits
   */
  generateVideoFromText: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(20).max(500),
        duration: z.number().min(1).max(60).optional(),
        quality: z.enum(["480p", "720p", "1080p"]).optional(),
        style: z.enum(["realistic", "animated", "cinematic", "documentary"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get user subscription tier (default to 'free')
        const userTier = "free"; // TODO: Fetch from database

        const limits = SUBSCRIPTION_LIMITS[userTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

        // Check duration limit
        const requestedDuration = input.duration || limits.videoMaxDuration;
        if (requestedDuration > limits.videoMaxDuration) {
          throw new Error(
            `ভিডিও সময়কাল সীমা অতিক্রম করেছে / Video duration exceeds limit of ${limits.videoMaxDuration} seconds`
          );
        }

        // Check quality limit
        const requestedQuality = input.quality || limits.videoQuality;
        const qualityLevels = { "480p": 1, "720p": 2, "1080p": 3 };
        if (qualityLevels[requestedQuality as keyof typeof qualityLevels] > qualityLevels[limits.videoQuality as keyof typeof qualityLevels]) {
          throw new Error(
            `ভিডিও গুণমান সীমা অতিক্রম করেছে / Video quality exceeds limit of ${limits.videoQuality}`
          );
        }

        // Generate video from text
        const videoResult = await generateVideoFromText({
          prompt: input.prompt,
          duration: requestedDuration,
          quality: requestedQuality as "480p" | "720p" | "1080p",
          style: input.style,
        });

        return {
          success: true,
          videoUrl: videoResult.url,
          prompt: input.prompt,
          duration: requestedDuration,
          quality: requestedQuality,
          style: input.style,
          tier: userTier,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Text-to-video generation failed:", error);
        throw new Error("টেক্সট থেকে ভিডিও তৈরি ব্যর্থ / Text-to-video generation failed");
      }
    }),

  /**
   * Get subscription limits for current user
   */
  getSubscriptionLimits: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Fetch user subscription from database
      const userTier = "free";

      const limits = SUBSCRIPTION_LIMITS[userTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free;

      return {
        tier: userTier,
        limits,
        features: {
          unlimitedImages: limits.imageLimit === -1,
          videoMaxDuration: limits.videoMaxDuration,
          videoQuality: limits.videoQuality,
          videoDailyLimit: limits.videoLimit,
        },
      };
    } catch (error) {
      console.error("Failed to get subscription limits:", error);
      throw new Error("সাবস্ক্রিপশন সীমা পেতে ব্যর্থ / Failed to get subscription limits");
    }
  }),

  /**
   * Get generation history
   */
  getGenerationHistory: protectedProcedure
    .input(
      z.object({
        type: z.enum(["text-to-image", "image-to-video", "text-to-video"]).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from database
        return {
          success: true,
          history: [],
          total: 0,
        };
      } catch (error) {
        console.error("Failed to get generation history:", error);
        throw new Error("ইতিহাস পেতে ব্যর্থ / Failed to get history");
      }
    }),

  /**
   * Get daily usage
   */
  getDailyUsage: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Fetch from database
      return {
        date: new Date(),
        imagesGenerated: 0,
        videosGenerated: 0,
        totalVideoDuration: 0,
      };
    } catch (error) {
      console.error("Failed to get daily usage:", error);
      throw new Error("দৈনিক ব্যবহার পেতে ব্যর্থ / Failed to get daily usage");
    }
  }),

  /**
   * Upgrade subscription
   */
  upgradeSubscription: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["free", "pro", "premium"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Process payment and update subscription
        return {
          success: true,
          tier: input.tier,
          limits: SUBSCRIPTION_LIMITS[input.tier],
          message: `সাবস্ক্রিপশন আপগ্রেড সফল / Subscription upgraded to ${input.tier}`,
        };
      } catch (error) {
        console.error("Subscription upgrade failed:", error);
        throw new Error("সাবস্ক্রিপশন আপগ্রেড ব্যর্থ / Subscription upgrade failed");
      }
    }),
});
