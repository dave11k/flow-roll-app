import React, { useRef, useEffect } from 'react';
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
import { X, Calendar, MapPin, Clock, Star, Target } from 'lucide-react-native';
import { TrainingSession } from '@/types/session';
import SubmissionPill from '@/components/SubmissionPill';

interface SessionDetailModalProps {
  visible: boolean;
  session: TrainingSession | null;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function SessionDetailModal({
  visible,
  session,
  onClose,
}: SessionDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.25,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!session) return null;

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

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'gi': return '#1e40af';
      case 'nogi': return '#dc2626';
      case 'open-mat': return '#059669';
      case 'wrestling': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'gi': return 'Gi';
      case 'nogi': return 'No-Gi';
      case 'open-mat': return 'Open Mat';
      case 'wrestling': return 'Wrestling';
      default: return type;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={24}
        color={i < rating ? '#f59e0b' : '#e5e7eb'}
        fill={i < rating ? '#f59e0b' : 'transparent'}
      />
    ));
  };

  const getTotalSubmissionCount = () => {
    return Object.values(session.submissionCounts || {}).reduce((total, count) => total + count, 0);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: opacityAnim,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date and Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Session Details</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(session.date)}</Text>
              <View style={styles.timeRow}>
                <Clock size={16} color="#6b7280" />
                <Text style={styles.timeText}>{formatTime(session.date)}</Text>
              </View>
            </View>

            {/* Location */}
            {session.location && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MapPin size={20} color="#1e3a2e" />
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <Text style={styles.locationText}>{session.location}</Text>
              </View>
            )}

            {/* Session Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Session Type</Text>
              </View>
              <View style={[
                styles.sessionTypeBadge,
                { backgroundColor: getSessionTypeColor(session.type) }
              ]}>
                <Text style={styles.sessionTypeText}>
                  {getSessionTypeLabel(session.type)}
                </Text>
              </View>
            </View>

            {/* Submissions */}
            {session.submissions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Submissions ({getTotalSubmissionCount()})</Text>
                </View>
                <View style={styles.submissionsList}>
                  {session.submissions.map((submission) => (
                    <View key={submission} style={styles.submissionPillContainer}>
                      <SubmissionPill
                        label={submission}
                        count={session.submissionCounts[submission] || 1}
                        onIncrement={() => {}} // Read-only
                        onDecrement={() => {}} // Read-only
                        color="#ef4444"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Satisfaction */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Satisfaction Rating</Text>
              </View>
              <View style={styles.starsContainer}>
                {renderStars(session.satisfaction)}
              </View>
              <Text style={styles.satisfactionLabel}>
                {session.satisfaction === 1 && 'Poor'}
                {session.satisfaction === 2 && 'Fair'}
                {session.satisfaction === 3 && 'Good'}
                {session.satisfaction === 4 && 'Great'}
                {session.satisfaction === 5 && 'Excellent'}
              </Text>
            </View>

            {/* Notes */}
            {session.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{session.notes}</Text>
              </View>
            )}
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
    height: screenHeight * 0.75,
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 8,
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
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
  },
  sessionTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submissionsList: {
    gap: 8,
  },
  submissionPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  satisfactionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});