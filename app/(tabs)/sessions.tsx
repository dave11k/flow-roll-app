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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, Plus, MapPin, Clock, Pencil, Trash2, Filter } from 'lucide-react-native';
import { TrainingSession, SessionType } from '@/types/session';
import { getSessions, saveSession, deleteSession } from '@/services/storage';
import CreateSessionModal from '@/components/CreateSessionModal';
import EditSessionModal from '@/components/EditSessionModal';
import SessionDetailModal from '@/components/SessionDetailModal';
import SessionFilterModal from '@/components/SessionFilterModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import SwipeableCard from '@/components/SwipeableCard';
import { useToast } from '@/contexts/ToastContext';

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
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<SessionFilters>({
    dateRange: { startDate: null, endDate: null },
    location: '',
    sessionTypes: [],
    submission: '',
    satisfaction: null,
  });
  const [lastLocation, setLastLocation] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const sessionsData = await getSessions();
      setSessions(sessionsData);
      
      // Set last location for modal default
      if (sessionsData.length > 0 && sessionsData[0].location) {
        setLastLocation(sessionsData[0].location);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFilters = React.useCallback((sessions: TrainingSession[], filters: SessionFilters) => {
    let filtered = [...sessions];

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

  // Apply filters whenever sessions or filters change
  useEffect(() => {
    const filtered = applyFilters(sessions, filters);
    setFilteredSessions(filtered);
  }, [sessions, filters, applyFilters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleCreateSession = async (session: TrainingSession) => {
    try {
      await saveSession(session);
      await loadData();
      setShowCreateModal(false);
      
      // Update last location
      if (session.location) {
        setLastLocation(session.location);
      }
      showSuccess('Session created successfully!');
    } catch {
      showError('Failed to save session. Please try again.');
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
    setShowEditModal(true);
  };

  const handleUpdateSession = async (updatedSession: TrainingSession) => {
    try {
      await saveSession(updatedSession);
      await loadData();
      setShowEditModal(false);
      setEditingSession(null);
      
      // Update last location
      if (updatedSession.location) {
        setLastLocation(updatedSession.location);
      }
      showSuccess('Session updated successfully!');
    } catch {
      showError('Failed to update session. Please try again.');
    }
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
              await deleteSession(session.id);
              await loadData();
              showError('Session deleted successfully!');
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, { color: i < rating ? '#f59e0b' : '#e5e7eb' }]}>
        ★
      </Text>
    ));
  };

  const getTotalSubmissionCount = (session: TrainingSession) => {
    return Object.values(session.submissionCounts || {}).reduce((total, count) => total + count, 0);
  };

  const handleApplyFilters = (newFilters: SessionFilters) => {
    setFilters(newFilters);
  };


  const hasActiveFilters = () => {
    return filters.dateRange.startDate !== null ||
           filters.dateRange.endDate !== null ||
           filters.location.trim() !== '' ||
           filters.sessionTypes.length > 0 ||
           filters.submission.trim() !== '' ||
           filters.satisfaction !== null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Sessions ({sessions.length})</Text>
      </View>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            keyboardShouldPersistTaps="handled"
          >

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
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
            <TouchableOpacity 
              style={styles.createSessionButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.createSessionText}>Create Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            <View style={styles.sessionsHeader}>
              <Text style={styles.sessionsTitle}>
                {hasActiveFilters() 
                  ? `Filtered Sessions (${filteredSessions.length})`
                  : 'Sessions'
                }
              </Text>
              <TouchableOpacity 
                style={[styles.filterButtonMain, hasActiveFilters() && styles.filterButtonActive]}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowFilterModal(true);
                }}
                activeOpacity={0.7}
              >
                <Filter size={20} color="#1e3a2e" />
                <Text style={styles.filterButtonText}>Filter</Text>
                {hasActiveFilters() && <View style={styles.filterIndicatorMain} />}
              </TouchableOpacity>
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
                    <View style={styles.starsContainer}>
                      {renderStars(session.satisfaction)}
                    </View>
                  </View>
                </View>

                  </TouchableOpacity>
                </SwipeableCard>
              </View>
            ))}
          </View>
        )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      <CreateSessionModal
        visible={showCreateModal}
        onSave={handleCreateSession}
        onClose={() => setShowCreateModal(false)}
        lastLocation={lastLocation}
      />

      {editingSession && (
        <EditSessionModal
          visible={showEditModal}
          session={editingSession}
          onSave={handleUpdateSession}
          onClose={() => {
            setShowEditModal(false);
            setEditingSession(null);
          }}
        />
      )}

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
          setShowCreateModal(true);
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
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
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
    backgroundColor: '#1e3a2e',
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
  sessionsList: {
    padding: 20,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  filterButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#fef3c7',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a2e',
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
});