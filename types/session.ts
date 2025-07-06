export interface TrainingSession {
  id: string;
  date: Date;
  location?: string;
  type: 'gi' | 'nogi' | 'open-mat' | 'wrestling';
  submissions: string[]; // Array of technique IDs that were submissions
  notes?: string;
  satisfaction: 1 | 2 | 3 | 4 | 5; // 1-5 star rating
  techniqueIds: string[]; // References to techniques learned in this session
}

export type SessionType = 'gi' | 'nogi' | 'open-mat' | 'wrestling';