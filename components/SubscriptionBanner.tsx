import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Clock, Crown, AlertCircle } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { subscriptionService } from '@/services/subscription';
import UpgradeModal from './UpgradeModal';

interface SubscriptionBannerProps {
  onDismiss?: () => void;
}

export default function SubscriptionBanner({ onDismiss }: SubscriptionBannerProps) {
  const { subscription, usage } = useData();
  const [visible, setVisible] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Determine if banner should be shown
    const shouldShowBanner = checkShouldShowBanner();
    if (shouldShowBanner) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [subscription, usage]);

  const checkShouldShowBanner = () => {
    if (!subscription || !usage) return false;

    // Show for trial users
    if (subscription.status === 'trial') {
      const remainingDays = subscriptionService.getRemainingTrialDays();
      return remainingDays !== null && remainingDays <= 3;
    }

    // Show for free users approaching limits
    if (subscription.status === 'free') {
      const techPercentage = (usage.techniqueCount / subscription.limits.maxTechniques) * 100;
      const sessionPercentage = (usage.sessionCount / subscription.limits.maxSessions) * 100;
      return techPercentage >= 80 || sessionPercentage >= 80;
    }

    return false;
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  const getBannerContent = () => {
    if (!subscription || !usage) return null;

    if (subscription.status === 'trial') {
      const remainingDays = subscriptionService.getRemainingTrialDays();
      return {
        icon: <Clock size={20} color="#f59e0b" />,
        title: `Trial ends in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`,
        subtitle: 'Upgrade now to keep all your data',
        colors: ['#fef3c7', '#fde68a'] as const,
        titleColor: '#92400e',
        subtitleColor: '#b45309',
      };
    }

    if (subscription.status === 'free') {
      const techPercentage = Math.round((usage.techniqueCount / subscription.limits.maxTechniques) * 100);
      const sessionPercentage = Math.round((usage.sessionCount / subscription.limits.maxSessions) * 100);
      const higherPercentage = Math.max(techPercentage, sessionPercentage);
      const limitType = techPercentage > sessionPercentage ? 'techniques' : 'sessions';

      return {
        icon: <AlertCircle size={20} color="#dc2626" />,
        title: `${higherPercentage}% of ${limitType} limit used`,
        subtitle: 'Upgrade to Pro for unlimited access',
        colors: ['#fee2e2', '#fecaca'] as const,
        titleColor: '#991b1b',
        subtitleColor: '#dc2626',
      };
    }

    return null;
  };

  const content = getBannerContent();
  if (!visible || !content) return null;

  return (
    <>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={content.colors}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.content}
            onPress={() => setShowUpgradeModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              {content.icon}
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: content.titleColor }]}>
                {content.title}
              </Text>
              <Text style={[styles.subtitle, { color: content.subtitleColor }]}>
                {content.subtitle}
              </Text>
            </View>
            <View style={styles.crownContainer}>
              <Crown size={24} color={content.titleColor} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={content.titleColor} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        source="feature"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  banner: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 40,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  crownContainer: {
    marginLeft: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});