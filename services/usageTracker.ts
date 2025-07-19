import { UsageInfo, SubscriptionInfo } from '@/types/subscription';
import { getTechniqueCount, getSessionCount } from './database';
import { subscriptionService } from './subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USAGE_CACHE_KEY = 'flow_roll_usage_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedUsage {
  usage: UsageInfo;
  timestamp: number;
}

class UsageTracker {
  private cachedUsage: CachedUsage | null = null;

  async getUsageInfo(forceRefresh = false): Promise<UsageInfo> {
    // Check cache first
    if (!forceRefresh && this.cachedUsage) {
      const now = Date.now();
      if (now - this.cachedUsage.timestamp < CACHE_DURATION) {
        return this.cachedUsage.usage;
      }
    }

    try {
      // Get fresh counts from database
      const [techniqueCount, sessionCount] = await Promise.all([
        getTechniqueCount(),
        getSessionCount(),
      ]);

      const usage: UsageInfo = {
        techniqueCount,
        sessionCount,
      };

      // Cache the result
      this.cachedUsage = {
        usage,
        timestamp: Date.now(),
      };

      // Persist to AsyncStorage for app restarts
      await this.persistUsage(usage);

      return usage;
    } catch (error) {
      console.error('Failed to get usage info:', error);
      
      // Try to load from persistent storage
      const persistedUsage = await this.loadPersistedUsage();
      if (persistedUsage) {
        return persistedUsage;
      }

      // Fall back to zero counts
      return {
        techniqueCount: 0,
        sessionCount: 0,
      };
    }
  }

  private async persistUsage(usage: UsageInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(USAGE_CACHE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Failed to persist usage:', error);
    }
  }

  private async loadPersistedUsage(): Promise<UsageInfo | null> {
    try {
      const stored = await AsyncStorage.getItem(USAGE_CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load persisted usage:', error);
    }
    return null;
  }

  async canAddTechnique(): Promise<{ allowed: boolean; reason?: string }> {
    const [usage, subscription] = await Promise.all([
      this.getUsageInfo(),
      subscriptionService.getSubscriptionInfo(),
    ]);

    const limit = subscription.limits.maxTechniques;

    if (limit === Infinity) {
      return { allowed: true };
    }

    if (usage.techniqueCount >= limit) {
      return {
        allowed: false,
        reason: `You've reached the free plan limit of ${limit} techniques. Upgrade to Pro for unlimited techniques!`,
      };
    }

    return { allowed: true };
  }

  async canAddSession(): Promise<{ allowed: boolean; reason?: string }> {
    const [usage, subscription] = await Promise.all([
      this.getUsageInfo(),
      subscriptionService.getSubscriptionInfo(),
    ]);

    const limit = subscription.limits.maxSessions;

    if (limit === Infinity) {
      return { allowed: true };
    }

    if (usage.sessionCount >= limit) {
      return {
        allowed: false,
        reason: `You've reached the free plan limit of ${limit} sessions. Upgrade to Pro for unlimited sessions!`,
      };
    }

    return { allowed: true };
  }

  async getRemainingTechniques(): Promise<number | null> {
    const [usage, subscription] = await Promise.all([
      this.getUsageInfo(),
      subscriptionService.getSubscriptionInfo(),
    ]);

    const limit = subscription.limits.maxTechniques;

    if (limit === Infinity) {
      return null; // Unlimited
    }

    return Math.max(0, limit - usage.techniqueCount);
  }

  async getRemainingSessions(): Promise<number | null> {
    const [usage, subscription] = await Promise.all([
      this.getUsageInfo(),
      subscriptionService.getSubscriptionInfo(),
    ]);

    const limit = subscription.limits.maxSessions;

    if (limit === Infinity) {
      return null; // Unlimited
    }

    return Math.max(0, limit - usage.sessionCount);
  }

  async getUsagePercentage(type: 'techniques' | 'sessions'): Promise<number | null> {
    const [usage, subscription] = await Promise.all([
      this.getUsageInfo(),
      subscriptionService.getSubscriptionInfo(),
    ]);

    const limit = type === 'techniques' 
      ? subscription.limits.maxTechniques 
      : subscription.limits.maxSessions;

    if (limit === Infinity) {
      return null; // Unlimited
    }

    const count = type === 'techniques' 
      ? usage.techniqueCount 
      : usage.sessionCount;

    return Math.min(100, Math.round((count / limit) * 100));
  }

  // Force refresh the cache after adding/deleting items
  async invalidateCache(): Promise<void> {
    this.cachedUsage = null;
    await AsyncStorage.removeItem(USAGE_CACHE_KEY);
  }
}

export const usageTracker = new UsageTracker();