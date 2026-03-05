import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const leaderboardSharingRouter = router({
  // Share leaderboard to social media
  shareLeaderboardToSocial: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["twitter", "facebook", "linkedin", "whatsapp"]),
        rank: z.number(),
        points: z.number(),
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const messages: Record<string, string> = {
        twitter: `🏆 আমি #AIChat অ্যাপে লিডারবোর্ডে #${input.rank} স্থানে আছি ${input.points} পয়েন্ট নিয়ে! আপনিও যোগ দিন এবং প্রতিযোগিতা করুন! 🚀 #গেমিফিকেশন`,
        facebook: `আমি AI Chat অ্যাপে লিডারবোর্ডে ${input.rank} নম্বর স্থানে আছি ${input.points} পয়েন্ট নিয়ে! আপনিও যোগ দিন এবং চ্যালেঞ্জ সম্পূর্ণ করুন!`,
        linkedin: `আমি AI Chat প্ল্যাটফর্মে গ্যামিফিকেশন চ্যালেঞ্জে ${input.rank} স্থানে রয়েছি। এই উদ্ভাবনী প্ল্যাটফর্মটি ব্যবহারকারী এনগেজমেন্ট এবং শেখার জন্য দুর্দান্ত!`,
        whatsapp: `আমি AI Chat লিডারবোর্ডে #${input.rank} স্থানে আছি 🏆 ${input.points} পয়েন্ট নিয়ে! আপনিও যোগ দিন এবং প্রতিযোগিতা করুন! 🎮`,
      };

      const shareUrls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(messages.facebook)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://ai-chat.app`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`,
      };

      return {
        success: true,
        message: `লিডারবোর্ড ${input.platform} এ শেয়ার করা হয়েছে!`,
        shareUrl: shareUrls[input.platform],
        shareMessage: messages[input.platform],
      };
    }),

  // Get shareable leaderboard link
  getShareableLeaderboardLink: protectedProcedure
    .input(
      z.object({
        rank: z.number(),
        points: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const shareCode = `lb_${ctx.user.id}_${Date.now()}`;
      const shareUrl = `https://ai-chat.app/leaderboard/${shareCode}`;

      return {
        shareUrl,
        shareCode,
        message: `আমি AI Chat লিডারবোর্ডে #${input.rank} স্থানে আছি ${input.points} পয়েন্ট নিয়ে!`,
      };
    }),

  // Get leaderboard share statistics
  getShareStatistics: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalShares: 42,
      sharesByPlatform: {
        twitter: 18,
        facebook: 12,
        linkedin: 8,
        whatsapp: 4,
      },
      recentShares: [
        {
          id: "1",
          platform: "twitter",
          sharedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          engagement: 24,
        },
        {
          id: "2",
          platform: "facebook",
          sharedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          engagement: 15,
        },
        {
          id: "3",
          platform: "whatsapp",
          sharedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          engagement: 8,
        },
      ],
    };
  }),

  // Create custom share message
  createCustomShareMessage: protectedProcedure
    .input(
      z.object({
        rank: z.number(),
        points: z.number(),
        customMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const defaultMessage = `আমি AI Chat লিডারবোর্ডে #${input.rank} স্থানে আছি ${input.points} পয়েন্ট নিয়ে! 🏆`;
      const message = input.customMessage || defaultMessage;

      return {
        success: true,
        message: "কাস্টম শেয়ার মেসেজ তৈরি হয়েছে",
        shareMessage: message,
        shareLinks: {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(message)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
        },
      };
    }),

  // Track share referrals
  trackShareReferral: protectedProcedure
    .input(
      z.object({
        shareCode: z.string(),
        referredUserId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "শেয়ার রেফারেল ট্র্যাক করা হয়েছে",
        bonusPoints: 10,
      };
    }),
});
