import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';

interface SubmissionPillProps {
  label: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  color?: string;
}

export default function SubmissionPill({ 
  label, 
  count, 
  onIncrement, 
  onDecrement, 
  color = '#ef4444' 
}: SubmissionPillProps) {
  const handleIncrement = () => {
    Keyboard.dismiss();
    onIncrement();
  };

  const handleDecrement = () => {
    Keyboard.dismiss();
    onDecrement();
  };

  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={handleDecrement}
        disabled={count <= 1}
        activeOpacity={0.7}
      >
        <Minus size={16} color={count <= 1 ? '#9ca3af' : '#fff'} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{count}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.counterButton}
        onPress={handleIncrement}
        disabled={count >= 100}
        activeOpacity={0.7}
      >
        <Plus size={16} color={count >= 100 ? '#9ca3af' : '#fff'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 24,
    marginBottom: 8,
    flex: 1,
  },
  counterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
});