/**
 * Predefined submission suggestions for BJJ sessions
 * This ensures consistent naming and prevents duplicate entries
 * with different spellings or variations
 */

export const SUBMISSION_SUGGESTIONS = [
  // Chokes
  'Rear Naked Choke',
  'Triangle Choke',
  'Guillotine Choke',
  'D\'Arce Choke',
  'Anaconda Choke',
  'Arm Triangle',
  'Baseball Choke',
  'Bow and Arrow Choke',
  'Ezekiel Choke',
  'North South Choke',
  'Paper Cutter Choke',
  'Peruvian Necktie',
  'Von Flue Choke',
  'Gogoplata',
  'Loop Choke',
  'Cross Collar Choke',
  'Lapel Choke',

  // Arm Attacks
  'Armbar',
  'Americana',
  'Kimura',
  'Omoplata',
  'Shoulder Lock',
  'Wrist Lock',
  'Bicep Slicer',
  'Arm Crush',

  // Leg Attacks
  'Heel Hook',
  'Ankle Lock',
  'Knee Bar',
  'Toe Hold',
  'Calf Slicer',
  'Achilles Lock',
  'Estima Lock',
  'Banana Split',
  'Electric Chair',

  // Spinal Attacks
  'Twister',
  'Can Opener',
  'Neck Crank',

  // Common Variations/Combinations
  'Flying Armbar',
  'Rolling Kneebar',
  'Inverted Triangle',
  'Reverse Triangle',
  'Mounted Triangle',
];

/**
 * Search for submission suggestions based on input
 * @param query - The search term
 * @param limit - Maximum number of results to return
 * @returns Array of matching submission suggestions
 */
export function searchSubmissionSuggestions(query: string, limit: number = 10): string[] {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = query.toLowerCase();
  const matches = SUBMISSION_SUGGESTIONS.filter(submission =>
    submission.toLowerCase().includes(searchTerm)
  );

  return matches.slice(0, limit);
}

/**
 * Check if a submission is valid (exists in our predefined list)
 * @param submission - The submission to validate
 * @returns True if the submission exists in our list
 */
export function isValidSubmission(submission: string): boolean {
  return SUBMISSION_SUGGESTIONS.includes(submission);
}

/**
 * Get all available submission suggestions
 * @returns Complete array of submission suggestions
 */
export function getAllSubmissionSuggestions(): string[] {
  return [...SUBMISSION_SUGGESTIONS];
}