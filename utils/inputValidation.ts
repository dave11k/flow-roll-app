/**
 * Input validation utilities for sanitizing and validating user inputs
 * Provides security against code injection and ensures data quality
 */

// Character limits
export const INPUT_LIMITS = {
  SEARCH: 30,
  NAME: 30,
  TECHNIQUE_NAME: 30,
  SUBMISSION: 50,
  LOCATION: 50,
  URL: 100,
  TAG: 30,
  PROFILE_NAME: 50,
} as const;

// Regex patterns for validation
const PATTERNS = {
  // Alphanumeric with basic punctuation and spaces
  SAFE_TEXT: /^[a-zA-Z0-9\s\-_.,!?'"()]+$/,
  // More restrictive for names (no special punctuation)
  NAME: /^[a-zA-Z0-9\s\-_]+$/,
  // URL validation (basic)
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  // Tag validation (alphanumeric with spaces and hyphens)
  TAG: /^[a-zA-Z0-9\s\-]+$/,
} as const;

/**
 * Sanitize input by removing potentially dangerous characters
 * Prevents XSS and injection attacks
 */
export const sanitizeInput = (input: string): string => {
  // Remove any HTML/script tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>\"'`;\\]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Collapse multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
};

/**
 * Validate technique/session names
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > INPUT_LIMITS.NAME) {
    return { isValid: false, error: `Name must be less than ${INPUT_LIMITS.NAME} characters` };
  }
  
  if (!PATTERNS.NAME.test(sanitized)) {
    return { isValid: false, error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  
  return { isValid: true };
};

/**
 * Validate search input
 */
export const validateSearch = (search: string): { isValid: boolean; sanitized: string } => {
  const sanitized = sanitizeInput(search);
  
  // Search can be empty
  if (!sanitized) {
    return { isValid: true, sanitized: '' };
  }
  
  // Truncate if too long
  const truncated = sanitized.substring(0, INPUT_LIMITS.SEARCH);
  
  return { isValid: true, sanitized: truncated };
};

/**
 * Validate URL input
 */
export const validateURL = (url: string): { isValid: boolean; error?: string } => {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'URL is required' };
  }
  
  if (trimmed.length > INPUT_LIMITS.URL) {
    return { isValid: false, error: `URL must be less than ${INPUT_LIMITS.URL} characters` };
  }
  
  // Basic URL validation
  try {
    // If it doesn't start with http, add it for validation
    const urlToValidate = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    new URL(urlToValidate);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Validate tag input
 */
export const validateTag = (tag: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(tag);
  
  if (!sanitized) {
    return { isValid: false, error: 'Tag is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Tag must be at least 2 characters' };
  }
  
  if (sanitized.length > INPUT_LIMITS.TAG) {
    return { isValid: false, error: `Tag must be less than ${INPUT_LIMITS.TAG} characters` };
  }
  
  if (!PATTERNS.TAG.test(sanitized)) {
    return { isValid: false, error: 'Tag can only contain letters, numbers, spaces, and hyphens' };
  }
  
  return { isValid: true };
};

/**
 * Validate submission name
 */
export const validateSubmission = (submission: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(submission);
  
  if (!sanitized) {
    return { isValid: false, error: 'Submission name is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Submission must be at least 2 characters' };
  }
  
  if (sanitized.length > INPUT_LIMITS.SUBMISSION) {
    return { isValid: false, error: `Submission must be less than ${INPUT_LIMITS.SUBMISSION} characters` };
  }
  
  if (!PATTERNS.SAFE_TEXT.test(sanitized)) {
    return { isValid: false, error: 'Submission contains invalid characters' };
  }
  
  return { isValid: true };
};

/**
 * Validate location input
 */
export const validateLocation = (location: string): { isValid: boolean; sanitized: string } => {
  const sanitized = sanitizeInput(location);
  
  // Location is optional
  if (!sanitized) {
    return { isValid: true, sanitized: '' };
  }
  
  // Truncate if too long
  const truncated = sanitized.substring(0, INPUT_LIMITS.LOCATION);
  
  return { isValid: true, sanitized: truncated };
};

/**
 * Validate profile name
 */
export const validateProfileName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > INPUT_LIMITS.PROFILE_NAME) {
    return { isValid: false, error: `Name must be less than ${INPUT_LIMITS.PROFILE_NAME} characters` };
  }
  
  if (!PATTERNS.SAFE_TEXT.test(sanitized)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  
  return { isValid: true };
};