import { describe, it, expect, beforeAll } from "vitest";
import { EncryptionService, generateConversationKey } from "@shared/encryption";

describe("Modern Features Tests", () => {
  describe("Encryption Service", () => {
    it("should generate a valid encryption key", () => {
      const key = generateConversationKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    });

    it("should encrypt and decrypt a message", () => {
      const key = generateConversationKey();
      const originalMessage = "এটি একটি পরীক্ষা বার্তা / This is a test message";

      const encrypted = EncryptionService.encrypt(originalMessage, key);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalMessage);

      const decrypted = EncryptionService.decrypt(encrypted, key);
      expect(decrypted).toBe(originalMessage);
    });

    it("should generate consistent hashes", () => {
      const message = "Test message";
      const hash1 = EncryptionService.hash(message);
      const hash2 = EncryptionService.hash(message);

      expect(hash1).toBe(hash2);
    });

    it("should generate and verify HMAC", () => {
      const message = "Test message";
      const key = "secret-key";

      const signature = EncryptionService.hmac(message, key);
      const isValid = EncryptionService.verifyHmac(message, key, signature);

      expect(isValid).toBe(true);
    });

    it("should reject invalid HMAC", () => {
      const message = "Test message";
      const key = "secret-key";
      const wrongSignature = "invalid-signature";

      const isValid = EncryptionService.verifyHmac(message, key, wrongSignature);

      expect(isValid).toBe(false);
    });

    it("should fail to decrypt with wrong key", () => {
      const key1 = generateConversationKey();
      const key2 = generateConversationKey();
      const message = "Secret message";

      const encrypted = EncryptionService.encrypt(message, key1);

      expect(() => {
        EncryptionService.decrypt(encrypted, key2);
      }).toThrow();
    });
  });

  describe("WebSocket Integration", () => {
    it("should have WebSocket utilities available", () => {
      expect(typeof WebSocket).toBe("function");
    });
  });

  describe("Voice Features", () => {
    it("should have Web Audio API available", () => {
      expect(typeof AudioContext).toBe("function");
    });

    it("should have Speech Recognition API available", () => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      expect(typeof SpeechRecognition).toBe("function");
    });

    it("should have Speech Synthesis API available", () => {
      expect(typeof window.speechSynthesis).toBe("object");
    });
  });

  describe("PWA Features", () => {
    it("should have Service Worker support", () => {
      expect("serviceWorker" in navigator).toBe(true);
    });

    it("should have Cache API support", () => {
      expect("caches" in window).toBe(true);
    });

    it("should have IndexedDB support", () => {
      expect("indexedDB" in window).toBe(true);
    });

    it("should have Notification API support", () => {
      expect("Notification" in window).toBe(true);
    });
  });

  describe("Encryption Message Flow", () => {
    it("should handle encrypted message workflow", () => {
      const conversationKey = generateConversationKey();
      const userMessage = "আমাকে সাহায্য করুন / Help me";

      // Encrypt
      const encrypted = EncryptionService.encrypt(userMessage, conversationKey);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(userMessage);

      // Simulate transmission
      const transmittedData = encrypted;

      // Decrypt
      const decrypted = EncryptionService.decrypt(transmittedData, conversationKey);
      expect(decrypted).toBe(userMessage);
    });

    it("should handle multiple messages in sequence", () => {
      const conversationKey = generateConversationKey();
      const messages = [
        "প্রথম বার্তা / First message",
        "দ্বিতীয় বার্তা / Second message",
        "তৃতীয় বার্তা / Third message",
      ];

      const encrypted = messages.map((msg) => EncryptionService.encrypt(msg, conversationKey));
      const decrypted = encrypted.map((enc) => EncryptionService.decrypt(enc, conversationKey));

      expect(decrypted).toEqual(messages);
    });
  });

  describe("Data Integrity", () => {
    it("should maintain data integrity with HMAC", () => {
      const message = "Important data";
      const key = "secret-key";

      const signature = EncryptionService.hmac(message, key);

      // Verify original message
      expect(EncryptionService.verifyHmac(message, key, signature)).toBe(true);

      // Verify modified message fails
      const modifiedMessage = "Modified data";
      expect(EncryptionService.verifyHmac(modifiedMessage, key, signature)).toBe(false);
    });
  });

  describe("Multilingual Support", () => {
    it("should handle Bengali text", () => {
      const bengaliText = "এটি বাংলা পাঠ্য / This is Bengali text";
      const key = generateConversationKey();

      const encrypted = EncryptionService.encrypt(bengaliText, key);
      const decrypted = EncryptionService.decrypt(encrypted, key);

      expect(decrypted).toBe(bengaliText);
    });

    it("should handle English text", () => {
      const englishText = "This is English text";
      const key = generateConversationKey();

      const encrypted = EncryptionService.encrypt(englishText, key);
      const decrypted = EncryptionService.decrypt(encrypted, key);

      expect(decrypted).toBe(englishText);
    });

    it("should handle mixed language text", () => {
      const mixedText = "আমরা English এবং বাংলা উভয়ই ব্যবহার করি";
      const key = generateConversationKey();

      const encrypted = EncryptionService.encrypt(mixedText, key);
      const decrypted = EncryptionService.decrypt(encrypted, key);

      expect(decrypted).toBe(mixedText);
    });
  });

  describe("Performance", () => {
    it("should encrypt/decrypt quickly", () => {
      const key = generateConversationKey();
      const message = "Performance test message";

      const startTime = performance.now();
      const encrypted = EncryptionService.encrypt(message, key);
      const decrypted = EncryptionService.decrypt(encrypted, key);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(decrypted).toBe(message);
    });

    it("should handle bulk encryption", () => {
      const key = generateConversationKey();
      const messages = Array.from({ length: 100 }, (_, i) => `Message ${i}`);

      const startTime = performance.now();
      const encrypted = messages.map((msg) => EncryptionService.encrypt(msg, key));
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(encrypted).toHaveLength(100);
    });
  });
});
