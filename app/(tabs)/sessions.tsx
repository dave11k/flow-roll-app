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
import { Calendar, Trophy, Target, Plus, MapPin, Clock, Pencil, Trash2 } from 'lucide-react-native';
import { TrainingSession } from '@/types/session';
import { getSessions, getTechniques, saveSession, deleteSession } from '@/services/storage';
import CreateSessionModal from '@/components/CreateSessionModal';
import EditSessionModal from '@/components/EditSessionModal';
import SessionDetailModal from '@/components/SessionDetailModal';

export default function Sessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [totalTechniques, setTotalTechniques] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
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
      const [sessionsData, techniquesData] = await Promise.all([
        getSessions(),
        getTechniques()
      ]);
      setSessions(sessionsData);
      setTotalTechniques(techniquesData.length);
      
      // Set last location for modal default
      if (sessionsData.length > 0 && sessionsData[0].location) {
        setLastLocation(sessionsData[0].location);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

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
    } catch {
      Alert.alert('Error', 'Failed to save session. Please try again.');
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
    } catch {
      Alert.alert('Error', 'Failed to update session. Please try again.');
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
            } catch {
              Alert.alert('Error', 'Failed to delete session. Please try again.');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Sessions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            Keyboard.dismiss();
            setShowCreateModal(true);
          }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Trophy size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Target size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>{totalTechniques}</Text>
            <Text style={styles.statLabel}>Techniques</Text>
          </View>
        </View>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Sessions Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first training session to start tracking your BJJ progress
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
            <Text style={styles.sessionsTitle}>Recent Sessions</Text>
            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionItemContainer}>
                <TouchableOpacity 
                  style={styles.sessionCard}
                  onPress={() => handleShowSessionDetail(session)}
                  activeOpacity={0.7}
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
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditSession(session)}
                    activeOpacity={0.7}
                  >
                    <Pencil size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteSession(session)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
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
  addButton: {
    backgroundColor: '#1e3a2e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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