import { TechniqueCategory } from '@/types/technique';

// Interface for technique suggestions with categories
export interface TechniqueSuggestion {
  name: string;
  category: TechniqueCategory;
}

// BJJ Technique suggestions for autocomplete
export const TECHNIQUE_SUGGESTIONS: TechniqueSuggestion[] = [
  // Most common submissions first
  { name: 'Armbar', category: 'Submission' },
  { name: 'Triangle Choke', category: 'Submission' },
  { name: 'Rear Naked Choke', category: 'Submission' },
  { name: 'Kimura', category: 'Submission' },
  { name: 'Guillotine Choke', category: 'Submission' },
  { name: 'Americana', category: 'Submission' },
  { name: 'Omoplata', category: 'Submission' },
  { name: 'Ezekiel Choke', category: 'Submission' },
  { name: 'D\'Arce Choke', category: 'Submission' },
  { name: 'Anaconda Choke', category: 'Submission' },
  { name: 'Arm Triangle Choke', category: 'Submission' },
  { name: 'Gogoplata', category: 'Submission' },
  { name: 'North South Choke', category: 'Submission' },
  { name: 'Bow and Arrow Choke', category: 'Submission' },
  { name: 'Inverted Triangle', category: 'Submission' },
  
  // Common sweeps
  { name: 'Scissor Sweep', category: 'Sweep' },
  { name: 'Butterfly Sweep', category: 'Sweep' },
  { name: 'Flower Sweep', category: 'Sweep' },
  { name: 'Hip Bump Sweep', category: 'Sweep' },
  { name: 'Pendulum Sweep', category: 'Sweep' },
  { name: 'X-Guard Sweep', category: 'Sweep' },
  { name: 'Balloon Sweep', category: 'Sweep' },
  { name: 'Hook Sweep', category: 'Sweep' },
  { name: 'Arm Drag Sweep', category: 'Sweep' },
  { name: 'Tripod Sweep', category: 'Sweep' },
  { name: 'Elevator Sweep', category: 'Sweep' },
  { name: 'Kimura Sweep', category: 'Sweep' },
  
  // Common escapes
  { name: 'Hip Escape', category: 'Escape' },
  { name: 'Mount Escape', category: 'Escape' },
  { name: 'Side Control Escape', category: 'Escape' },
  { name: 'Back Escape', category: 'Escape' },
  { name: 'Half Guard Escape', category: 'Escape' },
  { name: 'Guard Escape', category: 'Escape' },
  { name: 'Knee on Belly Escape', category: 'Escape' },
  { name: 'Triangle Choke Escape', category: 'Escape' },
  { name: 'Armbar Escape', category: 'Escape' },
  { name: 'Kimura Escape', category: 'Escape' },
  
  // Common guard passes
  { name: 'Knee Slice Pass', category: 'Guard Pass' },
  { name: 'Stack Pass', category: 'Guard Pass' },
  { name: 'Over Under Pass', category: 'Guard Pass' },
  { name: 'Double Under Pass', category: 'Guard Pass' },
  { name: 'Leg Drag Pass', category: 'Guard Pass' },
  { name: 'Toreando Pass', category: 'Guard Pass' },
  { name: 'Smash Pass', category: 'Guard Pass' },
  { name: 'Long Step Pass', category: 'Guard Pass' },
  { name: 'Knee Cut Pass', category: 'Guard Pass' },
  { name: 'X-Pass', category: 'Guard Pass' },
  { name: 'Bullfighter Pass', category: 'Guard Pass' },
  
  // Common takedowns
  { name: 'Double Leg Takedown', category: 'Takedown' },
  { name: 'Single Leg Takedown', category: 'Takedown' },
  { name: 'Ankle Pick', category: 'Takedown' },
  { name: 'Body Lock Takedown', category: 'Takedown' },
  { name: 'Arm Drag Takedown', category: 'Takedown' },
  { name: 'Snap Down', category: 'Takedown' },
  { name: 'Hip Throw', category: 'Takedown' },
  { name: 'Foot Sweep', category: 'Takedown' },
  { name: 'Outside Leg Trip', category: 'Takedown' },
  { name: 'Inside Leg Trip', category: 'Takedown' },
  
];

// Helper function to determine category for advanced techniques
function determineCategory(name: string): TechniqueCategory {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('choke') || lowerName.includes('necktie') || lowerName.includes('crank') || 
      lowerName.includes('slicer') || lowerName.includes('lock') || lowerName.includes('hook') ||
      lowerName.includes('bar') || lowerName.includes('hold') || lowerName.includes('twister') ||
      lowerName.includes('jime') || lowerName.includes('garami') || lowerName.includes('triangle')) {
    return 'Submission';
  }
  if (lowerName.includes('sweep')) {
    return 'Sweep';
  }
  if (lowerName.includes('escape')) {
    return 'Escape';
  }
  if (lowerName.includes('pass') || lowerName.includes('break')) {
    return 'Guard Pass';
  }
  if (lowerName.includes('defense')) {
    return 'Defense';
  }
  if (lowerName.includes('takedown') || lowerName.includes('throw') || lowerName.includes('goshi') ||
      lowerName.includes('gari') || lowerName.includes('nage') || lowerName.includes('otoshi') ||
      lowerName.includes('guruma') || lowerName.includes('makikomi') || lowerName.includes('gake')) {
    return 'Takedown';
  }
  
  return 'Other';
}

// Advanced techniques (less common but still important)
const advancedTechniques: TechniqueSuggestion[] = [
  'Berimbolo',
  
  'Collar Choke',
  'Sleeve Choke',
  'Lapel Choke',
  'Cross Collar Choke',
  'Loop Choke',
  'Paper Cutter Choke',
  'Baseball Bat Choke',
  'Peruvian Necktie',
  'Japanese Necktie',
  'Calf Slicer',
  'Bicep Slicer',
  'Wrist Lock',
  'Heel Hook',
  'Straight Ankle Lock',
  'Kneebar',
  'Toe Hold',
  'Leg Lace',
  'Twister',
  'Electric Chair',
  'Crucifix Choke',
  'Crucifix Armbar',
  'Von Flue Choke',
  'Brabo Choke',
  'Clock Choke',
  'Bolo Choke',
  'Can Opener',
  'Neck Crank',
  'Inverted Heel Hook',
  'Straight Leg Lock',
  'Reverse Triangle',
  'Leg Lasso Sweep',
  'Spider Guard Sweep',
  'De La Riva Sweep',
  'Reverse De La Riva Sweep',
  'Single Leg X-Guard Sweep',
  'Double Leg X-Guard Sweep',
  'Deep Half Guard Sweep',
  'Knee Shield Half Guard Sweep',
  'Underhook Half Guard Sweep',
  'Dogfight Sweep',
  'Roll-Over Sweep',
  '50/50 Guard Sweep',
  'Leg Drag Sweep',
  'Overhead Sweep',
  'Tomoe Nage',
  'Sleeve and Collar Sweep',
  'Sit Up Sweep',
  'Rolling Back Take',
  'Kiss of the Dragon',
  'Lumberjack Sweep',
  'Matrix Sweep',
  'Shin-to-Shin Sweep',
  'Ankle Pick Sweep',
  'Collar Drag Sweep',
  'Lapel Sweep',
  'Guard Recovery Sweep',
  'Tani Otoshi Sweep',
  'Sasae Tsuri Komi Ashi Sweep',
  'Okuri Ashi Harai Sweep',
  'Ko Uchi Gari Sweep',
  'Deashi Harai Sweep',
  'Yoko Tomoe Nage',
  'Sumo Sweep',
  'Guard Pull Sweep',
  'Rolling Kneebar Sweep',
  'Rolling Toe Hold Sweep',
  'Rolling Heel Hook Sweep',
  'Rolling Straight Ankle Lock Sweep',
  'North South Escape',
  'Turtle Escape',
  'Rear Naked Choke Escape',
  'Guillotine Escape',
  'Leg Lock Escape',
  '50/50 Guard Escape',
  'Crucifix Escape',
  'Truck Escape',
  'Kesa Gatame Escape',
  'S-Mount Escape',
  'Mounted Triangle Escape',
  'Mounted Armbar Escape',
  'Mounted Kimura Escape',
  'Mounted Americana Escape',
  'Mounted Ezekiel Escape',
  'Back Mount Escape',
  'Closed Guard Escape',
  'Open Guard Escape',
  'De La Riva Guard Escape',
  'X-Guard Escape',
  'Spider Guard Escape',
  'Lasso Guard Escape',
  'Reverse De La Riva Guard Escape',
  'Deep Half Guard Escape',
  'Headquarters Pass',
  'Weave Pass',
  'Leg Weave Pass',
  'Folding Pass',
  'Back Step Pass',
  'Overhook Pass',
  'Underhook Pass',
  'Darce Pass',
  'Kimura Pass',
  'Arm Triangle Pass',
  'Double Underhook Half Guard Pass',
  'Single Underhook Half Guard Pass',
  'Knee on Belly Pass',
  'North South Pass',
  'Pressure Pass',
  'Combat Base Pass',
  'Spider Guard Pass',
  'Lasso Guard Pass',
  'De La Riva Guard Pass',
  'Reverse De La Riva Guard Pass',
  'X-Guard Pass',
  'Deep Half Guard Pass',
  '50/50 Guard Pass',
  'Closed Guard Break',
  'Butterfly Guard Pass',
  'Open Guard Pass',
  'Guillotine Takedown',
  'Harai Goshi',
  'Uchi Mata',
  'Seoi Nage',
  'Tani Otoshi',
  'Sasae Tsuri Komi Ashi',
  'Okuri Ashi Harai',
  'Ko Uchi Gari',
  'Kouchi Gake',
  'Ippon Seoi Nage',
  'Koshi Guruma',
  'Uki Goshi',
  'Hane Goshi',
  'Sumi Gaeshi',
  'Tomo Nage',
  'Kata Guruma',
  'Morote Gari',
  'Soto Makikomi',
  'Uchi Makikomi',
  'Ouchi Gake',
  'Ko Soto Gari',
  'Ko Soto Gake',
  'Tsuri Komi Goshi',
  'Sode Tsuri Komi Goshi',
  'Okuri Eri Jime',
  'Hadaka Jime',
  'Kata Ha Jime',
  'Gyaku Juji Jime',
  'Nami Juji Jime',
  'Kata Juji Jime',
  'Ude Garami',
  'Ashi Garami',
  'Hiza Garami',
  'Ashi Jime',
  'Kani Basami',
  'Flying Armbar',
  'Flying Triangle',
  'Flying Guillotine',
  'Guard Pull',
  'Pulling Guard',
  'Posture Defense',
  'Crossface Defense',
  'Underhook Defense',
  'Frame Defense',
  'Hand Trap Defense',
  'Guard Retention',
  'Submission Defense',
  'Takedown Defense',
  'Sweep Defense',
  'Choke Defense',
  'Arm Attack Defense',
  'Leg Attack Defense',
  'Guard Pass Defense',
].map(name => ({ name, category: determineCategory(name) }));

// Combine all techniques
TECHNIQUE_SUGGESTIONS.push(...advancedTechniques);

/**
 * Search technique suggestions based on user input
 * @param query - The search query string
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Array of matching technique suggestions with categories
 */
export const searchTechniqueSuggestions = (query: string, maxResults: number = 5): TechniqueSuggestion[] => {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Find exact matches and partial matches
  const matches = TECHNIQUE_SUGGESTIONS.filter(technique => 
    technique.name.toLowerCase().includes(normalizedQuery)
  );
  
  // Sort by relevance (exact start matches first, then contains matches)
  const sortedMatches = matches.sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const bLower = b.name.toLowerCase();
    
    // Exact start matches get priority
    const aStartsWithQuery = aLower.startsWith(normalizedQuery);
    const bStartsWithQuery = bLower.startsWith(normalizedQuery);
    
    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;
    
    // Then sort by position in the original array (most common first)
    return TECHNIQUE_SUGGESTIONS.indexOf(a) - TECHNIQUE_SUGGESTIONS.indexOf(b);
  });
  
  return sortedMatches.slice(0, maxResults);
};