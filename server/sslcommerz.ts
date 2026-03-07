/**
 * SSLCommerz Payment Integration Module
 * Handles payment processing, verification, and transaction management
 */

import { getDb } from "./db";
import { sslcommerzTransactions, paymentInvoices, userSubscriptions, subscriptionPlans } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// SSLCommerz Configuration
const SSLCOMMERZ_CONFIG = {
  storeId: process.env.SSLCOMMERZ_STORE_ID || "",
  storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
  baseUrl: process.env.SSLCOMMERZ_BASE_URL || "https://securepay.sslcommerz.com",
  testUrl: "https://sandbox.sslcommerz.com",
  isProduction: process.env.NODE_ENV === "production",
};

/**
 * Generate unique transaction ID
 */
export function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create SSLCommerz payment request
 */
export async function createPaymentRequest(
  userId: number,
  planId: number,
  customerEmail: string,
  customerName: string,
  customerPhone: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get subscription plan details
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).limit(1);
    const plan = plans[0];

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    const transactionId = generateTransactionId();
    const amount = parseFloat(plan.price.toString());

    // Create transaction record
    await db.insert(sslcommerzTransactions).values({
      userId,
      transactionId,
      plan: plan.slug as "free" | "pro" | "premium",
      amount: amount.toString() as any,
      currency: plan.currency,
      status: "pending",
      customerName,
      customerEmail,
      customerPhone,
      ipAddress: "127.0.0.1",
    });

    // Prepare SSLCommerz payment request
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.storeId,
      store_passwd: SSLCOMMERZ_CONFIG.storePassword,
      total_amount: amount,
      currency: plan.currency,
      tran_id: transactionId,
      success_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/success`,
      fail_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/failed`,
      cancel_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/cancelled`,
      ipn_url: `${process.env.API_BASE_URL || "http://localhost:3000"}/api/trpc/payment.sslcommerzIPN`,
      cus_name: customerName,
      cus_email: customerEmail,
      cus_phone: customerPhone,
      cus_add1: "Customer Address",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      shipping_method: "NO",
      product_name: plan.name,
      product_category: "subscription",
      product_profile: "general",
    };

    return {
      success: true,
      transactionId,
      paymentData,
      paymentUrl: `${SSLCOMMERZ_CONFIG.isProduction ? SSLCOMMERZ_CONFIG.baseUrl : SSLCOMMERZ_CONFIG.testUrl}/gwprocess/v4/api.php`,
    };
  } catch (error) {
    console.error("Error creating payment request:", error);
    throw error;
  }
}

/**
 * Verify SSLCommerz payment response
 */
export async function verifyPaymentResponse(responseData: any) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { tran_id, status, val_id, card_brand, card_number } = responseData;

    // Find transaction
    const transactions = await db.select().from(sslcommerzTransactions).where(eq(sslcommerzTransactions.transactionId, tran_id)).limit(1);
    const transaction = transactions[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Update transaction with payment details
    if (status === "VALID" || status === "VALIDATED") {
      await db
        .update(sslcommerzTransactions)
        .set({
          status: "completed",
          sslcommerzRef: val_id,
          cardBrand: card_brand,
          cardNumber: card_number,
          completedAt: new Date(),
        })
        .where(eq(sslcommerzTransactions.id, transaction.id));

      // Get subscription plan for the user
      const plans = await db.select().from(subscriptionPlans).limit(1);
      const plan = plans[0];

      if (plan) {
        // Check if user already has subscription
        const subs = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, transaction.userId)).limit(1);
        const existingSubscription = subs[0];

        const endDate = new Date();
        if (plan.billingCycle === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        if (existingSubscription) {
          await db
            .update(userSubscriptions)
            .set({
              planId: plan.id,
              transactionId: transaction.id,
              status: "active",
              endDate,
              nextBillingDate: endDate,
            })
            .where(eq(userSubscriptions.userId, transaction.userId));
        } else {
          await db.insert(userSubscriptions).values({
            userId: transaction.userId,
            planId: plan.id,
            transactionId: transaction.id,
            status: "active",
            startDate: new Date(),
            endDate,
            autoRenew: true,
            nextBillingDate: endDate,
          });
        }
      }

      return {
        success: true,
        message: "Payment verified successfully",
        transactionId: tran_id,
        status: "completed",
      };
    } else {
      await db
        .update(sslcommerzTransactions)
        .set({
          status: "failed",
          errorMessage: `Payment failed with status: ${status}`,
        })
        .where(eq(sslcommerzTransactions.id, transaction.id));

      return {
        success: false,
        message: "Payment verification failed",
        transactionId: tran_id,
        status: "failed",
      };
    }
  } catch (error) {
    console.error("Error verifying payment response:", error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(transactionId: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const transactions = await db.select().from(sslcommerzTransactions).where(eq(sslcommerzTransactions.transactionId, transactionId)).limit(1);
    const transaction = transactions[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction;
  } catch (error) {
    console.error("Error getting transaction details:", error);
    throw error;
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const transactions = await db.select().from(sslcommerzTransactions).where(eq(sslcommerzTransactions.userId, userId));
    return transactions;
  } catch (error) {
    console.error("Error getting user transactions:", error);
    throw error;
  }
}

/**
 * Create payment invoice
 */
export async function createPaymentInvoice(
  transactionId: number,
  amount: number,
  taxAmount: number = 0
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const totalAmount = amount + taxAmount;

    await db.insert(paymentInvoices).values({
      transactionId,
      invoiceNumber,
      amount: amount.toString() as any,
      taxAmount: taxAmount.toString() as any,
      totalAmount: totalAmount.toString() as any,
      status: "draft",
    });

    return {
      success: true,
      invoiceNumber,
      message: "Invoice created successfully",
    };
  } catch (error) {
    console.error("Error creating payment invoice:", error);
    throw error;
  }
}

/**
 * Get subscription plans
 */
export async function getSubscriptionPlans() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
    return plans;
  } catch (error) {
    console.error("Error getting subscription plans:", error);
    throw error;
  }
}

/**
 * Get user subscription
 */
export async function getUserSubscription(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const subs = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).limit(1);
    const subscription = subs[0];

    if (!subscription) {
      return {
        plan: "free",
        status: "active",
        startDate: new Date(),
      };
    }

    // Check if subscription is expired
    if (subscription.endDate && subscription.endDate < new Date()) {
      return {
        plan: "free",
        status: "expired",
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      };
    }

    return subscription;
  } catch (error) {
    console.error("Error getting user subscription:", error);
    throw error;
  }
}

/**
 * Cancel user subscription
 */
export async function cancelUserSubscription(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const subs = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).limit(1);
    const subscription = subs[0];

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await db
      .update(userSubscriptions)
      .set({
        status: "cancelled",
        autoRenew: false,
      })
      .where(eq(userSubscriptions.userId, userId));

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}
