import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function KeyboardDismissButton() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        });
      }
    );

    return () => {
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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: keyboardHeight + 10,
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 9999,
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