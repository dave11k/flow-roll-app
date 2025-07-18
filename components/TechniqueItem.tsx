import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Technique } from '@/types/technique';
import TagChip from '@/components/TagChip';

interface TechniqueItemProps {
  technique: Technique;
  categoryColor: string;
  noMargin?: boolean;
}

export default function TechniqueItem({ 
  technique, 
  categoryColor,
  noMargin = false
}: TechniqueItemProps) {
  const MAX_CHARACTERS = 30;
  
  // Calculate how many tags we can show based on character count
  const calculateVisibleTags = () => {
    if (technique.tags.length === 0) return [];
    
    let totalChars = technique.category.length;
    const visibleTags = [];
    
    for (const tag of technique.tags) {
      const tagLength = tag.length;
      // Add some padding for spaces and formatting
      if (totalChars + tagLength + 2 <= MAX_CHARACTERS) {
        visibleTags.push(tag);
        totalChars += tagLength + 2;
      } else {
        break;
      }
    }
    
    // If we exceed the limit and have multiple tags, show just one tag + indicator
    if (totalChars > MAX_CHARACTERS && technique.tags.length > 1) {
      return [technique.tags[0]];
    }
    
    return visibleTags;
  };
  
  const visibleTags = calculateVisibleTags();
  const hiddenTagsCount = technique.tags.length - visibleTags.length;

  return (
    <View style={[styles.container, noMargin && styles.noMargin]}>
      <View style={styles.header}>
        <Text style={styles.name}>{technique.name}</Text>
        <Text style={styles.timestamp}>
          {technique.timestamp.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric' 
          })} {technique.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.tagsSection}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{technique.category}</Text>
          </View>
          
          {/* Tags */}
          {technique.tags.length > 0 && (
            <>
              {visibleTags.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  size="small"
                  variant="default"
                />
              ))}
              {hiddenTagsCount > 0 && (
                <View style={styles.moreTagsIndicator}>
                  <Text style={styles.moreTagsText}>+{hiddenTagsCount}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    minHeight: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  tagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  moreTagsIndicator: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  moreTagsText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  noMargin: {
    marginBottom: 0,
  },
});