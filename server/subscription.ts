import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";

// Subscription tier definitions
export const SUBSCRIPTION_TIERS = {
  free: {
    id: "free",
    name: "ফ্রি / Free",
    description: "মৌলিক বৈশিষ্ট্য / Basic features",
    price: 0,
    features: {
      images: "সীমাহীন / Unlimited",
      imageQuality: "উচ্চ / High",
      videoDuration: "৮ সেকেন্ড / 8 seconds",
      videoQuality: "480p",
      videosPerDay: 3,
      documentAnalysis: true,
      voiceFeatures: true,
      encryption: true,
      translation: true,
      prioritySupport: false,
    },
  },
  pro: {
    id: "pro",
    name: "প্রো / Pro",
    description: "উন্নত বৈশিষ্ট্য / Advanced features",
    price: 999, // $9.99 per month
    features: {
      images: "সীমাহীন / Unlimited",
      imageQuality: "অতি উচ্চ / Ultra High",
      videoDuration: "১০ সেকেন্ড / 10 seconds",
      videoQuality: "720p",
      videosPerDay: 10,
      documentAnalysis: true,
      voiceFeatures: true,
      encryption: true,
      translation: true,
      prioritySupport: true,
    },
  },
  premium: {
    id: "premium",
    name: "প্রিমিয়াম / Premium",
    description: "সর্বোচ্চ বৈশিষ্ট্য / Maximum features",
    price: 2999, // $29.99 per month
    features: {
      images: "সীমাহীন / Unlimited",
      imageQuality: "সর্বোচ্চ / Maximum",
      videoDuration: "৬০ সেকেন্ড / 60 seconds",
      videoQuality: "1080p",
      videosPerDay: -1, // unlimited
      documentAnalysis: true,
      voiceFeatures: true,
      encryption: true,
      translation: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
    },
  },
};

export const subscriptionRouter = router({
  /**
   * Get all subscription tiers
   */
  getTiers: protectedProcedure.query(() => {
    return {
      tiers: Object.values(SUBSCRIPTION_TIERS),
      currency: "USD",
    };
  }),

  /**
   * Get current user subscription
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Fetch from database
      // For now, return free tier
      const tier = SUBSCRIPTION_TIERS.free;

      return {
        tier: tier.id,
        tierName: tier.name,
        features: tier.features,
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
    } catch (error) {
      console.error("Failed to get subscription:", error);
      throw new Error("সাবস্ক্রিপশন তথ্য পেতে ব্যর্থ / Failed to get subscription");
    }
  }),

  /**
   * Upgrade subscription
   */
  upgradeSubscription: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(["free", "pro", "premium"]),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tier = SUBSCRIPTION_TIERS[input.tierId];

        if (!tier) {
          throw new Error("অবৈধ সাবস্ক্রিপশন টায়ার / Invalid subscription tier");
        }

        // TODO: Process payment with Stripe
        // For now, just return success
        return {
          success: true,
          tier: tier.id,
          tierName: tier.name,
          price: input.billingCycle === "yearly" ? tier.price * 10 : tier.price,
          billingCycle: input.billingCycle,
          message: `${tier.name} এ আপগ্রেড সফল / Successfully upgraded to ${tier.name}`,
        };
      } catch (error) {
        console.error("Subscription upgrade failed:", error);
        throw new Error("সাবস্ক্রিপশন আপগ্রেড ব্যর্থ / Subscription upgrade failed");
      }
    }),

  /**
   * Downgrade subscription
   */
  downgradeSubscription: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(["free", "pro", "premium"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tier = SUBSCRIPTION_TIERS[input.tierId];

        if (!tier) {
          throw new Error("অবৈধ সাবস্ক্রিপশন টায়ার / Invalid subscription tier");
        }

        // TODO: Update subscription in database
        return {
          success: true,
          tier: tier.id,
          tierName: tier.name,
          message: `${tier.name} এ ডাউনগ্রেড সফল / Successfully downgraded to ${tier.name}`,
        };
      } catch (error) {
        console.error("Subscription downgrade failed:", error);
        throw new Error("সাবস্ক্রিপশন ডাউনগ্রেড ব্যর্থ / Subscription downgrade failed");
      }
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // TODO: Cancel subscription in database
      return {
        success: true,
        message: "সাবস্ক্রিপশন বাতিল সফল / Subscription cancelled successfully",
      };
    } catch (error) {
      console.error("Subscription cancellation failed:", error);
      throw new Error("সাবস্ক্রিপশন বাতিল ব্যর্থ / Subscription cancellation failed");
    }
  }),

  /**
   * Get subscription features
   */
  getFeatures: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(["free", "pro", "premium"]),
      })
    )
    .query(({ input }) => {
      const tier = SUBSCRIPTION_TIERS[input.tierId];

      if (!tier) {
        throw new Error("অবৈধ সাবস্ক্রিপশন টায়ার / Invalid subscription tier");
      }

      return {
        tier: tier.id,
        tierName: tier.name,
        features: tier.features,
      };
    }),

  /**
   * Compare subscription tiers
   */
  compareTiers: protectedProcedure.query(() => {
    const tiers = Object.values(SUBSCRIPTION_TIERS);

    return {
      tiers: tiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        features: tier.features,
      })),
    };
  }),

  /**
   * Get billing history
   */
  getBillingHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Fetch from database
      return {
        history: [],
        total: 0,
      };
    } catch (error) {
      console.error("Failed to get billing history:", error);
      throw new Error("বিলিং ইতিহাস পেতে ব্যর্থ / Failed to get billing history");
    }
  }),

  /**
   * Get payment methods
   */
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Fetch from Stripe
      return {
        methods: [],
        default: null,
      };
    } catch (error) {
      console.error("Failed to get payment methods:", error);
      throw new Error("পেমেন্ট পদ্ধতি পেতে ব্যর্থ / Failed to get payment methods");
    }
  }),

  /**
   * Add payment method
   */
  addPaymentMethod: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Add to Stripe
        return {
          success: true,
          message: "পেমেন্ট পদ্ধতি যোগ সফল / Payment method added successfully",
        };
      } catch (error) {
        console.error("Failed to add payment method:", error);
        throw new Error("পেমেন্ট পদ্ধতি যোগ ব্যর্থ / Failed to add payment method");
      }
    }),
});
