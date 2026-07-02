/**
 * Payment tRPC Router
 * Handles payment operations for all gateways
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import {
  stripeTransactions,
  bkashTransactions,
  nagadTransactions,
  rocketTransactions,
  paymentHistory,
  paymentMethods,
  refunds,
  subscriptionPlans,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import {
  initiatePayment,
  verifyPayment,
  initiateStripePayment,
  verifyStripePayment,
} from "./paymentService";

export const paymentRouter = router({
  /**
   * Get available subscription plans
   */
  getPlans: protectedProcedure.query(async () => {
    try {
      const plans = await db.query.subscriptionPlans.findMany({
        where: (table) => eq(table.isActive, true),
      });

      return plans;
    } catch (error) {
      console.error("Error getting subscription plans:", error);
      throw new Error("Failed to get subscription plans");
    }
  }),

  /**
   * Initiate payment with selected gateway
   */
  initiatePayment: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        gateway: z.enum(["stripe", "sslcommerz", "bkash", "nagad", "rocket"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get plan details
        const plan = await db.query.subscriptionPlans.findFirst({
          where: eq(subscriptionPlans.id, input.planId),
        });

        if (!plan) {
          throw new Error("Plan not found");
        }

        // Initiate payment
        const paymentResponse = await initiatePayment({
          userId: ctx.user.id,
          amount: Number(plan.price),
          currency: plan.currency,
          planId: input.planId,
          gateway: input.gateway,
          description: `${plan.name} Subscription`,
        });

        if (!paymentResponse.success) {
          throw new Error(paymentResponse.message);
        }

        // Store transaction record
        if (input.gateway === "stripe") {
          await db.insert(stripeTransactions).values({
            userId: ctx.user.id,
            stripePaymentIntentId: paymentResponse.transactionId,
            amount: Number(plan.price),
            currency: plan.currency,
            status: "pending",
            planId: input.planId,
            description: `${plan.name} Subscription`,
          });
        } else if (input.gateway === "bkash") {
          await db.insert(bkashTransactions).values({
            userId: ctx.user.id,
            bkashPaymentId: paymentResponse.transactionId,
            amount: Number(plan.price),
            currency: plan.currency,
            status: "pending",
            planId: input.planId,
            phoneNumber: "",
          });
        } else if (input.gateway === "nagad") {
          await db.insert(nagadTransactions).values({
            userId: ctx.user.id,
            nagadPaymentId: paymentResponse.transactionId,
            amount: Number(plan.price),
            currency: plan.currency,
            status: "pending",
            planId: input.planId,
            phoneNumber: "",
          });
        } else if (input.gateway === "rocket") {
          await db.insert(rocketTransactions).values({
            userId: ctx.user.id,
            rocketPaymentId: paymentResponse.transactionId,
            amount: Number(plan.price),
            currency: plan.currency,
            status: "pending",
            planId: input.planId,
            phoneNumber: "",
          });
        }

        // Record in unified payment history
        await db.insert(paymentHistory).values({
          userId: ctx.user.id,
          gateway: input.gateway,
          transactionId: paymentResponse.transactionId,
          amount: Number(plan.price),
          currency: plan.currency,
          status: "pending",
          planId: input.planId,
          description: `${plan.name} Subscription`,
        });

        return {
          success: true,
          transactionId: paymentResponse.transactionId,
          paymentUrl: paymentResponse.paymentUrl,
          clientSecret: paymentResponse.clientSecret,
          message: paymentResponse.message,
        };
      } catch (error) {
        console.error("Error initiating payment:", error);
        throw new Error("Failed to initiate payment");
      }
    }),

  /**
   * Verify payment status
   */
  verifyPaymentStatus: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        gateway: z.enum(["stripe", "sslcommerz", "bkash", "nagad", "rocket"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const verifyResponse = await verifyPayment({
          transactionId: input.transactionId,
          gateway: input.gateway,
        });

        if (verifyResponse.success) {
          // Update transaction status
          await db
            .update(paymentHistory)
            .set({
              status: "completed",
              completedAt: new Date(),
            })
            .where(eq(paymentHistory.transactionId, input.transactionId));
        }

        return verifyResponse;
      } catch (error) {
        console.error("Error verifying payment:", error);
        throw new Error("Failed to verify payment");
      }
    }),

  /**
   * Get payment history
   */
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await db.query.paymentHistory.findMany({
        where: eq(paymentHistory.userId, ctx.user.id),
        orderBy: desc(paymentHistory.createdAt),
        limit: 50,
      });

      return history;
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw new Error("Failed to get payment history");
    }
  }),

  /**
   * Get saved payment methods
   */
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const methods = await db.query.paymentMethods.findMany({
        where: eq(paymentMethods.userId, ctx.user.id),
      });

      return methods;
    } catch (error) {
      console.error("Error getting payment methods:", error);
      throw new Error("Failed to get payment methods");
    }
  }),

  /**
   * Add payment method
   */
  addPaymentMethod: protectedProcedure
    .input(
      z.object({
        type: z.enum(["card", "bkash", "nagad", "rocket", "bank_transfer"]),
        isDefault: z.boolean().optional(),
        cardLastFour: z.string().optional(),
        cardBrand: z.string().optional(),
        cardExpiry: z.string().optional(),
        phoneNumber: z.string().optional(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        accountHolder: z.string().optional(),
        stripePaymentMethodId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await db.insert(paymentMethods).values({
          userId: ctx.user.id,
          type: input.type,
          isDefault: input.isDefault || false,
          cardLastFour: input.cardLastFour,
          cardBrand: input.cardBrand,
          cardExpiry: input.cardExpiry,
          phoneNumber: input.phoneNumber,
          bankName: input.bankName,
          accountNumber: input.accountNumber,
          accountHolder: input.accountHolder,
          stripePaymentMethodId: input.stripePaymentMethodId,
        });

        return {
          success: true,
          message: "Payment method added successfully",
          methodId: result.insertId,
        };
      } catch (error) {
        console.error("Error adding payment method:", error);
        throw new Error("Failed to add payment method");
      }
    }),

  /**
   * Delete payment method
   */
  deletePaymentMethod: protectedProcedure
    .input(z.object({ methodId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .delete(paymentMethods)
          .where(eq(paymentMethods.id, input.methodId));

        return {
          success: true,
          message: "Payment method deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting payment method:", error);
        throw new Error("Failed to delete payment method");
      }
    }),

  /**
   * Request refund
   */
  requestRefund: protectedProcedure
    .input(
      z.object({
        paymentHistoryId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify payment belongs to user
        const payment = await db.query.paymentHistory.findFirst({
          where: eq(paymentHistory.id, input.paymentHistoryId),
        });

        if (!payment || payment.userId !== ctx.user.id) {
          throw new Error("Payment not found");
        }

        // Create refund request
        const result = await db.insert(refunds).values({
          paymentHistoryId: input.paymentHistoryId,
          userId: ctx.user.id,
          amount: payment.amount,
          reason: input.reason,
          status: "pending",
        });

        return {
          success: true,
          message: "Refund request submitted successfully",
          refundId: result.insertId,
        };
      } catch (error) {
        console.error("Error requesting refund:", error);
        throw new Error("Failed to request refund");
      }
    }),

  /**
   * Get refund history
   */
  getRefundHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const refundHistory = await db.query.refunds.findMany({
        where: eq(refunds.userId, ctx.user.id),
        orderBy: desc(refunds.createdAt),
        limit: 50,
      });

      return refundHistory;
    } catch (error) {
      console.error("Error getting refund history:", error);
      throw new Error("Failed to get refund history");
    }
  }),
});
