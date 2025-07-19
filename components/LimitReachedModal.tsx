import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Animated,
} from 'react-native';
import { X, AlertCircle, TrendingUp, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useModalAnimation } from '@/hooks/useModalAnimation';
import { useData } from '@/contexts/DataContext';
import UpgradeModal from './UpgradeModal';

interface LimitReachedModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'technique' | 'session';
  currentCount: number;
  limit: number;
}

export default function LimitReachedModal({ 
  visible, 
  onClose, 
  type,
  currentCount,
  limit 
}: LimitReachedModalProps) {
  const modalAnimation = useModalAnimation(visible, { type: 'scale' });
  const { opacityAnim } = modalAnimation;
  const scaleAnim = 'scaleAnim' in modalAnimation ? modalAnimation.scaleAnim : modalAnimation.opacityAnim;
  const { usage } = useData();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const percentage = Math.round((currentCount / limit) * 100);
  const itemType = type === 'technique' ? 'techniques' : 'sessions';
  const icon = type === 'technique' ? '🥋' : '🏋️';

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    onClose();
  };

  const modalTransform = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: opacityAnim }]}>
        <BlurView intensity={100} style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={onClose}
          />
        </BlurView>
      </Animated.View>

      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.modal, modalTransform]}>
          <LinearGradient
            colors={['#fee2e2', '#fecaca']}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <X size={24} color="#dc2626" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <AlertCircle size={48} color="#dc2626" />
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Limit Reached
            </Text>
            
            <Text style={styles.message}>
              You've reached the free plan limit of {limit} {itemType}.
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statEmoji}>{icon}</Text>
                <Text style={styles.statNumber}>{currentCount}</Text>
                <Text style={styles.statLabel}>Current {itemType}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.stat}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>{percentage}%</Text>
                </View>
                <Text style={styles.statLabel}>Limit used</Text>
              </View>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Upgrade to Pro for:</Text>
              <View style={styles.benefit}>
                <Crown size={20} color="#f59e0b" />
                <Text style={styles.benefitText}>Unlimited {itemType}</Text>
              </View>
              <View style={styles.benefit}>
                <TrendingUp size={20} color="#10b981" />
                <Text style={styles.benefitText}>Advanced analytics</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <LinearGradient
                colors={['#5271ff', '#3b5fff']}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
        source="limit"
      />
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
    maxWidth: 380,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#e5e7eb',
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
  },
  benefitsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  upgradeButton: {
    marginBottom: 12,
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});