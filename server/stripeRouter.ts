import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { getDb } from "./db";
import {
  stripeCustomers,
  stripePaymentIntents,
  stripeSubscriptions,
  stripeInvoices,
  stripePrices,
  stripeProducts,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

/**
 * Stripe Payment Router
 * Handles all Stripe-related operations
 */
export const stripeRouter = router({
  /**
   * Create a Stripe customer for the user
   */
  createCustomer: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Check if customer already exists
        const existingCustomer = await db.query.stripeCustomers.findFirst({
          where: eq(stripeCustomers.userId, ctx.user.id),
        } as any);

        if (existingCustomer) {
          return { success: true, customerId: existingCustomer.stripeCustomerId };
        }

        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: input.email,
          name: input.name,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });

        // Save to database
        await db.insert(stripeCustomers).values({
          userId: ctx.user.id,
          stripeCustomerId: customer.id,
          email: input.email,
        } as any);

        return { success: true, customerId: customer.id };
      } catch (error) {
        console.error("Error creating Stripe customer:", error);
        throw new Error("Failed to create Stripe customer");
      }
    }),

  /**
   * Create a checkout session for payment
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create Stripe customer
        let customer = await db.query.stripeCustomers.findFirst({
          where: eq(stripeCustomers.userId, ctx.user.id),
        } as any);

        if (!customer) {
          const stripeCustomer = await stripe.customers.create({
            email: ctx.user.email || `user-${ctx.user.id}@bayojid.ai`,
            name: ctx.user.name,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });

          await db.insert(stripeCustomers).values({
            userId: ctx.user.id,
            stripeCustomerId: stripeCustomer.id,
            email: ctx.user.email || "",
          } as any);

          customer = {
            id: 0,
            userId: ctx.user.id,
            stripeCustomerId: stripeCustomer.id,
            email: ctx.user.email || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customer.stripeCustomerId,
          line_items: [
            {
              price: input.priceId,
              quantity: input.quantity,
            },
          ],
          mode: "payment",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  /**
   * Create a subscription checkout session
   */
  createSubscriptionCheckout: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create Stripe customer
        let customer = await db.query.stripeCustomers.findFirst({
          where: eq(stripeCustomers.userId, ctx.user.id),
        } as any);

        if (!customer) {
          const stripeCustomer = await stripe.customers.create({
            email: ctx.user.email || `user-${ctx.user.id}@bayojid.ai`,
            name: ctx.user.name,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });

          await db.insert(stripeCustomers).values({
            userId: ctx.user.id,
            stripeCustomerId: stripeCustomer.id,
            email: ctx.user.email || "",
          } as any);

          customer = {
            id: 0,
            userId: ctx.user.id,
            stripeCustomerId: stripeCustomer.id,
            email: ctx.user.email || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        }

        // Create subscription checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customer.stripeCustomerId,
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Error creating subscription checkout:", error);
        throw new Error("Failed to create subscription checkout");
      }
    }),

  /**
   * Get user's payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoices = await db.query.stripeInvoices.findMany({
        where: eq(stripeInvoices.userId, ctx.user.id),
      } as any);

      return {
        success: true,
        invoices: invoices.map((inv: any) => ({
          id: inv.id,
          amount: inv.amount / 100, // Convert from cents
          currency: inv.currency,
          status: inv.status,
          pdfUrl: inv.pdfUrl,
          hostedInvoiceUrl: inv.hostedInvoiceUrl,
          createdAt: inv.createdAt,
        })),
      };
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw new Error("Failed to fetch payment history");
    }
  }),

  /**
   * Get user's active subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const subscriptions = await db.query.stripeSubscriptions.findMany({
        where: eq(stripeSubscriptions.userId, ctx.user.id),
      } as any);

      return {
        success: true,
        subscriptions: subscriptions.map((sub: any) => ({
          id: sub.id,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          status: sub.status,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelledAt: sub.cancelledAt,
        })),
      };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw new Error("Failed to fetch subscriptions");
    }
  }),

  /**
   * Cancel a subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify subscription belongs to user
        const subscription = await db.query.stripeSubscriptions.findFirst({
          where: and(
            eq(stripeSubscriptions.userId, ctx.user.id),
            eq(stripeSubscriptions.stripeSubscriptionId, input.subscriptionId)
          ),
        } as any);

        if (!subscription) {
          throw new Error("Subscription not found");
        }

        // Cancel with Stripe
        const cancelled = await stripe.subscriptions.update(input.subscriptionId, {
          cancel_at_period_end: true,
        });

        // Update database
        await db
          .update(stripeSubscriptions)
          .set({
            status: cancelled.status as any,
            cancelledAt: new Date(),
          })
          .where(eq(stripeSubscriptions.id, subscription.id));

        return { success: true };
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),

  /**
   * Get available products and prices
   */
  getProducts: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const products = await db.query.stripeProducts.findMany({
        where: eq(stripeProducts.isActive, true),
      } as any);

      const prices = await db.query.stripePrices.findMany({
        where: eq(stripePrices.isActive, true),
      } as any);

      return {
        success: true,
        products: products.map((p: any) => ({
          id: p.id,
          stripeProductId: p.stripeProductId,
          name: p.name,
          description: p.description,
          type: p.type,
        })),
        prices: prices.map((p: any) => ({
          id: p.id,
          stripePriceId: p.stripePriceId,
          stripeProductId: p.stripeProductId,
          amount: p.amount / 100, // Convert from cents
          currency: p.currency,
          billingCycle: p.billingCycle,
        })),
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  }),

  /**
   * Retrieve a checkout session
   */
  getCheckoutSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        return {
          success: true,
          session: {
            id: session.id,
            status: session.payment_status,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            customerEmail: session.customer_email,
          },
        };
      } catch (error) {
        console.error("Error retrieving checkout session:", error);
        throw new Error("Failed to retrieve checkout session");
      }
    }),
});
