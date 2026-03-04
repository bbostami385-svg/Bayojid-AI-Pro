import CryptoJS from "crypto-js";

/**
 * Encryption utility for end-to-end encryption
 * Uses AES-256 for symmetric encryption
 */

export class EncryptionService {
  /**
   * Generate a random encryption key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }

  /**
   * Encrypt a message with a given key
   */
  static encrypt(message: string, key: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(message, key);
      return encrypted.toString();
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("এনক্রিপশন ব্যর্থ / Encryption failed");
    }
  }

  /**
   * Decrypt a message with a given key
   */
  static decrypt(encryptedMessage: string, key: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
      const message = decrypted.toString(CryptoJS.enc.Utf8);
      return message;
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("ডিক্রিপশন ব্যর্থ / Decryption failed");
    }
  }

  /**
   * Generate SHA-256 hash
   */
  static hash(message: string): string {
    return CryptoJS.SHA256(message).toString();
  }

  /**
   * Generate HMAC-SHA256
   */
  static hmac(message: string, key: string): string {
    return CryptoJS.HmacSHA256(message, key).toString();
  }

  /**
   * Verify HMAC-SHA256
   */
  static verifyHmac(message: string, key: string, signature: string): boolean {
    const computed = this.hmac(message, key);
    return computed === signature;
  }

  /**
   * Encrypt message for a conversation
   */
  static encryptMessage(message: string, conversationKey: string): {
    encrypted: string;
    timestamp: number;
  } {
    return {
      encrypted: this.encrypt(message, conversationKey),
      timestamp: Date.now(),
    };
  }

  /**
   * Decrypt message from a conversation
   */
  static decryptMessage(
    encryptedData: { encrypted: string; timestamp: number },
    conversationKey: string
  ): string {
    return this.decrypt(encryptedData.encrypted, conversationKey);
  }
}

/**
 * Generate a conversation encryption key
 * This should be shared securely between participants
 */
export function generateConversationKey(): string {
  return EncryptionService.generateKey();
}

/**
 * Derive a key from a password using PBKDF2
 */
export function deriveKeyFromPassword(password: string, salt: string): string {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  return key.toString();
}
