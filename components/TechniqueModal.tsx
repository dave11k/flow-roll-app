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
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Plus, Link2, Trash2, FileText, Pencil } from 'lucide-react-native';
import { Technique, TechniqueCategory, TechniqueLink } from '@/types/technique';
import { useData } from '@/contexts/DataContext';
import { searchTechniqueSuggestions, TechniqueSuggestion } from '@/data/techniqueSuggestions';
import CategoryDropdown from '@/components/CategoryDropdown';
import TagSelectionModal from '@/components/TagSelectionModal';
import TagChip from '@/components/TagChip';
import NotesModal from '@/components/NotesModal';
import { useToast } from '@/contexts/ToastContext';
import KeyboardDismissButton from '@/components/KeyboardDismissButton';
import { INPUT_LIMITS, validateName, validateURL, sanitizeInput } from '@/utils/inputValidation';
import LimitReachedModal from '@/components/LimitReachedModal';
import { usageTracker } from '@/services/usageTracker';

interface TechniqueModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  technique?: Technique;
  onSave: (technique?: Technique) => void;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TechniqueModal({
  visible,
  mode,
  technique,
  onSave,
  onClose,
}: TechniqueModalProps) {
  const { createTechnique, updateTechnique, usage, subscription } = useData();
  const { showSuccess, showError } = useToast();
  const [techniqueName, setTechniqueName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>('Submission');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<TechniqueLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [suggestions, setSuggestions] = useState<TechniqueSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [isNameFieldFocused, setIsNameFieldFocused] = useState(false);
  const [isLinkFieldFocused, setIsLinkFieldFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
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
  const { showToast } = useToast();

  useEffect(() => {
    if (visible) {
      if (mode === 'add') {
        // Reset form for add mode
        setTechniqueName('');
        setSelectedCategory('Submission');
        setSelectedTags([]);
        setNotes('');
        setLinks([]);
        setNewLinkUrl('');
        setShowSuggestions(false);
        setHasUserTyped(false);
      } else if (mode === 'edit' && technique) {
        // Populate form for edit mode
        setTechniqueName(technique.name);
        setSelectedCategory(technique.category);
        setSelectedTags(technique.tags || []);
        setNotes(technique.notes || '');
        setLinks(technique.links || []);
        setNewLinkUrl('');
        setShowSuggestions(false);
        setHasUserTyped(false);
      }
    }
  }, [visible, mode, technique]);

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
    if (techniqueName.length > 0 && hasUserTyped) {
      const filtered = searchTechniqueSuggestions(techniqueName, 8);
      // Hide suggestions if there's an exact match
      const hasExactMatch = filtered.some(
        suggestion => suggestion.name.toLowerCase() === techniqueName.toLowerCase()
      );
      if (hasExactMatch) {
        setShowSuggestions(false);
        setSuggestions([]);
      } else {
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [techniqueName, hasUserTyped]);

  const handleSaveTechnique = async () => {
    const trimmedName = techniqueName.trim().replace(/\s+/g, ' ');
    
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a technique name');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (mode === 'add') {
      // Check if user can add technique before attempting to save
      const canAdd = await usageTracker.canAddTechnique();
      if (!canAdd.allowed) {
        setShowLimitModal(true);
        return;
      }

      setIsLoading(true);
      try {
        const newTechnique: Technique = {
          id: Date.now().toString(),
          name: trimmedName,
          category: selectedCategory,
          tags: selectedTags,
          notes: notes.trim() || undefined,
          links: links.length > 0 ? links : undefined,
          timestamp: new Date(),
        };

        await createTechnique(newTechnique);
        
        // Close immediately like session modal
        onSave();
        onClose();
        showSuccess(`"${newTechnique.name}" added successfully!`);
        
      } catch (error: any) {
        // Check if it's a limit error
        if (error.message && error.message.includes('limit')) {
          setShowLimitModal(true);
        } else {
          showError('Failed to save technique. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'edit' && technique) {
      setIsLoading(true);
      try {
        const updatedTechnique: Technique = {
          ...technique,
          name: trimmedName,
          category: selectedCategory,
          tags: selectedTags,
          notes: notes.trim() || undefined,
          links: links.length > 0 ? links : undefined,
        };

        await updateTechnique(updatedTechnique);
        
        // Close immediately like session modal
        onSave();
        onClose();
        showSuccess(`"${updatedTechnique.name}" updated successfully!`);
        
      } catch {
        showError('Failed to update technique. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCategorySelect = (category: TechniqueCategory) => {
    setSelectedCategory(category);
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestionPress = (suggestion: TechniqueSuggestion) => {
    // Immediately clear suggestions to prevent double-tap issue
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Dismiss keyboard
    Keyboard.dismiss();
    // Set the technique name and category
    setTechniqueName(suggestion.name);
    setSelectedCategory(suggestion.category);
    
    // Fallback to clear suggestions to prevent double-tap issue
    setTimeout(() => {
      setShowSuggestions(false);
      setSuggestions([]);
    }, 50);
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
    // Hide suggestions when field loses focus
    setIsNameFieldFocused(false);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleTechniqueNameFocus = () => {
    setIsNameFieldFocused(true);
    if (techniqueName.length > 0 && hasUserTyped) {
      setShowSuggestions(true);
    }
  };

  const handleClose = () => {
    setShowSuggestions(false);
    onClose();
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    
    const urlValidation = validateURL(newLinkUrl);
    if (!urlValidation.isValid) {
      showToast(urlValidation.error || 'Invalid URL', 'error');
      return;
    }
    
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
    }
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  const handleClearName = () => {
    setTechniqueName('');
  };

  const handleLinkFieldFocus = () => {
    setIsLinkFieldFocused(true);
  };

  const handleLinkFieldBlur = () => {
    setIsLinkFieldFocused(false);
  };

  const handleClearLink = () => {
    setNewLinkUrl('');
  };

  const nameValidation = validateName(techniqueName);
  const isValid = nameValidation.isValid && selectedCategory && (mode === 'add' ? !isLoading : true);

  const getHeaderIcon = () => {
    return mode === 'add' ? <Plus size={24} color="#5271ff" /> : <Pencil size={24} color="#5271ff" />;
  };

  const getHeaderTitle = () => {
    return mode === 'add' ? 'Add Technique' : 'Edit Technique';
  };

  const getButtonText = () => {
    if (mode === 'add') {
      return isLoading ? 'Saving...' : 'Add';
    }
    return 'Save';
  };

  const getTagButtonText = () => {
    return mode === 'add' ? 'Add Tags' : 'Edit Tags';
  };

  const getNotesPlaceholder = () => {
    return mode === 'add' 
      ? "Add notes about the technique, key details, or what you learned..."
      : "Add notes about the technique...";
  };

  const getMaxHeight = () => {
    return mode === 'add' ? screenHeight * 0.6 : screenHeight * 0.65;
  };

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
                {getHeaderIcon()}
                <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
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

            <ScrollView 
              style={[styles.content, { maxHeight: getMaxHeight() }]} 
              showsVerticalScrollIndicator={false} 
              keyboardShouldPersistTaps="handled"
            >
              <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
                setShowSuggestions(false);
              }}>
                <View>
              {/* Technique Name Section */}
              <View style={styles.section}>
                <View style={styles.nameInputContainer}>
                  <TextInput
                    style={styles.techniqueInput}
                    placeholder="Enter technique name..."
                    placeholderTextColor="#c1c5d0"
                    value={techniqueName}
                    onChangeText={(text) => {
                      const sanitized = sanitizeInput(text);
                      setTechniqueName(sanitized);
                      setHasUserTyped(true);
                    }}
                    onFocus={handleTechniqueNameFocus}
                    onBlur={handleTechniqueNameBlur}
                    numberOfLines={1}
                    maxLength={INPUT_LIMITS.TECHNIQUE_NAME}
                  />
                  {techniqueName.length > 0 && isNameFieldFocused && (
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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                <CategoryDropdown
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  placeholder="Select category"
                  showAllOption={false}
                />
              </View>

              {/* Tags Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                
                <View style={styles.tagsContainer}>
                  {selectedTags.map((tag) => (
                    <TagChip
                      key={tag}
                      tag={tag}
                      variant="removable"
                      size="small"
                      onRemove={() => handleRemoveTag(tag)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addTagPill}
                    onPress={() => setShowTagModal(true)}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color="#5271ff" />
                    <Text style={styles.addTagPillText}>Add tag</Text>
                  </TouchableOpacity>
                </View>
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
                  {mode === 'add' ? (
                    <View style={styles.notesInput}>
                      <Text 
                        style={[
                          styles.notesText,
                          !notes && styles.notesPlaceholder
                        ]}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {notes || getNotesPlaceholder()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.notesInput}>
                      <View style={styles.notesInputContent}>
                        <FileText size={20} color="#9ca3af" style={styles.notesIcon} />
                        <Text 
                          style={[
                            styles.notesText,
                            !notes && styles.notesPlaceholder
                          ]}
                          numberOfLines={3}
                          ellipsizeMode="tail"
                        >
                          {notes || getNotesPlaceholder()}
                        </Text>
                      </View>
                    </View>
                  )}
                  <Text style={styles.characterCount}>
                    {notes.length}/2000
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Links Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Links & References</Text>
                
                {links.length < 10 && (
                  <View style={styles.addLinkInputContainer}>
                    <View style={styles.linkInputWrapper}>
                      <TextInput
                        ref={linkInputRef}
                        style={styles.linkInput}
                        placeholder="Enter reference link..."
                        placeholderTextColor="#9ca3af"
                        value={newLinkUrl}
                        onChangeText={(text) => {
                          const sanitized = sanitizeInput(text);
                          setNewLinkUrl(sanitized);
                        }}
                        onSubmitEditing={handleAddLink}
                        onFocus={handleLinkFieldFocus}
                        onBlur={handleLinkFieldBlur}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                        maxLength={INPUT_LIMITS.URL}
                      />
                      {newLinkUrl.length > 0 && isLinkFieldFocused && (
                        <TouchableOpacity
                          style={styles.clearLinkButton}
                          onPress={handleClearLink}
                          activeOpacity={0.7}
                        >
                          <X size={16} color="#9ca3af" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addLinkConfirmButton}
                      onPress={handleAddLink}
                      activeOpacity={0.7}
                    >
                      <Plus size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}

                
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
                onPress={handleSaveTechnique}
                disabled={!isValid}
                activeOpacity={0.8}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {getButtonText()}
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
        <KeyboardDismissButton isInsideModal />
      </View>
      
      <LimitReachedModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type="technique"
        currentCount={usage?.techniqueCount || 0}
        limit={subscription?.limits.maxTechniques || 50}
      />
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
    width: screenWidth - 20,
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
    padding: 14,
    paddingBottom: 4,
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
    borderColor: '#5271ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addTagText: {
    color: '#5271ff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2ff',
    borderWidth: 1,
    borderColor: '#5271ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addTagPillText: {
    color: '#5271ff',
    fontSize: 12,
    fontWeight: '500',
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
    paddingHorizontal: 16,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: 16,
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
    minHeight: 90,
    maxHeight: 120,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  notesInputContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    flex: 1,
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
    backgroundColor: '#5271ff',
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
    right: 8,
    top: 0,
    bottom: 0,
    width: 32,
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
    borderColor: '#5271ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addLinkText: {
    color: '#5271ff',
    fontSize: 14,
    fontWeight: '600',
  },
  addLinkInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  linkInputWrapper: {
    position: 'relative',
    flex: 1,
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  clearLinkButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLinkConfirmButton: {
    width: 40,
    height: 40,
    backgroundColor: '#5271ff',
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
    height: 100,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});