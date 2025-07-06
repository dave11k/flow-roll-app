import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase, saveTechniqueToDb, saveSessionToDb } from './database';
import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';

// AsyncStorage keys (from the old storage system)
const TECHNIQUES_KEY = 'bjj_techniques';
const SESSIONS_KEY = 'bjj_sessions';
const MIGRATION_COMPLETE_KEY = 'bjj_migration_complete';

export const runMigration = async (): Promise<void> => {
  try {
    // Check if migration has already been completed
    const migrationComplete = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
    if (migrationComplete === 'true') {
      console.log('Migration already completed, skipping...');
      return;
    }

    console.log('Starting data migration from AsyncStorage to SQLite...');

    // Initialize the database first
    await initializeDatabase();

    // Migrate techniques
    const migratedTechniques = await migrateTechniques();
    console.log(`Migrated ${migratedTechniques} techniques`);

    // Migrate sessions
    const migratedSessions = await migrateSessions();
    console.log(`Migrated ${migratedSessions} sessions`);

    // Mark migration as complete
    await AsyncStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw new Error('Migration failed');
  }
};

const migrateTechniques = async (): Promise<number> => {
  try {
    const techniquesJson = await AsyncStorage.getItem(TECHNIQUES_KEY);
    if (!techniquesJson) {
      console.log('No techniques found in AsyncStorage');
      return 0;
    }

    const techniques = JSON.parse(techniquesJson);
    let migratedCount = 0;

    for (const techniqueData of techniques) {
      try {
        const technique: Technique = {
          id: techniqueData.id,
          name: techniqueData.name,
          category: techniqueData.category,
          position: techniqueData.position,
          notes: techniqueData.notes,
          timestamp: new Date(techniqueData.timestamp),
          sessionId: techniqueData.sessionId
        };

        await saveTechniqueToDb(technique);
        migratedCount++;
      } catch (error) {
        console.error('Error migrating technique:', techniqueData.id, error);
      }
    }

    return migratedCount;
  } catch (error) {
    console.error('Error migrating techniques:', error);
    return 0;
  }
};

const migrateSessions = async (): Promise<number> => {
  try {
    const sessionsJson = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!sessionsJson) {
      console.log('No sessions found in AsyncStorage');
      return 0;
    }

    const sessions = JSON.parse(sessionsJson);
    let migratedCount = 0;

    for (const sessionData of sessions) {
      try {
        const session: TrainingSession = {
          id: sessionData.id,
          date: new Date(sessionData.date),
          location: sessionData.location,
          type: sessionData.type,
          notes: sessionData.notes,
          satisfaction: sessionData.satisfaction,
          techniqueIds: sessionData.techniqueIds || [],
          submissions: sessionData.submissions || [],
          submissionCounts: sessionData.submissionCounts || {}
        };

        await saveSessionToDb(session);
        migratedCount++;
      } catch (error) {
        console.error('Error migrating session:', sessionData.id, error);
      }
    }

    return migratedCount;
  } catch (error) {
    console.error('Error migrating sessions:', error);
    return 0;
  }
};

export const clearOldAsyncStorageData = async (): Promise<void> => {
  try {
    console.log('Clearing old AsyncStorage data...');
    await AsyncStorage.multiRemove([TECHNIQUES_KEY, SESSIONS_KEY]);
    console.log('Old AsyncStorage data cleared successfully');
  } catch (error) {
    console.error('Error clearing old AsyncStorage data:', error);
  }
};

export const resetMigration = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MIGRATION_COMPLETE_KEY);
    console.log('Migration reset - will run again on next app start');
  } catch (error) {
    console.error('Error resetting migration:', error);
  }
};

export const isMigrationComplete = async (): Promise<boolean> => {
  try {
    const migrationComplete = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
    return migrationComplete === 'true';
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};