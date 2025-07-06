import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';

const TECHNIQUES_KEY = 'bjj_techniques';
const SESSIONS_KEY = 'bjj_sessions';

// Technique Storage
export const saveTechnique = async (technique: Technique): Promise<void> => {
  try {
    const existingTechniques = await getTechniques();
    
    // Check if technique already exists (for updates)
    const existingIndex = existingTechniques.findIndex(t => t.id === technique.id);
    
    let updatedTechniques;
    if (existingIndex >= 0) {
      // Update existing technique
      updatedTechniques = [...existingTechniques];
      updatedTechniques[existingIndex] = technique;
    } else {
      // Add new technique to the beginning
      updatedTechniques = [technique, ...existingTechniques];
    }
    
    await AsyncStorage.setItem(TECHNIQUES_KEY, JSON.stringify(updatedTechniques));
  } catch (error) {
    console.error('Error saving technique:', error);
    throw new Error('Failed to save technique');
  }
};

export const getTechniques = async (): Promise<Technique[]> => {
  try {
    const techniquesJson = await AsyncStorage.getItem(TECHNIQUES_KEY);
    if (!techniquesJson) return [];
    
    const techniques = JSON.parse(techniquesJson);
    // Convert timestamp strings back to Date objects
    return techniques.map((technique: any) => ({
      ...technique,
      timestamp: new Date(technique.timestamp),
    }));
  } catch (error) {
    console.error('Error loading techniques:', error);
    return [];
  }
};

export const deleteTechnique = async (techniqueId: string): Promise<void> => {
  try {
    const techniques = await getTechniques();
    const updatedTechniques = techniques.filter(t => t.id !== techniqueId);
    
    // Always save the updated list (even if empty)
    await AsyncStorage.setItem(TECHNIQUES_KEY, JSON.stringify(updatedTechniques));
  } catch (error) {
    console.error('Error deleting technique:', error);
    throw new Error('Failed to delete technique');
  }
};

export const updateTechnique = async (updatedTechnique: Technique): Promise<void> => {
  try {
    // Use the saveTechnique function which now handles updates
    await saveTechnique(updatedTechnique);
  } catch (error) {
    console.error('Error updating technique:', error);
    throw new Error('Failed to update technique');
  }
};

// Session Storage
export const saveSession = async (session: TrainingSession): Promise<void> => {
  try {
    const existingSessions = await getSessions();
    const updatedSessions = [session, ...existingSessions];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving session:', error);
    throw new Error('Failed to save session');
  }
};

export const getSessions = async (): Promise<TrainingSession[]> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) return [];
    
    const sessions = JSON.parse(sessionsJson);
    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      date: new Date(session.date),
    }));
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessions = await getSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error('Failed to delete session');
  }
};

// Utility functions
export const getTechniquesBySession = async (sessionId: string): Promise<Technique[]> => {
  try {
    const techniques = await getTechniques();
    return techniques.filter(technique => technique.sessionId === sessionId);
  } catch (error) {
    console.error('Error loading techniques by session:', error);
    return [];
  }
};

export const getRecentTechniques = async (limit: number = 10): Promise<Technique[]> => {
  try {
    const techniques = await getTechniques();
    return techniques
      .slice(0, limit);
  } catch (error) {
    console.error('Error loading recent techniques:', error);
    return [];
  }
};