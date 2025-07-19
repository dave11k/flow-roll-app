import { Platform } from 'react-native';
import Purchases, { 
  PurchasesOffering, 
  CustomerInfo,
  PurchasesPackage,
  LOG_LEVEL,
  PurchasesEntitlementInfo
} from 'react-native-purchases';
import { 
  SubscriptionInfo, 
  SubscriptionStatus, 
  SubscriptionTier,
  SUBSCRIPTION_LIMITS,
  TRIAL_DURATION_DAYS,
  PurchasePackage
} from '@/types/subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_CACHE_KEY = 'flow_roll_subscription_cache';
const REVENUE_CAT_API_KEY_IOS = 'YOUR_IOS_API_KEY'; // Replace with actual key
const REVENUE_CAT_API_KEY_ANDROID = 'YOUR_ANDROID_API_KEY'; // Replace with actual key
const ENTITLEMENT_ID = 'pro'; // This should match your RevenueCat entitlement

class SubscriptionService {
  private initialized = false;
  private cachedSubscriptionInfo: SubscriptionInfo | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure RevenueCat
      const apiKey = Platform.OS === 'ios' ? REVENUE_CAT_API_KEY_IOS : REVENUE_CAT_API_KEY_ANDROID;
      
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      await Purchases.configure({ apiKey });
      this.initialized = true;

      // Load cached subscription info
      await this.loadCachedSubscription();
      
      // Fetch latest subscription status
      await this.refreshSubscriptionStatus();
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      // Fall back to free tier if initialization fails
      this.cachedSubscriptionInfo = this.getDefaultSubscription();
    }
  }

  private async loadCachedSubscription(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Convert date strings back to Date objects
        if (parsed.expiresAt) parsed.expiresAt = new Date(parsed.expiresAt);
        if (parsed.trialEndsAt) parsed.trialEndsAt = new Date(parsed.trialEndsAt);
        this.cachedSubscriptionInfo = parsed;
      }
    } catch (error) {
      console.error('Failed to load cached subscription:', error);
    }
  }

  private async cacheSubscription(info: SubscriptionInfo): Promise<void> {
    try {
      this.cachedSubscriptionInfo = info;
      await AsyncStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Failed to cache subscription:', error);
    }
  }

  private getDefaultSubscription(): SubscriptionInfo {
    return {
      tier: 'free',
      status: 'free',
      limits: SUBSCRIPTION_LIMITS.free,
    };
  }

  async refreshSubscriptionStatus(): Promise<SubscriptionInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const subscriptionInfo = this.parseCustomerInfo(customerInfo);
      await this.cacheSubscription(subscriptionInfo);
      return subscriptionInfo;
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
      return this.cachedSubscriptionInfo || this.getDefaultSubscription();
    }
  }

  private parseCustomerInfo(customerInfo: CustomerInfo): SubscriptionInfo {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    
    if (!entitlement) {
      // No active entitlement, check if trial was used
      const allPurchaseDates = customerInfo.allPurchaseDates || {};
      const hasUsedTrial = Object.keys(allPurchaseDates).length > 0;
      return {
        tier: 'free',
        status: hasUsedTrial ? 'expired' : 'free',
        limits: SUBSCRIPTION_LIMITS.free,
      };
    }

    // Active entitlement found
    const isTrialing = entitlement.periodType === 'TRIAL';
    const expirationDate = entitlement.expirationDate ? new Date(entitlement.expirationDate) : undefined;
    
    if (isTrialing) {
      return {
        tier: 'pro',
        status: 'trial',
        trialEndsAt: expirationDate,
        limits: SUBSCRIPTION_LIMITS.pro,
      };
    }

    return {
      tier: 'pro',
      status: 'pro',
      expiresAt: expirationDate,
      limits: SUBSCRIPTION_LIMITS.pro,
    };
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.cachedSubscriptionInfo || this.getDefaultSubscription();
  }

  async getOfferings(): Promise<PurchasePackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (!offerings.current || !offerings.current.availablePackages) {
        return [];
      }

      return offerings.current.availablePackages.map(pkg => ({
        identifier: pkg.identifier,
        product: {
          identifier: pkg.product.identifier,
          priceString: pkg.product.priceString,
          price: pkg.product.price,
          currencyCode: pkg.product.currencyCode || 'USD',
          title: pkg.product.title,
          description: pkg.product.description,
        },
      }));
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async purchasePackage(packageIdentifier: string): Promise<SubscriptionInfo> {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.identifier === packageIdentifier
      );

      if (!pkg) {
        throw new Error('Package not found');
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const subscriptionInfo = this.parseCustomerInfo(customerInfo);
      await this.cacheSubscription(subscriptionInfo);
      return subscriptionInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        throw new Error('Purchase cancelled');
      }
      throw error;
    }
  }

  async restorePurchases(): Promise<SubscriptionInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const subscriptionInfo = this.parseCustomerInfo(customerInfo);
      await this.cacheSubscription(subscriptionInfo);
      return subscriptionInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw new Error('Failed to restore purchases');
    }
  }

  async getCustomerId(): Promise<string | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.originalAppUserId;
    } catch (error) {
      console.error('Failed to get customer ID:', error);
      return null;
    }
  }

  isFeatureAvailable(feature: keyof SubscriptionInfo['limits']): boolean {
    const subscription = this.cachedSubscriptionInfo || this.getDefaultSubscription();
    return subscription.limits[feature] === true || subscription.limits[feature] === Infinity;
  }

  getRemainingTrialDays(): number | null {
    const subscription = this.cachedSubscriptionInfo;
    if (!subscription || subscription.status !== 'trial' || !subscription.trialEndsAt) {
      return null;
    }

    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  }
}

export const subscriptionService = new SubscriptionService();