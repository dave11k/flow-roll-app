import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { X, Target, MapPin, FileText, Calendar } from 'lucide-react-native';
import { Technique } from '@/types/technique';

interface TechniqueDetailModalProps {
  visible: boolean;
  technique: Technique | null;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#22c55e',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

export default function TechniqueDetailModal({
  visible,
  technique,
  onClose,
}: TechniqueDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, isVisible]);

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      lastGestureY.current = translationY;

      // If dragged down significantly or with high velocity, close modal
      if (translationY > 100 || velocityY > 1000) {
        onClose();
      } else {
        // Otherwise, snap back to original position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  if (!technique || !isVisible) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: dragY }
            ],
          },
        ]}
      >
        <View style={styles.modal}>
          <PanGestureHandler
            onGestureEvent={handlePanGesture}
            onHandlerStateChange={handlePanStateChange}
          >
            <Animated.View style={styles.header}>
              <View style={styles.dragHandle} />
            </Animated.View>
          </PanGestureHandler>
          
          <View style={styles.headerWithClose}>
            <Text style={styles.headerTitle}>Technique Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            {/* Technique Name */}
            <View style={styles.section}>
              <Text style={styles.techniqueName}>{technique.name}</Text>
            </View>

            {/* Category and Position */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Category & Position</Text>
              </View>
              <View style={styles.badgesContainer}>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: CATEGORY_COLORS[technique.category] || '#6b7280' }
                ]}>
                  <Text style={styles.badgeText}>{technique.category}</Text>
                </View>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{technique.position}</Text>
                </View>
              </View>
            </View>

            {/* Date Added */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Date Added</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(technique.timestamp)}</Text>
              <Text style={styles.timeText}>{formatTime(technique.timestamp)}</Text>
            </View>

            {/* Notes */}
            {technique.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color="#1e3a2e" />
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{technique.notes}</Text>
              </View>
            )}
            
            {/* Invisible spacer to ensure full scrollability */}
            <View style={styles.scrollSpacer} />
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.9,
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 4,
  },
  headerWithClose: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  techniqueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  positionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1e3a2e',
  },
  positionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  scrollSpacer: {
    height: 100,
  },
});