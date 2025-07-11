import React, { useState, useEffect, useRef, startTransition } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useFilterModal } from '@/contexts/FilterModalContext';

interface KeyboardDismissButtonProps {
  isInsideModal?: boolean;
  isFilterModal?: boolean;
}

function KeyboardDismissButtonCore({ isInsideModal = false, isFilterModal = false, isFilterModalOpen = false }: KeyboardDismissButtonProps & { isFilterModalOpen?: boolean }) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Use startTransition for non-urgent state updates
        startTransition(() => {
          setKeyboardHeight(event.endCoordinates.height);
          setIsKeyboardVisible(true);
        });
        
        // Defer animation start to prevent scheduling during render
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }).start();
          }
        });
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Defer animation start to prevent scheduling during render
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              // Use startTransition for cleanup state updates
              startTransition(() => {
                if (isMountedRef.current) {
                  setIsKeyboardVisible(false);
                  setKeyboardHeight(0);
                }
              });
            });
          }
        });
      }
    );

    return () => {
      isMountedRef.current = false;
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [fadeAnim]);

  const handleDismiss = () => {
    Keyboard.dismiss();
  };

  if (!isKeyboardVisible || keyboardHeight === 0) {
    return null;
  }

  // Hide global button when filter modals are open
  if (!isInsideModal && isFilterModalOpen) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: keyboardHeight + (isInsideModal ? (isFilterModal ? 80 : 30) : -14),
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handleDismiss}
        activeOpacity={0.8}
      >
        <ChevronDown size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function KeyboardDismissButton({ isInsideModal = false, isFilterModal = false }: KeyboardDismissButtonProps) {
  if (isInsideModal) {
    return <KeyboardDismissButtonCore isInsideModal={true} isFilterModal={isFilterModal} isFilterModalOpen={false} />;
  }
  
  const { isFilterModalOpen } = useFilterModal();
  return <KeyboardDismissButtonCore isInsideModal={false} isFilterModal={false} isFilterModalOpen={isFilterModalOpen} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 99999,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});