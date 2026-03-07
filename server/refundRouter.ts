/**
 * Refund tRPC Router
 * Handles refund requests and status checks
 */

import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  processRefund,
  getRefundStatus,
  validateRefundEligibility,
  calculatePartialRefund,
  formatRefundReason,
} from "./refundSystem";

export const refundRouter = router({
  /**
   * Request a refund for a transaction
   */
  requestRefund: protectedProcedure
    .input(
      z.object({
        transactionId: z.string().min(1),
        reason: z.enum([
          "not_needed",
          "duplicate",
          "service_issue",
          "technical_issue",
          "other",
        ]),
        description: z.string().optional(),
        refundType: z.enum(["full", "partial"]).default("full"),
        usageDays: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(
          `[Refund Router] User ${ctx.user.id} requesting refund for transaction ${input.transactionId}`
        );

        // Validate refund eligibility (30-day window)
        // In production, you would check the transaction date from database
        const daysSincePurchase = 5; // Mock value

        const eligibility = await validateRefundEligibility(
          input.transactionId,
          daysSincePurchase
        );

        if (!eligibility.eligible) {
          return {
            success: false,
            message: eligibility.reason,
            eligible: false,
          };
        }

        // Calculate refund amount
        let refundAmount = "0";
        if (input.refundType === "partial" && input.usageDays) {
          refundAmount = calculatePartialRefund("299.00", input.usageDays); // Mock original amount
        } else {
          refundAmount = "299.00"; // Mock full refund amount
        }

        // Process refund
        const refundResult = await processRefund({
          transactionId: input.transactionId,
          amount: refundAmount,
          reason: formatRefundReason(input.reason),
          refundType: input.refundType,
        });

        if (refundResult.success) {
          console.log(
            `[Refund Router] Refund request successful: ${refundResult.refundId}`
          );

          return {
            success: true,
            message: "রিফান্ড অনুরোধ সফলভাবে জমা দেওয়া হয়েছে",
            refundId: refundResult.refundId,
            refundAmount,
            status: "pending",
            eligible: true,
          };
        } else {
          return {
            success: false,
            message: refundResult.message,
            eligible: true,
          };
        }
      } catch (error) {
        console.error("[Refund Router] Error requesting refund:", error);
        return {
          success: false,
          message: "রিফান্ড অনুরোধ প্রক্রিয়াকরণে ত্রুটি",
          eligible: false,
        };
      }
    }),

  /**
   * Check refund status
   */
  checkRefundStatus: protectedProcedure
    .input(
      z.object({
        refundId: z.string().min(1),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        console.log(
          `[Refund Router] User ${ctx.user.id} checking refund status: ${input.refundId}`
        );

        const status = await getRefundStatus(input.refundId);

        return {
          success: true,
          refundId: status.refundId,
          status: status.status,
          message: status.message,
        };
      } catch (error) {
        console.error("[Refund Router] Error checking refund status:", error);
        return {
          success: false,
          message: "রিফান্ড স্ট্যাটাস পেতে ব্যর্থ",
        };
      }
    }),

  /**
   * Get refund eligibility for a transaction
   */
  checkEligibility: publicProcedure
    .input(
      z.object({
        transactionId: z.string().min(1),
        daysSincePurchase: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const eligibility = await validateRefundEligibility(
          input.transactionId,
          input.daysSincePurchase
        );

        return {
          eligible: eligibility.eligible,
          reason: eligibility.reason,
          maxRefundDays: eligibility.maxRefundDays,
          daysRemaining: Math.max(
            0,
            eligibility.maxRefundDays - input.daysSincePurchase
          ),
        };
      } catch (error) {
        console.error("[Refund Router] Error checking eligibility:", error);
        return {
          eligible: false,
          reason: "যোগ্যতা পরীক্ষায় ত্রুটি",
          maxRefundDays: 30,
          daysRemaining: 0,
        };
      }
    }),

  /**
   * Calculate partial refund amount
   */
  calculatePartialRefund: publicProcedure
    .input(
      z.object({
        originalAmount: z.string(),
        usageDays: z.number().min(0),
        totalSubscriptionDays: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const refundAmount = calculatePartialRefund(
          input.originalAmount,
          input.usageDays,
          input.totalSubscriptionDays
        );

        const dailyRate = (
          parseFloat(input.originalAmount) / input.totalSubscriptionDays
        ).toFixed(2);

        return {
          success: true,
          originalAmount: input.originalAmount,
          usageDays: input.usageDays,
          refundAmount,
          dailyRate,
          message: `${input.usageDays} দিনের ব্যবহারের পর ${refundAmount} টাকা রিফান্ড পাবেন`,
        };
      } catch (error) {
        console.error("[Refund Router] Error calculating refund:", error);
        return {
          success: false,
          message: "রিফান্ড পরিমাণ গণনায় ত্রুটি",
        };
      }
    }),

  /**
   * Get refund policy information
   */
  getRefundPolicy: publicProcedure.query(() => {
    return {
      maxRefundDays: 30,
      refundableItems: ["সাবস্ক্রিপশন", "প্রিমিয়াম ফিচার"],
      nonRefundableItems: ["ডাউনলোড করা কন্টেন্ট", "ব্যবহৃত ক্রেডিট"],
      partialRefundPolicy:
        "আংশিক ব্যবহারের জন্য দৈনিক হারে রিফান্ড পাওয়া যায়",
      processingTime: "৩-৫ কর্মদিবস",
      refundMethod: "মূল পেমেন্ট পদ্ধতিতে রিফান্ড করা হয়",
    };
  }),
});
