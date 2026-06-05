/**
 * Gamification Router
 * Implements leaderboards, badges, streaks, and reward system
 */

import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

// Badge definitions
const BADGES = {
  firstStep: {
    id: "first_step",
    name: "First Step",
    description: "Complete your first learning activity",
    icon: "🎯",
    points: 10,
  },
  weekWarrior: {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "⚔️",
    points: 50,
  },
  monthMaster: {
    id: "month_master",
    name: "Month Master",
    description: "Maintain a 30-day learning streak",
    icon: "👑",
    points: 200,
  },
  confidenceBuilder: {
    id: "confidence_builder",
    name: "Confidence Builder",
    description: "Reach 80% confidence in any topic",
    icon: "💪",
    points: 75,
  },
  perfectScore: {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Score 100% on an assessment",
    icon: "💯",
    points: 100,
  },
  helpfulPeer: {
    id: "helpful_peer",
    name: "Helpful Peer",
    description: "Get 10 helpful votes on forum posts",
    icon: "🤝",
    points: 60,
  },
  masterTeacher: {
    id: "master_teacher",
    name: "Master Teacher",
    description: "Help 5 students master a topic",
    icon: "🎓",
    points: 150,
  },
  speedLearner: {
    id: "speed_learner",
    name: "Speed Learner",
    description: "Complete a learning path in half the estimated time",
    icon: "⚡",
    points: 80,
  },
  knowledgeSeeker: {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Complete 10 different topics",
    icon: "🔍",
    points: 120,
  },
  communityChampion: {
    id: "community_champion",
    name: "Community Champion",
    description: "Participate in 5 study groups",
    icon: "🏆",
    points: 100,
  },
};

export const leaderboardRouter = router({
  // Get global leaderboard
  getGlobalLeaderboard: publicProcedure
    .input(
      z.object({
        timeframe: z.enum(["week", "month", "all_time"]).optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit || 10;
      return [
        {
          rank: 1,
          userId: "user_1",
          name: "Alex Chen",
          points: 2850,
          level: 12,
          streak: 45,
          badges: 8,
          avatar: "🌟",
        },
        {
          rank: 2,
          userId: "user_2",
          name: "Sarah Johnson",
          points: 2650,
          level: 11,
          streak: 32,
          badges: 7,
          avatar: "📚",
        },
        {
          rank: 3,
          userId: "user_3",
          name: "Mike Davis",
          points: 2420,
          level: 10,
          streak: 28,
          badges: 6,
          avatar: "💡",
        },
      ];
    }),

  // Get topic-specific leaderboard
  getTopicLeaderboard: publicProcedure
    .input(
      z.object({
        topic: z.string(),
        timeframe: z.enum(["week", "month", "all_time"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return [
        {
          rank: 1,
          name: "Math Master",
          points: 1200,
          confidence: 95,
          lessonsCompleted: 24,
        },
        {
          rank: 2,
          name: "Calculus Pro",
          points: 1050,
          confidence: 88,
          lessonsCompleted: 20,
        },
      ];
    }),

  // Get user rank
  getUserRank: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      rank: 42,
      totalUsers: 5000,
      points: 1850,
      level: 8,
      nextLevelPoints: 2000,
      percentToNextLevel: 92.5,
    };
  }),

  // Get leaderboard by category
  getLeaderboardByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(["points", "streak", "level", "badges"]),
      })
    )
    .query(async ({ input }) => {
      return [
        {
          rank: 1,
          name: "Top Learner",
          value: input.category === "points" ? 2850 : input.category === "streak" ? 60 : 15,
        },
      ];
    }),
});

export const badgeRouter = router({
  // Get all badges
  getAllBadges: publicProcedure.query(async () => {
    return Object.values(BADGES);
  }),

  // Get user badges
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        ...BADGES.firstStep,
        unlockedAt: new Date(Date.now() - 2592000000),
        progress: 100,
      },
      {
        ...BADGES.confidenceBuilder,
        unlockedAt: new Date(Date.now() - 1209600000),
        progress: 100,
      },
      {
        ...BADGES.weekWarrior,
        unlockedAt: new Date(Date.now() - 604800000),
        progress: 100,
      },
    ];
  }),

  // Get badge progress
  getBadgeProgress: protectedProcedure
    .input(z.object({ badgeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        badgeId: input.badgeId,
        name: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        progress: 5,
        required: 7,
        progressPercentage: 71,
        isUnlocked: false,
        unlocksAt: "2 days",
      };
    }),

  // Check badge eligibility
  checkBadgeEligibility: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return {
        userId: input.userId,
        eligibleBadges: [
          {
            badgeId: "week_warrior",
            name: "Week Warrior",
            progress: 71,
            unlocksAt: "2 days",
          },
        ],
        newBadgesUnlocked: [],
      };
    }),
});

export const streakRouter = router({
  // Get user streak
  getUserStreak: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      currentStreak: 23,
      longestStreak: 45,
      lastActivityDate: new Date(),
      daysUntilStreakLost: 1,
      streakBonusMultiplier: 1.5,
    };
  }),

  // Get streak calendar
  getStreakCalendar: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const days = [];
      for (let i = 1; i <= 30; i++) {
        days.push({
          date: i,
          hasActivity: Math.random() > 0.3,
          activityCount: Math.floor(Math.random() * 5),
          points: Math.floor(Math.random() * 100),
        });
      }
      return {
        month: input.month,
        year: input.year,
        days,
        totalActivityDays: days.filter((d) => d.hasActivity).length,
        totalPoints: days.reduce((sum, d) => sum + d.points, 0),
      };
    }),

  // Log activity for streak
  logActivity: protectedProcedure
    .input(
      z.object({
        activityType: z.string(),
        points: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        streakUpdated: true,
        currentStreak: 24,
        pointsEarned: input.points,
        bonusMultiplier: 1.5,
        totalPoints: Math.round(input.points * 1.5),
      };
    }),
});

export const rewardRouter = router({
  // Get user rewards
  getUserRewards: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      totalPoints: 2850,
      level: 12,
      nextLevelAt: 3000,
      rewards: [
        {
          id: "reward_1",
          name: "Premium Badge Pack",
          description: "Unlock 5 exclusive badges",
          cost: 500,
          type: "badge",
          purchased: false,
        },
        {
          id: "reward_2",
          name: "Lifetime Premium",
          description: "1 year of premium features",
          cost: 2000,
          type: "subscription",
          purchased: false,
        },
        {
          id: "reward_3",
          name: "Custom Avatar",
          description: "Create your own custom avatar",
          cost: 300,
          type: "cosmetic",
          purchased: true,
        },
      ],
    };
  }),

  // Redeem reward
  redeemReward: protectedProcedure
    .input(z.object({ rewardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Reward redeemed successfully",
        rewardId: input.rewardId,
        pointsDeducted: 500,
        remainingPoints: 2350,
      };
    }),

  // Get reward shop
  getRewardShop: publicProcedure.query(async () => {
    return [
      {
        id: "reward_1",
        name: "Premium Badge Pack",
        description: "Unlock 5 exclusive badges",
        cost: 500,
        type: "badge",
        icon: "🎖️",
        popularity: 4.8,
      },
      {
        id: "reward_2",
        name: "Lifetime Premium",
        description: "1 year of premium features",
        cost: 2000,
        type: "subscription",
        icon: "⭐",
        popularity: 4.9,
      },
    ];
  }),

  // Get daily bonus
  getDailyBonus: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      dailyBonusAvailable: true,
      bonusPoints: 50,
      nextBonusAt: new Date(Date.now() + 86400000),
      consecutiveDays: 5,
    };
  }),

  // Claim daily bonus
  claimDailyBonus: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      success: true,
      pointsClaimed: 50,
      bonusMultiplier: 1.5,
      totalPointsClaimed: 75,
      consecutiveDays: 6,
      nextBonusAt: new Date(Date.now() + 86400000),
    };
  }),
});

export const achievementRouter = router({
  // Get achievements
  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "ach_1",
        title: "First Lesson",
        description: "Complete your first lesson",
        icon: "🎓",
        unlockedAt: new Date(Date.now() - 2592000000),
        rarity: "common",
      },
      {
        id: "ach_2",
        title: "Confidence Master",
        description: "Reach 90% confidence in a topic",
        icon: "💪",
        unlockedAt: new Date(Date.now() - 1209600000),
        rarity: "rare",
      },
      {
        id: "ach_3",
        title: "Community Helper",
        description: "Help 10 other learners",
        icon: "🤝",
        unlockedAt: null,
        rarity: "epic",
        progress: 6,
        required: 10,
      },
    ];
  }),

  // Get achievement details
  getAchievementDetails: publicProcedure
    .input(z.object({ achievementId: z.string() }))
    .query(async ({ input }) => {
      return {
        id: input.achievementId,
        title: "Confidence Master",
        description: "Reach 90% confidence in a topic",
        icon: "💪",
        rarity: "rare",
        points: 100,
        unlockedBy: 2450,
        unlockedPercentage: 49,
      };
    }),
});

export const gamificationRouter = router({
  leaderboards: leaderboardRouter,
  badges: badgeRouter,
  streaks: streakRouter,
  rewards: rewardRouter,
  achievements: achievementRouter,
});

export default gamificationRouter;
