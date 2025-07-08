import * as SQLite from 'expo-sqlite';
import { Technique } from '@/types/technique';
import { TrainingSession } from '@/types/session';

// Database configuration
const DB_NAME = 'bjj_tracker.db';
const DB_VERSION = 1;

// Initialize database
let db: SQLite.SQLiteDatabase | null = null;

export const initializeDatabase = async (): Promise<void> => {
  if (db) {
    console.log('Database already initialized');
    return;
  }

  try {
    console.log('Opening database...');
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    console.log('Enabling foreign key constraints...');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    console.log('Creating tables...');
    await createTables();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Database initialization error details:', error.message, error.stack);
    db = null; // Reset db on failure
    throw new Error(`Failed to initialize database: ${error.message}`);
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    console.log('Executing table creation SQL...');
    const createTablesSQL = `
    -- Techniques table
    CREATE TABLE IF NOT EXISTS techniques (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
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

    -- Submissions table for session submissions
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
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

    -- Locations table for storing unique locations
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      usage_count INTEGER DEFAULT 0,
      last_used INTEGER
    );

    -- Tags table for storing available tags
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK (category IN ('position', 'attribute', 'style', 'custom')),
      usage_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      is_custom INTEGER DEFAULT 0
    );

    -- Junction table for technique tags (many-to-many relationship)
    CREATE TABLE IF NOT EXISTS technique_tags (
      technique_id TEXT NOT NULL,
      tag_name TEXT NOT NULL,
      PRIMARY KEY (technique_id, tag_name),
      FOREIGN KEY (technique_id) REFERENCES techniques (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_name) REFERENCES tags (name) ON DELETE CASCADE
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_techniques_category ON techniques (category);
    CREATE INDEX IF NOT EXISTS idx_techniques_timestamp ON techniques (timestamp);
    CREATE INDEX IF NOT EXISTS idx_techniques_session_id ON techniques (session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions (date);
    CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions (type);
    CREATE INDEX IF NOT EXISTS idx_submissions_session ON submissions (session_id);
    CREATE INDEX IF NOT EXISTS idx_locations_usage_count ON locations (usage_count DESC);
    CREATE INDEX IF NOT EXISTS idx_locations_last_used ON locations (last_used DESC);
    CREATE INDEX IF NOT EXISTS idx_tags_category ON tags (category);
    CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags (usage_count DESC);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);
    CREATE INDEX IF NOT EXISTS idx_technique_tags_technique ON technique_tags (technique_id);
    CREATE INDEX IF NOT EXISTS idx_technique_tags_tag ON technique_tags (tag_name);
  `;

    await db.execAsync(createTablesSQL);
    console.log('Tables created successfully');
    
    // Handle schema migrations for existing databases
    try {
      console.log('Checking for schema migrations...');
      
      // Check if the old position column exists and remove it
      const tableInfo = await db.getAllAsync('PRAGMA table_info(techniques)');
      const hasPositionColumn = tableInfo.some((col: any) => col.name === 'position');
      
      if (hasPositionColumn) {
        console.log('Found old position column, migrating techniques table...');
        
        // Create new table without position column
        await db.execAsync(`
          CREATE TABLE techniques_new (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            notes TEXT,
            timestamp INTEGER NOT NULL,
            session_id TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE SET NULL
          );
        `);
        
        // Copy data from old table (excluding position column)
        await db.execAsync(`
          INSERT INTO techniques_new (id, name, category, notes, timestamp, session_id)
          SELECT id, name, category, notes, timestamp, session_id FROM techniques;
        `);
        
        // Drop old table and rename new one
        await db.execAsync('DROP TABLE techniques;');
        await db.execAsync('ALTER TABLE techniques_new RENAME TO techniques;');
        
        // Recreate indexes
        await db.execAsync(`
          CREATE INDEX IF NOT EXISTS idx_techniques_category ON techniques (category);
          CREATE INDEX IF NOT EXISTS idx_techniques_timestamp ON techniques (timestamp);
          CREATE INDEX IF NOT EXISTS idx_techniques_session_id ON techniques (session_id);
        `);
        
        console.log('Techniques table migration completed');
      }
      
      // Add count column to submissions table if it doesn't exist
      await db.execAsync(`
        ALTER TABLE submissions ADD COLUMN count INTEGER DEFAULT 1;
      `);
      console.log('Schema migration completed');
    } catch (error) {
      // Column already exists or other error - this is expected for new databases
      console.log('Schema migrations completed or not needed:', error.message);
    }
    
    console.log('All table operations completed successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    console.error('Table creation error details:', error.message, error.stack);
    throw new Error(`Failed to create tables: ${error.message}`);
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
};

// Technique operations
export const saveTechniqueToDb = async (technique: Technique): Promise<void> => {
  try {
    const database = getDatabase();
    
    // Validate input
    if (!technique.id || !technique.name || !technique.category) {
      console.error('Invalid technique data:', technique);
      throw new Error('Missing required technique fields');
    }

    // Ensure tags is an array
    const tags = Array.isArray(technique.tags) ? technique.tags : [];

    console.log('Saving technique:', technique.name, 'with tags:', tags);

    await database.withTransactionAsync(async () => {
      // Insert or replace technique
      await database.runAsync(
        `INSERT OR REPLACE INTO techniques (id, name, category, notes, timestamp, session_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          technique.id,
          technique.name,
          technique.category,
          technique.notes || null,
          technique.timestamp.getTime(),
          technique.sessionId || null
        ]
      );

      // Remove existing tag associations for this technique
      await database.runAsync(
        'DELETE FROM technique_tags WHERE technique_id = ?',
        [technique.id]
      );

      // Add new tag associations only if there are tags
      if (tags.length > 0) {
        for (const tagName of tags) {
          // Skip empty or invalid tag names
          if (!tagName || typeof tagName !== 'string' || !tagName.trim()) {
            console.warn('Skipping invalid tag:', tagName);
            continue;
          }

          const cleanTagName = tagName.trim();

          try {
            // Ensure the tag exists in the tags table
            await database.runAsync(
              `INSERT OR IGNORE INTO tags (id, name, category, created_at, is_custom) 
               VALUES (?, ?, ?, ?, ?)`,
              [
                cleanTagName.toLowerCase().replace(/\s+/g, '-'),
                cleanTagName,
                'custom',
                Date.now(),
                1
              ]
            );

            // Create technique-tag association
            await database.runAsync(
              'INSERT INTO technique_tags (technique_id, tag_name) VALUES (?, ?)',
              [technique.id, cleanTagName]
            );

            // Update tag usage count
            await database.runAsync(
              'UPDATE tags SET usage_count = usage_count + 1 WHERE name = ?',
              [cleanTagName]
            );
          } catch (tagError) {
            console.error('Error processing tag:', cleanTagName, tagError);
            // Continue with other tags even if one fails
          }
        }
      }
    });

    console.log('Technique saved successfully with', tags.length, 'tags');
  } catch (error) {
    console.error('Error saving technique to database:', error);
    console.error('Technique data:', JSON.stringify(technique, null, 2));
    throw new Error(`Failed to save technique: ${error.message}`);
  }
};

export const getTechniquesFromDb = async (): Promise<Technique[]> => {
  const database = getDatabase();
  
  try {
    const techniques = await database.getAllAsync(
      'SELECT * FROM techniques ORDER BY timestamp DESC'
    );
    
    const result: Technique[] = [];
    
    for (const techniqueRow of techniques) {
      const row = techniqueRow as any;
      
      // Get tags for this technique
      const tagRows = await database.getAllAsync(
        'SELECT tag_name FROM technique_tags WHERE technique_id = ?',
        [row.id]
      );
      
      const tags = tagRows.map((tagRow: any) => tagRow.tag_name);
      
      result.push({
        id: row.id,
        name: row.name,
        category: row.category,
        tags,
        notes: row.notes,
        timestamp: new Date(row.timestamp),
        sessionId: row.session_id
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error loading techniques from database:', error);
    return [];
  }
};

export const deleteTechniqueFromDb = async (techniqueId: string): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.withTransactionAsync(async () => {
      // Delete technique (cascade will handle technique_tags)
      await database.runAsync('DELETE FROM techniques WHERE id = ?', [techniqueId]);
    });
    
    // Clean up unused custom tags after deletion
    const cleanedTags = await cleanupUnusedCustomTags();
    if (cleanedTags > 0) {
      console.log(`Cleaned up ${cleanedTags} unused custom tags after deleting technique`);
    }
  } catch (error) {
    console.error('Error deleting technique from database:', error);
    throw new Error('Failed to delete technique');
  }
};

export const getTechniquesBySessionFromDb = async (sessionId: string): Promise<Technique[]> => {
  const database = getDatabase();
  
  try {
    const techniques = await database.getAllAsync(
      'SELECT * FROM techniques WHERE session_id = ? ORDER BY timestamp DESC',
      [sessionId]
    );
    
    const result: Technique[] = [];
    
    for (const techniqueRow of techniques) {
      const row = techniqueRow as any;
      
      // Get tags for this technique
      const tagRows = await database.getAllAsync(
        'SELECT tag_name FROM technique_tags WHERE technique_id = ?',
        [row.id]
      );
      
      const tags = tagRows.map((tagRow: any) => tagRow.tag_name);
      
      result.push({
        id: row.id,
        name: row.name,
        category: row.category,
        tags,
        notes: row.notes,
        timestamp: new Date(row.timestamp),
        sessionId: row.session_id
      });
    }
    
    return result;
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

      // Save location if provided
      if (session.location && session.location.trim()) {
        const trimmedName = session.location.trim();
        await database.runAsync(
          `INSERT OR REPLACE INTO locations (name, usage_count, last_used) 
           VALUES (?, COALESCE((SELECT usage_count FROM locations WHERE name = ?), 0) + 1, ?)`,
          [trimmedName, trimmedName, Date.now()]
        );
      }

      // Remove existing technique associations
      await database.runAsync(
        'DELETE FROM session_techniques WHERE session_id = ?',
        [session.id]
      );

      // Remove existing submissions
      await database.runAsync(
        'DELETE FROM submissions WHERE session_id = ?',
        [session.id]
      );

      // Add technique associations
      for (const techniqueId of session.techniqueIds) {
        await database.runAsync(
          'INSERT INTO session_techniques (session_id, technique_id, is_submission) VALUES (?, ?, ?)',
          [session.id, techniqueId, 0]
        );
      }

      // Add submissions with counts
      for (const submissionName of session.submissions) {
        const count = session.submissionCounts[submissionName] || 1;
        await database.runAsync(
          'INSERT INTO submissions (session_id, name, count) VALUES (?, ?, ?)',
          [session.id, submissionName, count]
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
        'SELECT technique_id FROM session_techniques WHERE session_id = ?',
        [row.id]
      );
      
      // Get submissions for this session
      const submissionRows = await database.getAllAsync(
        'SELECT name, count FROM submissions WHERE session_id = ?',
        [row.id]
      );
      
      const techniqueIds = techniqueAssociations.map((assoc: any) => assoc.technique_id);
      const submissions = submissionRows.map((sub: any) => sub.name);
      const submissionCounts: Record<string, number> = {};
      submissionRows.forEach((sub: any) => {
        submissionCounts[sub.name] = sub.count || 1;
      });
      
      result.push({
        id: row.id,
        date: new Date(row.date),
        location: row.location,
        type: row.type,
        notes: row.notes,
        satisfaction: row.satisfaction,
        techniqueIds,
        submissions,
        submissionCounts
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
    const techniques = await database.getAllAsync(
      'SELECT * FROM techniques ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    
    const result: Technique[] = [];
    
    for (const techniqueRow of techniques) {
      const row = techniqueRow as any;
      
      // Get tags for this technique
      const tagRows = await database.getAllAsync(
        'SELECT tag_name FROM technique_tags WHERE technique_id = ?',
        [row.id]
      );
      
      const tags = tagRows.map((tagRow: any) => tagRow.tag_name);
      
      result.push({
        id: row.id,
        name: row.name,
        category: row.category,
        tags,
        notes: row.notes,
        timestamp: new Date(row.timestamp),
        sessionId: row.session_id
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error loading recent techniques from database:', error);
    return [];
  }
};

// Location operations
export const saveLocationToDb = async (locationName: string): Promise<void> => {
  if (!locationName || !locationName.trim()) return;
  
  const database = getDatabase();
  const trimmedName = locationName.trim();
  
  try {
    await database.runAsync(
      `INSERT OR REPLACE INTO locations (name, usage_count, last_used) 
       VALUES (?, COALESCE((SELECT usage_count FROM locations WHERE name = ?), 0) + 1, ?)`,
      [trimmedName, trimmedName, Date.now()]
    );
  } catch (error) {
    console.error('Error saving location to database:', error);
  }
};

export const getLocationsFromDb = async (): Promise<string[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT name FROM locations ORDER BY usage_count DESC, last_used DESC'
    );
    
    return result.map((row: any) => row.name);
  } catch (error) {
    console.error('Error loading locations from database:', error);
    return [];
  }
};

export const getUniqueSubmissionsFromDb = async (): Promise<string[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT DISTINCT name FROM submissions ORDER BY name ASC'
    );
    
    return result.map((row: any) => row.name);
  } catch (error) {
    console.error('Error loading unique submissions from database:', error);
    return [];
  }
};

// Tag operations
export const getAllTagsFromDb = async (): Promise<{ name: string; category: string; usageCount: number; isCustom: boolean }[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT name, category, usage_count, is_custom FROM tags ORDER BY usage_count DESC, name ASC'
    );
    
    return result.map((row: any) => ({
      name: row.name,
      category: row.category,
      usageCount: row.usage_count,
      isCustom: Boolean(row.is_custom)
    }));
  } catch (error) {
    console.error('Error loading tags from database:', error);
    return [];
  }
};

export const getPopularTagsFromDb = async (limit: number = 20): Promise<string[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT name FROM tags WHERE usage_count > 0 ORDER BY usage_count DESC, name ASC LIMIT ?',
      [limit]
    );
    
    return result.map((row: any) => row.name);
  } catch (error) {
    console.error('Error loading popular tags from database:', error);
    return [];
  }
};

export const searchTagsFromDb = async (query: string, limit: number = 10): Promise<string[]> => {
  const database = getDatabase();
  
  try {
    const result = await database.getAllAsync(
      'SELECT name FROM tags WHERE name LIKE ? ORDER BY usage_count DESC, name ASC LIMIT ?',
      [`%${query}%`, limit]
    );
    
    return result.map((row: any) => row.name);
  } catch (error) {
    console.error('Error searching tags from database:', error);
    return [];
  }
};

export const createCustomTagInDb = async (tagName: string): Promise<void> => {
  const database = getDatabase();
  
  try {
    await database.runAsync(
      `INSERT OR IGNORE INTO tags (id, name, category, created_at, is_custom, usage_count) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tagName.toLowerCase().replace(/\s+/g, '-'),
        tagName,
        'custom',
        Date.now(),
        1,
        0
      ]
    );
  } catch (error) {
    console.error('Error creating custom tag in database:', error);
    throw new Error('Failed to create custom tag');
  }
};

export const initializePredefinedTagsInDb = async (tags: { name: string; category: string }[]): Promise<void> => {
  const database = getDatabase();
  
  try {
    // Insert tags individually without transaction since this might be called within another transaction
    for (const tag of tags) {
      await database.runAsync(
        `INSERT OR IGNORE INTO tags (id, name, category, created_at, is_custom, usage_count) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tag.name.toLowerCase().replace(/\s+/g, '-'),
          tag.name,
          tag.category,
          Date.now(),
          0,
          0
        ]
      );
    }
  } catch (error) {
    console.error('Error initializing predefined tags in database:', error);
    throw new Error('Failed to initialize predefined tags');
  }
};

// Cleanup unused custom tags
export const cleanupUnusedCustomTags = async (): Promise<number> => {
  const database = getDatabase();
  
  try {
    // Find custom tags that are not used by any technique
    const unusedTags = await database.getAllAsync(`
      SELECT t.name 
      FROM tags t
      WHERE t.is_custom = 1
      AND NOT EXISTS (
        SELECT 1 
        FROM technique_tags tt 
        WHERE tt.tag_name = t.name
      )
    `);
    
    if (unusedTags.length === 0) {
      return 0;
    }
    
    // Delete unused custom tags
    await database.withTransactionAsync(async () => {
      for (const tag of unusedTags) {
        await database.runAsync(
          'DELETE FROM tags WHERE name = ? AND is_custom = 1',
          [(tag as any).name]
        );
      }
    });
    
    console.log(`Cleaned up ${unusedTags.length} unused custom tags`);
    return unusedTags.length;
  } catch (error) {
    console.error('Error cleaning up unused custom tags:', error);
    return 0;
  }
};

// Database cleanup
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};