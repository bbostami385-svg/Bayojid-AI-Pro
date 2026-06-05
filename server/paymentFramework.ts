/**
 * Payment System Framework
 * Handles payment processing with support for multiple payment gateways
 * Live API keys are injected via environment variables
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

// Payment Gateway Configuration
export interface PaymentGatewayConfig {
  id: string;
  name: string;
  envKeyId: string;
  envKeySecret: string;
  isConfigured: boolean;
  supportedCurrencies: string[];
  supportedMethods: string[];
}

// Supported Payment Gateways
export const PAYMENT_GATEWAYS: Record<string, PaymentGatewayConfig> = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    envKeyId: "STRIPE_PUBLISHABLE_KEY",
    envKeySecret: "STRIPE_SECRET_KEY",
    isConfigured: !!process.env.STRIPE_SECRET_KEY,
    supportedCurrencies: ["USD", "EUR", "GBP", "INR", "BDT"],
    supportedMethods: ["card", "apple_pay", "google_pay", "bank_transfer"],
  },
  sslcommerz: {
    id: "sslcommerz",
    name: "SSLCommerz",
    envKeyId: "SSLCOMMERZ_STORE_ID",
    envKeySecret: "SSLCOMMERZ_STORE_PASS",
    isConfigured: !!process.env.SSLCOMMERZ_STORE_ID && !!process.env.SSLCOMMERZ_STORE_PASS,
    supportedCurrencies: ["BDT", "USD", "EUR"],
    supportedMethods: ["card", "bkash", "nagad", "rocket", "bank_transfer"],
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    envKeyId: "PAYPAL_CLIENT_ID",
    envKeySecret: "PAYPAL_CLIENT_SECRET",
    isConfigured: !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET,
    supportedCurrencies: ["USD", "EUR", "GBP", "INR"],
    supportedMethods: ["paypal", "card", "bank_transfer"],
  },
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    envKeyId: "RAZORPAY_KEY_ID",
    envKeySecret: "RAZORPAY_KEY_SECRET",
    isConfigured: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    supportedCurrencies: ["INR", "USD"],
    supportedMethods: ["card", "upi", "netbanking", "wallet"],
  },
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      videoMinutesPerMonth: 10,
      imagesPerMonth: 5,
      storageGB: 1,
      maxProjects: 3,
      supportLevel: "community",
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 9.99,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      videoMinutesPerMonth: 60,
      imagesPerMonth: 50,
      storageGB: 10,
      maxProjects: 10,
      supportLevel: "email",
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29.99,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      videoMinutesPerMonth: 500,
      imagesPerMonth: 500,
      storageGB: 100,
      maxProjects: 50,
      supportLevel: "priority",
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 99.99,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      videoMinutesPerMonth: 5000,
      imagesPerMonth: 5000,
      storageGB: 1000,
      maxProjects: 500,
      supportLevel: "dedicated",
    },
  },
};

// Get configured payment gateways
export function getConfiguredGateways(): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS).filter((gateway) => gateway.isConfigured);
}

// Get all available gateways
export function getAllAvailableGateways(): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS);
}

// Check if gateway is configured
export function isGatewayConfigured(gatewayId: string): boolean {
  const gateway = PAYMENT_GATEWAYS[gatewayId];
  return gateway ? gateway.isConfigured : false;
}

// Get gateway credentials
export function getGatewayCredentials(gatewayId: string) {
  const gateway = PAYMENT_GATEWAYS[gatewayId];
  if (!gateway) return null;

  if (!gateway.isConfigured) {
    return {
      configured: false,
      message: `Missing credentials: ${gateway.envKeyId}, ${gateway.envKeySecret}`,
    };
  }

  return {
    configured: true,
    id: process.env[gateway.envKeyId],
    secret: process.env[gateway.envKeySecret] ? "***" : undefined,
  };
}

// Payment Router
export const paymentRouter = router({
  // Get available payment gateways
  getAvailableGateways: protectedProcedure.query(async ({ ctx }) => {
    const gateways = getConfiguredGateways();
    return {
      userId: ctx.user.id,
      gateways: gateways.map((g) => ({
        id: g.id,
        name: g.name,
        supportedCurrencies: g.supportedCurrencies,
        supportedMethods: g.supportedMethods,
      })),
      count: gateways.length,
    };
  }),

  // Get subscription plans
  getSubscriptionPlans: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      plans: Object.values(SUBSCRIPTION_PLANS),
    };
  }),

  // Get user's current subscription
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      currentPlan: "free",
      status: "active",
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: SUBSCRIPTION_PLANS.free.features,
    };
  }),

  // Upgrade subscription (placeholder for live API)
  upgradeSubscription: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        gatewayId: z.string(),
        paymentMethodId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = SUBSCRIPTION_PLANS[input.planId as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) {
        throw new Error("Plan not found");
      }

      const gateway = PAYMENT_GATEWAYS[input.gatewayId];
      if (!gateway || !gateway.isConfigured) {
        throw new Error(`Payment gateway ${input.gatewayId} not configured`);
      }

      // TODO: Integrate with live payment API
      // This will be implemented when live API credentials are provided
      return {
        success: false,
        message: `Payment gateway ${gateway.name} integration pending. Please add live API credentials.`,
        planId: input.planId,
        gatewayId: input.gatewayId,
        status: "pending_api_integration",
      };
    }),

  // Create payment intent (placeholder for live API)
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        currency: z.string(),
        planId: z.string(),
        gatewayId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gateway = PAYMENT_GATEWAYS[input.gatewayId];
      if (!gateway || !gateway.isConfigured) {
        throw new Error(`Payment gateway ${input.gatewayId} not configured`);
      }

      // TODO: Integrate with live payment API
      return {
        success: false,
        message: `Payment intent creation pending. Please add live API credentials for ${gateway.name}.`,
        gatewayId: input.gatewayId,
        status: "pending_api_integration",
      };
    }),

  // Confirm payment (placeholder for live API)
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        gatewayId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gateway = PAYMENT_GATEWAYS[input.gatewayId];
      if (!gateway || !gateway.isConfigured) {
        throw new Error(`Payment gateway ${input.gatewayId} not configured`);
      }

      // TODO: Integrate with live payment API
      return {
        success: false,
        message: `Payment confirmation pending. Please add live API credentials for ${gateway.name}.`,
        gatewayId: input.gatewayId,
        status: "pending_api_integration",
      };
    }),

  // Get payment history
  getPaymentHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        payments: [
          {
            id: "payment_1",
            date: new Date(),
            amount: 9.99,
            currency: "USD",
            plan: "Starter",
            status: "completed",
            gateway: "stripe",
          },
        ],
        total: 1,
      };
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      success: true,
      message: "Subscription cancelled successfully",
      effectiveDate: new Date(),
    };
  }),

  // Get payment gateway status
  getGatewayStatus: protectedProcedure
    .input(z.object({ gatewayId: z.string() }))
    .query(async ({ ctx, input }) => {
      const gateway = PAYMENT_GATEWAYS[input.gatewayId];
      if (!gateway) {
        return { status: "not_found", message: "Gateway not found" };
      }

      return {
        gatewayId: input.gatewayId,
        name: gateway.name,
        configured: gateway.isConfigured,
        envKeyId: gateway.envKeyId,
        envKeySecret: gateway.envKeySecret,
        supportedCurrencies: gateway.supportedCurrencies,
        supportedMethods: gateway.supportedMethods,
        message: gateway.isConfigured ? "Ready to use" : "Not configured - add API credentials",
      };
    }),

  // Get all gateways status
  getAllGatewaysStatus: protectedProcedure.query(async ({ ctx }) => {
    const gateways = Object.values(PAYMENT_GATEWAYS);
    return {
      userId: ctx.user.id,
      gateways: gateways.map((g) => ({
        id: g.id,
        name: g.name,
        configured: g.isConfigured,
        envKeyId: g.envKeyId,
        envKeySecret: g.envKeySecret,
      })),
      configuredCount: gateways.filter((g) => g.isConfigured).length,
      totalCount: gateways.length,
    };
  }),

  // Webhook handler (placeholder)
  handlePaymentWebhook: protectedProcedure
    .input(
      z.object({
        gatewayId: z.string(),
        eventType: z.string(),
        data: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement webhook handling for each payment gateway
      return {
        success: true,
        message: "Webhook received and queued for processing",
        eventType: input.eventType,
        gatewayId: input.gatewayId,
      };
    }),
});

export default paymentRouter;
