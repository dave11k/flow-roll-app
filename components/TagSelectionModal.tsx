import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Search, Plus, Tag as TagIcon } from 'lucide-react-native';
import { PREDEFINED_TAGS, TAG_VALIDATION } from '@/types/technique';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import TagService from '@/services/tagService';

interface TagSelectionModalProps {
  visible: boolean;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClose: () => void;
}

interface TagSection {
  title: string;
  data: readonly string[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TagSelectionModal({
  visible,
  selectedTags,
  onTagsChange,
  onClose,
}: TagSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<TagSection[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;

  // Create sections for the tag list
  const [allSections, setAllSections] = useState<TagSection[]>([
    {
      title: 'Positions',
      data: PREDEFINED_TAGS.POSITIONS,
    },
    {
      title: 'Attributes',
      data: PREDEFINED_TAGS.ATTRIBUTES,
    },
    {
      title: 'Styles',
      data: PREDEFINED_TAGS.STYLES,
    },
  ]);

  // Load custom tags from database
  const loadCustomTags = async () => {
    setIsLoadingTags(true);
    try {
      const allTags = await TagService.getAllTags();
      const customTagsList = allTags
        .filter(tag => tag.isCustom)
        .map(tag => tag.name);
      
      setCustomTags(customTagsList);
      
      // Update sections with custom tags
      const baseSections: TagSection[] = [
        {
          title: 'Positions',
          data: PREDEFINED_TAGS.POSITIONS,
        },
        {
          title: 'Attributes',
          data: PREDEFINED_TAGS.ATTRIBUTES,
        },
        {
          title: 'Styles',
          data: PREDEFINED_TAGS.STYLES,
        },
      ];
      
      if (customTagsList.length > 0) {
        baseSections.push({
          title: 'Custom Tags',
          data: customTagsList as readonly string[],
        });
      }
      
      setAllSections(baseSections);
    } catch (error) {
      console.error('Error loading custom tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setNewTagName('');
      setShowCreateNew(false);
      loadCustomTags();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.1);
      opacityAnim.setValue(0);
      backgroundOpacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Filter sections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(allSections.filter(section => section.data.length > 0));
      setShowCreateNew(false);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allSections.map(section => ({
        ...section,
        data: section.data.filter(tag => 
          tag.toLowerCase().includes(query)
        ),
      })).filter(section => section.data.length > 0);

      setFilteredSections(filtered);
      
      // Show create new option if search doesn't match any existing tags
      const hasExactMatch = allSections.some(section =>
        section.data.some(tag => tag.toLowerCase() === query)
      );
      setShowCreateNew(!hasExactMatch && isValidNewTag(searchQuery));
      setNewTagName(searchQuery);
    }
  }, [searchQuery, selectedTags, allSections]);

  const isValidNewTag = (tagName: string): boolean => {
    const trimmed = tagName.trim();
    return (
      trimmed.length >= TAG_VALIDATION.MIN_TAG_NAME_LENGTH &&
      trimmed.length <= TAG_VALIDATION.MAX_TAG_NAME_LENGTH &&
      !selectedTags.includes(trimmed)
    );
  };

  const handleTagPress = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      // Remove tag
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else {
      // Add tag (check max limit)
      if (selectedTags.length >= TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE) {
        Alert.alert(
          'Tag Limit Reached',
          `You can only add up to ${TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE} tags per technique.`
        );
        return;
      }
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleCreateNewTag = async () => {
    const trimmed = newTagName.trim();
    if (!isValidNewTag(trimmed)) {
      return;
    }

    if (selectedTags.length >= TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE) {
      Alert.alert(
        'Tag Limit Reached',
        `You can only add up to ${TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE} tags per technique.`
      );
      return;
    }

    // Create the custom tag in the database
    const success = await TagService.createCustomTag(trimmed);
    if (success) {
      onTagsChange([...selectedTags, trimmed]);
      setSearchQuery('');
      setNewTagName('');
      setShowCreateNew(false);
      Keyboard.dismiss();
      
      // Reload custom tags to include the new one
      await loadCustomTags();
    } else {
      Alert.alert('Error', 'Failed to create custom tag. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderTag = (tagName: string) => {
    const isSelected = selectedTags.includes(tagName);
    return (
      <TouchableOpacity
        key={tagName}
        style={[
          styles.tagButton,
          isSelected && styles.tagButtonSelected
        ]}
        onPress={() => handleTagPress(tagName)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.tagButtonText,
          isSelected && styles.tagButtonTextSelected
        ]}>
          {tagName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSection = ({ section }: { section: TagSection }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.tagsContainer}>
        {section.data.map(renderTag)}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop}>
            <Animated.View
              style={[
                styles.blurContainer,
                {
                  opacity: backgroundOpacityAnim,
                },
              ]}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TagIcon size={24} color="#5271ff" />
                <Text style={styles.headerTitle}>Select Tags</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsSection}>
                <Text style={styles.selectedTagsTitle}>
                  Selected ({selectedTags.length}/{TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.selectedTagsContainer}>
                    {selectedTags.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        style={styles.selectedTag}
                        onPress={() => handleTagPress(tag)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.selectedTagText}>{tag}</Text>
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tags..."
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    <X size={16} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Create New Tag Button */}
              {showCreateNew && (
                <TouchableOpacity
                  style={styles.createNewButton}
                  onPress={handleCreateNewTag}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color="#5271ff" />
                  <Text style={styles.createNewText}>Create &quot;{newTagName}&quot;</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tags List */}
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredSections.map((section, index) => (
                <View key={`${section.title}-${index}`}>
                  {renderSection({ section })}
                </View>
              ))}
              
              {filteredSections.length === 0 && searchQuery.trim() && (
                <View style={styles.emptyContainer}>
                  <TagIcon size={48} color="#9ca3af" />
                  <Text style={styles.emptyTitle}>No tags found</Text>
                  <Text style={styles.emptyDescription}>
                    Try a different search term or create a new tag
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        <KeyboardDismissButton />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.85,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: screenHeight * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  selectedTagsSection: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedTagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedTag: {
    backgroundColor: '#5271ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchSection: {
    padding: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearSearchButton: {
    padding: 4,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#5271ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  createNewText: {
    color: '#5271ff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    maxHeight: screenHeight * 0.4,
  },
  section: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagButtonSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#5271ff',
  },
  tagButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  tagButtonTextSelected: {
    color: '#5271ff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  doneButton: {
    backgroundColor: '#5271ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});