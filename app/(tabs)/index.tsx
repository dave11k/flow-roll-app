import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { Search, X, Plus, BookOpen, Filter, User } from 'lucide-react-native';
import { Technique, TechniqueCategory } from '@/types/technique';
import TechniqueFilterModal from '@/components/TechniqueFilterModal';
import TechniqueItem from '@/components/TechniqueItem';
import EditTechniqueModal from '@/components/EditTechniqueModal';
import AddTechniqueModal from '@/components/AddTechniqueModal';
import TechniqueDetailModal from '@/components/TechniqueDetailModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import SwipeableCard from '@/components/SwipeableCard';
import ProfileModal from '@/components/ProfileModal';
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
    isLoading, 
    updateTechnique, 
    removeTechnique, 
    refreshTechniques,
    error,
    clearError
  } = useData();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTechniques();
    setIsRefreshing(false);
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
          style={styles.techniqueCard}
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
        <Image 
          source={require('@/assets/images/FlowRoll.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>Techniques</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfileModal(true)}
          activeOpacity={0.7}
        >
          <User size={20} color="#000000" />
        </TouchableOpacity>
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
              <Filter size={20} color="#5271ff" />
              <Text style={styles.filterButtonText}>Filter</Text>
              {hasActiveFilters() && <View style={styles.filterIndicator} />}
            </TouchableOpacity>
          </View>
          {/* Active Filters Row */}
          {hasActiveFilters() && (
            <View style={styles.activeFiltersRow}>
              {filters.category && (
                <TouchableOpacity
                  style={[styles.activeFilterPill, { backgroundColor: CATEGORY_COLORS[filters.category] }]}
                  onPress={() => setFilters(prev => ({ ...prev, category: null }))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activeFilterText}>{filters.category}</Text>
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              )}
              {(() => {
                const maxTagsToShow = 5;
                const visibleTags = filters.tags.slice(0, maxTagsToShow);
                const hiddenTagsCount = filters.tags.length - maxTagsToShow;
                
                return (
                  <>
                    {visibleTags.map((tag, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.activeTagPill}
                        onPress={() => setFilters(prev => ({ 
                          ...prev, 
                          tags: prev.tags.filter(t => t !== tag) 
                        }))}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.activeTagText}>{tag}</Text>
                        <X size={12} color="#fff" />
                      </TouchableOpacity>
                    ))}
                    {hiddenTagsCount > 0 && (
                      <View style={styles.morePill}>
                        <Text style={styles.moreText}>+{hiddenTagsCount}</Text>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Techniques List */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={isRefreshing || isLoading} onRefresh={handleRefresh} />
            }
            keyboardShouldPersistTaps="handled"
          >
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
          <View style={styles.techniquesList}>
            <View style={styles.techniquesHeader}>
              <Text style={styles.techniquesTitle}>
                {hasActiveFilters() 
                  ? `Filtered Techniques (${filteredTechniques.length})`
                  : `Techniques (${techniques.length})`
                }
              </Text>
            </View>
            {filteredTechniques.map((item) => (
              <View key={item.id}>
                {renderTechniqueItem({ item })}
              </View>
            ))}
          </View>
        )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

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

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        profile={null}
        onSave={() => {}}
        onClose={() => setShowProfileModal(false)}
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
    paddingTop: 6,
    paddingBottom: 9,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 48,
  },
  logo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
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
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  activeTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#5271ff',
    gap: 4,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  morePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5271ff',
  },
  filterIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
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
  content: {
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
  techniquesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  techniquesHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  techniquesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  techniqueItemContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  techniqueCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});