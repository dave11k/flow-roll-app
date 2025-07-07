import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SubmissionDisplayPillProps {
  label: string;
  count: number;
  color?: string;
}

export default function SubmissionDisplayPill({ 
  label, 
  count, 
  color = '#ef4444' 
}: SubmissionDisplayPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      {count > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.count}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  count: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});