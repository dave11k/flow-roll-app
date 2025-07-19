export type SubscriptionTier = 'free' | 'pro';

export type SubscriptionStatus = 'free' | 'trial' | 'pro' | 'expired';

export interface SubscriptionLimits {
  maxTechniques: number;
  maxSessions: number;
  hasAnalytics: boolean;
  hasExportImport: boolean;
  hasCustomThemes: boolean;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt?: Date;
  trialEndsAt?: Date;
  limits: SubscriptionLimits;
}

export interface UsageInfo {
  techniqueCount: number;
  sessionCount: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxTechniques: 50,
    maxSessions: 50,
    hasAnalytics: false,
    hasExportImport: false,
    hasCustomThemes: false,
  },
  pro: {
    maxTechniques: Infinity,
    maxSessions: Infinity,
    hasAnalytics: true,
    hasExportImport: true,
    hasCustomThemes: true,
  },
};

export const TRIAL_DURATION_DAYS = 7;

export interface PurchasePackage {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
    price: number;
    currencyCode: string;
    title: string;
    description: string;
  };
}

export interface PaywallConfig {
  title: string;
  subtitle: string;
  features: string[];
  ctaText: string;
  dismissText: string;
}