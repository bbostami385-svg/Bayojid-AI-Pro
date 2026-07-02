/**
 * Two-Factor Authentication (2FA) Service
 * Handles TOTP (Time-based One-Time Password) generation and verification
 */

import speakeasy from "speakeasy";
import QRCode from "qrcode";

interface TOTPSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface VerificationResult {
  isValid: boolean;
  message: string;
}

/**
 * Generate a new TOTP secret and QR code for 2FA setup
 */
export async function generateTOTPSecret(userEmail: string, appName: string = "Bayojid AI"): Promise<TOTPSecret> {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${appName} (${userEmail})`,
      issuer: appName,
      length: 32,
    });

    if (!secret.otpauth_url) {
      throw new Error("Failed to generate TOTP secret");
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes (10 codes)
    const backupCodes = generateBackupCodes(10);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  } catch (error) {
    console.error("Error generating TOTP secret:", error);
    throw new Error("Failed to generate 2FA secret");
  }
}

/**
 * Verify TOTP code
 */
export function verifyTOTPCode(secret: string, token: string, window: number = 2): VerificationResult {
  try {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window,
    });

    return {
      isValid: Boolean(isValid),
      message: isValid ? "2FA code is valid" : "Invalid 2FA code",
    };
  } catch (error) {
    console.error("Error verifying TOTP code:", error);
    return {
      isValid: false,
      message: "Error verifying 2FA code",
    };
  }
}

/**
 * Verify backup code
 */
export function verifyBackupCode(backupCodes: string[], code: string): { isValid: boolean; remainingCodes: string[] } {
  const index = backupCodes.indexOf(code);

  if (index === -1) {
    return {
      isValid: false,
      remainingCodes: backupCodes,
    };
  }

  // Remove used backup code
  const remainingCodes = backupCodes.filter((_, i) => i !== index);

  return {
    isValid: true,
    remainingCodes,
  };
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }

  return codes;
}

/**
 * Encrypt backup codes for storage (basic implementation)
 * In production, use a proper encryption library
 */
export function encryptBackupCodes(codes: string[]): string {
  // This is a placeholder. In production, use proper encryption
  return JSON.stringify(codes);
}

/**
 * Decrypt backup codes from storage
 */
export function decryptBackupCodes(encrypted: string): string[] {
  try {
    // This is a placeholder. In production, use proper decryption
    return JSON.parse(encrypted);
  } catch {
    return [];
  }
}

/**
 * Generate current TOTP code (for testing purposes)
 */
export function generateCurrentTOTPCode(secret: string): string {
  try {
    const code = speakeasy.totp({
      secret,
      encoding: "base32",
    });
    return code;
  } catch (error) {
    console.error("Error generating TOTP code:", error);
    return "";
  }
}
