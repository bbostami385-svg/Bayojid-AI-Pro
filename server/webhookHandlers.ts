/**
 * Webhook Handlers for Payment Gateways
 * Handles payment confirmation callbacks from all gateways
 */

import { stripeTransactions, bkashTransactions, nagadTransactions, rocketTransactions, paymentHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        
        // Update Stripe transaction
        await db
          .update(stripeTransactions)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(stripeTransactions.stripePaymentIntentId, paymentIntent.id));

        // Update payment history
        const stripePayment = await db.query.stripeTransactions.findFirst({
          where: eq(stripeTransactions.stripePaymentIntentId, paymentIntent.id),
        });

        if (stripePayment) {
          await db
            .update(paymentHistory)
            .set({
              status: "completed",
              completedAt: new Date(),
            })
            .where(eq(paymentHistory.transactionId, paymentIntent.id));

          // Subscription activation will be handled in the payment verification flow
        }
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        
        await db
          .update(stripeTransactions)
          .set({
            status: "failed",
          })
          .where(eq(stripeTransactions.stripePaymentIntentId, failedIntent.id));

        await db
          .update(paymentHistory)
          .set({
            status: "failed",
          })
          .where(eq(paymentHistory.transactionId, failedIntent.id));
        break;
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    throw error;
  }
}

/**
 * Handle SSLCommerz webhook events
 */
export async function handleSSLCommerzWebhook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { status, tran_id, val_id, currency, amount } = data;

    if (status === "VALID") {
      // Payment verified
      const payment = await db.query.paymentHistory.findFirst({
        where: eq(paymentHistory.transactionId, tran_id),
      });

      if (payment) {
        await db
          .update(paymentHistory)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(paymentHistory.transactionId, tran_id));

        // Subscription activation will be handled in the payment verification flow
      }
    } else if (status === "FAILED") {
      // Payment failed
      await db
        .update(paymentHistory)
        .set({
          status: "failed",
        })
        .where(eq(paymentHistory.transactionId, tran_id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling SSLCommerz webhook:", error);
    throw error;
  }
}

/**
 * Handle bKash webhook events
 */
export async function handleBKashWebhook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { statusCode, statusMessage, trxID, amount } = data;

    if (statusCode === "0000") {
      // Payment successful
      const transaction = await db.query.bkashTransactions.findFirst({
        where: eq(bkashTransactions.bkashPaymentId, trxID),
      });

      if (transaction) {
        await db
          .update(bkashTransactions)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(bkashTransactions.bkashPaymentId, trxID));

        // Update payment history
        await db
          .update(paymentHistory)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(paymentHistory.transactionId, trxID));

        // Subscription activation will be handled in the payment verification flow
      }
    } else {
      // Payment failed
      await db
        .update(bkashTransactions)
        .set({
          status: "failed",
        })
        .where(eq(bkashTransactions.bkashPaymentId, trxID));

      await db
        .update(paymentHistory)
        .set({
          status: "failed",
        })
        .where(eq(paymentHistory.transactionId, trxID));
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling bKash webhook:", error);
    throw error;
  }
}

/**
 * Handle Nagad webhook events
 */
export async function handleNagadWebhook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { status, orderId, amount } = data;

    if (status === "success") {
      // Payment successful
      const transaction = await db.query.nagadTransactions.findFirst({
        where: eq(nagadTransactions.nagadPaymentId, orderId),
      });

      if (transaction) {
        await db
          .update(nagadTransactions)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(nagadTransactions.nagadPaymentId, orderId));

        // Update payment history
        await db
          .update(paymentHistory)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(paymentHistory.transactionId, orderId));

        // Subscription activation will be handled in the payment verification flow
      }
    } else {
      // Payment failed
      await db
        .update(nagadTransactions)
        .set({
          status: "failed",
        })
        .where(eq(nagadTransactions.nagadPaymentId, orderId));

      await db
        .update(paymentHistory)
        .set({
          status: "failed",
        })
        .where(eq(paymentHistory.transactionId, orderId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling Nagad webhook:", error);
    throw error;
  }
}

/**
 * Handle Rocket webhook events
 */
export async function handleRocketWebhook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const { status, trxId, amount } = data;

    if (status === "completed") {
      // Payment successful
      const transaction = await db.query.rocketTransactions.findFirst({
        where: eq(rocketTransactions.rocketPaymentId, trxId),
      });

      if (transaction) {
        await db
          .update(rocketTransactions)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(rocketTransactions.rocketPaymentId, trxId));

        // Update payment history
        await db
          .update(paymentHistory)
          .set({
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(paymentHistory.transactionId, trxId));

        // Subscription activation will be handled in the payment verification flow
      }
    } else {
      // Payment failed
      await db
        .update(rocketTransactions)
        .set({
          status: "failed",
        })
        .where(eq(rocketTransactions.rocketPaymentId, trxId));

      await db
        .update(paymentHistory)
        .set({
          status: "failed",
        })
        .where(eq(paymentHistory.transactionId, trxId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling Rocket webhook:", error);
    throw error;
  }
}
