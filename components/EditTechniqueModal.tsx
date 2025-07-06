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
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Pencil, FileText } from 'lucide-react-native';
import { Technique, TechniqueCategory, TechniquePosition } from '@/types/technique';
import TechniquePill from '@/components/TechniquePill';
import NotesModal from '@/components/NotesModal';

interface EditTechniqueModalProps {
  visible: boolean;
  technique: Technique;
  onSave: (technique: Technique) => void;
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
  'Full Guard',
  'Side Control',
  'Back',
  'Half Guard',
  'Standing',
  'Open Guard',
  'Butterfly Guard',
  'De La Riva Guard',
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EditTechniqueModal({
  visible,
  technique,
  onSave,
  onClose,
}: EditTechniqueModalProps) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<TechniquePosition | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const notesInputRef = useRef<View>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const categoryScrollRef = useRef<ScrollView>(null);
  const positionScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && technique) {
      setName(technique.name);
      setSelectedCategory(technique.category);
      setSelectedPosition(technique.position);
      setNotes(technique.notes || '');
    }
  }, [visible, technique]);

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

  const handleCategorySelect = (category: TechniqueCategory) => {
    setSelectedCategory(category);
  };

  const handlePositionSelect = (position: TechniquePosition) => {
    setSelectedPosition(position);
  };
  const handleSave = () => {
    if (!name.trim() || !selectedCategory || !selectedPosition) {
      return;
    }

    const updatedTechnique: Technique = {
      ...technique,
      name: name.trim(),
      category: selectedCategory,
      position: selectedPosition,
      notes: notes.trim() || undefined,
    };

    onSave(updatedTechnique);
  };

  const handleClose = () => {
    onClose();
  };

  const isValid = name.trim() && selectedCategory && selectedPosition;

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
                <Pencil size={24} color="#1e3a2e" />
                <Text style={styles.headerTitle}>Edit Technique</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
              {/* Name Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Name</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter technique name..."
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  maxLength={100}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.section}>
                <ScrollView 
                  ref={categoryScrollRef}
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                  keyboardShouldPersistTaps="handled"
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
              <View style={styles.section}>
                <ScrollView 
                  ref={positionScrollRef}
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                  keyboardShouldPersistTaps="handled"
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

              {/* Notes Input */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TouchableOpacity
                  ref={notesInputRef}
                  style={styles.notesInput}
                  onPress={() => setShowNotesModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notesInputContent}>
                    <FileText size={20} color="#9ca3af" style={styles.notesIcon} />
                    <Text style={[
                      styles.notesText,
                      !notes && styles.notesPlaceholder
                    ]}>
                      {notes || "Add notes about the technique..."}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.characterCount}>
                  {notes.length}/2000
                </Text>
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
        </Animated.View>
      </KeyboardAvoidingView>

      <NotesModal
        visible={showNotesModal}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setShowNotesModal(false)}
      />
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
    maxHeight: screenHeight * 0.95,
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
    maxHeight: screenHeight * 0.95,
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
    maxHeight: screenHeight * 0.65,
  },
  section: {
    padding: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  pillsContainer: {
    paddingRight: 20,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  notesInputContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  notesPlaceholder: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
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