import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const challengesRouter = router({
  // Get active challenges
  getActiveChallenges: protectedProcedure.query(async ({ ctx }) => {
    const challenges = [
      {
        id: "1",
        title: "চ্যাট মাস্টার / Chat Master",
        description: "এই সপ্তাহে ১০টি কথোপকথন শুরু করুন",
        icon: "💬",
        requirement: 10,
        progress: 7,
        reward: 100,
        rewardType: "points",
        badge: "chat-master",
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: "easy",
      },
      {
        id: "2",
        title: "টেমপ্লেট শেয়ারার / Template Sharer",
        description: "৫টি চ্যাট টেমপ্লেট শেয়ার করুন",
        icon: "📋",
        requirement: 5,
        progress: 2,
        reward: 150,
        rewardType: "points",
        badge: "template-sharer",
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: "medium",
      },
      {
        id: "3",
        title: "মডেল ক্রিয়েটর / Model Creator",
        description: "কাস্টম AI মডেল তৈরি করুন এবং শেয়ার করুন",
        icon: "🤖",
        requirement: 3,
        progress: 1,
        reward: 250,
        rewardType: "points",
        badge: "model-creator",
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: "hard",
      },
      {
        id: "4",
        title: "ভিডিও প্রোডিউসার / Video Producer",
        description: "এই সপ্তাহে ৩টি ভিডিও তৈরি করুন",
        icon: "🎬",
        requirement: 3,
        progress: 1,
        reward: 200,
        rewardType: "points",
        badge: "video-producer",
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: "medium",
      },
      {
        id: "5",
        title: "সোশ্যাল বাটারফ্লাই / Social Butterfly",
        description: "আপনার কথোপকথন সোশ্যাল মিডিয়ায় ১০ বার শেয়ার করুন",
        icon: "🦋",
        requirement: 10,
        progress: 3,
        reward: 120,
        rewardType: "points",
        badge: "social-butterfly",
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: "easy",
      },
    ];

    return { challenges };
  }),

  // Get completed challenges
  getCompletedChallenges: protectedProcedure.query(async ({ ctx }) => {
    const completed = [
      {
        id: "c1",
        title: "প্রথম কথোপকথন / First Chat",
        description: "আপনার প্রথম কথোপকথন সম্পূর্ণ করুন",
        icon: "🎉",
        reward: 50,
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        badge: "first-chat",
      },
      {
        id: "c2",
        title: "দশ বার্তা / Ten Messages",
        description: "একটি কথোপকথনে ১০টি বার্তা পাঠান",
        icon: "💯",
        reward: 75,
        completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        badge: "ten-messages",
      },
      {
        id: "c3",
        title: "প্রোফাইল সম্পূর্ণ / Profile Complete",
        description: "আপনার প্রোফাইল সম্পূর্ণ করুন",
        icon: "👤",
        reward: 100,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        badge: "profile-complete",
      },
    ];

    return { completed };
  }),

  // Complete a challenge
  completeChallenge: protectedProcedure
    .input(z.object({ challengeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real app, this would update the database
      return {
        success: true,
        message: "চ্যালেঞ্জ সম্পূর্ণ হয়েছে! / Challenge completed!",
        reward: 100,
        newBadge: "challenge-master",
      };
    }),

  // Get challenge leaderboard
  getChallengeLeaderboard: protectedProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const leaderboard = [
        {
          rank: 1,
          username: "আলী / Ali",
          progress: 10,
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          avatar: "👨‍💼",
        },
        {
          rank: 2,
          username: "ফাতেমা / Fatima",
          progress: 9,
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          avatar: "👩‍💼",
        },
        {
          rank: 3,
          username: "করিম / Karim",
          progress: 8,
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          avatar: "👨‍🎓",
        },
        {
          rank: 4,
          username: "আয়েশা / Ayesha",
          progress: 7,
          completedAt: null,
          avatar: "👩‍🎓",
        },
      ];

      return { leaderboard };
    }),

  // Get user challenge stats
  getUserChallengeStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalChallengesCompleted: 15,
      totalPointsEarned: 2500,
      currentStreak: 7,
      badges: [
        { id: "1", name: "চ্যাট মাস্টার / Chat Master", icon: "💬" },
        { id: "2", name: "টেমপ্লেট শেয়ারার / Template Sharer", icon: "📋" },
        { id: "3", name: "সোশ্যাল বাটারফ্লাই / Social Butterfly", icon: "🦋" },
      ],
      nextMilestone: {
        name: "চ্যালেঞ্জ চ্যাম্পিয়ন / Challenge Champion",
        requirement: 20,
        progress: 15,
        reward: 500,
      },
    };
  }),

  // Get weekly challenges reset info
  getWeeklyChallengesInfo: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + (7 - nextReset.getDay()));
    nextReset.setHours(0, 0, 0, 0);

    return {
      week: Math.ceil((now.getDate()) / 7),
      nextResetDate: nextReset,
      timeUntilReset: Math.floor((nextReset.getTime() - now.getTime()) / 1000),
      totalWeeklyChallenges: 5,
      completedThisWeek: 2,
      totalPointsThisWeek: 250,
    };
  }),
});
