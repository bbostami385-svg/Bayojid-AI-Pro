import crypto from "crypto";
import type { Request, Response } from "express";
import { getDb } from "./db";
import { sslcommerzTransactions, userSubscriptions, subscriptionPlans } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * SSLCommerz Webhook Handler
 * Processes payment notifications from SSLCommerz
 */

interface SSLCommerzWebhookPayload {
  tran_id: string;
  status: string;
  amount: string;
  currency: string;
  card_type: string;
  card_number: string;
  bank_tran_id: string;
  val_id: string;
  risk_level: string;
  risk_title: string;
  emi_instalment: string;
  emi_amount: string;
  emi_description: string;
  emi_issuer: string;
  store_amount: string;
  store_id: string;
  verify_sign: string;
  verify_key: string;
  [key: string]: string;
}

/**
 * Verify SSLCommerz webhook signature
 */
function verifyWebhookSignature(
  payload: SSLCommerzWebhookPayload,
  storePassword: string
): boolean {
  try {
    // Create signature string from payload
    const signatureString = Object.keys(payload)
      .sort()
      .filter((key) => key !== "verify_sign" && key !== "verify_key")
      .map((key) => `${key}=${payload[key]}`)
      .join("&");

    // Add store password
    const fullString = signatureString + storePassword;

    // Generate MD5 hash
    const generatedHash = crypto.createHash("md5").update(fullString).digest("hex");

    // Compare with provided signature
    return generatedHash === payload.verify_sign;
  } catch (error) {
    console.error("[Webhook] Signature verification error:", error);
    return false;
  }
}

/**
 * Handle SSLCommerz webhook POST request
 */
export async function handleSSLCommerzWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as SSLCommerzWebhookPayload;

    console.log("[Webhook] Received webhook:", {
      tran_id: payload.tran_id,
      status: payload.status,
      amount: payload.amount,
    });

    // Verify signature
    const storePassword = process.env.SSLCOMMERZ_STORE_PASS;
    if (!storePassword) {
      console.error("[Webhook] Store password not configured");
      return res.status(500).json({ error: "Store password not configured" });
    }

    if (!verifyWebhookSignature(payload, storePassword)) {
      console.error("[Webhook] Invalid signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process based on status
    if (payload.status === "VALID" || payload.status === "valid") {
      await handleValidPayment(payload);
    } else if (payload.status === "FAILED" || payload.status === "failed") {
      await handleFailedPayment(payload);
    } else if (payload.status === "CANCELLED" || payload.status === "cancelled") {
      await handleCancelledPayment(payload);
    }

    // Always return 200 to acknowledge receipt
    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Handle valid payment
 */
async function handleValidPayment(payload: SSLCommerzWebhookPayload) {
  try {
    console.log("[Webhook] Processing valid payment:", payload.tran_id);
    const db = await getDb();
    if (!db) {
      console.error("[Webhook] Database not available");
      return;
    }

    // Update transaction status
    const transaction = await db
      .select()
      .from(sslcommerzTransactions)
      .where(eq(sslcommerzTransactions.transactionId, payload.tran_id))
      .limit(1);

    if (!transaction || transaction.length === 0) {
      console.error("[Webhook] Transaction not found:", payload.tran_id);
      return;
    }

    const txn = transaction[0];

    // Update transaction to COMPLETED
    await db
      .update(sslcommerzTransactions)
      .set({
        status: "completed",
        bankTransactionId: payload.bank_tran_id,
        cardBrand: payload.card_type,
        cardNumber: payload.card_number,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sslcommerzTransactions.transactionId, payload.tran_id));

    // Activate subscription for this user
    const userSubs = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, txn.userId))
      .limit(1);

    if (userSubs && userSubs.length > 0) {
      const subscription = userSubs[0];

      // Get plan to determine billing cycle
      const plans = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, subscription.planId))
        .limit(1);

      if (plans && plans.length > 0) {
        const plan = plans[0];
        const startDate = new Date();
        const endDate = new Date();

        if (plan.billingCycle === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan.billingCycle === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // Update subscription status
        await db
          .update(userSubscriptions)
          .set({
            status: "active",
            transactionId: txn.id,
            startDate: startDate,
            endDate: endDate,
            nextBillingDate: endDate,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.id, subscription.id));

        console.log("[Webhook] Subscription activated:", subscription.id);
      }
    }

    console.log("[Webhook] Payment processed successfully:", payload.tran_id);
  } catch (error) {
    console.error("[Webhook] Error handling valid payment:", error);
  }
}

/**
 * Handle failed payment
 */
async function handleFailedPayment(payload: SSLCommerzWebhookPayload) {
  try {
    console.log("[Webhook] Processing failed payment:", payload.tran_id);
    const db = await getDb();
    if (!db) return;

    // Update transaction status
    await db
      .update(sslcommerzTransactions)
      .set({
        status: "failed",
        errorMessage: payload.risk_title || "Payment failed",
        updatedAt: new Date(),
      })
      .where(eq(sslcommerzTransactions.transactionId, payload.tran_id));

    console.log("[Webhook] Payment marked as failed:", payload.tran_id);
  } catch (error) {
    console.error("[Webhook] Error handling failed payment:", error);
  }
}

/**
 * Handle cancelled payment
 */
async function handleCancelledPayment(payload: SSLCommerzWebhookPayload) {
  try {
    console.log("[Webhook] Processing cancelled payment:", payload.tran_id);
    const db = await getDb();
    if (!db) return;

    // Update transaction status
    await db
      .update(sslcommerzTransactions)
      .set({
        status: "cancelled",
        errorMessage: "Payment cancelled by user",
        updatedAt: new Date(),
      })
      .where(eq(sslcommerzTransactions.transactionId, payload.tran_id));

    console.log("[Webhook] Payment marked as cancelled:", payload.tran_id);
  } catch (error) {
    console.error("[Webhook] Error handling cancelled payment:", error);
  }
}

/**
 * Validate payment with SSLCommerz
 * This is called to verify a payment after completion
 */
export async function validateSSLCommerzPayment(
  transactionId: string,
  validationId: string
): Promise<boolean> {
  try {
    console.log("[Validation] Validating payment:", transactionId);
    const db = await getDb();
    if (!db) return false;

    // In production, you would call SSLCommerz validation API
    // For now, we'll just check if the transaction exists and is marked as valid

    const transaction = await db
      .select()
      .from(sslcommerzTransactions)
      .where(eq(sslcommerzTransactions.transactionId, transactionId))
      .limit(1);

    if (!transaction || transaction.length === 0) {
      console.error("[Validation] Transaction not found:", transactionId);
      return false;
    }

    const txn = transaction[0];
    const isValid = txn.status === "completed" || txn.status === "pending";

    console.log("[Validation] Payment validation result:", isValid);
    return isValid;
  } catch (error) {
    console.error("[Validation] Error validating payment:", error);
    return false;
  }
}
