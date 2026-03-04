import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

export const socialSharingRouter = router({
  /**
   * Generate shareable link for conversation
   */
  generateShareLink: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        includeMessages: z.boolean().default(true),
        expiresIn: z.number().optional(), // hours
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Generate unique share token and save to database
        const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const shareUrl = `${process.env.VITE_FRONTEND_URL || "https://example.com"}/shared/${shareToken}`;

        return {
          success: true,
          shareToken,
          shareUrl,
          expiresAt: input.expiresIn ? new Date(Date.now() + input.expiresIn * 60 * 60 * 1000) : null,
        };
      } catch (error) {
        console.error("Failed to generate share link:", error);
        throw new Error("শেয়ার লিংক তৈরি ব্যর্থ / Failed to generate share link");
      }
    }),

  /**
   * Share to Twitter/X
   */
  shareToTwitter: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().max(280),
        includeLink: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const twitterUrl = new URL("https://twitter.com/intent/tweet");
        twitterUrl.searchParams.set("text", input.message);

        if (input.includeLink) {
          const shareLink = await generateShareLink(input.conversationId);
          twitterUrl.searchParams.set("url", shareLink.shareUrl);
        }

        return {
          success: true,
          url: twitterUrl.toString(),
          message: "টুইটারে শেয়ার করার জন্য প্রস্তুত / Ready to share on Twitter",
        };
      } catch (error) {
        console.error("Failed to share to Twitter:", error);
        throw new Error("টুইটার শেয়ারিং ব্যর্থ / Failed to share to Twitter");
      }
    }),

  /**
   * Share to Facebook
   */
  shareToFacebook: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const shareLink = await generateShareLink(input.conversationId);

        const facebookUrl = new URL("https://www.facebook.com/sharer/sharer.php");
        facebookUrl.searchParams.set("u", shareLink.shareUrl);
        facebookUrl.searchParams.set("quote", input.title);

        return {
          success: true,
          url: facebookUrl.toString(),
          message: "ফেসবুকে শেয়ার করার জন্য প্রস্তুত / Ready to share on Facebook",
        };
      } catch (error) {
        console.error("Failed to share to Facebook:", error);
        throw new Error("ফেসবুক শেয়ারিং ব্যর্থ / Failed to share to Facebook");
      }
    }),

  /**
   * Share to LinkedIn
   */
  shareToLinkedIn: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const shareLink = await generateShareLink(input.conversationId);

        const linkedinUrl = new URL("https://www.linkedin.com/sharing/share-offsite/");
        linkedinUrl.searchParams.set("url", shareLink.shareUrl);

        return {
          success: true,
          url: linkedinUrl.toString(),
          message: "লিংকডইনে শেয়ার করার জন্য প্রস্তুত / Ready to share on LinkedIn",
        };
      } catch (error) {
        console.error("Failed to share to LinkedIn:", error);
        throw new Error("লিংকডইন শেয়ারিং ব্যর্থ / Failed to share to LinkedIn");
      }
    }),

  /**
   * Share via email
   */
  shareViaEmail: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        recipientEmail: z.string().email(),
        subject: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Send email via email service
        return {
          success: true,
          message: "ইমেইল পাঠানো হয়েছে / Email sent successfully",
        };
      } catch (error) {
        console.error("Failed to share via email:", error);
        throw new Error("ইমেইল শেয়ারিং ব্যর্থ / Failed to share via email");
      }
    }),

  /**
   * Copy to clipboard
   */
  copyToClipboard: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        format: z.enum(["text", "markdown", "html"]).default("text"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Fetch conversation and format it
        const shareLink = await generateShareLink(input.conversationId);

        return {
          success: true,
          content: `কথোপকথন: ${shareLink.shareUrl}`,
          format: input.format,
        };
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        throw new Error("ক্লিপবোর্ডে কপি ব্যর্থ / Failed to copy to clipboard");
      }
    }),

  /**
   * Get shared conversation
   */
  getSharedConversation: protectedProcedure
    .input(
      z.object({
        shareToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Fetch shared conversation from database
        return {
          success: true,
          conversation: {
            id: 1,
            title: "শেয়ার করা কথোপকথন / Shared Conversation",
            messages: [],
            sharedBy: "ব্যবহারকারী / User",
            sharedAt: new Date(),
          },
        };
      } catch (error) {
        console.error("Failed to get shared conversation:", error);
        throw new Error("শেয়ার করা কথোপকথন পেতে ব্যর্থ / Failed to get shared conversation");
      }
    }),

  /**
   * Get share statistics
   */
  getShareStatistics: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Fetch from database
        return {
          totalShares: 0,
          sharesByPlatform: {
            twitter: 0,
            facebook: 0,
            linkedin: 0,
            email: 0,
            direct: 0,
          },
          views: 0,
          lastSharedAt: null,
        };
      } catch (error) {
        console.error("Failed to get share statistics:", error);
        throw new Error("শেয়ার পরিসংখ্যান পেতে ব্যর্থ / Failed to get share statistics");
      }
    }),
});

// Helper function
async function generateShareLink(conversationId: number) {
  const shareToken = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const shareUrl = `${process.env.VITE_FRONTEND_URL || "https://example.com"}/shared/${shareToken}`;

  return {
    shareToken,
    shareUrl,
  };
}
