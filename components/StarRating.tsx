import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Star } from 'lucide-react-native';
import { ThemeColors } from '@/constants/colors';

export type StarRatingMode = 'display' | 'input' | 'filter';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  mode: StarRatingMode;
  size?: number;
  onRatingPress?: (rating: number) => void;
  style?: any;
  showLabel?: boolean;
  labelSuffix?: string;
  starStyle?: 'icon' | 'text';
}

export default function StarRating({
  rating,
  maxRating = 5,
  mode,
  size = 24,
  onRatingPress,
  style,
  showLabel = false,
  labelSuffix = '',
  starStyle = 'icon',
}: StarRatingProps) {
  
  const handleStarPress = (selectedRating: number) => {
    if (mode === 'display') return;
    
    if (mode === 'input') {
      onRatingPress?.(selectedRating);
    } else if (mode === 'filter') {
      // For filter mode, toggle the rating (select if different, deselect if same)
      const newRating = rating === selectedRating ? 0 : selectedRating;
      onRatingPress?.(newRating);
    }
  };

  const getStarColor = (index: number): string => {
    const isActive = index < rating;
    return isActive ? ThemeColors.starActive : ThemeColors.starInactive;
  };

  const getStarFill = (index: number): string => {
    const isActive = index < rating;
    return isActive ? ThemeColors.starActive : 'transparent';
  };

  const isInteractive = mode !== 'display';

  const renderStar = (index: number) => {
    
    if (starStyle === 'text') {
      return (
        <Text 
          key={index} 
          style={[
            styles.textStar, 
            { 
              color: getStarColor(index),
              fontSize: size,
            }
          ]}
        >
          ★
        </Text>
      );
    }

    return (
      <Star
        key={index}
        size={size}
        color={getStarColor(index)}
        fill={getStarFill(index)}
      />
    );
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const starNumber = index + 1;
      
      if (isInteractive) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(starNumber)}
            style={[
              styles.starButton,
              mode === 'input' && { padding: 4 },
              mode === 'filter' && { padding: 4 },
            ]}
            activeOpacity={0.7}
          >
            {renderStar(index)}
          </TouchableOpacity>
        );
      }

      return renderStar(index);
    });
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.starsContainer,
        mode === 'filter' && styles.filterStarsContainer,
      ]}>
        {renderStars()}
      </View>
      
      {showLabel && rating > 0 && (
        <Text style={styles.ratingLabel}>
          {rating}{labelSuffix}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  filterStarsContainer: {
    justifyContent: 'center',
    gap: 8,
  },
  
  starButton: {
    // Minimum touch target size for accessibility
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  textStar: {
    lineHeight: undefined, // Let the font determine line height
  },
  
  ratingLabel: {
    fontSize: 14,
    color: ThemeColors.textSecondary,
    marginTop: 4,
  },
});

// Helper function to create a display-only star rating
export function DisplayStarRating(props: Omit<StarRatingProps, 'mode' | 'onRatingPress'>) {
  return <StarRating {...props} mode="display" />;
}

// Helper function to create an input star rating
export function InputStarRating(props: Omit<StarRatingProps, 'mode'>) {
  return <StarRating {...props} mode="input" />;
}

// Helper function to create a filter star rating
export function FilterStarRating(props: Omit<StarRatingProps, 'mode'>) {
  return <StarRating {...props} mode="filter" />;
}