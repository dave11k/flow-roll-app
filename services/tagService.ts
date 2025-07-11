import { 
  getAllTagsFromDb, 
  getPopularTagsFromDb, 
  searchTagsFromDb, 
  createCustomTagInDb 
} from './database';
import { TAG_VALIDATION } from '@/types/technique';

// Tag Service - centralized tag management
export class TagService {
  // Get all available tags
  static async getAllTags(): Promise<{ name: string; category: string; usageCount: number; isCustom: boolean }[]> {
    try {
      return await getAllTagsFromDb();
    } catch (error) {
      console.error('Error fetching all tags:', error);
      return [];
    }
  }

  // Get popular tags based on usage
  static async getPopularTags(limit: number = 20): Promise<string[]> {
    try {
      return await getPopularTagsFromDb(limit);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      return [];
    }
  }

  // Search tags by name
  static async searchTags(query: string, limit: number = 10): Promise<string[]> {
    try {
      if (!query.trim()) return [];
      return await searchTagsFromDb(query.trim(), limit);
    } catch (error) {
      console.error('Error searching tags:', error);
      return [];
    }
  }

  // Create a new custom tag
  static async createCustomTag(tagName: string): Promise<boolean> {
    try {
      const trimmed = tagName.trim();
      
      // Validate tag name
      if (!this.isValidTagName(trimmed)) {
        throw new Error('Invalid tag name');
      }

      await createCustomTagInDb(trimmed);
      return true;
    } catch (error) {
      console.error('Error creating custom tag:', error);
      return false;
    }
  }

  // Validate tag name
  static isValidTagName(tagName: string): boolean {
    const trimmed = tagName.trim();
    return (
      trimmed.length >= TAG_VALIDATION.MIN_TAG_NAME_LENGTH &&
      trimmed.length <= TAG_VALIDATION.MAX_TAG_NAME_LENGTH &&
      /^[a-zA-Z0-9\s\-]+$/.test(trimmed) // Only alphanumeric, spaces, and hyphens
    );
  }

  // Validate tag selection
  static isValidTagSelection(tags: string[]): { isValid: boolean; error?: string } {
    if (tags.length > TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE) {
      return {
        isValid: false,
        error: `Maximum ${TAG_VALIDATION.MAX_TAGS_PER_TECHNIQUE} tags allowed`
      };
    }

    // Check for duplicates
    const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
    if (uniqueTags.size !== tags.length) {
      return {
        isValid: false,
        error: 'Duplicate tags are not allowed'
      };
    }

    // Validate each tag name
    for (const tag of tags) {
      if (!this.isValidTagName(tag)) {
        return {
          isValid: false,
          error: `Invalid tag: "${tag}"`
        };
      }
    }

    return { isValid: true };
  }

  // Get suggested tags based on category
  static getSuggestedTagsForCategory(category: string): string[] {
    const suggestions: Record<string, string[]> = {
      'Submission': ['Choke', 'Joint-Lock', 'Arm-Bar', 'Triangle', 'Rear-Naked-Choke'],
      'Sweep': ['Hook-Sweep', 'Scissor-Sweep', 'Butterfly-Sweep', 'Hip-Bump'],
      'Escape': ['Hip-Escape', 'Bridge', 'Frame', 'Roll'],
      'Guard Pass': ['Pressure-Pass', 'Standing-Pass', 'Speed-Pass', 'Smash-Pass'],
      'Takedown': ['Single-Leg', 'Double-Leg', 'Hip-Toss', 'Foot-Sweep'],
      'Defense': ['Frame', 'Hand-Fighting', 'Posture', 'Base'],
    };

    return suggestions[category] || [];
  }
}

export default TagService;