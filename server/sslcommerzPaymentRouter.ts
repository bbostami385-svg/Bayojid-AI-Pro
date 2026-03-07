/**
 * SSLCommerz Payment tRPC Router
 * Handles payment-related tRPC procedures
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import {
  createPaymentRequest,
  verifyPaymentResponse,
  getTransactionDetails,
  getUserTransactions,
  createPaymentInvoice,
  getSubscriptionPlans,
  getUserSubscription,
  cancelUserSubscription,
} from "./sslcommerz";

export const sslcommerzPaymentRouter = router({
  /**
   * Get all available subscription plans
   */
  getPlans: publicProcedure.query(async () => {
    try {
      const plans = await getSubscriptionPlans();
      return {
        success: true,
        plans,
      };
    } catch (error) {
      console.error("Error getting plans:", error);
      throw error;
    }
  }),

  /**
   * Get user's current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getUserSubscription(ctx.user.id);
      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error("Error getting subscription:", error);
      throw error;
    }
  }),

  /**
   * Create payment request for subscription upgrade
   */
  createPaymentRequest: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createPaymentRequest(
          ctx.user.id,
          input.planId,
          ctx.user.email || "",
          ctx.user.name || "Customer",
          "" // Phone will be collected from user if needed
        );

        return result;
      } catch (error) {
        console.error("Error creating payment request:", error);
        throw error;
      }
    }),

  /**
   * Verify payment response from SSLCommerz
   */
  verifyPayment: publicProcedure
    .input(
      z.object({
        tran_id: z.string(),
        status: z.string(),
        val_id: z.string().optional(),
        card_brand: z.string().optional(),
        card_number: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await verifyPaymentResponse(input);
        return result;
      } catch (error) {
        console.error("Error verifying payment:", error);
        throw error;
      }
    }),

  /**
   * Get transaction details
   */
  getTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const transaction = await getTransactionDetails(input.transactionId);

        // Verify user owns this transaction
        if (transaction.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        return {
          success: true,
          transaction,
        };
      } catch (error) {
        console.error("Error getting transaction:", error);
        throw error;
      }
    }),

  /**
   * Get user's transaction history
   */
  getTransactionHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const transactions = await getUserTransactions(ctx.user.id);
      return {
        success: true,
        transactions,
      };
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw error;
    }
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await cancelUserSubscription(ctx.user.id);
      return result;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }),

  /**
   * Handle SSLCommerz IPN (Instant Payment Notification)
   */
  sslcommerzIPN: publicProcedure
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ input }) => {
      try {
        const result = await verifyPaymentResponse(input);
        return result;
      } catch (error) {
        console.error("Error handling IPN:", error);
        throw error;
      }
    }),
});
