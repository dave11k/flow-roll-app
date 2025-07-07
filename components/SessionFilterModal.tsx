import React, { useState, useRef, useEffect } from 'react';
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
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { X, Calendar, MapPin, Target, Star, RotateCcw } from 'lucide-react-native';
import { SessionType } from '@/types/session';

interface SessionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  location: string;
  sessionTypes: SessionType[];
  submission: string;
  satisfaction: number | null;
}

interface SessionFilterModalProps {
  visible: boolean;
  filters: SessionFilters;
  onApplyFilters: (filters: SessionFilters) => void;
  onClose: () => void;
  availableLocations: string[];
}

const { height: screenHeight } = Dimensions.get('window');

const SESSION_TYPES: { type: SessionType; label: string; color: string }[] = [
  { type: 'gi', label: 'Gi', color: '#1e40af' },
  { type: 'nogi', label: 'No-Gi', color: '#dc2626' },
  { type: 'open-mat', label: 'Open Mat', color: '#059669' },
  { type: 'wrestling', label: 'Wrestling', color: '#7c3aed' },
];

export default function SessionFilterModal({
  visible,
  filters,
  onApplyFilters,
  onClose,
  availableLocations,
}: SessionFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<SessionFilters>(filters);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      dragY.setValue(0);
      setLocalFilters(filters);
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

  const handleSessionTypeToggle = (type: SessionType) => {
    setLocalFilters(prev => ({
      ...prev,
      sessionTypes: prev.sessionTypes.includes(type)
        ? prev.sessionTypes.filter(t => t !== type)
        : [...prev.sessionTypes, type]
    }));
  };

  const handleSatisfactionSelect = (rating: number) => {
    setLocalFilters(prev => ({
      ...prev,
      satisfaction: prev.satisfaction === rating ? null : rating
    }));
  };

  const handleClearAll = () => {
    setLocalFilters({
      dateRange: { startDate: null, endDate: null },
      location: '',
      sessionTypes: [],
      submission: '',
      satisfaction: null,
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const isSelected = localFilters.satisfaction === rating;
      return (
        <TouchableOpacity
          key={i}
          onPress={() => handleSatisfactionSelect(rating)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Star
            size={28}
            color={isSelected ? '#f59e0b' : '#e5e7eb'}
            fill={isSelected ? '#f59e0b' : 'transparent'}
          />
        </TouchableOpacity>
      );
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={animateClose}>
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
                <View style={styles.headerContent}>
                  <Text style={styles.headerTitle}>Filter Sessions</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={animateClose}
                    activeOpacity={0.7}
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Range */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Date Range</Text>
              </View>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>
                    {formatDate(localFilters.dateRange.startDate)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>to</Text>
                <TouchableOpacity style={styles.dateButton}>
                  <Text style={styles.dateButtonText}>
                    {formatDate(localFilters.dateRange.endDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Filter by location..."
                placeholderTextColor="#9ca3af"
                value={localFilters.location}
                onChangeText={(text) => setLocalFilters(prev => ({ ...prev, location: text }))}
              />
            </View>

            {/* Session Type */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#1e3a2e" />
                <Text style={styles.sectionTitle}>Session Type</Text>
              </View>
              <View style={styles.sessionTypesContainer}>
                {SESSION_TYPES.map((sessionType) => {
                  const isSelected = localFilters.sessionTypes.includes(sessionType.type);
                  return (
                    <TouchableOpacity
                      key={sessionType.type}
                      style={[
                        styles.sessionTypeChip,
                        {
                          backgroundColor: isSelected ? sessionType.color : '#f3f4f6',
                          borderColor: sessionType.color,
                        }
                      ]}
                      onPress={() => handleSessionTypeToggle(sessionType.type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.sessionTypeText,
                        { color: isSelected ? '#fff' : sessionType.color }
                      ]}>
                        {sessionType.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submission */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Submission</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Search for specific submissions..."
                placeholderTextColor="#9ca3af"
                value={localFilters.submission}
                onChangeText={(text) => setLocalFilters(prev => ({ ...prev, submission: text }))}
              />
            </View>

            {/* Satisfaction */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Minimum Satisfaction</Text>
              </View>
              <View style={styles.satisfactionContainer}>
                {renderStars()}
              </View>
              {localFilters.satisfaction && (
                <Text style={styles.satisfactionLabel}>
                  {localFilters.satisfaction}+ stars
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <RotateCcw size={16} color="#6b7280" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
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
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  dateSeparator: {
    fontSize: 14,
    color: '#6b7280',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  sessionTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sessionTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  satisfactionContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
  starButton: {
    padding: 4,
  },
  satisfactionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e3a2e',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});