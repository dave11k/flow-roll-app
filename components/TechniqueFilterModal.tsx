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
  TextInput,
} from 'react-native';
import { useModalAnimation } from '@/hooks/useModalAnimation';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { X, RotateCcw, ChevronDown, Search } from 'lucide-react-native';
import { TechniqueCategory } from '@/types/technique';
import { getAllTagsFromDb } from '@/services/database';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import { useFilterModal } from '@/contexts/FilterModalContext';
import { CATEGORY_COLORS } from '@/constants/colors';

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

export default function TechniqueFilterModal({
  visible,
  filters,
  onApplyFilters,
  onClose,
}: TechniqueFilterModalProps) {
  const { setIsFilterModalOpen } = useFilterModal();
  const [localFilters, setLocalFilters] = useState<TechniqueFilters>(filters);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const lastGestureY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const tagSectionRef = useRef<View>(null);

  const modalAnimation = useModalAnimation(visible, { type: 'slide' });
  const { 
    slideAnim, 
    backgroundOpacityAnim, 
    dragY, 
    isVisible, 
    animateOut,
    resetDrag 
  } = modalAnimation as any; // Type assertion for slide animation

  useEffect(() => {
    if (visible) {
      setIsFilterModalOpen(true);
      resetDrag();
      setLocalFilters(filters);
      loadTags();
    } else if (!visible && isVisible) {
      setIsFilterModalOpen(false);
    }
  }, [visible, filters, resetDrag, setIsFilterModalOpen, isVisible]);

  const loadTags = async () => {
    try {
      const tags = await getAllTagsFromDb();
      // Filter to only show tags that are actually used in techniques
      const usedTags = tags.filter(tag => tag.usageCount > 0);
      const tagNames = usedTags.map(tag => tag.name);
      setAvailableTags(tagNames);
      setFilteredTags(tagNames);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAvailableTags([]);
      setFilteredTags([]);
    }
  };

  const animateClose = () => {
    animateOut(() => {
      resetDrag();
      onClose();
    });
  };

  const animateCloseWithCallback = (callback?: () => void) => {
    animateOut(() => {
      resetDrag();
      onClose();
      callback?.();
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


  const handleTagToggle = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    setLocalFilters({ ...localFilters, tags: newTags });
  };

  const handleResetFilters = () => {
    const resetFilters: TechniqueFilters = {
      category: null,
      tags: [],
    };
    setLocalFilters(resetFilters);
    setTagSearchQuery('');
    setFilteredTags(availableTags);
  };

  const handleTagSearch = (query: string) => {
    setTagSearchQuery(query);
    if (query.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(availableTags);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={animateClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backgroundOpacityAnim,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Modal Container */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { translateY: slideAnim },
                { translateY: dragY }
              ],
              zIndex: 2,
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
                    <Text style={styles.headerTitle}>Filter by Tags</Text>
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
                <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {/* Tags Filter */}
                    <View ref={tagSectionRef} style={styles.section}>
                      {availableTags.length >= 20 && (
                        <View style={styles.tagSearchContainer}>
                          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
                          <TextInput
                            style={styles.tagSearchInput}
                            placeholder="Search tags..."
                            placeholderTextColor="#9ca3af"
                            value={tagSearchQuery}
                            onChangeText={handleTagSearch}
                            onFocus={() => {
                              // Scroll to position the tag section with extra space below
                              setTimeout(() => {
                                if (tagSectionRef.current && scrollViewRef.current) {
                                  tagSectionRef.current.measureInWindow((x, y, width, height) => {
                                    const modalTop = screenHeight * 0.1;
                                    const relativeY = y - modalTop;
                                    scrollViewRef.current?.scrollTo({ 
                                      y: relativeY - 100, 
                                      animated: true 
                                    });
                                  });
                                }
                              }, 100);
                            }}
                          />
                          {tagSearchQuery.length > 0 && (
                            <TouchableOpacity
                              style={styles.clearSearchButton}
                              onPress={() => {
                                setTagSearchQuery('');
                                setFilteredTags(availableTags);
                              }}
                              activeOpacity={0.7}
                            >
                              <X size={16} color="#6b7280" />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      <View style={styles.tagsContainer}>
                        {filteredTags.length > 0 ? (
                          <>
                            {filteredTags.slice(0, 200).map((tag) => (
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
                            ))}
                            {filteredTags.length > 200 && (
                              <View style={styles.tagChip}>
                                <Text style={styles.tagText}>+{filteredTags.length - 200}</Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <Text style={styles.noTagsText}>
                            {tagSearchQuery ? 'No matching tags' : 'No tags available'}
                          </Text>
                        )}
                      </View>
                  </View>
                
                  {/* Invisible spacer to ensure full scrollability */}
                  <View style={styles.scrollSpacer} />
                </ScrollView>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleResetFilters}
                activeOpacity={0.7}
              >
                <RotateCcw size={16} color="#6b7280" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  // Apply filters after modal close animation completes
                  animateCloseWithCallback(() => {
                    onApplyFilters(localFilters);
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>Apply Tags</Text>
              </TouchableOpacity>
            </View>
          </View>
          <KeyboardDismissButton isInsideModal isFilterModal />
        </Animated.View>
      </View>
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
    zIndex: 1000,
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
    marginTop: 16,
    marginBottom: 8,
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
    backgroundColor: '#5271ff',
    borderColor: '#5271ff',
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTagText: {
    color: '#fff',
  },
  noTagsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 120,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    height: 260,
  },
  tagSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 22,
  },
  searchIcon: {
    marginRight: 8,
  },
  tagSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
  },
  clearSearchButton: {
    padding: 4,
  },
});