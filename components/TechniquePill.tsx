import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';

interface TechniquePillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}

export default function TechniquePill({ 
  label, 
  isSelected, 
  onPress, 
  color 
}: TechniquePillProps) {
  const handlePress = () => {
    Keyboard.dismiss();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        { backgroundColor: isSelected ? color : '#f5f5f5' }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.pillText,
        { color: isSelected ? '#fff' : '#333' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 70,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});