import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { X, RotateCcw, ChevronDown } from 'lucide-react-native';
import { TechniqueCategory } from '@/types/technique';
import { getAllTagsFromDb } from '@/services/database';

interface TechniqueFilters {
  category: TechniqueCategory | null;
  tags: string[];
}

interface TechniqueFilterModalProps {
  visible: boolean;
  filters: TechniqueFilters;
  onApplyFilters: (filters: TechniqueFilters) => void;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

const CATEGORIES: TechniqueCategory[] = [
  'Submission',
  'Sweep',
  'Escape',
  'Guard Pass',
  'Takedown',
  'Defense',
  'Other',
];

const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#5271ff',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

export default function TechniqueFilterModal({
  visible,
  filters,
  onApplyFilters,
  onClose,
}: TechniqueFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<TechniqueFilters>(filters);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      dragY.setValue(0);
      setLocalFilters(filters);
      loadTags();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, isVisible, slideAnim, opacityAnim, dragY, filters]);

  const loadTags = async () => {
    try {
      const tags = await getAllTagsFromDb();
      // Filter to only show tags that are actually used in techniques
      const usedTags = tags.filter(tag => tag.usageCount > 0);
      setAvailableTags(usedTags.map(tag => tag.name));
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAvailableTags([]);
    }
  };

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragY.setValue(0);
      onClose();
    });
  };

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      lastGestureY.current = translationY;

      // If dragged down significantly or with high velocity, animate close
      if (translationY > 100 || velocityY > 1000) {
        animateClose();
      } else {
        // Otherwise, snap back to original position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };


  const handleCategorySelect = (category: TechniqueCategory | null) => {
    const newFilters = { ...localFilters, category };
    setLocalFilters(newFilters);
    setShowCategoryDropdown(false);
    onApplyFilters(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    const newFilters = { ...localFilters, tags: newTags };
    setLocalFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: TechniqueFilters = {
      category: null,
      tags: [],
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    animateClose();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={animateClose}>
        <View style={styles.backdrop}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: opacityAnim,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: dragY }
            ],
          },
        ]}
      >
        <View style={styles.modal}>
          <PanGestureHandler
            onGestureEvent={handlePanGesture}
            onHandlerStateChange={handlePanStateChange}
          >
            <Animated.View>
              <View style={styles.header}>
                <View style={styles.dragHandle} />
                <View style={styles.headerContent}>
                  <Text style={styles.headerTitle}>Filter Techniques</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={animateClose}
                    activeOpacity={0.7}
                  >
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>

          <View style={styles.contentWrapper}>
            <TouchableWithoutFeedback onPress={() => {
              setShowCategoryDropdown(false);
            }}>
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category Filter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      <View style={styles.dropdownContent}>
                        {localFilters.category ? (
                          <View style={styles.selectedCategory}>
                            <View style={[
                              styles.categoryDot,
                              { backgroundColor: CATEGORY_COLORS[localFilters.category] }
                            ]} />
                            <Text style={styles.selectedText}>{localFilters.category}</Text>
                          </View>
                        ) : (
                          <Text style={styles.placeholderText}>All Categories</Text>
                        )}
                      </View>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>

                    {showCategoryDropdown && (
                      <View style={styles.dropdownList}>
                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                          <TouchableOpacity
                            style={[styles.dropdownItem, !localFilters.category && styles.activeItem]}
                            onPress={() => handleCategorySelect(null)}
                          >
                            <Text style={styles.dropdownItemText}>All Categories</Text>
                          </TouchableOpacity>
                          {CATEGORIES.map((category) => (
                            <TouchableOpacity
                              key={category}
                              style={[styles.dropdownItem, localFilters.category === category && styles.activeItem]}
                              onPress={() => handleCategorySelect(category)}
                            >
                              <View style={styles.categoryOption}>
                                <View style={[
                                  styles.categoryDot,
                                  { backgroundColor: CATEGORY_COLORS[category] }
                                ]} />
                                <Text style={styles.dropdownItemText}>{category}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Tags Filter - Always visible */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <View style={styles.tagsContainer}>
                      {availableTags.length > 0 ? (
                        availableTags.map((tag) => (
                          <TouchableOpacity
                            key={tag}
                            style={[
                              styles.tagChip,
                              localFilters.tags.includes(tag) && styles.activeTag
                            ]}
                            onPress={() => handleTagToggle(tag)}
                          >
                            <Text style={[
                              styles.tagText,
                              localFilters.tags.includes(tag) && styles.activeTagText
                            ]}>
                              {tag}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.noTagsText}>No tags available</Text>
                      )}
                    </View>
                </View>
              
                {/* Invisible spacer to ensure full scrollability */}
                <View style={styles.scrollSpacer} />
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleResetFilters}
              activeOpacity={0.7}
            >
              <RotateCcw size={16} color="#6b7280" />
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApplyFilters(localFilters);
                animateClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.9,
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  dropdownContent: {
    flex: 1,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dropdownList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activeItem: {
    backgroundColor: '#f0f9ff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTag: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTagText: {
    color: '#2563eb',
  },
  noTagsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    backgroundColor: '#fff',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  clearButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#5271ff',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollSpacer: {
    height: 100,
  },
});