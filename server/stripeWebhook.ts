import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import {
  stripePaymentIntents,
  stripeSubscriptions,
  stripeInvoices,
  stripeCustomers,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe Webhook Handler
 * Processes Stripe events and updates database accordingly
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    switch (event.type) {
      // Payment Intent Events
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, db);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, db);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, db);
        break;

      // Subscription Events
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, db);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, db);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, db);
        break;

      // Invoice Events
      case "invoice.created":
        await handleInvoiceCreated(event.data.object as Stripe.Invoice, db);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, db);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler error" });
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  db: any
) {
  console.log(`Payment intent ${paymentIntent.id} succeeded`);

  const userId = parseInt(paymentIntent.metadata?.userId || "0");
  if (!userId) return;

  // Update payment intent status in database
  const existing = await db.query.stripePaymentIntents.findFirst({
    where: eq(stripePaymentIntents.stripePaymentIntentId, paymentIntent.id),
  } as any);

  if (existing) {
    await db
      .update(stripePaymentIntents)
      .set({ status: "succeeded" })
      .where(eq(stripePaymentIntents.id, existing.id));
  } else {
    await db.insert(stripePaymentIntents).values({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "succeeded",
      metadata: paymentIntent.metadata || {},
    } as any);
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  db: any
) {
  console.log(`Payment intent ${paymentIntent.id} failed`);

  const userId = parseInt(paymentIntent.metadata?.userId || "0");
  if (!userId) return;

  const existing = await db.query.stripePaymentIntents.findFirst({
    where: eq(stripePaymentIntents.stripePaymentIntentId, paymentIntent.id),
  } as any);

  if (existing) {
    await db
      .update(stripePaymentIntents)
      .set({ status: "canceled" })
      .where(eq(stripePaymentIntents.id, existing.id));
  }
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  db: any
) {
  console.log(`Payment intent ${paymentIntent.id} canceled`);

  const existing = await db.query.stripePaymentIntents.findFirst({
    where: eq(stripePaymentIntents.stripePaymentIntentId, paymentIntent.id),
  } as any);

  if (existing) {
    await db
      .update(stripePaymentIntents)
      .set({ status: "canceled" })
      .where(eq(stripePaymentIntents.id, existing.id));
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  db: any
) {
  console.log(`Subscription ${subscription.id} created`);

  const userId = parseInt(subscription.metadata?.userId || "0");
  if (!userId) return;

  await db.insert(stripeSubscriptions).values({
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id || "",
    status: subscription.status,
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    metadata: subscription.metadata || {},
  } as any);
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  db: any
) {
  console.log(`Subscription ${subscription.id} updated`);

  const existing = await db.query.stripeSubscriptions.findFirst({
    where: eq(stripeSubscriptions.stripeSubscriptionId, subscription.id),
  } as any);

  if (existing) {
    await db
      .update(stripeSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      })
      .where(eq(stripeSubscriptions.id, existing.id));
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  db: any
) {
  console.log(`Subscription ${subscription.id} deleted`);

  const existing = await db.query.stripeSubscriptions.findFirst({
    where: eq(stripeSubscriptions.stripeSubscriptionId, subscription.id),
  } as any);

  if (existing) {
    await db
      .update(stripeSubscriptions)
      .set({
        status: "canceled",
        cancelledAt: new Date(),
        endedAt: new Date(),
      })
      .where(eq(stripeSubscriptions.id, existing.id));
  }
}

/**
 * Handle invoice.created event
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice, db: any) {
  console.log(`Invoice ${invoice.id} created`);

  const customerId = invoice.customer as string;
  const customer = await db.query.stripeCustomers.findFirst({
    where: eq(stripeCustomers.stripeCustomerId, customerId),
  } as any);

  if (!customer) return;

  await db.insert(stripeInvoices).values({
    userId: customer.userId,
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: (invoice as any).subscription as string,
    amount: invoice.total || 0,
    currency: invoice.currency,
    status: invoice.status as any,
    pdfUrl: (invoice as any).pdf,
    hostedInvoiceUrl: (invoice as any).hosted_invoice_url,
  } as any);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  console.log(`Invoice ${invoice.id} payment succeeded`);

  const existing = await db.query.stripeInvoices.findFirst({
    where: eq(stripeInvoices.stripeInvoiceId, invoice.id),
  } as any);

  if (existing) {
    await db
      .update(stripeInvoices)
      .set({ status: "paid" })
      .where(eq(stripeInvoices.id, existing.id));
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, db: any) {
  console.log(`Invoice ${invoice.id} payment failed`);

  const existing = await db.query.stripeInvoices.findFirst({
    where: eq(stripeInvoices.stripeInvoiceId, invoice.id),
  } as any);

  if (existing) {
    await db
      .update(stripeInvoices)
      .set({ status: "open" })
      .where(eq(stripeInvoices.id, existing.id));
  }
}
