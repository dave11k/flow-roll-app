export interface Technique {
  id: string;
  name: string;
  category: TechniqueCategory;
  tags: string[];
  notes?: string;
  links?: TechniqueLink[];
  timestamp: Date;
  sessionId?: string; // Optional reference to the session where this was learned
}

export interface TechniqueLink {
  id: string;
  url: string;
  title?: string;
  timestamp: Date;
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
    'Closed Guard',
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
    'Single Leg X-Guard',
    'North South',
    'Knee on Belly',
    'Turtle',
    '50/50 Guard',
    'S-Mount',
  ],
  // Attribute tags
  ATTRIBUTES: [
    'Gi',
    'NoGi',
    'Wrestling',
    'Self-Defense',
    'MMA',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Transition',
    'High-Risk',
    'Low-Percentage',
    'Berimbolo',
    'Judo',
    'Leg-Lock',
    'Experimental',
  ],
  // Style tags
  STYLES: [
    
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
