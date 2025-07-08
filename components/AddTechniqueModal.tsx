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
import { X, Save, Plus, Link2, Trash2, FileText } from 'lucide-react-native';
import { Technique, TechniqueCategory, TechniqueLink } from '@/types/technique';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import { saveTechnique } from '@/services/storage';
import { searchTechniqueSuggestions, TechniqueSuggestion } from '@/data/techniqueSuggestions';
import CategoryDropdown from '@/components/CategoryDropdown';
import TagSelectionModal from '@/components/TagSelectionModal';
import TagChip from '@/components/TagChip';
import NotesModal from '@/components/NotesModal';
import { useToast } from '@/contexts/ToastContext';

interface AddTechniqueModalProps {
  visible: boolean;
  onSave: () => void;
  onClose: () => void;
}



const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AddTechniqueModal({
  visible,
  onSave,
  onClose,
}: AddTechniqueModalProps) {
  const { showSuccess, showError } = useToast();
  const [techniqueName, setTechniqueName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>('Submission');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<TechniqueLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [suggestions, setSuggestions] = useState<TechniqueSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const justSelectedSuggestion = useRef(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showAddLinkInput, setShowAddLinkInput] = useState(false);
  const [notesInputPosition, setNotesInputPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | undefined>(undefined);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const notesInputRef = useRef<View>(null);
  const linkInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      // Reset form
      setTechniqueName('');
      setSelectedCategory('Submission');
      setSelectedTags([]);
      setNotes('');
      setLinks([]);
      setNewLinkUrl('');
      setShowAddLinkInput(false);
      setShowSuggestions(false);
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

  // Filter suggestions based on input
  useEffect(() => {
    if (techniqueName.length > 0) {
      const filtered = searchTechniqueSuggestions(techniqueName, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [techniqueName]);

  const handleAddTechnique = async () => {
    if (!techniqueName.trim()) {
      Alert.alert('Error', 'Please enter a technique name');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    

    setIsLoading(true);

    try {
      const newTechnique: Technique = {
        id: Date.now().toString(),
        name: techniqueName.trim(),
        category: selectedCategory,
        tags: selectedTags,
        notes: notes.trim() || undefined,
        links: links.length > 0 ? links : undefined,
        timestamp: new Date(),
      };

      await saveTechnique(newTechnique);
      
      // Close immediately like session modal
      onSave();
      onClose();
      showSuccess(`"${newTechnique.name}" added successfully!`);
      
    } catch {
      showError('Failed to save technique. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: TechniqueCategory) => {
    setSelectedCategory(category);
  };

  const handleTagsChange = (tags: string[]) => {
    console.log('AddTechniqueModal - handleTagsChange called with:', tags);
    setSelectedTags(tags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionPress = (suggestion: TechniqueSuggestion) => {
    justSelectedSuggestion.current = true;
    setTechniqueName(suggestion.name);
    setSelectedCategory(suggestion.category);
    setShowSuggestions(false);
    setSuggestions([]); // Clear suggestions array
    Keyboard.dismiss();
    // Reset the flag after a longer delay to ensure blur event completes
    setTimeout(() => {
      justSelectedSuggestion.current = false;
    }, 500);
  };

  const handleNotesPress = () => {
    if (notesInputRef.current) {
      notesInputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setNotesInputPosition({ x: pageX, y: pageY, width, height });
        setShowNotesModal(true);
      });
    }
  };

  const handleNotesModalClose = () => {
    setShowNotesModal(false);
  };

  const handleTechniqueNameBlur = () => {
    if (!justSelectedSuggestion.current) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    }
  };

  const handleTechniqueNameFocus = () => {
    if (techniqueName.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    
    let formattedUrl = newLinkUrl.trim();
    // Add https:// if no protocol is specified
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    const newLink: TechniqueLink = {
      id: Date.now().toString(),
      url: formattedUrl,
      timestamp: new Date()
    };
    
    if (links.length < 10) {
      setLinks([...links, newLink]);
      setNewLinkUrl('');
      setShowAddLinkInput(false);
    }
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  const handleClearName = () => {
    setTechniqueName('');
  };

  const isValid = techniqueName.trim() && selectedCategory && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
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
                <Plus size={24} color="#1e3a2e" />
                <Text style={styles.headerTitle}>Add Technique</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
              {/* Technique Name Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Name</Text>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.techniqueInput}
                    placeholder="Enter technique name..."
                    placeholderTextColor="#c1c5d0"
                    value={techniqueName}
                    onChangeText={setTechniqueName}
                    onFocus={handleTechniqueNameFocus}
                    onBlur={handleTechniqueNameBlur}
                    numberOfLines={1}
                    maxLength={100}
                  />
                  {techniqueName.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={handleClearName}
                      activeOpacity={0.7}
                    >
                      <X size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Auto-suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
                      {suggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={`${suggestion.name}-${index}`}
                          style={styles.suggestionPill}
                          onPress={() => handleSuggestionPress(suggestion)}
                          delayPressIn={0}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.suggestionText}>{suggestion.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Category Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category</Text>
                <CategoryDropdown
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  placeholder="Select category"
                  showAllOption={false}
                />
              </View>

              {/* Tags Selection */}
              <View style={styles.section}>
                <View style={styles.tagsHeader}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={() => setShowTagModal(true)}
                    activeOpacity={0.7}
                  >
                    <Plus size={16} color="#1e3a2e" />
                    <Text style={styles.addTagText}>Add Tags</Text>
                  </TouchableOpacity>
                </View>
                
                {selectedTags.length > 0 ? (
                  <View style={styles.selectedTagsContainer}>
                    {selectedTags.map((tag) => {
                      console.log('Rendering tag chip for:', tag);
                      return (
                        <TagChip
                          key={tag}
                          tag={tag}
                          variant="removable"
                          onRemove={() => handleRemoveTag(tag)}
                        />
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.noTagsContainer}>
                    <Text style={styles.noTagsText}>
                      No tags selected. Tags help categorize and find techniques later.
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <TouchableOpacity
                  ref={notesInputRef}
                  style={styles.notesContainer}
                  onPress={handleNotesPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.notesInput}>
                    <Text style={[
                      styles.notesText,
                      !notes && styles.notesPlaceholder
                    ]}>
                      {notes || "Add notes about the technique, key details, or what you learned..."}
                    </Text>
                  </View>
                  <Text style={styles.characterCount}>
                    {notes.length}/2000
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Links Section */}
              <View style={styles.section}>
                <View style={styles.linksHeader}>
                  <Text style={styles.sectionTitle}>Links & References</Text>
                  {links.length < 10 && (
                    <TouchableOpacity
                      style={styles.addLinkButton}
                      onPress={() => {
                        setShowAddLinkInput(true);
                        setTimeout(() => linkInputRef.current?.focus(), 100);
                      }}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} color="#1e3a2e" />
                      <Text style={styles.addLinkText}>Add Link</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {showAddLinkInput && (
                  <View style={styles.addLinkInputContainer}>
                    <TextInput
                      ref={linkInputRef}
                      style={styles.linkInput}
                      placeholder="Enter YouTube or Reddit link..."
                      placeholderTextColor="#9ca3af"
                      value={newLinkUrl}
                      onChangeText={setNewLinkUrl}
                      onSubmitEditing={handleAddLink}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                    <TouchableOpacity
                      style={styles.addLinkConfirmButton}
                      onPress={handleAddLink}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                {links.length > 0 ? (
                  <View style={styles.linksContainer}>
                    {links.map((link) => (
                      <View key={link.id} style={styles.linkItem}>
                        <Link2 size={16} color="#6b7280" style={styles.linkIcon} />
                        <Text style={styles.linkText} numberOfLines={1}>
                          {link.url}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeLinkButton}
                          onPress={() => handleRemoveLink(link.id)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <Text style={styles.linkCount}>{links.length}/10 links</Text>
                  </View>
                ) : (
                  <View style={styles.noLinksContainer}>
                    <Text style={styles.noLinksText}>
                      No links added. Add YouTube videos or Reddit posts for reference.
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Spacer for keyboard */}
              <View style={styles.keyboardSpacer} />
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  !isValid && styles.saveButtonDisabled
                ]}
                onPress={handleAddTechnique}
                disabled={!isValid}
                activeOpacity={0.8}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>

            <NotesModal
              visible={showNotesModal}
              notes={notes}
              onNotesChange={setNotes}
              onClose={handleNotesModalClose}
              triggerPosition={notesInputPosition}
            />

            <TagSelectionModal
              visible={showTagModal}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              onClose={() => setShowTagModal(false)}
            />
          </View>
        </Animated.View>
        <KeyboardDismissButton />
      </View>
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
    maxHeight: screenHeight * 0.75,
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
    maxHeight: screenHeight * 0.75,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  successIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxHeight: screenHeight * 0.6,
  },
  section: {
    padding: 20,
    paddingBottom: 16,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#1e3a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addTagText: {
    color: '#1e3a2e',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noTagsContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noTagsText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  techniqueInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 56,
    color: '#1f2937',
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionPill: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    position: 'relative',
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    justifyContent: 'flex-start',
  },
  notesText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  notesPlaceholder: {
    color: '#c1c5d0',
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1e3a2e',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nameInputContainer: {
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#1e3a2e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addLinkText: {
    color: '#1e3a2e',
    fontSize: 14,
    fontWeight: '600',
  },
  addLinkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  addLinkConfirmButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1e3a2e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linksContainer: {
    gap: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  linkIcon: {
    flexShrink: 0,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  removeLinkButton: {
    padding: 4,
  },
  linkCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  noLinksContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noLinksText: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  keyboardSpacer: {
    height: 200,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});