/**
 * 2FA tRPC Router
 * Handles Two-Factor Authentication setup and verification
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { user2FASettings, twoFAAttempts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateTOTPSecret,
  verifyTOTPCode,
  verifyBackupCode,
  encryptBackupCodes,
  decryptBackupCodes,
} from "./twoFAService";

export const twoFARouter = router({
  /**
   * Get current 2FA settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const settings = await db.query.user2FASettings.findFirst({
        where: eq(user2FASettings.userId, ctx.user.id),
      });

      return {
        isEnabled: settings?.isEnabled || false,
        method: settings?.method || "totp",
        verifiedAt: settings?.verifiedAt,
      };
    } catch (error) {
      console.error("Error getting 2FA settings:", error);
      throw new Error("Failed to get 2FA settings");
    }
  }),

  /**
   * Generate TOTP secret for 2FA setup
   */
  generateSecret: protectedProcedure.query(async ({ ctx }) => {
    try {
      const secret = await generateTOTPSecret(ctx.user.email || "user@bayojidai.com");

      return {
        secret: secret.secret,
        qrCode: secret.qrCode,
        backupCodes: secret.backupCodes,
      };
    } catch (error) {
      console.error("Error generating TOTP secret:", error);
      throw new Error("Failed to generate 2FA secret");
    }
  }),

  /**
   * Setup 2FA with TOTP code verification
   */
  setupTOTP: protectedProcedure
    .input(
      z.object({
        secret: z.string(),
        code: z.string(),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the TOTP code
        const verification = verifyTOTPCode(input.secret, input.code);

        if (!verification.isValid) {
          throw new Error("Invalid 2FA code");
        }

        // Encrypt backup codes
        const encryptedBackupCodes = encryptBackupCodes(input.backupCodes);

        // Save 2FA settings
        await db
          .insert(user2FASettings)
          .values({
            userId: ctx.user.id,
            isEnabled: true,
            method: "totp",
            secret: input.secret,
            backupCodes: JSON.parse(encryptedBackupCodes),
            verifiedAt: new Date(),
          })
          .onDuplicateKeyUpdate({
            set: {
              isEnabled: true,
              method: "totp",
              secret: input.secret,
              backupCodes: JSON.parse(encryptedBackupCodes),
              verifiedAt: new Date(),
            },
          });

        return {
          success: true,
          message: "2FA setup successful",
        };
      } catch (error) {
        console.error("Error setting up 2FA:", error);
        throw new Error("Failed to setup 2FA");
      }
    }),

  /**
   * Verify 2FA code during login
   */
  verifyCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const settings = await db.query.user2FASettings.findFirst({
          where: eq(user2FASettings.userId, ctx.user.id),
        });

        if (!settings || !settings.isEnabled) {
          throw new Error("2FA not enabled");
        }

        if (settings.method === "totp" && settings.secret) {
          const verification = verifyTOTPCode(settings.secret, input.code);

          if (!verification.isValid) {
            // Log failed attempt
            await db.insert(twoFAAttempts).values({
              userId: ctx.user.id,
              method: "totp",
              code: input.code,
              isValid: false,
              ipAddress: ctx.ipAddress,
              userAgent: ctx.userAgent,
            });

            throw new Error("Invalid 2FA code");
          }

          // Log successful attempt
          await db.insert(twoFAAttempts).values({
            userId: ctx.user.id,
            method: "totp",
            code: input.code,
            isValid: true,
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
          });

          return {
            success: true,
            message: "2FA verification successful",
          };
        }

        throw new Error("Unsupported 2FA method");
      } catch (error) {
        console.error("Error verifying 2FA code:", error);
        throw new Error("Failed to verify 2FA code");
      }
    }),

  /**
   * Verify using backup code
   */
  verifyBackupCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const settings = await db.query.user2FASettings.findFirst({
          where: eq(user2FASettings.userId, ctx.user.id),
        });

        if (!settings || !settings.isEnabled) {
          throw new Error("2FA not enabled");
        }

        const backupCodes = decryptBackupCodes(JSON.stringify(settings.backupCodes));
        const result = verifyBackupCode(backupCodes, input.code);

        if (!result.isValid) {
          throw new Error("Invalid backup code");
        }

        // Update backup codes
        await db
          .update(user2FASettings)
          .set({
            backupCodes: result.remainingCodes as any,
          })
          .where(eq(user2FASettings.userId, ctx.user.id));

        return {
          success: true,
          message: "Backup code verified successfully",
          remainingCodes: result.remainingCodes.length,
        };
      } catch (error) {
        console.error("Error verifying backup code:", error);
        throw new Error("Failed to verify backup code");
      }
    }),

  /**
   * Disable 2FA
   */
  disable: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await db
        .update(user2FASettings)
        .set({
          isEnabled: false,
        })
        .where(eq(user2FASettings.userId, ctx.user.id));

      return {
        success: true,
        message: "2FA disabled successfully",
      };
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      throw new Error("Failed to disable 2FA");
    }
  }),

  /**
   * Get 2FA attempt history
   */
  getAttemptHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const attempts = await db.query.twoFAAttempts.findMany({
        where: eq(twoFAAttempts.userId, ctx.user.id),
        limit: 50,
        orderBy: (table) => [table.attemptedAt],
      });

      return attempts;
    } catch (error) {
      console.error("Error getting 2FA attempt history:", error);
      throw new Error("Failed to get 2FA attempt history");
    }
  }),
});
