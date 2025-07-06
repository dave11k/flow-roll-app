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
} from 'react-native';
import { Search, Pencil, Trash2, Filter, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Technique, TechniqueCategory, TechniquePosition } from '@/types/technique';
import { getTechniques, deleteTechnique, saveTechnique } from '@/services/storage';
import TechniquePill from '@/components/TechniquePill';
import TechniqueItem from '@/components/TechniqueItem';
import EditTechniqueModal from '../../components/EditTechniqueModal';

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
  'Guard',
  'Side Control',
  'Back',
  'Half Guard',
  'Standing',
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

const POSITION_COLOR = '#4b5563';

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<TechniquePosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  useEffect(() => {
    filterTechniques();
  }, [techniques, searchQuery, selectedCategory, selectedPosition]);

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

  const filterTechniques = () => {
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
  };

  const handleCategorySelect = (category: TechniqueCategory | null) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    // Scroll to beginning to show selected category at front
    setTimeout(() => {
      categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
    }, 100);
  };

  const handlePositionSelect = (position: TechniquePosition | null) => {
    setSelectedPosition(selectedPosition === position ? null : position);
    // Scroll to beginning to show selected position at front
    setTimeout(() => {
      positionScrollRef.current?.scrollTo({ x: 0, animated: true });
    }, 100);
  };
  const handleEditTechnique = (technique: Technique) => {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to update technique. Please try again.');
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
            } catch (error) {
              Alert.alert('Error', 'Failed to delete technique. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedPosition(null);
    // Reset scroll positions
    setTimeout(() => {
      categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
      positionScrollRef.current?.scrollTo({ x: 0, animated: true });
    }, 100);
  };

  const hasActiveFilters = searchQuery.trim() || selectedCategory || selectedPosition;

  const renderTechniqueItem = ({ item }: { item: Technique }) => (
    <View style={styles.techniqueItemContainer}>
      <TechniqueItem
        technique={item}
        categoryColor={CATEGORY_COLORS[item.category]}
      />
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTechnique(item)}
          activeOpacity={0.7}
        >
          <Pencil size={16} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTechnique(item)}
          activeOpacity={0.7}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Techniques</Text>
        <Text style={styles.techniqueCount}>
          {filteredTechniques.length === techniques.length 
            ? `${filteredTechniques.length} total`
            : `${filteredTechniques.length} of ${techniques.length}`
          }
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search techniques..."
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
        
        {/* Filters */}
        <View style={styles.filterRow}>
          <ScrollView 
            ref={categoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {[
              ...(selectedCategory ? [selectedCategory] : []),
              ...CATEGORIES.filter(cat => cat !== selectedCategory)
            ].map((category) => (
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
          >
            {[
              ...(selectedPosition ? [selectedPosition] : []),
              ...POSITIONS.filter(pos => pos !== selectedPosition)
            ].map((position) => (
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

      {/* Techniques List */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading techniques...</Text>
          </View>
        ) : filteredTechniques.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {techniques.length === 0 ? 'No Techniques Yet' : 'No Matching Techniques'}
            </Text>
            <Text style={styles.emptyDescription}>
              {techniques.length === 0 
                ? 'Start adding techniques to build your BJJ library'
                : 'Try adjusting your search or filters'
              }
            </Text>
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
  techniqueCount: {
    fontSize: 16,
    color: '#a7c3b3',
    fontWeight: '600',
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
    gap: 22,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterRow: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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
  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
});