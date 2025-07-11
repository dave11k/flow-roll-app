/**
 * Centralized date formatting utilities
 * Consolidates all date formatting logic used throughout the app
 */

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Helper function to get relative day names
function getRelativeDayName(date: Date): string | null {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  
  return null;
}

/**
 * Format date in MM/DD/YYYY format (used in date pickers)
 */
export function formatDatePicker(date: Date | null): string {
  if (!date) return '';
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format date for session cards (e.g., "Mon, Jan 15")
 */
export function formatSessionCardDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for detail views (e.g., "Monday, January 15, 2024")
 */
export function formatDetailDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with relative names when applicable (e.g., "Today", "Yesterday", or "Monday, January 15")
 */
export function formatRelativeDate(date: Date): string {
  const relativeName = getRelativeDayName(date);
  if (relativeName) return relativeName;
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for modal headers with relative names (e.g., "Today", "Yesterday", or full format)
 */
export function formatModalHeaderDate(date: Date): string {
  const relativeName = getRelativeDayName(date);
  if (relativeName) return relativeName;
  
  return formatDetailDate(date);
}

/**
 * Format time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Format date and time together (e.g., "Monday, January 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date): string {
  const dateStr = formatDetailDate(date);
  const timeStr = formatTime(date);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Format date for technique items (e.g., "Jan 15, 2024 2:30 PM")
 */
export function formatTechniqueItemDate(date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = formatTime(date);
  return `${dateStr} ${timeStr}`;
}

/**
 * Format date for technique detail view with relative names
 */
export function formatTechniqueDetailDate(date: Date): string {
  const relativeName = getRelativeDayName(date);
  if (relativeName) {
    const timeStr = formatTime(date);
    return `${relativeName} at ${timeStr}`;
  }
  
  return formatDateTime(date);
}

/**
 * Format date range for filters (e.g., "Jan 15 - Jan 20, 2024")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();
  
  if (sameMonth) {
    const month = startDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = startDate.getFullYear();
    return `${month} ${startDay} - ${endDay}, ${year}`;
  } else if (sameYear) {
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = startDate.getFullYear();
    return `${startStr} - ${endStr}, ${year}`;
  } else {
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }
}

/**
 * Format a single date for compact display (e.g., "Jan 15")
 */
export function formatCompactDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get a user-friendly relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  // For longer periods, return formatted date
  return formatCompactDate(date);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is within the last 7 days
 */
export function isWithinLastWeek(date: Date): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return date >= oneWeekAgo;
}

/**
 * Get the start of day for a given date
 */
export function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

/**
 * Get the end of day for a given date
 */
export function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}