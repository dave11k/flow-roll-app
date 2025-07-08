export type BeltRank = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface UserProfile {
  name: string;
  beltRank: BeltRank;
  stripes: number; // 0-4 stripes
}

export const BELT_RANKS: { value: BeltRank; label: string; color: string }[] = [
  { value: 'white', label: 'White Belt', color: '#ffffff' },
  { value: 'blue', label: 'Blue Belt', color: '#3b82f6' },
  { value: 'purple', label: 'Purple Belt', color: '#8b5cf6' },
  { value: 'brown', label: 'Brown Belt', color: '#92400e' },
  { value: 'black', label: 'Black Belt', color: '#000000' },
];

export const MAX_STRIPES = 4;