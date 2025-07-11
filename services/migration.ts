import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeDatabase, saveTechniqueToDb, saveSessionToDb, initializePredefinedTagsInDb } from './database';
import { Technique, PREDEFINED_TAGS } from '@/types/technique';
import { TrainingSession } from '@/types/session';

// AsyncStorage keys (from the old storage system)
const TECHNIQUES_KEY = 'bjj_techniques';
const SESSIONS_KEY = 'bjj_sessions';
const MIGRATION_COMPLETE_KEY = 'bjj_migration_complete';
const TAG_MIGRATION_COMPLETE_KEY = 'bjj_tag_migration_complete';

export const runMigration = async (): Promise<void> => {
  try {
    // Initialize the database first
    await initializeDatabase();
    
    console.log('Database initialized, starting migrations...');

    // Run AsyncStorage to SQLite migration if needed
    await runAsyncStorageMigration();

    // Run position to tags migration if needed
    await runTagMigration();

    // Initialize predefined tags (after main migrations to avoid conflicts)
    await initializePredefinedTags();
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw new Error('Migration failed');
  }
};

const runAsyncStorageMigration = async (): Promise<void> => {
  try {
    // Check if migration has already been completed
    const migrationComplete = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
    if (migrationComplete === 'true') {
      console.log('AsyncStorage migration already completed, skipping...');
      return;
    }

    console.log('Starting data migration from AsyncStorage to SQLite...');

    // Migrate techniques
    const migratedTechniques = await migrateTechniques();
    console.log(`Migrated ${migratedTechniques} techniques`);

    // Migrate sessions
    const migratedSessions = await migrateSessions();
    console.log(`Migrated ${migratedSessions} sessions`);

    // Mark migration as complete
    await AsyncStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
    
    console.log('AsyncStorage migration completed successfully!');
  } catch (error) {
    console.error('Error during AsyncStorage migration:', error);
    throw new Error('AsyncStorage migration failed');
  }
};

const runTagMigration = async (): Promise<void> => {
  try {
    // Check if tag migration has already been completed
    const tagMigrationComplete = await AsyncStorage.getItem(TAG_MIGRATION_COMPLETE_KEY);
    if (tagMigrationComplete === 'true') {
      console.log('Tag migration already completed, skipping...');
      return;
    }

    console.log('Starting position to tags migration...');

    const migratedTechniques = await migratePositionsToTags();
    console.log(`Updated ${migratedTechniques} techniques with tags`);

    // Mark tag migration as complete
    await AsyncStorage.setItem(TAG_MIGRATION_COMPLETE_KEY, 'true');
    
    console.log('Tag migration completed successfully!');
  } catch (error) {
    console.error('Error during tag migration:', error);
    throw new Error('Tag migration failed');
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
        // Convert old position to tags array for new system
        const tags = techniqueData.position ? [techniqueData.position] : [];
        
        const technique: Technique = {
          id: techniqueData.id,
          name: techniqueData.name,
          category: techniqueData.category,
          tags: tags,
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

const initializePredefinedTags = async (): Promise<void> => {
  try {
    // Check if tags are already initialized by checking for a few key tags
    const { getDatabase } = await import('./database');
    const database = getDatabase();
    
    const existingTags = await database.getAllAsync(
      'SELECT COUNT(*) as count FROM tags WHERE is_custom = 0'
    );
    
    const tagCount = (existingTags[0] as any)?.count || 0;
    
    if (tagCount > 10) {
      console.log('Predefined tags already initialized, skipping...');
      return;
    }

    console.log('Initializing predefined tags...');
    
    const allTags = [
      ...PREDEFINED_TAGS.POSITIONS.map(name => ({ name, category: 'position' })),
      ...PREDEFINED_TAGS.ATTRIBUTES.map(name => ({ name, category: 'attribute' })),
      ...PREDEFINED_TAGS.STYLES.map(name => ({ name, category: 'style' })),
    ];

    await initializePredefinedTagsInDb(allTags);
    console.log(`Successfully initialized ${allTags.length} predefined tags`);
  } catch (error) {
    console.error('Error initializing predefined tags:', error);
    // Don't throw error for tag initialization - app can still work without predefined tags
    console.log('App will continue without predefined tags - they can be created manually');
  }
};

const migratePositionsToTags = async (): Promise<number> => {
  try {
    // This function would migrate existing SQLite techniques that still have the old position field
    // Since we're updating the schema, this is mainly for safety and future database operations
    // The actual conversion happens in the database schema update and new technique saves
    
    console.log('Position to tags migration completed (handled by database schema updates)');
    return 0;
  } catch (error) {
    console.error('Error migrating positions to tags:', error);
    return 0;
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

export const isTagMigrationComplete = async (): Promise<boolean> => {
  try {
    const tagMigrationComplete = await AsyncStorage.getItem(TAG_MIGRATION_COMPLETE_KEY);
    return tagMigrationComplete === 'true';
  } catch (error) {
    console.error('Error checking tag migration status:', error);
    return false;
  }
};