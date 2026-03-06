import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const stripePaymentRouter = router({
  // Create checkout session for subscription upgrade
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.enum(["pro", "premium"]),
        billingCycle: z.enum(["monthly", "annual"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mock Stripe checkout session creation
      // In production, use Stripe SDK: stripe.checkout.sessions.create()
      const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

      return {
        sessionId,
        checkoutUrl,
        planId: input.planId,
        billingCycle: input.billingCycle,
      };
    }),

  // Get payment history for current user
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    // Mock payment history
    return {
      payments: [
        {
          id: "pi_1",
          amount: 9.99,
          currency: "USD",
          status: "succeeded",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          planId: "pro",
          invoiceUrl: "https://invoice.stripe.com/i/1",
        },
        {
          id: "pi_2",
          amount: 19.99,
          currency: "USD",
          status: "succeeded",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          planId: "premium",
          invoiceUrl: "https://invoice.stripe.com/i/2",
        },
      ],
      totalSpent: 29.98,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }),

  // Get current subscription details
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    // Mock subscription details
    return {
      status: "active",
      planId: "pro",
      billingCycle: "monthly",
      amount: 9.99,
      currency: "USD",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: {
        videoGenerationDuration: 10,
        videoQuality: "720p",
        imageGenerationUnlimited: true,
        prioritySupport: true,
        customAIModels: 5,
      },
    };
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Mock subscription cancellation
      return {
        success: true,
        message: "সাবস্ক্রিপশন বাতিল করা হয়েছে / Subscription cancelled",
        cancelledAt: new Date(),
        refundAmount: 0,
        refundStatus: "none",
      };
    }),

  // Update payment method
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mock payment method update
      return {
        success: true,
        message: "পেমেন্ট পদ্ধতি আপডেট করা হয়েছে / Payment method updated",
        lastFour: "4242",
        expiryDate: "12/25",
      };
    }),

  // Get invoice details
  getInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Mock invoice details
      return {
        id: input.invoiceId,
        amount: 9.99,
        currency: "USD",
        status: "paid",
        date: new Date(),
        planId: "pro",
        billingCycle: "monthly",
        items: [
          {
            description: "Pro Plan - Monthly",
            amount: 9.99,
            quantity: 1,
          },
        ],
        subtotal: 9.99,
        tax: 0,
        total: 9.99,
        pdfUrl: "https://invoice.stripe.com/pdf/1",
      };
    }),

  // Download invoice as PDF
  downloadInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Mock invoice download
      return {
        success: true,
        downloadUrl: `https://invoice.stripe.com/pdf/${input.invoiceId}`,
        filename: `invoice-${input.invoiceId}.pdf`,
      };
    }),

  // Get pricing plans
  getPricingPlans: protectedProcedure.query(async ({ ctx }) => {
    return {
      plans: [
        {
          id: "free",
          name: "ফ্রি / Free",
          price: 0,
          currency: "USD",
          billingCycle: "monthly",
          features: {
            videoGenerationDuration: 8,
            videoQuality: "480p",
            imageGenerationUnlimited: false,
            imageGenerationMonthly: 10,
            prioritySupport: false,
            customAIModels: 0,
            communityAccess: true,
          },
          description: "শুরু করার জন্য নিখুঁত / Perfect to get started",
        },
        {
          id: "pro",
          name: "প্রো / Pro",
          price: 9.99,
          currency: "USD",
          billingCycle: "monthly",
          features: {
            videoGenerationDuration: 10,
            videoQuality: "720p",
            imageGenerationUnlimited: true,
            prioritySupport: true,
            customAIModels: 5,
            communityAccess: true,
          },
          description: "পেশাদারদের জন্য / For professionals",
          popular: true,
        },
        {
          id: "premium",
          name: "প্রিমিয়াম / Premium",
          price: 19.99,
          currency: "USD",
          billingCycle: "monthly",
          features: {
            videoGenerationDuration: 60,
            videoQuality: "1080p",
            imageGenerationUnlimited: true,
            prioritySupport: true,
            customAIModels: 20,
            communityAccess: true,
            apiAccess: true,
          },
          description: "সর্বোচ্চ শক্তি / Maximum power",
        },
      ],
    };
  }),
});
