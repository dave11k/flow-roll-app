import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '@/styles/common';
import { CATEGORY_COLORS } from '@/constants/colors';
import { TechniqueCategory } from '@/types/technique';
import { INPUT_LIMITS, validateSearch } from '@/utils/inputValidation';

interface SearchFilterBarProps {
  // Search props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  
  // Filter props
  hasActiveFilters: boolean;
  onFilterPress: () => void;
  
  // Active filters display (optional)
  activeFilters?: {
    category?: TechniqueCategory | null;
    tags?: string[];
    onClearCategory?: () => void;
    onClearTag?: (tag: string) => void;
    onClearAll?: () => void;
  };
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search",
  hasActiveFilters,
  onFilterPress,
  activeFilters,
}: SearchFilterBarProps) {
  
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const renderActiveFilters = () => {
    if (!activeFilters || !hasActiveFilters) return null;
    
    const { category, tags = [], onClearCategory, onClearTag, onClearAll } = activeFilters;
    const maxTagsToShow = 5;
    const visibleTags = tags.slice(0, maxTagsToShow);
    const hiddenTagsCount = tags.length - maxTagsToShow;
    
    return (
      <View style={styles.activeFiltersRow}>
        {category && onClearCategory && (
          <TouchableOpacity
            style={[styles.activeFilterPill, { backgroundColor: CATEGORY_COLORS[category] }]}
            onPress={onClearCategory}
            activeOpacity={0.7}
          >
            <Text style={styles.activeFilterText}>{category}</Text>
            <X size={12} color="#fff" />
          </TouchableOpacity>
        )}
        
        {visibleTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.activeFilterPill, styles.activeTagPill]}
            onPress={() => onClearTag?.(tag)}
            activeOpacity={0.7}
          >
            <Text style={styles.activeTagText}>{tag}</Text>
            <X size={12} color="#fff" />
          </TouchableOpacity>
        ))}
        
        {hiddenTagsCount > 0 && (
          <View style={[styles.activeFilterPill, styles.hiddenTagsPill]}>
            <Text style={styles.hiddenTagsText}>+{hiddenTagsCount}</Text>
          </View>
        )}
        
        {onClearAll && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={onClearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.searchSection}>
        <View style={styles.searchAndFilterRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={(text) => {
                const { sanitized } = validateSearch(text);
                onSearchChange(sanitized);
              }}
              returnKeyType="search"
              maxLength={INPUT_LIMITS.SEARCH}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearSearchButton}
              >
                <X size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.filterButton, 
              hasActiveFilters && styles.filterButtonActive
            ]}
            onPress={() => {
              Keyboard.dismiss();
              onFilterPress();
            }}
            activeOpacity={0.7}
          >
            <Filter size={20} color={Colors.primary} />
            <Text style={styles.filterButtonText}>Filter</Text>
            {hasActiveFilters && <View style={styles.filterIndicator} />}
          </TouchableOpacity>
        </View>
        
        {renderActiveFilters()}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    padding: 0,
  },
  
  clearSearchButton: {
    padding: Spacing.xs,
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    position: 'relative',
  },
  
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  
  filterIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  
  activeTagPill: {
    backgroundColor: Colors.gray600,
  },
  
  hiddenTagsPill: {
    backgroundColor: Colors.gray400,
  },
  
  activeFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  
  activeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  
  hiddenTagsText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  
  clearAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  
  clearAllText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});