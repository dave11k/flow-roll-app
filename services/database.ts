import * as SQLite from 'expo-sqlite';
import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';

// Database configuration
const DB_NAME = 'bjj_tracker.db';
const DB_VERSION = 1;

// Initialize database
let db: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async (): Promise<void> => {
  if (db) return;

  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Enable foreign key constraints
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Create tables
    await createTables();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database');
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  const createTablesSQL = `
    -- Techniques table
    CREATE TABLE IF NOT EXISTS techniques (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      position TEXT NOT NULL,
      notes TEXT,
      timestamp INTEGER NOT NULL,
      session_id TEXT,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE SET NULL
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      location TEXT,
      type TEXT NOT NULL,
      notes TEXT,
      satisfaction INTEGER NOT NULL CHECK (satisfaction >= 1 AND satisfaction <= 5)
    );

    -- Junction table for session techniques (many-to-many relationship)
    CREATE TABLE IF NOT EXISTS session_techniques (
      session_id TEXT NOT NULL,
      technique_id TEXT NOT NULL,
      is_submission INTEGER DEFAULT 0,
      PRIMARY KEY (session_id, technique_id),
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (technique_id) REFERENCES techniques (id) ON DELETE CASCADE
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_techniques_category ON techniques (category);
    CREATE INDEX IF NOT EXISTS idx_techniques_position ON techniques (position);
    CREATE INDEX IF NOT EXISTS idx_techniques_timestamp ON techniques (timestamp);
    CREATE INDEX IF NOT EXISTS idx_techniques_session_id ON techniques (session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions (date);
    CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions (type);
  `;

  await db.execAsync(createTablesSQL);
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
};

// Technique operations
export const saveTechniqueToDb = async (technique: Technique): Promise<void> => {
  const database = getDatabase();
  
  try {
    // Insert or replace technique
    await database.runAsync(
      `INSERT OR REPLACE INTO techniques (id, name, category, position, notes, timestamp, session_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        technique.id,
        technique.name,
        technique.category,
        technique.position,
        technique.notes || null,
        technique.timestamp.getTime(),
        technique.sessionId || null
      ]
    );
  } catch (error) {
    console.error('Error saving technique to database:', error);
    throw new Error('Failed to save technique');
  }
};

export const getTechniquesFromDb = async (): Promise<Technique[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT * FROM techniques ORDER BY timestamp DESC'
    );
    
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      position: row.position,
      notes: row.notes,
      timestamp: new Date(row.timestamp),
      sessionId: row.session_id
    }));
  } catch (error) {
    console.error('Error loading techniques from database:', error);
    return [];
  }
};

export const deleteTechniqueFromDb = async (techniqueId: string): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.runAsync('DELETE FROM techniques WHERE id = ?', [techniqueId]);
  } catch (error) {
    console.error('Error deleting technique from database:', error);
    throw new Error('Failed to delete technique');
  }
};

export const getTechniquesBySessionFromDb = async (sessionId: string): Promise<Technique[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT * FROM techniques WHERE session_id = ? ORDER BY timestamp DESC',
      [sessionId]
    );
    
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      position: row.position,
      notes: row.notes,
      timestamp: new Date(row.timestamp),
      sessionId: row.session_id
    }));
  } catch (error) {
    console.error('Error loading techniques by session from database:', error);
    return [];
  }
};

// Session operations
export const saveSessionToDb = async (session: TrainingSession): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.withTransactionAsync(async () => {
      // Insert or replace session
      await database.runAsync(
        `INSERT OR REPLACE INTO sessions (id, date, location, type, notes, satisfaction) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.date.getTime(),
          session.location || null,
          session.type,
          session.notes || null,
          session.satisfaction
        ]
      );

      // Remove existing technique associations
      await database.runAsync(
        'DELETE FROM session_techniques WHERE session_id = ?',
        [session.id]
      );

      // Add technique associations
      for (const techniqueId of session.techniqueIds) {
        const isSubmission = session.submissions.includes(techniqueId) ? 1 : 0;
        await database.runAsync(
          'INSERT INTO session_techniques (session_id, technique_id, is_submission) VALUES (?, ?, ?)',
          [session.id, techniqueId, isSubmission]
        );
      }
    });
  } catch (error) {
    console.error('Error saving session to database:', error);
    throw new Error('Failed to save session');
  }
};

export const getSessionsFromDb = async (): Promise<TrainingSession[]> => {
  const database = getDatabase();
  
  try {
    const sessions = await database.getAllAsync(
      'SELECT * FROM sessions ORDER BY date DESC'
    );
    
    const result: TrainingSession[] = [];
    
    for (const sessionRow of sessions) {
      const row = sessionRow as any; // Type assertion for database row
      // Get technique associations for this session
      const techniqueAssociations = await database.getAllAsync(
        'SELECT technique_id, is_submission FROM session_techniques WHERE session_id = ?',
        [row.id]
      );
      
      const techniqueIds = techniqueAssociations.map((assoc: any) => assoc.technique_id);
      const submissions = techniqueAssociations
        .filter((assoc: any) => assoc.is_submission === 1)
        .map((assoc: any) => assoc.technique_id);
      
      result.push({
        id: row.id,
        date: new Date(row.date),
        location: row.location,
        type: row.type,
        notes: row.notes,
        satisfaction: row.satisfaction,
        techniqueIds,
        submissions
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error loading sessions from database:', error);
    return [];
  }
};

export const deleteSessionFromDb = async (sessionId: string): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.withTransactionAsync(async () => {
      // Delete session (cascade will handle session_techniques)
      await database.runAsync('DELETE FROM sessions WHERE id = ?', [sessionId]);
      
      // Update techniques that referenced this session
      await database.runAsync(
        'UPDATE techniques SET session_id = NULL WHERE session_id = ?',
        [sessionId]
      );
    });
  } catch (error) {
    console.error('Error deleting session from database:', error);
    throw new Error('Failed to delete session');
  }
};

// Utility functions
export const getRecentTechniquesFromDb = async (limit: number = 10): Promise<Technique[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT * FROM techniques ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      position: row.position,
      notes: row.notes,
      timestamp: new Date(row.timestamp),
      sessionId: row.session_id
    }));
  } catch (error) {
    console.error('Error loading recent techniques from database:', error);
    return [];
  }
};

// Database cleanup
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};