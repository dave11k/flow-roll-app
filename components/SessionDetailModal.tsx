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
import { Pencil, Trash2, Calendar, MapPin, Clock, Star, Target } from 'lucide-react-native';
import { TrainingSession } from '@/types/session';
import SubmissionDisplayPill from '@/components/SubmissionDisplayPill';
import StarRating from '@/components/StarRating';
import { FloatingCloseButton } from './FloatingCloseButton';

interface SessionDetailModalProps {
  visible: boolean;
  session: TrainingSession | null;
  onClose: () => void;
  onEdit?: (session: TrainingSession) => void;
  onDelete?: (session: TrainingSession) => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function SessionDetailModal({
  visible,
  session,
  onClose,
  onEdit,
  onDelete,
}: SessionDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setShowCloseButton(true);
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

  const animateClose = () => {
    setShowCloseButton(false);
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
      dragY.setValue(0);
      onClose();
    });
  };

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      lastGestureY.current = translationY;

      // If dragged down significantly or with high velocity, animate close
      if (translationY > 100 || velocityY > 1000) {
        animateClose();
      } else {
        // Otherwise, snap back to original position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!session || !isVisible) return null;

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


  const getTotalSubmissionCount = () => {
    return Object.values(session.submissionCounts || {}).reduce((total, count) => total + count, 0);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={animateClose}>
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
            <Animated.View>
              <View style={styles.header}>
                <View style={styles.dragHandle} />
              </View>
              
              <View style={styles.headerWithClose}>
                <Text style={styles.headerTitle}>Session Details</Text>
                <View style={styles.actionButtons}>
                  {onEdit && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => {
                        console.log('Edit button pressed');
                        onEdit(session);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Pencil size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => {
                        console.log('Delete button pressed');
                        onDelete(session);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            {/* Date and Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#5271ff" />
                <Text style={styles.sectionTitle}>Date</Text>
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
                  <MapPin size={20} color="#5271ff" />
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <Text style={styles.locationText}>{session.location}</Text>
              </View>
            )}

            {/* Session Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#5271ff" />
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
                    <SubmissionDisplayPill
                      key={submission}
                      label={submission}
                      count={session.submissionCounts[submission] || 1}
                      color="#ef4444"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Satisfaction */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Satisfaction Rating</Text>
              </View>
              <StarRating
                mode="display"
                rating={session.satisfaction}
                size={24}
              />
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
            
            {/* Invisible spacer to ensure full scrollability */}
            <View style={styles.scrollSpacer} />
          </ScrollView>
          
          
        </View>
        
      </Animated.View>
      {showCloseButton && <FloatingCloseButton onPress={animateClose} />}
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#3b82f6',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginVertical: 12,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
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
  scrollSpacer: {
    height: 100,
  },
});