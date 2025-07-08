import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Pencil, Trash2, Target, MapPin, FileText, Calendar, Link2, ExternalLink } from 'lucide-react-native';
import { Technique } from '@/types/technique';
import * as Linking from 'expo-linking';

interface TechniqueDetailModalProps {
  visible: boolean;
  technique: Technique | null;
  onClose: () => void;
  onEdit?: (technique: Technique) => void;
  onDelete?: (technique: Technique) => void;
}

const { height: screenHeight } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316',
  'Escape': '#eab308',
  'Guard Pass': '#22c55e',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
};

export default function TechniqueDetailModal({
  visible,
  technique,
  onClose,
  onEdit,
  onDelete,
}: TechniqueDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const dragY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight * 0.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, isVisible]);

  const animateClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dragY.setValue(0);
      onClose();
    });
  };

  const handlePanGesture = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      lastGestureY.current = translationY;

      // If dragged down significantly or with high velocity, animate close
      if (translationY > 100 || velocityY > 1000) {
        animateClose();
      } else {
        // Otherwise, snap back to original position
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!technique || !isVisible) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={animateClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { translateY: dragY }
            ],
          },
        ]}
      >
        <View style={styles.modal}>
          <PanGestureHandler
            onGestureEvent={handlePanGesture}
            onHandlerStateChange={handlePanStateChange}
          >
            <Animated.View>
              <View style={styles.header}>
                <View style={styles.dragHandle} />
              </View>
              
              <View style={styles.headerWithClose}>
                <Text style={styles.headerTitle}>{technique.name}</Text>
              </View>
            </Animated.View>
          </PanGestureHandler>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >

            {/* Category and Action Buttons */}
            <View style={styles.section}>
              <View style={styles.categoryRow}>
                <View style={styles.badgesContainer}>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: CATEGORY_COLORS[technique.category] || '#6b7280' }
                  ]}>
                    <Text style={styles.badgeText}>{technique.category}</Text>
                  </View>
                </View>
                
                <View style={styles.actionButtons}>
                  {onEdit && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => {
                        console.log('Edit button pressed');
                        onEdit(technique);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Pencil size={12} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => {
                        console.log('Delete button pressed');
                        onDelete(technique);
                        onClose();
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={12} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Tags */}
              {technique.tags && technique.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagsTitle}>Tags</Text>
                  <View style={styles.tagsList}>
                    {technique.tags.map((tag) => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Date Added */}
            <View style={styles.section}>
              <Text style={styles.dateText}>{formatDate(technique.timestamp)}</Text>
              <Text style={styles.timeText}>{formatTime(technique.timestamp)}</Text>
            </View>

            {/* Notes */}
            {technique.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color="#1e3a2e" />
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{technique.notes}</Text>
              </View>
            )}

            {/* Links & References */}
            {technique.links && technique.links.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Link2 size={20} color="#1e3a2e" />
                  <Text style={styles.sectionTitle}>Links & References</Text>
                </View>
                <View style={styles.linksContainer}>
                  {technique.links.map((link) => (
                    <TouchableOpacity
                      key={link.id}
                      style={styles.linkItem}
                      onPress={async () => {
                        try {
                          let formattedUrl = link.url;
                          // Add https:// if no protocol is specified
                          if (!formattedUrl.match(/^https?:\/\//)) {
                            formattedUrl = 'https://' + formattedUrl;
                          }
                          
                          const canOpen = await Linking.canOpenURL(formattedUrl);
                          if (canOpen) {
                            await Linking.openURL(formattedUrl);
                          } else {
                            console.warn('Cannot open URL:', formattedUrl);
                          }
                        } catch (error) {
                          console.error('Error opening URL:', error);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Link2 size={16} color="#6b7280" style={styles.linkIcon} />
                      <Text style={styles.linkText} numberOfLines={1}>
                        {link.title || link.url}
                      </Text>
                      <ExternalLink size={16} color="#6b7280" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Invisible spacer to ensure full scrollability */}
            <View style={styles.scrollSpacer} />
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.9,
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 4,
  },
  headerWithClose: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#3b82f6',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  techniqueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 10
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
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
    paddingVertical: 10,
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
  scrollSpacer: {
    height: 100,
  },
});