import { SubscriptionInfo } from '@/types/subscription';

export interface FeatureFlags {
  canAddTechnique: boolean;
  canAddSession: boolean;
  hasAdvancedAnalytics: boolean;
  hasExportImport: boolean;
  hasCustomThemes: boolean;
  hasPrioritySupport: boolean;
}

export const getFeatureFlags = (subscription: SubscriptionInfo | null): FeatureFlags => {
  if (!subscription) {
    // Default to free tier if no subscription info
    return {
      canAddTechnique: true, // Will be checked separately by usage tracker
      canAddSession: true,   // Will be checked separately by usage tracker
      hasAdvancedAnalytics: false,
      hasExportImport: false,
      hasCustomThemes: false,
      hasPrioritySupport: false,
    };
  }

  const isPro = subscription.status === 'pro' || subscription.status === 'trial';

  return {
    canAddTechnique: true, // Usage limits are checked separately
    canAddSession: true,   // Usage limits are checked separately
    hasAdvancedAnalytics: isPro,
    hasExportImport: isPro,
    hasCustomThemes: isPro,
    hasPrioritySupport: isPro,
  };
};

export const canAccessFeature = (
  feature: keyof FeatureFlags, 
  subscription: SubscriptionInfo | null
): boolean => {
  const flags = getFeatureFlags(subscription);
  return flags[feature];
};

export const getProFeatures = (): Array<{
  key: keyof FeatureFlags;
  name: string;
  description: string;
}> => {
  return [
    {
      key: 'hasAdvancedAnalytics',
      name: 'Advanced Analytics',
      description: 'Deep insights into your training progress with detailed charts and statistics',
    },
    {
      key: 'hasExportImport',
      name: 'Export & Import',
      description: 'Backup and restore your techniques and sessions data',
    },
    {
      key: 'hasCustomThemes',
      name: 'Custom Themes',
      description: 'Personalize your app with different color schemes and themes',
    },
    {
      key: 'hasPrioritySupport',
      name: 'Priority Support',
      description: 'Get faster responses and priority handling for support requests',
    },
  ];
};