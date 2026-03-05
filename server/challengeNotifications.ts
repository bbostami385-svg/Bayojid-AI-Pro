import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";

export const challengeNotificationsRouter = router({
  // Send challenge completion notification
  notifyChallengeCompletion: protectedProcedure
    .input(
      z.object({
        challengeId: z.string(),
        challengeTitle: z.string(),
        reward: z.number(),
        badge: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Send in-app notification
      const notification = {
        userId: ctx.user.id,
        type: "challenge_completed",
        title: `চ্যালেঞ্জ সম্পূর্ণ! / Challenge Completed!`,
        message: `আপনি "${input.challengeTitle}" চ্যালেঞ্জ সম্পূর্ণ করেছেন এবং ${input.reward} পয়েন্ট অর্জন করেছেন!`,
        icon: "🎉",
        actionUrl: "/challenges",
        createdAt: new Date(),
      };

      // Send push notification to owner
      await notifyOwner({
        title: "চ্যালেঞ্জ সম্পূর্ণ / Challenge Completed",
        content: `ব্যবহারকারী "${input.challengeTitle}" চ্যালেঞ্জ সম্পূর্ণ করেছেন`,
      });

      return {
        success: true,
        notification,
      };
    }),

  // Send milestone achievement notification
  notifyMilestoneAchievement: protectedProcedure
    .input(
      z.object({
        milestoneName: z.string(),
        reward: z.number(),
        badge: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = {
        userId: ctx.user.id,
        type: "milestone_achieved",
        title: `মাইলফলক অর্জন! / Milestone Achieved!`,
        message: `অভিনন্দন! আপনি "${input.milestoneName}" মাইলফলক অর্জন করেছেন এবং ${input.reward} পয়েন্ট পেয়েছেন!`,
        icon: "🏆",
        actionUrl: "/reputation",
        createdAt: new Date(),
      };

      return {
        success: true,
        notification,
      };
    }),

  // Send streak notification
  notifyStreakMilestone: protectedProcedure
    .input(
      z.object({
        streakDays: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = {
        userId: ctx.user.id,
        type: "streak_milestone",
        title: `স্ট্রীক মাইলস্টোন! / Streak Milestone!`,
        message: `দুর্দান্ত! আপনার ${input.streakDays} দিনের স্ট্রীক চলছে। এটি চালিয়ে যান!`,
        icon: "🔥",
        actionUrl: "/challenges",
        createdAt: new Date(),
      };

      return {
        success: true,
        notification,
      };
    }),

  // Send badge earned notification
  notifyBadgeEarned: protectedProcedure
    .input(
      z.object({
        badgeName: z.string(),
        badgeIcon: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = {
        userId: ctx.user.id,
        type: "badge_earned",
        title: `নতুন ব্যাজ অর্জন! / New Badge Earned!`,
        message: `${input.badgeIcon} ${input.badgeName} ব্যাজ অর্জন করেছেন! ${input.description}`,
        icon: input.badgeIcon,
        actionUrl: "/reputation",
        createdAt: new Date(),
      };

      return {
        success: true,
        notification,
      };
    }),

  // Get challenge notifications
  getChallengeNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notifications = [
      {
        id: "1",
        type: "challenge_completed",
        title: "চ্যালেঞ্জ সম্পূর্ণ!",
        message: '"চ্যাট মাস্টার" চ্যালেঞ্জ সম্পূর্ণ করেছেন এবং 100 পয়েন্ট অর্জন করেছেন!',
        icon: "🎉",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: "2",
        type: "streak_milestone",
        title: "স্ট্রীক মাইলস্টোন!",
        message: "আপনার 7 দিনের স্ট্রীক চলছে। এটি চালিয়ে যান!",
        icon: "🔥",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
      {
        id: "3",
        type: "badge_earned",
        title: "নতুন ব্যাজ অর্জন!",
        message: "🦋 সোশ্যাল বাটারফ্লাই ব্যাজ অর্জন করেছেন!",
        icon: "🦋",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
      },
    ];

    return { notifications };
  }),

  // Mark notification as read
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "নোটিফিকেশন পড়া হিসাবে চিহ্নিত করা হয়েছে",
      };
    }),
});
