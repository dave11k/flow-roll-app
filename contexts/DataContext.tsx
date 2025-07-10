import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';
import { UserProfile } from '@/types/profile';
import { getTechniques, getSessions, saveTechnique, saveSession, deleteTechnique, deleteSession, getProfile, saveProfile } from '@/services/storage';
import { loadTestData } from '@/services/testData';

interface DataContextType {
  // Data
  techniques: Technique[];
  sessions: TrainingSession[];
  profile: UserProfile | null;
  
  // Loading states
  isLoading: boolean;
  isInitialLoading: boolean;
  techniquesLoading: boolean;
  sessionsLoading: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  refreshTechniques: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  
  // CRUD operations with automatic cache updates
  createTechnique: (technique: Technique) => Promise<void>;
  updateTechnique: (technique: Technique) => Promise<void>;
  removeTechnique: (techniqueId: string) => Promise<void>;
  
  createSession: (session: TrainingSession) => Promise<void>;
  updateSession: (session: TrainingSession) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  
  // Profile operations
  updateProfile: (profile: UserProfile) => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [techniquesLoading, setTechniquesLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);
      
      // Load test data if needed
      await loadTestData();
      
      // Load techniques, sessions, and profile concurrently
      const [techniquesData, sessionsData, profileData] = await Promise.all([
        getTechniques(),
        getSessions(),
        getProfile()
      ]);
      
      setTechniques(techniquesData);
      setSessions(sessionsData);
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [techniquesData, sessionsData, profileData] = await Promise.all([
        getTechniques(),
        getSessions(),
        getProfile()
      ]);
      
      setTechniques(techniquesData);
      setSessions(sessionsData);
      setProfile(profileData);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTechniques = useCallback(async () => {
    try {
      setTechniquesLoading(true);
      setError(null);
      
      const techniquesData = await getTechniques();
      setTechniques(techniquesData);
    } catch (err) {
      console.error('Error refreshing techniques:', err);
      setError('Failed to refresh techniques. Please try again.');
    } finally {
      setTechniquesLoading(false);
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      setError(null);
      
      const sessionsData = await getSessions();
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error refreshing sessions:', err);
      setError('Failed to refresh sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Technique CRUD operations
  const createTechnique = useCallback(async (technique: Technique) => {
    try {
      await saveTechnique(technique);
      // Optimistically update the local state
      setTechniques(prev => [technique, ...prev]);
      setError(null);
    } catch (err) {
      console.error('Error creating technique:', err);
      setError('Failed to create technique. Please try again.');
      // Refresh from server in case of error
      await refreshTechniques();
      throw err;
    }
  }, [refreshTechniques]);

  const updateTechnique = useCallback(async (technique: Technique) => {
    try {
      await saveTechnique(technique);
      // Optimistically update the local state
      setTechniques(prev => prev.map(t => t.id === technique.id ? technique : t));
      setError(null);
    } catch (err) {
      console.error('Error updating technique:', err);
      setError('Failed to update technique. Please try again.');
      // Refresh from server in case of error
      await refreshTechniques();
      throw err;
    }
  }, [refreshTechniques]);

  const removeTechnique = useCallback(async (techniqueId: string) => {
    try {
      await deleteTechnique(techniqueId);
      // Optimistically update the local state
      setTechniques(prev => prev.filter(t => t.id !== techniqueId));
      setError(null);
    } catch (err) {
      console.error('Error deleting technique:', err);
      setError('Failed to delete technique. Please try again.');
      // Refresh from server in case of error
      await refreshTechniques();
      throw err;
    }
  }, [refreshTechniques]);

  // Session CRUD operations
  const createSession = useCallback(async (session: TrainingSession) => {
    try {
      await saveSession(session);
      // Optimistically update the local state (add to beginning for most recent first)
      setSessions(prev => [session, ...prev]);
      setError(null);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session. Please try again.');
      // Refresh from server in case of error
      await refreshSessions();
      throw err;
    }
  }, [refreshSessions]);

  const updateSession = useCallback(async (session: TrainingSession) => {
    try {
      await saveSession(session);
      // Optimistically update the local state
      setSessions(prev => prev.map(s => s.id === session.id ? session : s));
      setError(null);
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session. Please try again.');
      // Refresh from server in case of error
      await refreshSessions();
      throw err;
    }
  }, [refreshSessions]);

  const removeSession = useCallback(async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      // Optimistically update the local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setError(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session. Please try again.');
      // Refresh from server in case of error
      await refreshSessions();
      throw err;
    }
  }, [refreshSessions]);

  // Profile operations
  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      await saveProfile(newProfile);
      // Optimistically update the local state
      setProfile(newProfile);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: DataContextType = {
    techniques,
    sessions,
    profile,
    isLoading,
    isInitialLoading,
    techniquesLoading,
    sessionsLoading,
    refreshData,
    refreshTechniques,
    refreshSessions,
    createTechnique,
    updateTechnique,
    removeTechnique,
    createSession,
    updateSession,
    removeSession,
    updateProfile,
    error,
    clearError,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}