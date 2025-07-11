import { StyleSheet } from 'react-native';

// Common color constants
export const Colors = {
  // Background colors
  background: '#f8fafc',
  white: '#ffffff',
  
  // Gray scale
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
  
  // Primary colors
  primary: '#5271ff',
  primaryDark: '#4f46e5',
  
  // Status colors
  success: '#059669',
  error: '#dc2626',
  warning: '#f59e0b',
  
  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  placeholder: '#c1c5d0',
  
  // Border colors
  border: '#e5e7eb',
  borderFocus: '#5271ff',
} as const;

// Common spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Common border radius values
export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
} as const;

// Common shadow styles
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// Common reusable styles
export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  
  // Card styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  
  cardSmall: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.small,
  },
  
  // Modal styles
  modal: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.modal,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  
  modalContent: {
    flex: 1,
  },
  
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    gap: Spacing.md,
  },
  
  // Section styles
  section: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  sectionSmall: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  
  // Input styles
  inputContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  inputContainerFocused: {
    borderColor: Colors.borderFocus,
    backgroundColor: Colors.white,
  },
  
  textInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    padding: 0, // Remove default padding
  },
  
  // Button styles
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.gray100,
  },
  
  buttonDanger: {
    backgroundColor: Colors.error,
  },
  
  // Text styles
  titleLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  
  titleMedium: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  
  body: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  
  bodySmall: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Common gaps
  gapXs: { gap: Spacing.xs },
  gapSm: { gap: Spacing.sm },
  gapMd: { gap: Spacing.md },
  gapLg: { gap: Spacing.lg },
  gapXl: { gap: Spacing.xl },
  
  // Common margins
  marginTopSm: { marginTop: Spacing.sm },
  marginTopMd: { marginTop: Spacing.md },
  marginTopLg: { marginTop: Spacing.lg },
  marginBottomSm: { marginBottom: Spacing.sm },
  marginBottomMd: { marginBottom: Spacing.md },
  marginBottomLg: { marginBottom: Spacing.lg },
  
  // Common paddings
  paddingHorizontalSm: { paddingHorizontal: Spacing.sm },
  paddingHorizontalMd: { paddingHorizontal: Spacing.md },
  paddingHorizontalLg: { paddingHorizontal: Spacing.lg },
  paddingVerticalSm: { paddingVertical: Spacing.sm },
  paddingVerticalMd: { paddingVertical: Spacing.md },
  paddingVerticalLg: { paddingVertical: Spacing.lg },
  
  // Search and filter common styles
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    padding: 0,
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl * 2,
    paddingBottom: 100,
    marginTop: 60,
  },
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  
  emptyStateDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// Helper function to combine styles safely
export function combineStyles(...styles: any[]) {
  return StyleSheet.flatten(styles.filter(Boolean));
}