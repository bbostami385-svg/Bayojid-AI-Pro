import { CREDIT_CONFIG, CREDIT_COSTS } from "./creditSystemV2";

/**
 * Fair Usage Policy Enforcement
 * - GPT-5: Max 20-30% usage allowed
 * - Heavy models: Auto-restricted for free/pro tiers
 * - Soft limits: Warn at 80%, block at 90%
 */

export interface FairUsageCheck {
  allowed: boolean;
  warning: boolean;
  message: string;
  recommendation?: string;
}

/**
 * Check if GPT-5 usage is within limits
 */
export function checkGPT5Usage(
  userTier: string,
  gpt5UsagePercentage: number
): FairUsageCheck {
  const tierConfig = CREDIT_CONFIG[userTier as keyof typeof CREDIT_CONFIG];

  if (!tierConfig.gpt5Limit || tierConfig.gpt5Limit === 0) {
    return {
      allowed: false,
      warning: false,
      message: `GPT-5 is not available for ${userTier} tier`,
      recommendation: `Upgrade to Premium (${tierConfig.gpt5Limit}% allowed) or Enterprise (30% allowed)`,
    };
  }

  if (gpt5UsagePercentage > tierConfig.gpt5Limit) {
    return {
      allowed: false,
      warning: false,
      message: `GPT-5 usage exceeds ${tierConfig.gpt5Limit}% limit for ${userTier} tier. Current: ${gpt5UsagePercentage.toFixed(1)}%`,
      recommendation: `Reduce GPT-5 usage or upgrade to a higher tier`,
    };
  }

  if (gpt5UsagePercentage > tierConfig.gpt5Limit * 0.8) {
    return {
      allowed: true,
      warning: true,
      message: `GPT-5 usage approaching limit. Current: ${gpt5UsagePercentage.toFixed(1)}%, Limit: ${tierConfig.gpt5Limit}%`,
      recommendation: `Consider using alternative models or upgrading`,
    };
  }

  return {
    allowed: true,
    warning: false,
    message: `GPT-5 usage within limits`,
  };
}

/**
 * Check if model is allowed for tier
 */
export function checkModelAllowance(
  modelName: string,
  userTier: string
): FairUsageCheck {
  const tierConfig = CREDIT_CONFIG[userTier as keyof typeof CREDIT_CONFIG];

  // Heavy models restricted for free tier
  if (userTier === "free") {
    const restrictedModels = ["gpt5", "claude-mythos", "grok", "gemini3"];
    if (restrictedModels.some((m) => modelName.toLowerCase().includes(m))) {
      return {
        allowed: false,
        warning: false,
        message: `${modelName} is not available for free tier`,
        recommendation: `Upgrade to Pro tier to access premium models`,
      };
    }
  }

  // GPT-5 specific check
  if (modelName.toLowerCase().includes("gpt5")) {
    if (!tierConfig.gpt5Limit || tierConfig.gpt5Limit === 0) {
      return {
        allowed: false,
        warning: false,
        message: `GPT-5 is not available for ${userTier} tier`,
        recommendation: `Upgrade to Premium or Enterprise tier`,
      };
    }
  }

  return {
    allowed: true,
    warning: false,
    message: `${modelName} is available for ${userTier} tier`,
  };
}

/**
 * Check monthly usage against safe zone
 */
export function checkMonthlySafeZone(
  userTier: string,
  monthlyUsedCredits: number
): FairUsageCheck {
  const tierConfig = CREDIT_CONFIG[userTier as keyof typeof CREDIT_CONFIG];

  if (!tierConfig.safeZoneMin || !tierConfig.safeZoneMax) {
    return {
      allowed: true,
      warning: false,
      message: `No safe zone defined for ${userTier} tier`,
    };
  }

  const usagePercentage = (monthlyUsedCredits / tierConfig.monthlyCredits) * 100;

  if (usagePercentage > 90) {
    return {
      allowed: false,
      warning: true,
      message: `Monthly usage exceeds 90% (${usagePercentage.toFixed(1)}%). Fair Usage Policy blocks further usage.`,
      recommendation: `Wait for next month or upgrade to a higher tier`,
    };
  }

  if (usagePercentage > 80) {
    return {
      allowed: true,
      warning: true,
      message: `Monthly usage at ${usagePercentage.toFixed(1)}%. Approaching fair usage limit.`,
      recommendation: `Consider upgrading to maintain uninterrupted access`,
    };
  }

  if (monthlyUsedCredits < tierConfig.safeZoneMin) {
    return {
      allowed: true,
      warning: false,
      message: `Monthly usage below safe zone (${tierConfig.safeZoneMin}-${tierConfig.safeZoneMax})`,
      recommendation: `You're using less than expected. Increase usage or consider downgrading`,
    };
  }

  if (monthlyUsedCredits > tierConfig.safeZoneMax) {
    return {
      allowed: true,
      warning: true,
      message: `Monthly usage above safe zone (${tierConfig.safeZoneMin}-${tierConfig.safeZoneMax})`,
      recommendation: `You're using more than expected. Consider upgrading`,
    };
  }

  return {
    allowed: true,
    warning: false,
    message: `Monthly usage in safe zone`,
  };
}

/**
 * Get recommended model based on tier and usage
 */
export function getRecommendedModel(
  userTier: string,
  useCase: "chat" | "coding" | "analysis" | "creative"
): string {
  switch (userTier) {
    case "free":
      switch (useCase) {
        case "chat":
          return "Gemini Flash";
        case "coding":
          return "Qwen";
        case "analysis":
          return "DeepSeek";
        case "creative":
          return "Gemini Flash";
        default:
          return "Gemini Flash";
      }

    case "pro":
      switch (useCase) {
        case "chat":
          return "Claude Mythos";
        case "coding":
          return "Grok";
        case "analysis":
          return "Perplexity";
        case "creative":
          return "Claude Mythos";
        default:
          return "Claude Mythos";
      }

    case "premium":
      switch (useCase) {
        case "chat":
          return "Claude Mythos";
        case "coding":
          return "GPT-5 (limited 25%)";
        case "analysis":
          return "Perplexity";
        case "creative":
          return "Grok";
        default:
          return "Claude Mythos";
      }

    case "enterprise":
      switch (useCase) {
        case "chat":
          return "GPT-5 (30% allowed)";
        case "coding":
          return "GPT-5 (30% allowed)";
        case "analysis":
          return "GPT-5 (30% allowed)";
        case "creative":
          return "GPT-5 (30% allowed)";
        default:
          return "GPT-5 (30% allowed)";
      }

    default:
      return "Gemini Flash";
  }
}

/**
 * Calculate effective credit cost with fair usage multiplier
 */
export function calculateEffectiveCost(
  operation: string,
  baseCredits: number,
  monthlyUsagePercentage: number
): number {
  // Increase cost as user approaches limits (soft limit incentive)
  let multiplier = 1;

  if (monthlyUsagePercentage > 80) {
    multiplier = 1.2; // 20% increase
  }
  if (monthlyUsagePercentage > 85) {
    multiplier = 1.5; // 50% increase
  }
  if (monthlyUsagePercentage > 90) {
    multiplier = 2; // 100% increase (double cost)
  }

  return Math.ceil(baseCredits * multiplier);
}

/**
 * Generate fair usage report for user
 */
export function generateFairUsageReport(
  userTier: string,
  monthlyUsedCredits: number,
  gpt5UsagePercentage: number
): {
  tier: string;
  monthlyLimit: number;
  used: number;
  remaining: number;
  usagePercentage: number;
  gpt5Usage: number;
  status: "healthy" | "warning" | "critical";
  recommendations: string[];
} {
  const tierConfig = CREDIT_CONFIG[userTier as keyof typeof CREDIT_CONFIG];
  const monthlyLimit = tierConfig.monthlyCredits;
  const remaining = monthlyLimit - monthlyUsedCredits;
  const usagePercentage = (monthlyUsedCredits / monthlyLimit) * 100;

  const recommendations: string[] = [];

  if (usagePercentage > 90) {
    recommendations.push("You've reached 90% of your monthly limit. Upgrade or wait for next month.");
  } else if (usagePercentage > 80) {
    recommendations.push("You're approaching your monthly limit. Consider upgrading to a higher tier.");
  }

  if (gpt5UsagePercentage > tierConfig.gpt5Limit * 0.8) {
    recommendations.push(`GPT-5 usage approaching limit (${gpt5UsagePercentage.toFixed(1)}%/${tierConfig.gpt5Limit}%)`);
  }

  if (userTier === "free" && usagePercentage > 50) {
    recommendations.push("Upgrade to Pro tier for 10x more credits and access to premium models.");
  }

  let status: "healthy" | "warning" | "critical" = "healthy";
  if (usagePercentage > 90) status = "critical";
  else if (usagePercentage > 80) status = "warning";

  return {
    tier: userTier,
    monthlyLimit,
    used: monthlyUsedCredits,
    remaining,
    usagePercentage: Math.round(usagePercentage * 100) / 100,
    gpt5Usage: gpt5UsagePercentage,
    status,
    recommendations,
  };
}
