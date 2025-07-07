import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Search, Pencil, Trash2, Filter, X, Plus, BookOpen } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Technique, TechniqueCategory, TechniquePosition } from '@/types/technique';
import { getTechniques, deleteTechnique, saveTechnique } from '@/services/storage';
import { searchTechniqueSuggestions } from '@/data/techniqueSuggestions';
import TechniquePill from '@/components/TechniquePill';
import TechniqueItem from '@/components/TechniqueItem';
import EditTechniqueModal from '@/components/EditTechniqueModal';
import AddTechniqueModal from '@/components/AddTechniqueModal';
import TechniqueDetailModal from '@/components/TechniqueDetailModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import SwipeableCard from '@/components/SwipeableCard';
import { useToast } from '@/contexts/ToastContext';

const CATEGORIES: TechniqueCategory[] = [
  'Submission',
  'Sweep',
  'Escape',
  'Guard Pass',
  'Takedown',
  'Defense',
  'Other',
];

const POSITIONS: TechniquePosition[] = [
  'Mount',
  'Full Guard',
  'Side Control',
  'Back',
  'Half Guard',
  'Standing',
  'Open Guard',
  'Butterfly Guard',
  'De La Riva Guard',
  'X-Guard',
  'Spider Guard',
  'Lasso Guard',
  'Reverse De La Riva Guard',
  'Deep Half Guard',
  'North South',
  'Knee on Belly',
  'Turtle',
  '50/50 Guard',
  'Leg Entanglement',
  'Crucifix',
  'Kesa Gatame',
  'S-Mount',
  'Other',
];

const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#22c55e',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

const POSITION_COLOR = '#1e3a2e';

export default function TechniquesPage() {
  const { showSuccess, showError } = useToast();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<TechniquePosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const justSelectedSuggestion = useRef(false);
  const categoryScrollRef = useRef<ScrollView>(null);
  const positionScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadTechniques();
  }, []);

  // Refresh techniques when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTechniques();
    }, [])
  );

  const filterTechniques = React.useCallback(() => {
    let filtered = [...techniques];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(technique =>
        technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (technique.notes && technique.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(technique => technique.category === selectedCategory);
    }

    // Filter by position
    if (selectedPosition) {
      filtered = filtered.filter(technique => technique.position === selectedPosition);
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredTechniques(filtered);
  }, [techniques, searchQuery, selectedCategory, selectedPosition]);

  useEffect(() => {
    filterTechniques();
  }, [filterTechniques]);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = searchTechniqueSuggestions(searchQuery, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const loadTechniques = async () => {
    try {
      setIsLoading(true);
      const techniquesData = await getTechniques();
      setTechniques(techniquesData);
    } catch (error) {
      console.error('Error loading techniques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: TechniqueCategory | null) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handlePositionSelect = (position: TechniquePosition | null) => {
    setSelectedPosition(selectedPosition === position ? null : position);
  };

  const handleShowTechniqueDetail = (technique: Technique) => {
    Keyboard.dismiss();
    setSelectedTechnique(technique);
    setShowDetailModal(true);
  };

  const handleEditTechnique = (technique: Technique) => {
    Keyboard.dismiss();
    setEditingTechnique(technique);
    setShowEditModal(true);
  };

  const handleSaveTechnique = async (updatedTechnique: Technique) => {
    try {
      // Use the saveTechnique function which now handles updates
      await saveTechnique(updatedTechnique);
      
      // Reload techniques
      await loadTechniques();
      setShowEditModal(false);
      setEditingTechnique(null);
      showSuccess('Technique updated successfully!');
    } catch {
      showError('Failed to update technique. Please try again.');
    }
  };

  const handleDeleteTechnique = (technique: Technique) => {
    Alert.alert(
      'Delete Technique',
      `Are you sure you want to delete "${technique.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTechnique(technique.id);
              await loadTechniques();
              showError('Technique deleted successfully!');
            } catch {
              showError('Failed to delete technique. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedPosition(null);
  };

  const handleSuggestionPress = (suggestion: string) => {
    justSelectedSuggestion.current = true;
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
    // Reset the flag after a short delay
    setTimeout(() => {
      justSelectedSuggestion.current = false;
    }, 100);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    if (!justSelectedSuggestion.current) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    }
  };

  const hasActiveFilters = searchQuery.trim() || selectedCategory || selectedPosition;

  const renderTechniqueItem = ({ item }: { item: Technique }) => (
    <View style={styles.techniqueItemContainer}>
      <SwipeableCard
        onSwipeLeft={() => handleEditTechnique(item)}
        onSwipeRight={() => handleDeleteTechnique(item)}
      >
        <TouchableOpacity
          onPress={() => handleShowTechniqueDetail(item)}
          activeOpacity={0.7}
        >
          <TechniqueItem
            technique={item}
            categoryColor={CATEGORY_COLORS[item.category]}
            noMargin={true}
          />
        </TouchableOpacity>
      </SwipeableCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Techniques ({techniques.length})</Text>
      </View>

      {/* Search Bar */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search techniques..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
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

        {/* Auto-suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always">
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={`${suggestion}-${index}`}
                  style={styles.suggestionPill}
                  onPress={() => handleSuggestionPress(suggestion)}
                  delayPressIn={0}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Filters */}
        <View style={[styles.filterRow, styles.firstFilterRow]}>
          <ScrollView 
            ref={categoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {CATEGORIES.map((category) => (
              <TechniquePill
                key={category}
                label={category}
                isSelected={selectedCategory === category}
                onPress={() => handleCategorySelect(category)}
                color={CATEGORY_COLORS[category]}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView 
            ref={positionScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {POSITIONS.map((position) => (
              <TechniquePill
                key={position}
                label={position}
                isSelected={selectedPosition === position}
                onPress={() => handlePositionSelect(position)}
                color={POSITION_COLOR}
              />
            ))}
          </ScrollView>
        </View>

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
            activeOpacity={0.7}
          >
            <Filter size={16} color="#6b7280" />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
        </View>
      </TouchableWithoutFeedback>

      {/* Techniques List */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading techniques...</Text>
          </View>
        ) : filteredTechniques.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {techniques.length === 0 ? 'No Techniques Yet' : 'No Matching Techniques'}
            </Text>
            <Text style={styles.emptyDescription}>
              {techniques.length === 0 
                ? 'Start adding techniques to build your BJJ library'
                : 'Try adjusting your search or filters'
              }
            </Text>
            {techniques.length === 0 && (
              <TouchableOpacity
                style={styles.createTechniqueButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.7}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createTechniqueText}>Add Technique</Text>
              </TouchableOpacity>
            )}
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButtonLarge}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTechniques}
            renderItem={renderTechniqueItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Add Technique Modal */}
      <AddTechniqueModal
        visible={showAddModal}
        onSave={loadTechniques}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Modal */}
      {editingTechnique && (
        <EditTechniqueModal
          visible={showEditModal}
          technique={editingTechnique}
          onSave={handleSaveTechnique}
          onClose={() => {
            setShowEditModal(false);
            setEditingTechnique(null);
          }}
        />
      )}

      {/* Detail Modal */}
      <TechniqueDetailModal
        visible={showDetailModal}
        technique={selectedTechnique}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTechnique(null);
        }}
        onEdit={handleEditTechnique}
        onDelete={handleDeleteTechnique}
      />

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => {
          Keyboard.dismiss();
          setShowAddModal(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#1e3a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a3d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 8,
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
  filterRow: {
    marginBottom: 8,
  },
  firstFilterRow: {
    marginTop: 16,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  createTechniqueButton: {
    backgroundColor: '#1e3a2e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  createTechniqueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFiltersButtonLarge: {
    backgroundColor: '#1e3a2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  techniqueItemContainer: {
    position: 'relative',
    marginBottom: 12,
  },
});