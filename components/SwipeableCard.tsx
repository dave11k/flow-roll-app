import React, { useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { 
  PanGestureHandler, 
  State 
} from 'react-native-gesture-handler';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftThreshold?: number;
  rightThreshold?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  leftThreshold = 100,
  rightThreshold = 100
}: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef<PanGestureHandler>(null);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Determine if swipe should trigger action
      const shouldSwipeLeft = translationX > leftThreshold || velocityX > 800;
      const shouldSwipeRight = translationX < -rightThreshold || velocityX < -800;

      if (shouldSwipeLeft && onSwipeLeft) {
        // Animate out to the left
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft();
          translateX.setValue(0);
        });
      } else if (shouldSwipeRight && onSwipeRight) {
        // Animate out to the right
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight();
          translateX.setValue(0);
        });
      } else {
        // Spring back to original position
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      ref={panRef}
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleStateChange}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});