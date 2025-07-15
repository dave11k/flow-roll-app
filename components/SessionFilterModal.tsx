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
  Keyboard,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { X, Calendar, MapPin, Target, RotateCcw, ChevronDown } from 'lucide-react-native';
import { SessionType } from '@/types/session';
import { getLocationsFromDb, getUniqueSubmissionsFromDb } from '@/services/database';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import SimpleDatePicker from '@/components/SimpleDatePicker';
import { useFilterModal } from '@/contexts/FilterModalContext';
import { useModalAnimation } from '@/hooks/useModalAnimation';
import StarRating from '@/components/StarRating';

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
}: SessionFilterModalProps) {
  const { setIsFilterModalOpen } = useFilterModal();
  const [localFilters, setLocalFilters] = useState<SessionFilters>(filters);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSubmissionDropdown, setShowSubmissionDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableSubmissions, setAvailableSubmissions] = useState<string[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<string[]>([]);
  const lastGestureY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const submissionInputRef = useRef<View>(null);

  const modalAnimation = useModalAnimation(visible, { type: 'slide', duration: 300 });
  const { 
    slideAnim, 
    backgroundOpacityAnim, 
    dragY, 
    isVisible, 
    animateOut, 
    resetDrag 
  } = modalAnimation as any; // Type assertion for slide animation

  useEffect(() => {
    if (visible) {
      setIsFilterModalOpen(true);
      setLocalFilters(filters);
      loadData();
    } else if (!visible && isVisible) {
      setIsFilterModalOpen(false);
    }
  }, [visible, filters, setIsFilterModalOpen, isVisible]);

  const loadData = async () => {
    try {
      const [locations, submissions] = await Promise.all([
        getLocationsFromDb(),
        getUniqueSubmissionsFromDb()
      ]);
      setAvailableLocations(locations);
      setAvailableSubmissions(submissions);
      setFilteredSubmissions(submissions);
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  };

  const animateClose = () => {
    animateOut(() => {
      resetDrag();
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
    const clearedFilters = {
      dateRange: { startDate: null, endDate: null },
      location: '',
      sessionTypes: [],
      submission: '',
      satisfaction: null,
    };
    setLocalFilters(clearedFilters);
    setShowLocationDropdown(false);
    setShowSubmissionDropdown(false);
    onApplyFilters(clearedFilters);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleSubmissionInputChange = (text: string) => {
    setLocalFilters(prev => ({ ...prev, submission: text }));
    
    if (text.trim()) {
      const filtered = availableSubmissions.filter(submission =>
        submission.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSubmissions(filtered);
      setShowSubmissionDropdown(text.length > 0 && filtered.length > 0);
    } else {
      setFilteredSubmissions(availableSubmissions);
      setShowSubmissionDropdown(false);
    }
  };

  const handleSubmissionSelect = (submission: string) => {
    setLocalFilters(prev => ({ ...prev, submission }));
    setShowSubmissionDropdown(false);
    // Add slight delay to ensure state update happens before dismissing keyboard
    setTimeout(() => {
      Keyboard.dismiss();
    }, 50);
  };

  const handleLocationSelect = (location: string) => {
    setLocalFilters(prev => ({ ...prev, location }));
    setShowLocationDropdown(false);
  };



  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={animateClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backgroundOpacityAnim,
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

            <View style={styles.contentWrapper}>
                <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Date Range */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Calendar size={20} color="#5271ff" />
                  <Text style={styles.sectionTitle}>Date Range</Text>
                </View>
                <View style={styles.dateRangeContainer}>
                  <SimpleDatePicker
                    value={localFilters.dateRange.startDate}
                    onChange={(date) => {
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          startDate: date
                        }
                      }));
                    }}
                    placeholder="Start date"
                    maxDate={new Date()}
                  />
                  <Text style={styles.dateSeparator}>to</Text>
                  <SimpleDatePicker
                    value={localFilters.dateRange.endDate}
                    onChange={(date) => {
                      setLocalFilters(prev => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          endDate: date
                        }
                      }));
                    }}
                    placeholder="End date"
                    maxDate={new Date()}
                  />
                </View>
              </View>

              {/* Location */}
              <View style={[styles.section, { zIndex: 2000 }]}>
                <View style={styles.sectionHeader}>
                  <MapPin size={20} color="#5271ff" />
                  <Text style={styles.sectionTitle}>Location</Text>
                </View>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownButtonText, localFilters.location ? styles.dropdownButtonTextSelected : null]}>
                      {localFilters.location || 'Select location...'}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>
                  {showLocationDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="always">
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => handleLocationSelect('')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownItemText}>All locations</Text>
                        </TouchableOpacity>
                        {availableLocations.map((location, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleLocationSelect(location)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.dropdownItemText}>{location}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Submission */}
              <View style={[styles.section, { zIndex: 1000 }]} ref={submissionInputRef}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Submission</Text>
                </View>
                <View style={styles.dropdownContainer}>
                  <View style={styles.submissionInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Search for specific submissions..."
                      placeholderTextColor="#9ca3af"
                      value={localFilters.submission}
                      onChangeText={handleSubmissionInputChange}
                      onFocus={() => {
                        if (localFilters.submission.trim() && filteredSubmissions.length > 0) {
                          setShowSubmissionDropdown(true);
                        }
                        // Scroll to show the input and dropdown
                        setTimeout(() => {
                          if (submissionInputRef.current && scrollViewRef.current) {
                            submissionInputRef.current.measureInWindow((x, y, width, height) => {
                              // Calculate position relative to modal
                              const modalTop = screenHeight * 0.1;
                              const relativeY = y - modalTop;
                              // Scroll to position the input field in view with some padding
                              scrollViewRef.current?.scrollTo({ 
                                y: relativeY - 100, 
                                animated: true 
                              });
                            });
                          }
                        }, 100);
                      }}
                    />
                    {localFilters.submission.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearSubmissionButton}
                        onPress={() => {
                          setLocalFilters(prev => ({ ...prev, submission: '' }));
                          setShowSubmissionDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <X size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {showSubmissionDropdown && filteredSubmissions.length > 0 && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="always">
                        {filteredSubmissions.map((submission, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleSubmissionSelect(submission)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.dropdownItemText}>{submission}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Session Type */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Target size={20} color="#5271ff" />
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

              {/* Satisfaction */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Minimum Satisfaction</Text>
                </View>
                <StarRating
                  mode="filter"
                  rating={localFilters.satisfaction || 0}
                  alignment="left"
                  onRatingPress={(rating: number) => {
                    setLocalFilters(prev => ({
                      ...prev,
                      satisfaction: prev.satisfaction === rating ? null : rating
                    }));
                  }}
                  size={28}
                />
                {localFilters.satisfaction && (
                  <Text style={styles.satisfactionLabel}>
                    {localFilters.satisfaction}+ stars
                  </Text>
                )}
              </View>
              
              {/* Invisible spacer to ensure full scrollability */}
              <View style={styles.scrollSpacer} />
                </ScrollView>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <RotateCcw size={16} color="#6b7280" />
                <Text style={styles.clearButtonText}>Clear</Text>
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
          <KeyboardDismissButton isInsideModal isFilterModal />
        </Animated.View>
      </View>
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
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateSeparator: {
    fontSize: 14,
    color: '#6b7280',
  },
  submissionInputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  clearSubmissionButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
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
    paddingBottom: 120,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: '#5271ff',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#9ca3af',
    flex: 1,
  },
  dropdownButtonTextSelected: {
    color: '#1f2937',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  scrollSpacer: {
    height: 200,
  },
});