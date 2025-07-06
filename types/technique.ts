export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  position: TechniquePosition;
  notes?: string;
  timestamp: Date;
  sessionId?: string; // Optional reference to the session where this was learned
}

export type TechniqueCategory = 
  | 'Submission'
  | 'Sweep'
  | 'Escape'
  | 'Guard Pass'
  | 'Takedown'
  | 'Defense'
  | 'Other';

export type TechniquePosition = 
  | 'Mount'
  | 'Guard'
  | 'Side Control'
  | 'Back'
  | 'Half Guard'
  | 'Standing'
  | 'Other';
