/**
 * Subscription Lifecycle Management
 * Handles upgrade, downgrade, cancellation, and reactivation
 */

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "expired"
  | "pending";

export type SubscriptionAction = "upgrade" | "downgrade" | "cancel" | "reactivate";

export interface Subscription {
  id: string;
  userId: number;
  stripeSubscriptionId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: "monthly" | "yearly";
  features: string[];
  tier: "basic" | "pro" | "premium";
}

export interface SubscriptionChange {
  id: string;
  subscriptionId: string;
  action: SubscriptionAction;
  fromPlan: string;
  toPlan: string;
  effectiveDate: Date;
  prorationAmount: number;
  reason?: string;
  createdAt: Date;
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Basic Plan",
    description: "Perfect for getting started",
    price: 9.99,
    currency: "usd",
    billingInterval: "monthly",
    features: [
      "Up to 10 AI conversations per day",
      "Basic analytics",
      "Email support",
    ],
    tier: "basic",
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    description: "For power users",
    price: 29.99,
    currency: "usd",
    billingInterval: "monthly",
    features: [
      "Unlimited AI conversations",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    tier: "pro",
  },
  premium: {
    id: "premium",
    name: "Premium Plan",
    description: "For enterprises",
    price: 99.99,
    currency: "usd",
    billingInterval: "monthly",
    features: [
      "Unlimited everything",
      "Custom analytics",
      "Dedicated support",
      "Advanced API access",
      "Custom integrations",
    ],
    tier: "premium",
  },
};

/**
 * Get subscription plan details
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null;
}

/**
 * Get all available plans
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Calculate proration amount for upgrade/downgrade
 */
export function calculateProration(
  fromPlan: SubscriptionPlan,
  toPlan: SubscriptionPlan,
  daysRemaining: number,
  totalDaysInPeriod: number
): number {
  const dailyRateFrom = fromPlan.price / totalDaysInPeriod;
  const dailyRateTo = toPlan.price / totalDaysInPeriod;

  const creditFromCurrentPlan = dailyRateFrom * daysRemaining;
  const chargeForNewPlan = dailyRateTo * daysRemaining;

  return chargeForNewPlan - creditFromCurrentPlan;
}

/**
 * Validate subscription upgrade
 */
export function canUpgrade(
  currentPlanId: string,
  targetPlanId: string
): { allowed: boolean; reason?: string } {
  const currentPlan = getSubscriptionPlan(currentPlanId);
  const targetPlan = getSubscriptionPlan(targetPlanId);

  if (!currentPlan || !targetPlan) {
    return { allowed: false, reason: "Invalid plan" };
  }

  if (currentPlan.tier === targetPlan.tier) {
    return { allowed: false, reason: "Cannot upgrade to the same plan" };
  }

  const tierOrder = { basic: 0, pro: 1, premium: 2 };
  if (tierOrder[currentPlan.tier] >= tierOrder[targetPlan.tier]) {
    return { allowed: false, reason: "Can only upgrade to a higher tier" };
  }

  return { allowed: true };
}

/**
 * Validate subscription downgrade
 */
export function canDowngrade(
  currentPlanId: string,
  targetPlanId: string
): { allowed: boolean; reason?: string } {
  const currentPlan = getSubscriptionPlan(currentPlanId);
  const targetPlan = getSubscriptionPlan(targetPlanId);

  if (!currentPlan || !targetPlan) {
    return { allowed: false, reason: "Invalid plan" };
  }

  if (currentPlan.tier === targetPlan.tier) {
    return { allowed: false, reason: "Cannot downgrade to the same plan" };
  }

  const tierOrder = { basic: 0, pro: 1, premium: 2 };
  if (tierOrder[currentPlan.tier] <= tierOrder[targetPlan.tier]) {
    return { allowed: false, reason: "Can only downgrade to a lower tier" };
  }

  return { allowed: true };
}

/**
 * Create subscription change record
 */
export function createSubscriptionChange(
  subscriptionId: string,
  action: SubscriptionAction,
  fromPlanId: string,
  toPlanId: string,
  prorationAmount: number,
  reason?: string
): SubscriptionChange {
  return {
    id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subscriptionId,
    action,
    fromPlan: fromPlanId,
    toPlan: toPlanId,
    effectiveDate: new Date(),
    prorationAmount,
    reason,
    createdAt: new Date(),
  };
}

/**
 * Get subscription change history
 */
export function getSubscriptionChangeHistory(
  subscriptionId: string
): SubscriptionChange[] {
  // TODO: Fetch from database
  return [];
}

/**
 * Calculate days remaining in billing period
 */
export function calculateDaysRemaining(
  currentPeriodEnd: Date
): number {
  const now = new Date();
  const daysRemaining = Math.ceil(
    (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, daysRemaining);
}

/**
 * Get total days in billing period
 */
export function getTotalDaysInPeriod(
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): number {
  return Math.ceil(
    (currentPeriodEnd.getTime() - currentPeriodStart.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

/**
 * Validate cancellation
 */
export function validateCancellation(
  subscription: Subscription
): { allowed: boolean; reason?: string } {
  if (subscription.status === "cancelled") {
    return { allowed: false, reason: "Subscription is already cancelled" };
  }

  if (subscription.status === "expired") {
    return { allowed: false, reason: "Subscription has already expired" };
  }

  return { allowed: true };
}

/**
 * Validate reactivation
 */
export function validateReactivation(
  subscription: Subscription
): { allowed: boolean; reason?: string } {
  if (subscription.status === "active") {
    return { allowed: false, reason: "Subscription is already active" };
  }

  if (subscription.status === "expired") {
    return { allowed: false, reason: "Expired subscriptions cannot be reactivated" };
  }

  if (!subscription.cancelledAt) {
    return { allowed: false, reason: "Cannot reactivate this subscription" };
  }

  const daysSinceCancellation = Math.floor(
    (Date.now() - subscription.cancelledAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceCancellation > 30) {
    return {
      allowed: false,
      reason: "Subscription can only be reactivated within 30 days of cancellation",
    };
  }

  return { allowed: true };
}

/**
 * Get subscription renewal date
 */
export function getSubscriptionRenewalDate(
  subscription: Subscription
): Date {
  return subscription.currentPeriodEnd;
}

/**
 * Check if subscription is expiring soon
 */
export function isExpiringWithin(
  subscription: Subscription,
  days: number
): boolean {
  const now = Date.now();
  const expiryTime = subscription.currentPeriodEnd.getTime();
  const daysMs = days * 24 * 60 * 60 * 1000;

  return expiryTime - now <= daysMs && expiryTime > now;
}

/**
 * Get subscription status display text
 */
export function getSubscriptionStatusDisplay(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: "Active",
    paused: "Paused",
    cancelled: "Cancelled",
    expired: "Expired",
    pending: "Pending",
  };
  return statusMap[status];
}

/**
 * Get subscription action display text
 */
export function getSubscriptionActionDisplay(action: SubscriptionAction): string {
  const actionMap: Record<SubscriptionAction, string> = {
    upgrade: "Upgraded",
    downgrade: "Downgraded",
    cancel: "Cancelled",
    reactivate: "Reactivated",
  };
  return actionMap[action];
}
