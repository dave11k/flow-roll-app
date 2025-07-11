import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { TechniqueCategory } from '@/types/technique';
import { CATEGORY_COLORS as BASE_CATEGORY_COLORS } from '@/constants/colors';

interface CategoryDropdownProps {
  selectedCategory: TechniqueCategory | null;
  onCategorySelect: (category: TechniqueCategory) => void;
  onClearCategory?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showAllOption?: boolean;
}

const CATEGORIES: TechniqueCategory[] = [
  'Submission',
  'Sweep',
  'Escape',
  'Guard Pass',
  'Takedown',
  'Defense',
  'Other',
];

const CATEGORY_COLORS: Record<TechniqueCategory | 'All', string> = {
  ...BASE_CATEGORY_COLORS,
  'All': '#9ca3af',
};

const { width: screenWidth } = Dimensions.get('window');

export default function CategoryDropdown({
  selectedCategory,
  onCategorySelect,
  onClearCategory,
  placeholder = 'All categories',
  disabled = false,
  showAllOption = true,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    scaleAnim.setValue(0.95);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const handleCategoryPress = (category: TechniqueCategory) => {
    onCategorySelect(category);
    handleClose();
  };

  const handleAllPress = () => {
    if (onClearCategory) {
      onClearCategory();
    }
    handleClose();
  };

  const renderCategoryItem = (category: TechniqueCategory) => {
    const isSelected = selectedCategory === category;
    const color = CATEGORY_COLORS[category];

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.dropdownItem,
          isSelected && styles.dropdownItemSelected,
        ]}
        onPress={() => handleCategoryPress(category)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryItemContent}>
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Text style={[
            styles.dropdownItemText,
            isSelected && styles.dropdownItemTextSelected,
          ]}>
            {category}
          </Text>
        </View>
        {isSelected && (
          <Check size={20} color="#5271ff" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.trigger,
          disabled && styles.triggerDisabled,
          selectedCategory && styles.triggerSelected,
        ]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          <View style={styles.selectedCategoryContent}>
            <View
              style={[
                styles.selectedColorIndicator,
                { backgroundColor: selectedCategory ? CATEGORY_COLORS[selectedCategory] : CATEGORY_COLORS['All'] },
              ]}
            />
            <Text style={styles.selectedText}>
              {selectedCategory || 'All'}
            </Text>
          </View>
          <ChevronDown
            size={16}
            color={disabled ? '#9ca3af' : '#6b7280'}
            style={[
              styles.chevron,
              isOpen && styles.chevronRotated,
            ]}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.dropdown,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Select Category</Text>
              </View>
              <ScrollView
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
              >
                {/* All Categories Option */}
                {showAllOption && (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      !selectedCategory && styles.dropdownItemSelected,
                    ]}
                    onPress={handleAllPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryItemContent}>
                      <View style={[styles.colorIndicator, { backgroundColor: CATEGORY_COLORS['All'] }]} />
                      <Text style={[
                        styles.dropdownItemText,
                        !selectedCategory && styles.dropdownItemTextSelected,
                      ]}>
                        All
                      </Text>
                    </View>
                    {!selectedCategory && (
                      <Check size={20} color="#5271ff" />
                    )}
                  </TouchableOpacity>
                )}
                
                {CATEGORIES.map(renderCategoryItem)}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  triggerDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  triggerSelected: {
    borderColor: '#5271ff',
    backgroundColor: '#f0f2ff',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedColorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    width: screenWidth - 80,
    maxHeight: 400,
  },
  dropdownHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#5271ff',
    fontWeight: '600',
  },
});