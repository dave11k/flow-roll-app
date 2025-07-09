import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Search, X, Plus, BookOpen, Filter } from 'lucide-react-native';
import { Technique, TechniqueCategory } from '@/types/technique';
import TechniqueFilterModal from '@/components/TechniqueFilterModal';
import TechniqueItem from '@/components/TechniqueItem';
import EditTechniqueModal from '@/components/EditTechniqueModal';
import AddTechniqueModal from '@/components/AddTechniqueModal';
import TechniqueDetailModal from '@/components/TechniqueDetailModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import SwipeableCard from '@/components/SwipeableCard';
import { useToast } from '@/contexts/ToastContext';
import { useData } from '@/contexts/DataContext';

const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#5271ff',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

export default function TechniquesPage() {
  const { showSuccess, showError } = useToast();
  const { 
    techniques, 
    isInitialLoading, 
    updateTechnique, 
    removeTechnique, 
    refreshTechniques,
    error,
    clearError
  } = useData();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: null as TechniqueCategory | null,
    tags: [] as string[]
  });
  const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Handle errors from data context
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  // Track when we've loaded data at least once
  useEffect(() => {
    if (techniques.length > 0 || (!isInitialLoading && techniques.length === 0)) {
      setHasLoadedOnce(true);
    }
  }, [techniques.length, isInitialLoading]);

  const filterTechniques = React.useCallback(() => {
    let filtered = [...techniques];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(technique =>
        technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (technique.notes && technique.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        technique.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(technique => technique.category === filters.category);
    }

    // Filter by tags (all selected tags must be present)
    if (filters.tags.length > 0) {
      filtered = filtered.filter(technique =>
        filters.tags.every(selectedTag =>
          technique.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredTechniques(filtered);
  }, [techniques, searchQuery, filters]);

  useEffect(() => {
    filterTechniques();
  }, [filterTechniques]);



  const handleApplyFilters = (newFilters: { category: TechniqueCategory | null; tags: string[] }) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return filters.category !== null || filters.tags.length > 0;
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
      await updateTechnique(updatedTechnique);
      setShowEditModal(false);
      setEditingTechnique(null);
      showSuccess(`"${updatedTechnique.name}" updated successfully!`);
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
              await removeTechnique(technique.id);
              showSuccess(`"${technique.name}" deleted successfully!`);
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
    setFilters({ category: null, tags: [] });
  };


  const hasActiveFiltersForClear = searchQuery.trim() || filters.category || filters.tags.length > 0;

  const renderTechniqueItem = ({ item }: { item: Technique }) => (
    <View style={styles.techniqueItemContainer}>
      <SwipeableCard
        onSwipeLeft={() => handleEditTechnique(item)}
        onSwipeRight={() => handleDeleteTechnique(item)}
      >
        <TouchableOpacity
          onPress={() => handleShowTechniqueDetail(item)}
          activeOpacity={1}
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

      {/* Search and Filter Row */}
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
      }}>
        <View style={styles.searchSection}>
          <View style={styles.searchAndFilterRow}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
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
            
            <TouchableOpacity
              style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
              onPress={() => {
                Keyboard.dismiss();
                setShowFilterModal(true);
              }}
              activeOpacity={0.7}
            >
              <Filter size={20} color="#000000" />
              <Text style={styles.filterButtonText}>Filter</Text>
              {hasActiveFilters() && <View style={styles.filterIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Techniques List */}
      <View style={styles.listContainer}>
        {(isInitialLoading && !hasLoadedOnce) ? (
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
            {hasActiveFiltersForClear && (
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
        onSave={refreshTechniques}
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

      {/* Filter Modal */}
      <TechniqueFilterModal
        visible={showFilterModal}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClose={() => setShowFilterModal(false)}
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
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
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
    paddingBottom: 16,
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    minHeight: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  clearSearchButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    minHeight: 36,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
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
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
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