import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Plus, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Technique, TechniqueCategory, TechniquePosition } from '@/types/technique';
import { saveTechnique } from '@/services/storage';
import TechniquePill from '@/components/TechniquePill';
import NotesModal from '@/components/NotesModal';

interface AddTechniqueModalProps {
  visible: boolean;
  onSave: () => void;
  onClose: () => void;
}

const CATEGORIES: TechniqueCategory[] = [
  'Submission',
  'Sweep',
  'Escape',
  'Guard Pass',
  'Takedown',
  'Defense',
  'Other',
];

const POSITIONS: TechniquePosition[] = [
  'Mount',
  'Guard',
  'Side Control',
  'Back',
  'Half Guard',
  'Standing',
  'Other',
];

const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#22c55e',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

const POSITION_COLOR = '#1e3a2e';

// Sample technique suggestions
const TECHNIQUE_SUGGESTIONS = [
  'Armbar from Guard',
  'Triangle Choke',
  'Rear Naked Choke',
  'Scissor Sweep',
  'Hip Escape',
  'Knee Slice Pass',
  'Double Leg Takedown',
  'Kimura',
  'Omoplata',
  'Butterfly Sweep',
  'Berimbolo',
  'Ezekiel Choke',
  'Americana',
  'Gogoplata',
  'X-Guard Sweep',
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AddTechniqueModal({
  visible,
  onSave,
  onClose,
}: AddTechniqueModalProps) {
  const [techniqueName, setTechniqueName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<TechniquePosition | null>(null);
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesInputPosition, setNotesInputPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const notesInputRef = useRef<View>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const positionScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // Reset form
      setTechniqueName('');
      setSelectedCategory(null);
      setSelectedPosition(null);
      setNotes('');
      setShowSuggestions(false);
      setShowSuccess(false);
    }
  }, [visible]);

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

  // Filter suggestions based on input
  useEffect(() => {
    if (techniqueName.length > 0) {
      const filtered = TECHNIQUE_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(techniqueName.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [techniqueName]);

  const handleAddTechnique = async () => {
    if (!techniqueName.trim()) {
      Alert.alert('Error', 'Please enter a technique name');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    if (!selectedPosition) {
      Alert.alert('Error', 'Please select a position');
      return;
    }

    setIsLoading(true);

    try {
      const newTechnique: Technique = {
        id: Date.now().toString(),
        name: techniqueName.trim(),
        category: selectedCategory,
        position: selectedPosition,
        notes: notes.trim() || undefined,
        timestamp: new Date(),
      };

      await saveTechnique(newTechnique);
      
      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
        onClose();
      }, 1500);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save technique. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: TechniqueCategory) => {
    setSelectedCategory(category);
  };

  const handlePositionSelect = (position: TechniquePosition) => {
    setSelectedPosition(position);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setIsSelectingSuggestion(true);
    setTechniqueName(suggestion);
    setShowSuggestions(false);
    setTimeout(() => setIsSelectingSuggestion(false), 100);
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

  const handleTechniqueNameBlur = () => {
    if (!isSelectingSuggestion) {
      setShowSuggestions(false);
    }
  };

  const handleTechniqueNameFocus = () => {
    if (techniqueName.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isValid = techniqueName.trim() && selectedCategory && selectedPosition && !isLoading;

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
                <Plus size={24} color="#1e3a2e" />
                <Text style={styles.headerTitle}>Add Technique</Text>
              </View>
              <View style={styles.headerRight}>
                {showSuccess && (
                  <View style={styles.successIndicator}>
                    <CheckCircle size={20} color="#059669" />
                    <Text style={styles.successText}>Saved!</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Technique Name Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Name</Text>
                <TextInput
                  style={styles.techniqueInput}
                  placeholder="Enter technique name..."
                  placeholderTextColor="#c1c5d0"
                  value={techniqueName}
                  onChangeText={setTechniqueName}
                  onFocus={handleTechniqueNameFocus}
                  onBlur={handleTechniqueNameBlur}
                  numberOfLines={1}
                  maxLength={100}
                />

                {/* Auto-suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {suggestions.map((suggestion) => (
                        <TouchableOpacity
                          key={suggestion}
                          style={styles.suggestionPill}
                          onPress={() => handleSuggestionPress(suggestion)}
                        >
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Category and Position Selection */}
              <View style={styles.categoriesSection}>
                {/* Category Selection */}
                <View style={styles.categorySubsection}>
                  <ScrollView 
                    ref={categoryScrollRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {CATEGORIES.map((category) => (
                      <TechniquePill
                        key={category}
                        label={category}
                        isSelected={selectedCategory === category}
                        onPress={() => handleCategorySelect(category)}
                        color={CATEGORY_COLORS[category]}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* Position Selection */}
                <View style={styles.positionSubsection}>
                  <ScrollView 
                    ref={positionScrollRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {POSITIONS.map((position) => (
                      <TechniquePill
                        key={position}
                        label={position}
                        isSelected={selectedPosition === position}
                        onPress={() => handlePositionSelect(position)}
                        color={POSITION_COLOR}
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Notes Section */}
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
                      {notes || "Add notes about the technique, key details, or what you learned..."}
                    </Text>
                  </View>
                  <Text style={styles.characterCount}>
                    {notes.length}/2000
                  </Text>
                </TouchableOpacity>
              </View>
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
                onPress={handleAddTechnique}
                disabled={!isValid}
                activeOpacity={0.8}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            <NotesModal
              visible={showNotesModal}
              notes={notes}
              onNotesChange={setNotes}
              onClose={handleNotesModalClose}
              triggerPosition={notesInputPosition}
            />
          </View>
        </Animated.View>
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
    width: screenWidth - 40,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
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
    paddingBottom: 16,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 4,
  },
  categorySubsection: {
    marginBottom: 16,
  },
  positionSubsection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  techniqueInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 56,
    color: '#1f2937',
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionPill: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScrollContent: {
    paddingRight: 20,
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
    minHeight: 120,
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
    backgroundColor: '#1e3a2e',
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
});