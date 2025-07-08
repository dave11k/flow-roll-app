import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { CheckCircle, AlertCircle, X } from 'lucide-react-native';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Toast({
  message,
  type,
  visible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => onClose(), 0);
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          icon: <CheckCircle size={20} color="#fff" />,
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          icon: <AlertCircle size={20} color="#fff" />,
        };
      default:
        return {
          backgroundColor: '#6b7280',
          icon: <AlertCircle size={20} color="#fff" />,
        };
    }
  };

  const config = getToastConfig();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        {config.icon}
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          activeOpacity={0.7}
        >
          <X size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    left: 20,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});