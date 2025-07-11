import React, { useEffect, useRef } from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, FileText } from 'lucide-react-native';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';

interface NotesModalProps {
  visible: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  triggerPosition?: { x: number; y: number; width: number; height: number };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function NotesModal({
  visible,
  notes,
  onNotesChange,
  onClose,
  triggerPosition,
}: NotesModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Calculate initial position based on trigger position
      const initialX = triggerPosition ? triggerPosition.x + triggerPosition.width / 2 - screenWidth / 2 : 0;
      const initialY = triggerPosition ? triggerPosition.y + triggerPosition.height / 2 - screenHeight / 2 : 0;

      // Set initial values
      scaleAnim.setValue(0.1);
      opacityAnim.setValue(0);
      translateXAnim.setValue(initialX);
      translateYAnim.setValue(initialY);
      backgroundOpacityAnim.setValue(0);

      // Animate in
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
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
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
  }, [visible, triggerPosition]);

  const handleClose = () => {
    onClose();
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
              ]
              }
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: translateXAnim },
                { translateY: translateYAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <FileText size={24} color="#1e40af" />
                <Text style={styles.headerTitle}>Notes</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Add notes about the technique, key details, or what you learned..."
                placeholderTextColor="#9ca3af"
                value={notes}
                onChangeText={onNotesChange}
                multiline
                autoFocus
                textAlignVertical="top"
                maxLength={2000}
              />
              <View style={styles.characterCountContainer}>
                <Text style={styles.characterCount}>
                  {notes.length}/2000
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        <KeyboardDismissButton isInsideModal />
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
    maxHeight: screenHeight * 0.56,
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
  inputContainer: {
    padding: 20,
    height: 250,
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    textAlignVertical: 'top',
    height: 180,
    paddingVertical: 8,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#5271ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});