import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableOpacityProps,
  View,
} from 'react-native';

interface CrossPlatformTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  rippleColor?: string;
  borderless?: boolean;
}

export default function CrossPlatformTouchable({
  children,
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  borderless = false,
  style,
  ...props
}: CrossPlatformTouchableProps) {
  if (Platform.OS === 'android' && Platform.Version >= 21) {
    return (
      <TouchableNativeFeedback
        {...props}
        background={TouchableNativeFeedback.Ripple(rippleColor, borderless)}
      >
        <View style={style}>
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity style={style} {...props}>
      {children}
    </TouchableOpacity>
  );
}