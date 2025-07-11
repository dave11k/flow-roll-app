import { TechniqueCategory } from '@/types/technique';
import { SessionType } from '@/types/session';

// Technique category colors
export const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  'Submission': '#ef4444',
  'Sweep': '#f97316', 
  'Escape': '#eab308',
  'Guard Pass': '#5271ff',
  'Takedown': '#3b82f6',
  'Defense': '#8b5cf6',
  'Other': '#6b7280',
} as const;

// Session type configuration with colors
export const SESSION_TYPES: { type: SessionType; label: string; color: string }[] = [
  { type: 'gi', label: 'Gi', color: '#1e40af' },
  { type: 'nogi', label: 'No-Gi', color: '#dc2626' },
  { type: 'open-mat', label: 'Open Mat', color: '#059669' },
  { type: 'wrestling', label: 'Wrestling', color: '#7c3aed' },
] as const;

// Session type colors as a record for easier lookup
export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  gi: '#1e40af',
  nogi: '#dc2626',
  'open-mat': '#059669',
  wrestling: '#7c3aed',
} as const;

// Session type labels as a record for easier lookup
export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  gi: 'Gi',
  nogi: 'No-Gi',
  'open-mat': 'Open Mat',
  wrestling: 'Wrestling',
} as const;

// Helper functions
export const getCategoryColor = (category: TechniqueCategory): string => {
  return CATEGORY_COLORS[category];
};

export const getSessionTypeColor = (type: SessionType): string => {
  return SESSION_TYPE_COLORS[type];
};

export const getSessionTypeLabel = (type: SessionType): string => {
  return SESSION_TYPE_LABELS[type];
};

// Position color (used in technique components)
export const POSITION_COLOR = '#4b5563';

// Theme colors (extend the basic Colors from common.ts)
export const ThemeColors = {
  // Primary brand color
  primary: '#1e3a2e', // dark green from design system
  primaryAlt: '#5271ff', // blue primary used in UI
  
  // Status colors
  success: '#059669',
  error: '#dc2626', 
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Star rating
  starActive: '#f59e0b',
  starInactive: '#e5e7eb',
  
  // Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6', 
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Backgrounds
  background: '#f8fafc',
  surface: '#ffffff',
  
  // Text
  textPrimary: '#1f2937',
  textSecondary: '#6b7280', 
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  placeholder: '#c1c5d0',
  
  // Borders
  border: '#e5e7eb',
  borderFocus: '#5271ff',
  
  // Button colors
  buttonPrimary: '#5271ff',
  buttonSecondary: '#f3f4f6',
  buttonDanger: '#dc2626',
  buttonSuccess: '#059669',
  
  // Input backgrounds
  inputBackground: '#f9fafb',
  inputBackgroundFocused: '#ffffff',
} as const;

// Export all colors in a single object for convenience
export const Colors = {
  ...ThemeColors,
  categories: CATEGORY_COLORS,
  sessionTypes: SESSION_TYPE_COLORS,
  position: POSITION_COLOR,
} as const;