import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
} from '../../../utils/responsive';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  isSelected: boolean;
}

interface FilterOverlayProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOption[];
  onFilterPress: (filterId: string) => void;
}

const FilterOverlay: React.FC<FilterOverlayProps> = ({
  visible,
  onClose,
  filters,
  onFilterPress,
}) => {
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(0.3, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 120 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      overlayOpacity.value = withTiming(0, { duration: 250 });
      overlayScale.value = withTiming(0.8, { duration: 250 });
    }
  }, [visible, overlayOpacity, overlayScale, backdropOpacity]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      transform: [{ scale: overlayScale.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(0, 0, 0, ${backdropOpacity.value})`,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        console.log('Modal onRequestClose called');
        onClose();
      }}
    >
      <Animated.View style={[styles.modalContainer, backdropStyle]}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => {
            console.log('Modal container tapped - should close');
            onClose();
          }}
          activeOpacity={1}
        >
          <View style={styles.overlay} pointerEvents="box-none">
            <Animated.View style={[styles.container, overlayStyle]} pointerEvents="box-none">
              <View style={styles.filtersGrid}>
                {filters.map((filter, index) => (
                  <FilterChip
                    key={filter.id}
                    filter={filter}
                    index={index}
                    onPress={onFilterPress}
                    visible={visible}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

interface FilterChipProps {
  filter: FilterOption;
  index: number;
  onPress: (filterId: string) => void;
  visible: boolean;
}

const FilterChip: React.FC<FilterChipProps> = ({ filter, index, onPress, visible }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      // Animation khi hiện - staggered từ trái qua phải
      translateY.value = withDelay(
        index * 150,
        withSpring(0, { damping: 15, stiffness: 120 })
      );
      opacity.value = withDelay(
        index * 150,
        withTiming(1, { duration: 400 })
      );
      scale.value = withDelay(
        index * 150,
        withSpring(1, { damping: 15, stiffness: 120 })
      );
    } else {
      // Animation khi ẩn - reverse staggered từ phải qua trái
      const reverseIndex = 3 - index; // Reverse order for 4 items (0,1,2,3 -> 3,2,1,0)
      translateY.value = withDelay(
        reverseIndex * 100,
        withTiming(50, { duration: 250 })
      );
      opacity.value = withDelay(
        reverseIndex * 100,
        withTiming(0, { duration: 250 })
      );
      scale.value = withDelay(
        reverseIndex * 100,
        withTiming(0.7, { duration: 250 })
      );
    }
  }, [visible, index, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.chipWrapper, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          filter.isSelected ? styles.selectedChip : styles.unselectedChip,
        ]}
        onPress={(event) => {
          event.stopPropagation();
          console.log('Filter chip pressed:', filter.id);
          onPress(filter.id);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.chipContent}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: filter.icon }}
              style={styles.chipIcon}
            />
          </View>
          <Text style={[
            styles.chipText,
            filter.isSelected ? styles.selectedChipText : styles.unselectedChipText,
          ]}>
            {filter.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FilterOverlay;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: responsiveSpacing(350),
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsiveSpacing(12),
  },
  chipWrapper: {
    width: '48%',
  },
  filterChip: {
    width: '100%',
    borderRadius: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsiveSpacing(90),
  },
  selectedChip: {
    backgroundColor: Colors.black,
  },
  unselectedChip: {
    backgroundColor: Colors.white,
  },
  chipContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    borderRadius: responsiveIcon(20),
    backgroundColor: Colors.limeGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  chipIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: Colors.white,
  },
  chipText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    textAlign: 'center',
    lineHeight: responsiveFont(16),
  },
  selectedChipText: {
    color: Colors.white,
  },
  unselectedChipText: {
    color: Colors.black,
  },
});
