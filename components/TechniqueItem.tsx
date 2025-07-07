import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Technique } from '@/types/technique';

interface TechniqueItemProps {
  technique: Technique;
  categoryColor: string;
}

export default function TechniqueItem({ 
  technique, 
  categoryColor 
}: TechniqueItemProps) {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{technique.name}</Text>
        <Text style={styles.timestamp}>
          {technique.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: categoryColor }]}>
          <Text style={styles.tagText}>{technique.category}</Text>
        </View>
        <View style={[styles.tag, styles.positionTag]}>
          <Text style={[styles.tagText, { color: '#333' }]}>
            {technique.position}
          </Text>
        </View>
      </View>
      {technique.notes && (
        <View style={styles.notesContainer}>
          <Text 
            style={styles.notesText}
            numberOfLines={3}
          >
            {technique.notes}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positionTag: {
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});