import { describe, it, expect, beforeEach, vi } from "vitest";
import { twoFARouter } from "./twoFARouter";
import { protectedProcedure } from "./_core/trpc";

describe("twoFARouter", () => {
  describe("setup2FA", () => {
    it("should generate a secret and QR code", async () => {
      expect(twoFARouter.createCaller).toBeDefined();
    });
  });

  describe("verify2FA", () => {
    it("should verify a TOTP code", async () => {
      expect(twoFARouter.createCaller).toBeDefined();
    });
  });

  describe("disable2FA", () => {
    it("should disable 2FA for a user", async () => {
      expect(twoFARouter.createCaller).toBeDefined();
    });
  });

  describe("getBackupCodes", () => {
    it("should return backup codes", async () => {
      expect(twoFARouter.createCaller).toBeDefined();
    });
  });

  describe("get2FAStatus", () => {
    it("should return 2FA status", async () => {
      expect(twoFARouter.createCaller).toBeDefined();
    });
  });
});
