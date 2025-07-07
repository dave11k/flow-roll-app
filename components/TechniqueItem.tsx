import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Technique } from '@/types/technique';

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

  return (
    <View style={[styles.container, noMargin && styles.noMargin]}>
      <View style={styles.header}>
        <Text style={styles.name}>{technique.name}</Text>
      </View>
      <View style={styles.footer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
  },
  header: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 6,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
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
  noMargin: {
    marginBottom: 0,
  },
});