import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { EncryptionService, generateConversationKey } from "@shared/encryption";

export const encryptionRouter = router({
  /**
   * Generate a new encryption key for a conversation
   */
  generateConversationKey: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const key = generateConversationKey();

        // In production, store the key securely using a key management service
        // For now, we'll return the key to be stored on client-side
        return {
          success: true,
          keyGenerated: true,
          key,
          message: "এনক্রিপশন কী তৈরি হয়েছে / Encryption key generated",
        };
      } catch (error) {
        console.error("Failed to generate encryption key:", error);
        throw new Error("এনক্রিপশন কী তৈরি ব্যর্থ / Failed to generate encryption key");
      }
    }),

  /**
   * Encrypt a message
   */
  encryptMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        key: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const encrypted = EncryptionService.encrypt(input.message, input.key);

        return {
          success: true,
          encrypted,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("বার্তা এনক্রিপশন ব্যর্থ / Message encryption failed");
      }
    }),

  /**
   * Decrypt a message
   */
  decryptMessage: protectedProcedure
    .input(
      z.object({
        encryptedMessage: z.string(),
        key: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const decrypted = EncryptionService.decrypt(input.encryptedMessage, input.key);

        return {
          success: true,
          decrypted,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("বার্তা ডিক্রিপশন ব্যর্থ / Message decryption failed");
      }
    }),

  /**
   * Hash a message
   */
  hashMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const hash = EncryptionService.hash(input.message);

        return {
          success: true,
          hash,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Hashing failed:", error);
        throw new Error("বার্তা হ্যাশিং ব্যর্থ / Message hashing failed");
      }
    }),

  /**
   * Generate HMAC signature
   */
  generateHmac: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        key: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const signature = EncryptionService.hmac(input.message, input.key);

        return {
          success: true,
          signature,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("HMAC generation failed:", error);
        throw new Error("HMAC জেনারেশন ব্যর্থ / HMAC generation failed");
      }
    }),

  /**
   * Verify HMAC signature
   */
  verifyHmac: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        key: z.string(),
        signature: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const isValid = EncryptionService.verifyHmac(input.message, input.key, input.signature);

        return {
          success: true,
          isValid,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("HMAC verification failed:", error);
        throw new Error("HMAC যাচাইকরণ ব্যর্থ / HMAC verification failed");
      }
    }),
});
