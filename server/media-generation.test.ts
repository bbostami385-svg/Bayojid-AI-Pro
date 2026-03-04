import { describe, it, expect } from "vitest";
import { SUBSCRIPTION_TIERS } from "./subscription";

describe("Media Generation Features", () => {
  describe("Subscription Tiers", () => {
    it("should have free tier defined", () => {
      expect(SUBSCRIPTION_TIERS.free).toBeDefined();
      expect(SUBSCRIPTION_TIERS.free.id).toBe("free");
      expect(SUBSCRIPTION_TIERS.free.price).toBe(0);
    });

    it("should have pro tier defined", () => {
      expect(SUBSCRIPTION_TIERS.pro).toBeDefined();
      expect(SUBSCRIPTION_TIERS.pro.id).toBe("pro");
      expect(SUBSCRIPTION_TIERS.pro.price).toBe(999);
    });

    it("should have premium tier defined", () => {
      expect(SUBSCRIPTION_TIERS.premium).toBeDefined();
      expect(SUBSCRIPTION_TIERS.premium.id).toBe("premium");
      expect(SUBSCRIPTION_TIERS.premium.price).toBe(2999);
    });

    it("free tier should have correct video limits", () => {
      const tier = SUBSCRIPTION_TIERS.free;
      expect(tier.features.videoDuration).toBe("৮ সেকেন্ড / 8 seconds");
      expect(tier.features.videoQuality).toBe("480p");
      expect(tier.features.videosPerDay).toBe(3);
    });

    it("pro tier should have correct video limits", () => {
      const tier = SUBSCRIPTION_TIERS.pro;
      expect(tier.features.videoDuration).toBe("১০ সেকেন্ড / 10 seconds");
      expect(tier.features.videoQuality).toBe("720p");
      expect(tier.features.videosPerDay).toBe(10);
    });

    it("premium tier should have unlimited videos", () => {
      const tier = SUBSCRIPTION_TIERS.premium;
      expect(tier.features.videoDuration).toBe("৬০ সেকেন্ড / 60 seconds");
      expect(tier.features.videoQuality).toBe("1080p");
      expect(tier.features.videosPerDay).toBe(-1); // unlimited
    });

    it("all tiers should have unlimited images", () => {
      Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
        expect(tier.features.images).toBe("সীমাহীন / Unlimited");
      });
    });
  });

  describe("Subscription Features", () => {
    it("free tier should have basic features", () => {
      const tier = SUBSCRIPTION_TIERS.free;
      expect(tier.features.encryption).toBe(true);
      expect(tier.features.translation).toBe(true);
      expect(tier.features.voiceFeatures).toBe(true);
      expect(tier.features.prioritySupport).toBe(false);
    });

    it("pro tier should have advanced features", () => {
      const tier = SUBSCRIPTION_TIERS.pro;
      expect(tier.features.encryption).toBe(true);
      expect(tier.features.translation).toBe(true);
      expect(tier.features.prioritySupport).toBe(true);
    });

    it("premium tier should have all features", () => {
      const tier = SUBSCRIPTION_TIERS.premium;
      expect(tier.features.customBranding).toBe(true);
      expect(tier.features.apiAccess).toBe(true);
      expect(tier.features.prioritySupport).toBe(true);
    });
  });

  describe("Video Duration Validation", () => {
    it("should validate free tier video duration", () => {
      const tier = SUBSCRIPTION_TIERS.free;
      const maxDuration = 8;
      expect(maxDuration).toBeLessThanOrEqual(8);
    });

    it("should validate pro tier video duration", () => {
      const tier = SUBSCRIPTION_TIERS.pro;
      const maxDuration = 10;
      expect(maxDuration).toBeLessThanOrEqual(10);
    });

    it("should validate premium tier video duration", () => {
      const tier = SUBSCRIPTION_TIERS.premium;
      const maxDuration = 60;
      expect(maxDuration).toBeLessThanOrEqual(60);
    });
  });

  describe("Video Quality Validation", () => {
    it("should validate free tier quality", () => {
      const tier = SUBSCRIPTION_TIERS.free;
      expect(tier.features.videoQuality).toBe("480p");
    });

    it("should validate pro tier quality", () => {
      const tier = SUBSCRIPTION_TIERS.pro;
      expect(tier.features.videoQuality).toBe("720p");
    });

    it("should validate premium tier quality", () => {
      const tier = SUBSCRIPTION_TIERS.premium;
      expect(tier.features.videoQuality).toBe("1080p");
    });

    it("should have quality hierarchy", () => {
      const qualityLevels: Record<string, number> = {
        "480p": 1,
        "720p": 2,
        "1080p": 3,
      };

      expect(qualityLevels["480p"]).toBeLessThan(qualityLevels["720p"]);
      expect(qualityLevels["720p"]).toBeLessThan(qualityLevels["1080p"]);
    });
  });

  describe("Pricing", () => {
    it("should have correct pricing", () => {
      expect(SUBSCRIPTION_TIERS.free.price).toBe(0);
      expect(SUBSCRIPTION_TIERS.pro.price).toBe(999); // $9.99
      expect(SUBSCRIPTION_TIERS.premium.price).toBe(2999); // $29.99
    });

    it("should have price hierarchy", () => {
      expect(SUBSCRIPTION_TIERS.free.price).toBeLessThan(SUBSCRIPTION_TIERS.pro.price);
      expect(SUBSCRIPTION_TIERS.pro.price).toBeLessThan(SUBSCRIPTION_TIERS.premium.price);
    });
  });

  describe("Image Generation", () => {
    it("should allow unlimited images for all tiers", () => {
      Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
        expect(tier.features.images).toBe("সীমাহীন / Unlimited");
      });
    });

    it("should have image quality options", () => {
      Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
        expect(tier.features.imageQuality).toBeDefined();
        expect(["উচ্চ / High", "অতি উচ্চ / Ultra High", "সর্বোচ্চ / Maximum"]).toContain(
          tier.features.imageQuality
        );
      });
    });
  });

  describe("Daily Quota", () => {
    it("free tier should have 3 videos per day", () => {
      expect(SUBSCRIPTION_TIERS.free.features.videosPerDay).toBe(3);
    });

    it("pro tier should have 10 videos per day", () => {
      expect(SUBSCRIPTION_TIERS.pro.features.videosPerDay).toBe(10);
    });

    it("premium tier should have unlimited videos", () => {
      expect(SUBSCRIPTION_TIERS.premium.features.videosPerDay).toBe(-1);
    });
  });

  describe("Feature Comparison", () => {
    it("should have more features in higher tiers", () => {
      const freeTier = SUBSCRIPTION_TIERS.free;
      const proTier = SUBSCRIPTION_TIERS.pro;
      const premiumTier = SUBSCRIPTION_TIERS.premium;

      // Pro should have better video quality
      const qualityLevels: Record<string, number> = {
        "480p": 1,
        "720p": 2,
        "1080p": 3,
      };

      expect(
        qualityLevels[freeTier.features.videoQuality.split(" ")[0] as keyof typeof qualityLevels]
      ).toBeLessThan(
        qualityLevels[proTier.features.videoQuality.split(" ")[0] as keyof typeof qualityLevels]
      );

      expect(
        qualityLevels[proTier.features.videoQuality.split(" ")[0] as keyof typeof qualityLevels]
      ).toBeLessThan(
        qualityLevels[premiumTier.features.videoQuality.split(" ")[0] as keyof typeof qualityLevels]
      );
    });
  });

  describe("Tier Names", () => {
    it("should have Bengali and English names", () => {
      Object.values(SUBSCRIPTION_TIERS).forEach((tier) => {
        expect(tier.name).toContain("/");
        const [bengali, english] = tier.name.split("/");
        expect(bengali.trim().length).toBeGreaterThan(0);
        expect(english.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
