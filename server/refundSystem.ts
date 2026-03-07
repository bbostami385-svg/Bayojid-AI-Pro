/**
 * Refund System
 * Handles payment refunds and reversals via SSLCommerz API
 */

import crypto from "crypto";

interface RefundRequest {
  transactionId: string;
  amount?: string; // If not provided, full refund
  reason: string;
  refundType: "full" | "partial";
}

interface RefundResponse {
  success: boolean;
  refundId?: string;
  message: string;
  originalTransactionId: string;
  refundAmount: string;
  status: "pending" | "completed" | "failed";
}

/**
 * Generate refund request signature for SSLCommerz
 */
function generateRefundSignature(
  transactionId: string,
  amount: string,
  storePassword: string
): string {
  const signatureString = `${transactionId}${amount}${storePassword}`;
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

/**
 * Process refund via SSLCommerz API
 */
export async function processRefund(
  request: RefundRequest
): Promise<RefundResponse> {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASS;
    const apiUrl = process.env.SSLCOMMERZ_API_URL || "https://securepay.sslcommerz.com";

    if (!storeId || !storePassword) {
      console.error("[Refund] Missing SSLCommerz credentials");
      return {
        success: false,
        message: "রিফান্ড প্রক্রিয়াকরণে ত্রুটি: সার্ভার কনফিগারেশন ত্রুটি",
        originalTransactionId: request.transactionId,
        refundAmount: request.amount || "0",
        status: "failed",
      };
    }

    // Generate refund ID
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // For now, log the refund request
    console.log("[Refund] Processing refund request:", {
      transactionId: request.transactionId,
      amount: request.amount,
      reason: request.reason,
      refundId,
    });

    // In production, this would call SSLCommerz refund API
    // const signature = generateRefundSignature(
    //   request.transactionId,
    //   request.amount || "0",
    //   storePassword
    // );

    // const response = await fetch(`${apiUrl}/api/merchantRefund`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body: new URLSearchParams({
    //     store_id: storeId,
    //     store_passwd: storePassword,
    //     refund_ref_id: refundId,
    //     refund_amount: request.amount || "0",
    //     bank_tran_id: request.transactionId,
    //     reason: request.reason,
    //   }).toString(),
    // });

    // Simulate successful refund
    return {
      success: true,
      refundId,
      message: "রিফান্ড সফলভাবে প্রক্রিয়া করা হয়েছে",
      originalTransactionId: request.transactionId,
      refundAmount: request.amount || "0",
      status: "pending",
    };
  } catch (error) {
    console.error("[Refund] Error processing refund:", error);
    return {
      success: false,
      message: "রিফান্ড প্রক্রিয়াকরণে ত্রুটি",
      originalTransactionId: request.transactionId,
      refundAmount: request.amount || "0",
      status: "failed",
    };
  }
}

/**
 * Get refund status
 */
export async function getRefundStatus(refundId: string): Promise<{
  refundId: string;
  status: "pending" | "completed" | "failed";
  message: string;
}> {
  try {
    console.log("[Refund] Checking refund status:", refundId);

    // In production, this would query SSLCommerz API
    // For now, return pending status
    return {
      refundId,
      status: "pending",
      message: "রিফান্ড প্রক্রিয়াধীন",
    };
  } catch (error) {
    console.error("[Refund] Error getting refund status:", error);
    return {
      refundId,
      status: "failed",
      message: "রিফান্ড স্ট্যাটাস পেতে ব্যর্থ",
    };
  }
}

/**
 * Validate refund eligibility
 */
export async function validateRefundEligibility(
  transactionId: string,
  daysSincePurchase: number
): Promise<{
  eligible: boolean;
  reason?: string;
  maxRefundDays: number;
}> {
  const MAX_REFUND_DAYS = 30; // 30 days refund window

  if (daysSincePurchase > MAX_REFUND_DAYS) {
    return {
      eligible: false,
      reason: `ক্রয়ের ৩০ দিন পর রিফান্ড পাওয়া যায় না। আপনার ক্রয় ${daysSincePurchase} দিন আগে ছিল।`,
      maxRefundDays: MAX_REFUND_DAYS,
    };
  }

  if (daysSincePurchase < 0) {
    return {
      eligible: false,
      reason: "অবৈধ লেনদেন তারিখ",
      maxRefundDays: MAX_REFUND_DAYS,
    };
  }

  return {
    eligible: true,
    maxRefundDays: MAX_REFUND_DAYS,
  };
}

/**
 * Calculate partial refund amount
 */
export function calculatePartialRefund(
  originalAmount: string,
  usageDays: number,
  totalSubscriptionDays: number = 30
): string {
  try {
    const amount = parseFloat(originalAmount);
    const dailyRate = amount / totalSubscriptionDays;
    const remainingDays = Math.max(0, totalSubscriptionDays - usageDays);
    const refundAmount = dailyRate * remainingDays;

    return Math.max(0, refundAmount).toFixed(2);
  } catch (error) {
    console.error("[Refund] Error calculating partial refund:", error);
    return "0.00";
  }
}

/**
 * Format refund reason for display
 */
export function formatRefundReason(reason: string): string {
  const reasons: Record<string, string> = {
    not_needed: "সেবা প্রয়োজন নেই",
    duplicate: "ডুপ্লিকেট চার্জ",
    service_issue: "সেবায় সমস্যা",
    technical_issue: "প্রযুক্তিগত সমস্যা",
    other: "অন্যান্য কারণ",
  };

  return reasons[reason] || reason;
}
