import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles,
  Trophy,
  Zap,
  Shield,
  TrendingUp,
  FileDown,
  Users,
  Star
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PurchasePackage } from '@/types/subscription';
import { subscriptionService } from '@/services/subscription';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
// import { modalStyles } from '@/styles/common';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  source?: 'limit' | 'settings' | 'feature';
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  isPro: boolean;
}

export default function UpgradeModal({ visible, onClose, onSuccess, source = 'limit' }: UpgradeModalProps) {
  const { refreshSubscription, subscription } = useData();
  const { showSuccess, showError } = useToast();
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const features: Feature[] = [
    {
      icon: <Trophy size={24} color="#f59e0b" />,
      title: 'Unlimited Techniques',
      description: 'Track as many techniques as you want',
      isPro: true,
    },
    {
      icon: <Zap size={24} color="#3b82f6" />,
      title: 'Unlimited Sessions',
      description: 'Log unlimited training sessions',
      isPro: true,
    },
    {
      icon: <TrendingUp size={24} color="#10b981" />,
      title: 'Advanced Analytics',
      description: 'Deep insights into your training progress',
      isPro: true,
    },
    {
      icon: <FileDown size={24} color="#8b5cf6" />,
      title: 'Export & Import',
      description: 'Backup and restore your data anytime',
      isPro: true,
    },
    {
      icon: <Shield size={24} color="#ef4444" />,
      title: 'Priority Support',
      description: 'Get help when you need it most',
      isPro: true,
    },
    {
      icon: <Sparkles size={24} color="#ec4899" />,
      title: 'Custom Themes',
      description: 'Personalize your app experience',
      isPro: true,
    },
  ];

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const offerings = await subscriptionService.getOfferings();
      setPackages(offerings);
      if (offerings.length > 0) {
        setSelectedPackage(offerings[0].identifier);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      showError('Failed to load subscription options');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setIsPurchasing(true);
    try {
      await subscriptionService.purchasePackage(selectedPackage);
      await refreshSubscription();
      showSuccess('Successfully upgraded to Pro!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        showError('Failed to complete purchase. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      await subscriptionService.restorePurchases();
      await refreshSubscription();
      showSuccess('Purchases restored successfully!');
      onClose();
    } catch (error) {
      showError('No purchases found to restore');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <BlurView intensity={100} style={StyleSheet.absoluteFillObject}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </BlurView>

      <SafeAreaView style={styles.container}>
        <View style={styles.modal}>
          <LinearGradient
            colors={['#1e3a2e', '#2d5a4e']}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.crownContainer}>
                <Crown size={48} color="#fbbf24" />
              </View>
              <Text style={styles.title}>Unlock FlowRoll Pro</Text>
              <Text style={styles.subtitle}>
                {source === 'limit' 
                  ? "You've reached the free plan limits"
                  : "Take your BJJ journey to the next level"}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Everything in Pro</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <View style={styles.featureIcon}>
                    {feature.icon}
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Check size={20} color="#10b981" />
                </View>
              ))}
            </View>

            {/* Pricing */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5271ff" />
              </View>
            ) : (
              <View style={styles.pricingSection}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[
                      styles.packageCard,
                      selectedPackage === pkg.identifier && styles.packageCardSelected
                    ]}
                    onPress={() => setSelectedPackage(pkg.identifier)}
                  >
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                      {pkg.identifier.includes('annual') && (
                        <View style={styles.saveBadge}>
                          <Text style={styles.saveBadgeText}>BEST VALUE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                    <Text style={styles.packageDescription}>{pkg.product.description}</Text>
                    {selectedPackage === pkg.identifier && (
                      <View style={styles.selectedIndicator}>
                        <Check size={16} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trial info */}
            {subscription?.status === 'free' && (
              <View style={styles.trialInfo}>
                <Star size={20} color="#f59e0b" />
                <Text style={styles.trialText}>
                  Start with a 7-day free trial • Cancel anytime
                </Text>
              </View>
            )}

            {/* Purchase button */}
            <TouchableOpacity
              style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={isPurchasing || !selectedPackage}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  {subscription?.status === 'free' ? 'Start Free Trial' : 'Upgrade Now'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore button */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isPurchasing}
            >
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              {'\n'}Subscriptions auto-renew unless cancelled 24 hours before the current period ends.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxWidth: 440,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  pricingSection: {
    marginBottom: 24,
  },
  packageCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  packageCardSelected: {
    borderColor: '#5271ff',
    backgroundColor: '#f0f4ff',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5271ff',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5271ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  purchaseButton: {
    backgroundColor: '#5271ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5271ff',
  },
  terms: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
});