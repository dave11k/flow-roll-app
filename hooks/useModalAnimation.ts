import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export type ModalAnimationType = 'slide' | 'scale' | 'complex';

interface ModalAnimationConfig {
  type: ModalAnimationType;
  duration?: number;
  tension?: number;
  friction?: number;
  // For complex animations
  initialPosition?: { x: number; y: number };
}

interface BaseModalAnimationReturn {
  opacityAnim: Animated.Value;
  backgroundOpacityAnim: Animated.Value;
  isVisible: boolean;
  animateIn: () => void;
  animateOut: (onComplete?: () => void) => void;
  resetDrag: () => void;
}

interface SlideModalAnimationReturn extends BaseModalAnimationReturn {
  slideAnim: Animated.Value;
  dragY: Animated.Value;
}

interface ScaleModalAnimationReturn extends BaseModalAnimationReturn {
  scaleAnim: Animated.Value;
}

interface ComplexModalAnimationReturn extends BaseModalAnimationReturn {
  scaleAnim: Animated.Value;
  translateXAnim: Animated.Value;
  translateYAnim: Animated.Value;
}

type ModalAnimationReturn = SlideModalAnimationReturn | ScaleModalAnimationReturn | ComplexModalAnimationReturn;

export function useModalAnimation(
  visible: boolean,
  config: ModalAnimationConfig
): ModalAnimationReturn {
  const { type, duration = 300, tension = 100, friction = 8, initialPosition } = config;
  
  // Common animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  
  // Type-specific animations
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.1)).current;
  const translateXAnim = useRef(new Animated.Value(initialPosition?.x || 0)).current;
  const translateYAnim = useRef(new Animated.Value(initialPosition?.y || 0)).current;

  const animateIn = useCallback(() => {
    setIsVisible(true);
    
    // Reset values
    if (type === 'slide') {
      dragY.setValue(0);
    } else if (type === 'scale') {
      scaleAnim.setValue(0.1);
      opacityAnim.setValue(0);
      backgroundOpacityAnim.setValue(0);
    } else if (type === 'complex') {
      scaleAnim.setValue(0.1);
      opacityAnim.setValue(0);
      translateXAnim.setValue(initialPosition?.x || 0);
      translateYAnim.setValue(initialPosition?.y || 0);
      backgroundOpacityAnim.setValue(0);
    }

    // Create animations based on type
    let animations: Animated.CompositeAnimation[] = [];
    
    if (type === 'slide') {
      animations = [
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];
    } else if (type === 'scale') {
      animations = [
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];
    } else if (type === 'complex') {
      animations = [
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];
    }
    
    Animated.parallel(animations).start();
  }, [type, duration, tension, friction, initialPosition]);

  const animateOut = useCallback((onComplete?: () => void) => {
    let animations: Animated.CompositeAnimation[] = [];
    
    if (type === 'slide') {
      animations = [
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ];
    } else if (type === 'scale') {
      animations = [
        Animated.spring(scaleAnim, {
          toValue: 0.1,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ];
    } else if (type === 'complex') {
      animations = [
        Animated.spring(scaleAnim, {
          toValue: 0.1,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: initialPosition?.x || 0,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.spring(translateYAnim, {
          toValue: initialPosition?.y || 0,
          useNativeDriver: true,
          tension,
          friction,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ];
    }
    
    Animated.parallel(animations).start(() => {
      setIsVisible(false);
      onComplete?.();
    });
  }, [type, duration, tension, friction, initialPosition]);

  const resetDrag = useCallback(() => {
    if (type === 'slide') {
      dragY.setValue(0);
    }
  }, [type]);

  useEffect(() => {
    if (visible) {
      animateIn();
    } else if (isVisible) {
      animateOut();
    }
  }, [visible, isVisible, animateIn, animateOut]);

  // Return appropriate animations based on type
  if (type === 'slide') {
    return {
      opacityAnim,
      backgroundOpacityAnim,
      isVisible,
      animateIn,
      animateOut,
      resetDrag,
      slideAnim,
      dragY,
    };
  } else if (type === 'scale') {
    return {
      opacityAnim,
      backgroundOpacityAnim,
      isVisible,
      animateIn,
      animateOut,
      resetDrag,
      scaleAnim,
    };
  } else if (type === 'complex') {
    return {
      opacityAnim,
      backgroundOpacityAnim,
      isVisible,
      animateIn,
      animateOut,
      resetDrag,
      scaleAnim,
      translateXAnim,
      translateYAnim,
    };
  }

  // Default return (should not happen)
  return {
    opacityAnim,
    backgroundOpacityAnim,
    isVisible,
    animateIn,
    animateOut,
    resetDrag,
    slideAnim,
    dragY,
  } as SlideModalAnimationReturn;
}