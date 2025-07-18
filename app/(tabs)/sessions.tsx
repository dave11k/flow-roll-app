import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Platform,
} from 'react-native';
import { Calendar, Plus, MapPin, Clock, Filter, Search, X } from 'lucide-react-native';
import { TrainingSession, SessionType } from '@/types/session';
import SessionModal from '@/components/SessionModal';
import SessionDetailModal from '@/components/SessionDetailModal';
import SessionFilterModal from '@/components/SessionFilterModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import SwipeableCard from '@/components/SwipeableCard';
import { useToast } from '@/contexts/ToastContext';
import { useData } from '@/contexts/DataContext';
import StarRating from '@/components/StarRating';

interface SessionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  location: string;
  sessionTypes: SessionType[];
  submission: string;
  satisfaction: number | null;
}

export default function Sessions() {
  const { showSuccess, showError } = useToast();
  const {
    sessions,
    isInitialLoading,
    isLoading,
    refreshSessions,
    createSession,
    updateSession,
    removeSession,
    error,
    clearError
  } = useData();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState<'create' | 'edit'>('create');
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SessionFilters>({
    dateRange: { startDate: null, endDate: null },
    location: '',
    sessionTypes: [],
    submission: '',
    satisfaction: null,
  });
  const [lastLocation, setLastLocation] = useState('');

  // Handle errors from data context
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  // Track when we've loaded data at least once
  useEffect(() => {
    if (sessions.length > 0 || (!isInitialLoading && sessions.length === 0)) {
      setHasLoadedOnce(true);
    }
  }, [sessions.length, isInitialLoading]);

  // Update last location when sessions change
  useEffect(() => {
    if (sessions.length > 0 && sessions[0].location) {
      setLastLocation(sessions[0].location);
    }
  }, [sessions]);

  const applyFilters = React.useCallback((sessions: TrainingSession[], filters: SessionFilters, searchQuery: string) => {
    let filtered = [...sessions];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(session =>
        session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.submissions.some(submission => 
          submission.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange.startDate) {
      filtered = filtered.filter(session => session.date >= filters.dateRange.startDate!);
    }
    if (filters.dateRange.endDate) {
      const endOfDay = new Date(filters.dateRange.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(session => session.date <= endOfDay);
    }

    // Filter by location
    if (filters.location.trim()) {
      filtered = filtered.filter(session => 
        session.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Filter by session types
    if (filters.sessionTypes.length > 0) {
      filtered = filtered.filter(session => 
        filters.sessionTypes.includes(session.type)
      );
    }

    // Filter by submission
    if (filters.submission.trim()) {
      filtered = filtered.filter(session => 
        session.submissions.some(submission => 
          submission.toLowerCase().includes(filters.submission.toLowerCase())
        )
      );
    }

    // Filter by satisfaction
    if (filters.satisfaction !== null) {
      filtered = filtered.filter(session => 
        session.satisfaction >= filters.satisfaction!
      );
    }

    return filtered;
  }, []);

  // Apply filters whenever sessions, filters, or search query change
  useEffect(() => {
    const filtered = applyFilters(sessions, filters, searchQuery);
    setFilteredSessions(filtered);
  }, [sessions, filters, searchQuery, applyFilters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSessions();
    setIsRefreshing(false);
  };

  const handleSaveSession = async (session: TrainingSession) => {
    try {
      if (sessionModalMode === 'create') {
        await createSession(session);
        showSuccess('Session created successfully!');
      } else {
        await updateSession(session);
        showSuccess('Session updated successfully!');
      }
      
      setShowSessionModal(false);
      setEditingSession(null);
      
      // Update last location
      if (session.location) {
        setLastLocation(session.location);
      }
    } catch {
      showError(`Failed to ${sessionModalMode === 'create' ? 'save' : 'update'} session. Please try again.`);
    }
  };

  const handleShowSessionDetail = (session: TrainingSession) => {
    Keyboard.dismiss();
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const handleEditSession = (session: TrainingSession) => {
    Keyboard.dismiss();
    setEditingSession(session);
    setSessionModalMode('edit');
    setShowSessionModal(true);
  };


  const handleDeleteSession = (session: TrainingSession) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete this session from ${formatDate(session.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSession(session.id);
              showSuccess('Session deleted successfully!');
            } catch {
              showError('Failed to delete session. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'gi': return '#1e40af';
      case 'nogi': return '#dc2626';
      case 'open-mat': return '#059669';
      case 'wrestling': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'gi': return 'Gi';
      case 'nogi': return 'No-Gi';
      case 'open-mat': return 'Open Mat';
      case 'wrestling': return 'Wrestling';
      default: return type;
    }
  };


  const getTotalSubmissionCount = (session: TrainingSession) => {
    return Object.values(session.submissionCounts || {}).reduce((total, count) => total + count, 0);
  };

  const handleApplyFilters = (newFilters: SessionFilters) => {
    setFilters(newFilters);
  };


  const hasActiveFilters = () => {
    return searchQuery.trim() !== '' ||
           filters.dateRange.startDate !== null ||
           filters.dateRange.endDate !== null ||
           filters.location.trim() !== '' ||
           filters.sessionTypes.length > 0 ||
           filters.submission.trim() !== '' ||
           filters.satisfaction !== null;
  };

  return (
    <SafeAreaView style={styles.container}>
      
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
              style={[styles.filterButtonMain, hasActiveFilters() && styles.filterButtonActive]}
              onPress={() => {
                Keyboard.dismiss();
                setShowFilterModal(true);
              }}
              activeOpacity={0.7}
            >
              <Filter size={20} color="#5271ff" />
              <Text style={styles.filterButtonText}>Filter</Text>
              {hasActiveFilters() && <View style={styles.filterIndicatorMain} />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={isRefreshing || isLoading} onRefresh={handleRefresh} />
            }
            keyboardShouldPersistTaps="handled"
          >

        {/* Sessions List */}
        {(isInitialLoading && !hasLoadedOnce) ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>Loading sessions...</Text>
          </View>
        ) : filteredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {sessions.length === 0 ? 'No Sessions Yet' : 'No Matching Sessions'}
            </Text>
            <Text style={styles.emptyDescription}>
              {sessions.length === 0 
                ? 'Create your first training session to start tracking your BJJ progress'
                : 'Try adjusting your filters to find sessions'
              }
            </Text>
            {sessions.length === 0 ? (
              <TouchableOpacity 
                style={styles.createSessionButton}
                onPress={() => {
                  setSessionModalMode('create');
                  setEditingSession(null);
                  setShowSessionModal(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createSessionText}>Create Session</Text>
              </TouchableOpacity>
            ) : hasActiveFilters() ? (
              <TouchableOpacity 
                style={styles.clearFiltersButtonLarge}
                onPress={() => {
                  setSearchQuery('');
                  setFilters({
                    dateRange: { startDate: null, endDate: null },
                    location: '',
                    sessionTypes: [],
                    submission: '',
                    satisfaction: null,
                  });
                }}
              >
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.createSessionButton}
                onPress={() => {
                  setSessionModalMode('create');
                  setEditingSession(null);
                  setShowSessionModal(true);
                }}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.createSessionText}>Create Session</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.sessionsList}>
            <View style={styles.sessionsHeader}>
              <Text style={styles.sessionsTitle}>
                {hasActiveFilters() 
                  ? `Filtered Sessions (${filteredSessions.length})`
                  : `Sessions (${sessions.length})`
                }
              </Text>
            </View>
            {filteredSessions.map((session) => (
              <View key={session.id} style={styles.sessionItemContainer}>
                <SwipeableCard
                  onSwipeLeft={() => handleEditSession(session)}
                  onSwipeRight={() => handleDeleteSession(session)}
                >
                  <TouchableOpacity 
                    style={styles.sessionCard}
                    onPress={() => handleShowSessionDetail(session)}
                    activeOpacity={1}
                  >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionMainInfo}>
                      <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                      <View style={styles.locationTimeContainer}>
                        {session.location && (
                          <View style={styles.locationContainer}>
                            <MapPin size={14} color="#6b7280" />
                            <Text style={styles.sessionLocation}>{session.location}</Text>
                          </View>
                        )}
                        <View style={styles.timeContainer}>
                          <Clock size={14} color="#6b7280" />
                          <Text style={styles.sessionTime}>
                            {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>


                <View style={styles.sessionTypeContainer}>
                  <View style={[
                    styles.sessionTypeBadge, 
                    { backgroundColor: getSessionTypeColor(session.type) }
                  ]}>
                    <Text style={styles.sessionTypeText}>
                      {getSessionTypeLabel(session.type)}
                    </Text>
                  </View>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatNumber}>{getTotalSubmissionCount(session)}</Text>
                    <Text style={styles.sessionStatLabel}>Submissions</Text>
                  </View>
                </View>

                <View style={styles.sessionRating}>
                  <View style={styles.satisfactionContainer}>
                    <Text style={styles.ratingLabel}>Satisfaction:</Text>
                    <StarRating
                      mode="display"
                      rating={session.satisfaction}
                      size={16}
                      alignment="left"
                    />
                  </View>
                </View>

                  </TouchableOpacity>
                </SwipeableCard>
              </View>
            ))}
            {/* Bottom spacing to ensure last item is visible */}
            <View style={{ height: 100 }} />
          </View>
        )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      <SessionModal
        visible={showSessionModal}
        mode={sessionModalMode}
        session={editingSession || undefined}
        onSave={handleSaveSession}
        onClose={() => {
          setShowSessionModal(false);
          setEditingSession(null);
        }}
        lastLocation={lastLocation}
      />

      <SessionDetailModal
        visible={showDetailModal}
        session={selectedSession}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSession(null);
        }}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
      />

      <SessionFilterModal
        visible={showFilterModal}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClose={() => setShowFilterModal(false)}
      />

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={() => {
          Keyboard.dismiss();
          setSessionModalMode('create');
          setEditingSession(null);
          setShowSessionModal(true);
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
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  createSessionButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  createSessionText: {
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
  sessionsList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  filterButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: Platform.select({
      ios: 34,
      android: 44, // Taller height for Android
    }),
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
    position: 'relative',
    width: '30%',
  },
  filterButtonActive: {
    backgroundColor: '#f3f4f6',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5271ff',
  },
  filterIndicatorMain: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  sessionItemContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionMainInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sessionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sessionStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  sessionRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  satisfactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: Platform.select({
      ios: 34,
      android: 44, // Taller height for Android
    }),
    gap: 10,
    width: '70%',
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: '#1f2937',
  },
  clearSearchButton: {
    padding: 4,
  },
});