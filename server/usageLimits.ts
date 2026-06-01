/**
 * Usage Limits Configuration
 * Define free and paid tier limits for video editing and image generation
 */

export type UserTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface UsageLimits {
  videoEditingMinutesPerMonth: number;
  imageGenerationPerMonth: number;
  videoEditingQuality: 'low' | 'medium' | 'high' | '4k';
  imageGenerationQuality: 'low' | 'medium' | 'high' | 'ultra';
  videoExportFormats: string[];
  imageExportFormats: string[];
  prioritySupport: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  analyticsAccess: boolean;
  teamCollaboration: boolean;
  maxTeamMembers: number;
  storageGB: number;
  concurrentEdits: number;
}

export const TIER_LIMITS: Record<UserTier, UsageLimits> = {
  free: {
    videoEditingMinutesPerMonth: 10, // 10 minutes/month
    imageGenerationPerMonth: 5, // 5 images/month
    videoEditingQuality: 'medium', // Up to 720p
    imageGenerationQuality: 'medium', // 512x512
    videoExportFormats: ['mp4'],
    imageExportFormats: ['jpg', 'png'],
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    analyticsAccess: false,
    teamCollaboration: false,
    maxTeamMembers: 1,
    storageGB: 1,
    concurrentEdits: 1,
  },

  starter: {
    videoEditingMinutesPerMonth: 60, // 60 minutes/month
    imageGenerationPerMonth: 50, // 50 images/month
    videoEditingQuality: 'high', // Up to 1080p
    imageGenerationQuality: 'high', // 1024x1024
    videoExportFormats: ['mp4', 'mov', 'webm'],
    imageExportFormats: ['jpg', 'png', 'webp'],
    prioritySupport: false,
    apiAccess: false,
    customBranding: false,
    analyticsAccess: true,
    teamCollaboration: false,
    maxTeamMembers: 1,
    storageGB: 10,
    concurrentEdits: 1,
  },

  pro: {
    videoEditingMinutesPerMonth: 500, // 500 minutes/month
    imageGenerationPerMonth: 500, // 500 images/month
    videoEditingQuality: '4k', // Up to 4K
    imageGenerationQuality: 'ultra', // 2048x2048
    videoExportFormats: ['mp4', 'mov', 'webm', 'mkv', 'avi'],
    imageExportFormats: ['jpg', 'png', 'webp', 'tiff', 'svg'],
    prioritySupport: true,
    apiAccess: true,
    customBranding: true,
    analyticsAccess: true,
    teamCollaboration: true,
    maxTeamMembers: 5,
    storageGB: 100,
    concurrentEdits: 3,
  },

  enterprise: {
    videoEditingMinutesPerMonth: 99999, // Unlimited
    imageGenerationPerMonth: 99999, // Unlimited
    videoEditingQuality: '4k',
    imageGenerationQuality: 'ultra',
    videoExportFormats: ['mp4', 'mov', 'webm', 'mkv', 'avi', 'flv', 'wmv'],
    imageExportFormats: ['jpg', 'png', 'webp', 'tiff', 'svg', 'eps', 'pdf'],
    prioritySupport: true,
    apiAccess: true,
    customBranding: true,
    analyticsAccess: true,
    teamCollaboration: true,
    maxTeamMembers: 99999,
    storageGB: 1000,
    concurrentEdits: 10,
  },
};

export const TIER_PRICING: Record<UserTier, { monthly: number; annual: number; description: string }> = {
  free: {
    monthly: 0,
    annual: 0,
    description: 'Perfect for trying out our platform',
  },

  starter: {
    monthly: 9.99,
    annual: 99.99,
    description: 'Great for individuals and small creators',
  },

  pro: {
    monthly: 29.99,
    annual: 299.99,
    description: 'Ideal for professionals and content creators',
  },

  enterprise: {
    monthly: 99.99,
    annual: 999.99,
    description: 'For teams and businesses',
  },
};

/**
 * Get tier limits
 */
export function getTierLimits(tier: UserTier): UsageLimits {
  return TIER_LIMITS[tier];
}

/**
 * Get tier pricing
 */
export function getTierPricing(tier: UserTier) {
  return TIER_PRICING[tier];
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  tier: UserTier,
  action: 'video_edit' | 'image_generate',
  currentUsage: number,
  amount: number
): { allowed: boolean; reason?: string } {
  const limits = getTierLimits(tier);

  if (action === 'video_edit') {
    const limit = limits.videoEditingMinutesPerMonth;
    if (limit === 99999) return { allowed: true }; // Unlimited
    if (currentUsage + amount > limit) {
      return {
        allowed: false,
        reason: `Video editing limit exceeded. You have ${limit - currentUsage} minutes remaining this month.`,
      };
    }
    return { allowed: true };
  }

  if (action === 'image_generate') {
    const limit = limits.imageGenerationPerMonth;
    if (limit === 99999) return { allowed: true }; // Unlimited
    if (currentUsage + amount > limit) {
      return {
        allowed: false,
        reason: `Image generation limit exceeded. You have ${limit - currentUsage} images remaining this month.`,
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unknown action' };
}

/**
 * Get remaining usage
 */
export function getRemainingUsage(
  tier: UserTier,
  action: 'video_edit' | 'image_generate',
  currentUsage: number
): number {
  const limits = getTierLimits(tier);

  if (action === 'video_edit') {
    const limit = limits.videoEditingMinutesPerMonth;
    if (limit === 99999) return 99999;
    return Math.max(0, limit - currentUsage);
  }

  if (action === 'image_generate') {
    const limit = limits.imageGenerationPerMonth;
    if (limit === 99999) return 99999;
    return Math.max(0, limit - currentUsage);
  }

  return 0;
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(
  tier: UserTier,
  action: 'video_edit' | 'image_generate',
  currentUsage: number
): number {
  const limits = getTierLimits(tier);

  if (action === 'video_edit') {
    const limit = limits.videoEditingMinutesPerMonth;
    if (limit === 99999) return 0;
    return Math.min(100, (currentUsage / limit) * 100);
  }

  if (action === 'image_generate') {
    const limit = limits.imageGenerationPerMonth;
    if (limit === 99999) return 0;
    return Math.min(100, (currentUsage / limit) * 100);
  }

  return 0;
}

/**
 * Get recommended tier based on usage
 */
export function getRecommendedTier(
  videoEditingMinutes: number,
  imageGenerationCount: number
): UserTier {
  // If using more than free allows, suggest starter
  if (videoEditingMinutes > 10 || imageGenerationCount > 5) {
    // If using more than starter allows, suggest pro
    if (videoEditingMinutes > 60 || imageGenerationCount > 50) {
      // If using more than pro allows, suggest enterprise
      if (videoEditingMinutes > 500 || imageGenerationCount > 500) {
        return 'enterprise';
      }
      return 'pro';
    }
    return 'starter';
  }

  return 'free';
}
