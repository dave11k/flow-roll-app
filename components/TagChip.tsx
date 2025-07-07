import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface TagChipProps {
  tag: string;
  variant?: 'default' | 'selected' | 'removable';
  size?: 'small' | 'medium';
  onPress?: () => void;
  onRemove?: () => void;
}

export default function TagChip({
  tag,
  variant = 'default',
  size = 'medium',
  onPress,
  onRemove,
}: TagChipProps) {
  // Debug logging
  if (variant === 'removable') {
    console.log('TagChip rendering with tag:', tag, 'variant:', variant);
  }
  
  const isRemovable = variant === 'removable' && onRemove;
  const isInteractive = onPress || isRemovable;

  const chipStyles = [
    styles.chip,
    size === 'small' && styles.chipSmall,
    variant === 'selected' && styles.chipSelected,
    variant === 'removable' && styles.chipRemovable,
  ];

  const textStyles = [
    styles.text,
    size === 'small' && styles.textSmall,
    variant === 'selected' && styles.textSelected,
    variant === 'removable' && styles.textRemovable,
  ];

  const ChipComponent = isInteractive ? TouchableOpacity : View;

  // Additional debug check
  if (!tag || tag.trim() === '') {
    console.warn('TagChip received empty tag:', tag);
    return null; // Don't render empty tags
  }

  return (
    <ChipComponent
      style={chipStyles}
      onPress={onPress}
      activeOpacity={isInteractive ? 0.7 : 1}
    >
      <Text style={textStyles} numberOfLines={1}>
        {tag}
      </Text>
      {isRemovable && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeButton}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <X size={size === 'small' ? 12 : 14} color="#fff" />
        </TouchableOpacity>
      )}
    </ChipComponent>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start', // Size to content
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start', // Size to content
  },
  chipSelected: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#1e3a2e',
  },
  chipRemovable: {
    backgroundColor: '#1e3a2e',
  },
  text: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 0, // Allow text to shrink
  },
  textSmall: {
    fontSize: 12,
  },
  textSelected: {
    color: '#1e3a2e',
    fontWeight: '600',
  },
  textRemovable: {
    color: '#fff',
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 2,
  },
});