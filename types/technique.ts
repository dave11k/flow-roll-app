export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  tags: string[];
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

// Available predefined tags
export const PREDEFINED_TAGS = {
  // Position tags (from existing positions)
  POSITIONS: [
    'Mount',
    'Full Guard',
    'Side Control',
    'Back',
    'Half Guard',
    'Standing',
    'Open Guard',
    'Butterfly Guard',
    'De La Riva Guard',
    'X-Guard',
    'Spider Guard',
    'Lasso Guard',
    'Reverse De La Riva Guard',
    'Deep Half Guard',
    'North South',
    'Knee on Belly',
    'Turtle',
    '50/50 Guard',
    'Leg Entanglement',
    'Crucifix',
    'Kesa Gatame',
    'S-Mount',
  ],
  // Attribute tags
  ATTRIBUTES: [
    'Gi',
    'NoGi',
    'Both',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Competition',
    'Wrestling',
    'Self-Defense',
    'MMA',
    'Sport-BJJ',
    'Standing',
    'Ground',
    'Transition',
    'Basic',
    'Complex',
    'High-Risk',
    'Low-Percentage',
  ],
  // Style tags
  STYLES: [
    'Traditional',
    'Modern',
    'Berimbolo',
    'Judo',
    'Leg-Locks',
    'Pressure',
    'Flow',
    'Fundamentals',
    'Experimental',
  ],
} as const;

// Type for tag categories
export type TagCategory = 'position' | 'attribute' | 'style' | 'custom';

// Interface for tag with metadata
export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  usageCount: number;
  createdAt: Date;
  isCustom: boolean;
}

// Helper type for all predefined tags
export type PredefinedTag = 
  | typeof PREDEFINED_TAGS.POSITIONS[number]
  | typeof PREDEFINED_TAGS.ATTRIBUTES[number]
  | typeof PREDEFINED_TAGS.STYLES[number];

// Validation constants
export const TAG_VALIDATION = {
  MAX_TAGS_PER_TECHNIQUE: 10,
  MAX_TAG_NAME_LENGTH: 25,
  MIN_TAG_NAME_LENGTH: 2,
} as const;
