import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, MapPin, Plus, Trash2, Star, Zap, Pencil } from 'lucide-react-native';
import { TrainingSession, SessionType } from '@/types/session';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import TechniquePill from '@/components/TechniquePill';
import SubmissionPill from '@/components/SubmissionPill';
import AddTechniqueModal from '@/components/AddTechniqueModal';
import NotesModal from '@/components/NotesModal';
import { searchSubmissionSuggestions, isValidSubmission } from '@/data/submissionSuggestions';

interface EditSessionModalProps {
  visible: boolean;
  session: TrainingSession;
  onSave: (session: TrainingSession) => void;
  onClose: () => void;
}

const SESSION_TYPES: { type: SessionType; label: string; color: string }[] = [
  { type: 'gi', label: 'Gi', color: '#1e40af' },
  { type: 'nogi', label: 'No-Gi', color: '#dc2626' },
  { type: 'open-mat', label: 'Open Mat', color: '#059669' },
  { type: 'wrestling', label: 'Wrestling', color: '#7c3aed' },
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EditSessionModal({
  visible,
  session,
  onSave,
  onClose,
}: EditSessionModalProps) {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);
  const [submissions, setSubmissions] = useState<string[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [newSubmission, setNewSubmission] = useState('');
  const [submissionSuggestions, setSubmissionSuggestions] = useState<string[]>([]);
  const [showSubmissionDropdown, setShowSubmissionDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [satisfaction, setSatisfaction] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showAddTechniqueModal, setShowAddTechniqueModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesInputPosition, setNotesInputPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | undefined>(undefined);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const typeScrollRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<View>(null);

  useEffect(() => {
    if (visible && session) {
      // Populate form with session data
      setDate(session.date);
      setLocation(session.location || '');
      setSelectedType(session.type);
      setSubmissions(session.submissions);
      setSubmissionCounts(session.submissionCounts || {});
      setNewSubmission('');
      setNotes(session.notes || '');
      setSatisfaction(session.satisfaction);
      setShowAddTechniqueModal(false);
      setShowNotesModal(false);
    }
  }, [visible, session]);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.1);
      opacityAnim.setValue(0);
      backgroundOpacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleTypeSelect = (type: SessionType) => {
    setSelectedType(type);
  };

  const handleAddSubmission = () => {
    const submission = newSubmission.trim();
    if (submission && isValidSubmission(submission) && !submissions.includes(submission)) {
      setSubmissions([...submissions, submission]);
      setSubmissionCounts(prev => ({ ...prev, [submission]: 1 }));
      setNewSubmission('');
      setShowSubmissionDropdown(false);
    }
  };

  const handleSubmissionInputChange = (text: string) => {
    setNewSubmission(text);
    
    if (text.trim()) {
      const suggestions = searchSubmissionSuggestions(text, 6);
      setSubmissionSuggestions(suggestions);
      setShowSubmissionDropdown(suggestions.length > 0);
    } else {
      setShowSubmissionDropdown(false);
    }
  };

  const handleSubmissionSelect = (submission: string) => {
    setNewSubmission(submission);
    setShowSubmissionDropdown(false);
    // Auto-add the submission when selected
    if (!submissions.includes(submission)) {
      setSubmissions([...submissions, submission]);
      setSubmissionCounts(prev => ({ ...prev, [submission]: 1 }));
      setNewSubmission('');
    }
    Keyboard.dismiss();
  };

  const handleRemoveSubmission = (submission: string) => {
    setSubmissions(submissions.filter(s => s !== submission));
    setSubmissionCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[submission];
      return newCounts;
    });
  };

  const handleIncrementSubmission = (submission: string) => {
    setSubmissionCounts(prev => ({
      ...prev,
      [submission]: Math.min((prev[submission] || 1) + 1, 100)
    }));
  };

  const handleDecrementSubmission = (submission: string) => {
    setSubmissionCounts(prev => ({
      ...prev,
      [submission]: Math.max((prev[submission] || 1) - 1, 1)
    }));
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    
    // Prevent setting dates in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (newDate <= today) {
      setDate(newDate);
    }
  };

  const handleSave = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a session type');
      return;
    }

    const updatedSession: TrainingSession = {
      ...session,
      date,
      location: location.trim() || undefined,
      type: selectedType,
      submissions,
      submissionCounts,
      notes: notes.trim() || undefined,
      satisfaction,
    };

    onSave(updatedSession);
  };

  const handleAddTechniqueModalSave = () => {
    // Technique was saved, just close the modal
    setShowAddTechniqueModal(false);
  };

  const handleNotesPress = () => {
    if (notesInputRef.current) {
      notesInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setNotesInputPosition({ x: pageX, y: pageY, width, height });
        setShowNotesModal(true);
      });
    }
  };

  const handleNotesModalClose = () => {
    setShowNotesModal(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleClearLocation = () => {
    setLocation('');
  };

  const isValid = selectedType;

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const isForwardDisabled = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate > today;
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => setSatisfaction((i + 1) as 1 | 2 | 3 | 4 | 5)}
        style={styles.starButton}
        activeOpacity={0.7}
      >
        <Star
          size={32}
          color={i < satisfaction ? '#f59e0b' : '#e5e7eb'}
          fill={i < satisfaction ? '#f59e0b' : 'transparent'}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop}>
            <Animated.View
              style={[
                styles.blurContainer,
                {
                  opacity: backgroundOpacityAnim,
                },
              ]}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Pencil size={24} color="#5271ff" />
                <Text style={styles.headerTitle}>Edit Session</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
              {/* Date Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Date</Text>
                <View style={styles.dateContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDateChange(-1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dateButtonText}>←</Text>
                  </TouchableOpacity>
                  <View style={styles.dateDisplay}>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                    <Text style={styles.dateSubtext}>
                      {date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      isForwardDisabled() && styles.dateButtonDisabled
                    ]}
                    onPress={() => handleDateChange(1)}
                    disabled={isForwardDisabled()}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dateButtonText,
                      isForwardDisabled() && styles.dateButtonTextDisabled
                    ]}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.locationContainer}>
                  <MapPin size={20} color="#9ca3af" />
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Gym name or location..."
                    placeholderTextColor="#9ca3af"
                    value={location}
                    onChangeText={setLocation}
                    maxLength={100}
                  />
                  {location.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearLocation}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Session Type */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Type</Text>
                <ScrollView 
                  ref={typeScrollRef}
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {SESSION_TYPES.map((sessionType) => (
                    <TechniquePill
                      key={sessionType.type}
                      label={sessionType.label}
                      isSelected={selectedType === sessionType.type}
                      onPress={() => handleTypeSelect(sessionType.type)}
                      color={sessionType.color}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Submissions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Submissions</Text>
                <View style={styles.submissionDropdownContainer}>
                  <TextInput
                    style={styles.submissionInput}
                    placeholder="Search submissions..."
                    placeholderTextColor="#9ca3af"
                    value={newSubmission}
                    onChangeText={handleSubmissionInputChange}
                    onFocus={() => {
                      if (newSubmission.trim()) {
                        const suggestions = searchSubmissionSuggestions(newSubmission, 6);
                        setSubmissionSuggestions(suggestions);
                        setShowSubmissionDropdown(suggestions.length > 0);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowSubmissionDropdown(false);
                      }, 150);
                    }}
                    returnKeyType="done"
                    maxLength={50}
                  />
                  
                  {/* Submission Suggestions Dropdown */}
                  {showSubmissionDropdown && submissionSuggestions.length > 0 && (
                    <View style={styles.submissionDropdown}>
                      <ScrollView style={styles.submissionDropdownScroll} nestedScrollEnabled keyboardShouldPersistTaps="always">
                        {submissionSuggestions.map((suggestion, index) => (
                          <TouchableOpacity
                            key={`${suggestion}-${index}`}
                            style={styles.submissionDropdownItem}
                            onPress={() => handleSubmissionSelect(suggestion)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.submissionDropdownItemText}>{suggestion}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                
                {submissions.length > 0 && (
                  <View style={styles.submissionsList}>
                    {submissions.map((submission) => (
                      <View key={submission} style={styles.submissionPillContainer}>
                        <SubmissionPill
                          label={submission}
                          count={submissionCounts[submission] || 1}
                          onIncrement={() => handleIncrementSubmission(submission)}
                          onDecrement={() => handleDecrementSubmission(submission)}
                          color="#ef4444"
                        />
                        <TouchableOpacity
                          style={styles.removeSubmissionButton}
                          onPress={() => handleRemoveSubmission(submission)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Add Technique Button */}
              <View style={styles.addTechniqueSection}>
                <TouchableOpacity
                  style={styles.addTechniqueButton}
                  onPress={() => setShowAddTechniqueModal(true)}
                  activeOpacity={0.7}
                >
                  <Zap size={20} color="#5271ff" />
                  <Text style={styles.addTechniqueButtonText}>Add Technique</Text>
                </TouchableOpacity>
              </View>

              {/* Satisfaction Rating */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Satisfaction</Text>
                <View style={styles.starsContainer}>
                  {renderStars()}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TouchableOpacity
                  ref={notesInputRef}
                  style={styles.notesContainer}
                  onPress={handleNotesPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.notesInput}>
                    <Text style={[
                      styles.notesText,
                      !notes && styles.notesPlaceholder
                    ]}>
                      {notes || "How did the session go? What did you work on?"}
                    </Text>
                  </View>
                  <Text style={styles.characterCount}>
                    {notes.length}/1000
                  </Text>
                </TouchableOpacity>
              </View>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isValid && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!isValid}
                activeOpacity={0.8}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Technique Modal */}
          <AddTechniqueModal
            visible={showAddTechniqueModal}
            onSave={handleAddTechniqueModalSave}
            onClose={() => setShowAddTechniqueModal(false)}
          />

          {/* Notes Modal */}
          <NotesModal
            visible={showNotesModal}
            notes={notes}
            onNotesChange={setNotes}
            onClose={handleNotesModalClose}
            triggerPosition={notesInputPosition}
          />
        </Animated.View>
        <KeyboardDismissButton />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: screenWidth - 20,
    maxHeight: screenHeight * 0.9,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: screenHeight * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    maxHeight: screenHeight * 0.6,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5271ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  dateButtonTextDisabled: {
    color: '#d1d5db',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  dateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  typeScrollContent: {
    paddingRight: 20,
  },
  submissionDropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  submissionInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
  },
  submissionsList: {
    gap: 8,
  },
  submissionPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  removeSubmissionButton: {
    padding: 4,
  },
  submissionDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  submissionDropdownScroll: {
    maxHeight: 200,
  },
  submissionDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  submissionDropdownItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  notesContainer: {
    position: 'relative',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    justifyContent: 'flex-start',
  },
  notesText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  notesPlaceholder: {
    color: '#c1c5d0',
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#5271ff',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addTechniqueSection: {
    padding: 20,
    paddingBottom: 16,
  },
  addTechniqueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#5271ff',
    borderStyle: 'dashed',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addTechniqueButtonText: {
    color: '#5271ff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
  },
});