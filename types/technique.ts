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
  | 'Full Guard'
  | 'Side Control'
  | 'Back'
  | 'Half Guard'
  | 'Standing'
  | 'Open Guard'
  | 'Butterfly Guard'
  | 'De La Riva Guard'
  | 'X-Guard'
  | 'Spider Guard'
  | 'Lasso Guard'
  | 'Reverse De La Riva Guard'
  | 'Deep Half Guard'
  | 'North South'
  | 'Knee on Belly'
  | 'Turtle'
  | '50/50 Guard'
  | 'Leg Entanglement'
  | 'Crucifix'
  | 'Kesa Gatame'
  | 'S-Mount'
  | 'Other';
