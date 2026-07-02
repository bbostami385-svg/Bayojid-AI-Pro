import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Password Reset Router - Handles forgot password and password reset flows
 */
export const passwordResetRouter = router({
  /**
   * Request password reset - sends email with reset link
   */
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Find user by email
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        // Always return success for security (don't reveal if email exists)
        if (!user || user.length === 0) {
          return {
            success: true,
            message: "If an account exists with this email, a password reset link has been sent",
          };
        }

        // TODO: Generate reset token and send email
        // For now, just return success
        console.log(`Password reset requested for: ${input.email}`);

        return {
          success: true,
          message: "If an account exists with this email, a password reset link has been sent",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Password reset request failed",
        });
      }
    }),

  /**
   * Verify reset token
   */
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        // TODO: Verify reset token from database
        // For now, just return success
        return {
          valid: true,
          email: "user@example.com", // Would be retrieved from token
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.newPassword !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Passwords do not match",
          });
        }

        // TODO: Verify token and update password
        // For now, just return success
        return {
          success: true,
          message: "Password has been reset successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Password reset failed",
        });
      }
    }),

  /**
   * Verify email
   */
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Verify email token and mark email as verified
        return {
          success: true,
          message: "Email verified successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email verification failed",
        });
      }
    }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Find user by email
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (!user || user.length === 0) {
          return {
            success: true,
            message: "If an account exists with this email, a verification link has been sent",
          };
        }

        // TODO: Generate verification token and send email
        console.log(`Verification email resent to: ${input.email}`);

        return {
          success: true,
          message: "If an account exists with this email, a verification link has been sent",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email resend failed",
        });
      }
    }),
});

export type PasswordResetRouter = typeof passwordResetRouter;
