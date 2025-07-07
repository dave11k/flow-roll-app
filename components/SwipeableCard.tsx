import React, { useRef } from 'react';
import { StyleSheet, Animated, Dimensions, View, Text } from 'react-native';
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
    { useNativeDriver: false } // Changed to false to allow layout animations
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
          useNativeDriver: false,
        }).start(() => {
          onSwipeLeft();
          translateX.setValue(0);
        });
      } else if (shouldSwipeRight && onSwipeRight) {
        // Animate out to the right
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: false,
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
          useNativeDriver: false,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Foreground Card */}
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <View style={styles.cardWrapper}>
          {/* Background Actions */}
          <View style={styles.backgroundContainer}>
            {/* Edit Background (Blue) */}
            <Animated.View 
              style={[
                styles.editBackground,
                {
                  opacity: translateX.interpolate({
                    inputRange: [0, leftThreshold],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <Text style={styles.actionText}>Edit</Text>
            </Animated.View>
            
            {/* Delete Background (Red) */}
            <Animated.View 
              style={[
                styles.deleteBackground,
                {
                  opacity: translateX.interpolate({
                    inputRange: [-rightThreshold, 0],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                }
              ]}
            >
              <Text style={styles.actionText}>Delete</Text>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.foregroundCard,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardWrapper: {
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 12,
  },
  editBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  foregroundCard: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});