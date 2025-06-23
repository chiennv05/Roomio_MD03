import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';

interface FilterChip {
  id: string;
  label: string;
  icon: string;
  isSelected?: boolean;
}

// Component cho từng chip riêng biệt
interface AnimatedChipProps {
  filter: FilterChip;
  index: number;
  onPress: (filterId: string) => void;
  isVisible: boolean;
}

const AnimatedChip: React.FC<AnimatedChipProps> = ({ filter, index, onPress, isVisible }) => {
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withDelay(
        index * 100,
        withSpring(0, { damping: 15, stiffness: 150 })
      );
      opacity.value = withDelay(
        index * 100,
        withTiming(1, { duration: 300 })
      );
    } else {
      translateY.value = withTiming(-30, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, index, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.chip,
          filter.isSelected && styles.selectedChip
        ]}
        onPress={() => onPress(filter.id)}
        activeOpacity={0.7}
      >
        <View style={styles.chipContent}>
          <Image 
            source={{ uri: filter.icon }} 
            style={[
              styles.chipIcon,
              filter.isSelected && styles.selectedChipIcon
            ]} 
          />
          <Text style={[
            styles.chipText,
            filter.isSelected && styles.selectedChipText
          ]}>
            {filter.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FilterChipsProps {
  filters: FilterChip[];
  onFilterPress: (filterId: string) => void;
  isVisible: boolean;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onFilterPress, isVisible }) => {
  const containerOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      containerOpacity.value = withTiming(1, { duration: 250 });
      containerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      containerOpacity.value = withTiming(0, { duration: 200 });
      containerScale.value = withTiming(0.9, { duration: 200 });
    }
  }, [isVisible, containerOpacity, containerScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
      transform: [{ scale: containerScale.value }],
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.chipsContainer}>
        {filters.map((filter, index) => (
          <AnimatedChip
            key={filter.id}
            filter={filter}
            index={index}
            onPress={onFilterPress}
            isVisible={isVisible}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default FilterChips;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(16),
    backgroundColor: Colors.backgroud,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
  },
  chip: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedChip: {
    backgroundColor: Colors.limeGreen,
    borderColor: Colors.limeGreen,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    width: responsiveIcon(18),
    height: responsiveIcon(18),
    marginRight: responsiveSpacing(8),
    tintColor: Colors.darkGreen,
  },
  selectedChipIcon: {
    tintColor: Colors.white,
  },
  chipText: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 1,
  },
  selectedChipText: {
    color: Colors.white,
  },
}); 