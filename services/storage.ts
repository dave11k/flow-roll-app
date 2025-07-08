import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';
import { 
  initializeDatabase,
  saveTechniqueToDb,
  getTechniquesFromDb,
  deleteTechniqueFromDb,
  getTechniquesBySessionFromDb,
  saveSessionToDb,
  getSessionsFromDb,
  deleteSessionFromDb,
  getRecentTechniquesFromDb
} from './database';
import { runMigration } from './migration';

// Initialize database and run migration on first import
let initialized = false;
let initializing = false;

const ensureInitialized = async () => {
  if (initialized) return;
  
  if (initializing) {
    // Wait for initialization to complete
    while (initializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  initializing = true;
  
  try {
    await initializeDatabase();
    await runMigration();
    initialized = true;
    console.log('Storage successfully initialized');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  } finally {
    initializing = false;
  }
};

// Technique Storage
export const saveTechnique = async (technique: Technique): Promise<void> => {
  try {
    console.log('Storage: Starting to save technique:', technique.name);
    await ensureInitialized();
    console.log('Storage: Database initialized, calling saveTechniqueToDb');
    await saveTechniqueToDb(technique);
    console.log('Storage: Technique saved successfully');
  } catch (error) {
    console.error('Error saving technique in storage layer:', error);
    console.error('Storage error details:', error.message, error.stack);
    throw new Error(`Failed to save technique: ${error.message}`);
  }
};

export const getTechniques = async (): Promise<Technique[]> => {
  try {
    await ensureInitialized();
    return await getTechniquesFromDb();
  } catch (error) {
    console.error('Error loading techniques:', error);
    return [];
  }
};

export const deleteTechnique = async (techniqueId: string): Promise<void> => {
  try {
    await ensureInitialized();
    await deleteTechniqueFromDb(techniqueId);
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
    await ensureInitialized();
    await saveSessionToDb(session);
  } catch (error) {
    console.error('Error saving session:', error);
    throw new Error('Failed to save session');
  }
};

export const getSessions = async (): Promise<TrainingSession[]> => {
  try {
    await ensureInitialized();
    return await getSessionsFromDb();
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    await ensureInitialized();
    await deleteSessionFromDb(sessionId);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error('Failed to delete session');
  }
};

// Utility functions
export const getTechniquesBySession = async (sessionId: string): Promise<Technique[]> => {
  try {
    await ensureInitialized();
    return await getTechniquesBySessionFromDb(sessionId);
  } catch (error) {
    console.error('Error loading techniques by session:', error);
    return [];
  }
};

export const getRecentTechniques = async (limit: number = 10): Promise<Technique[]> => {
  try {
    await ensureInitialized();
    return await getRecentTechniquesFromDb(limit);
  } catch (error) {
    console.error('Error loading recent techniques:', error);
    return [];
  }
};