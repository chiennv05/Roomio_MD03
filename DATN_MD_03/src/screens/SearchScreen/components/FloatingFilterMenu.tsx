import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { 
  responsiveFont, 
  responsiveIcon, 
  responsiveSpacing 
} from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface FilterButtonProps {
  option: {
    id: string;
    label: string;
    icon: string;
  };
  index: number;
  isSelected: boolean;
  animationProgress: Animated.SharedValue<number>;
  onPress: (filterId: string) => void;
  isOpen: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  option,
  index,
  isSelected,
  animationProgress,
  onPress,
  isOpen,
}) => {
  const angle = (index * 90) - 90; // 4 buttons spread in 90 degree arc, starting from top
  const radius = responsiveIcon(80);
  
  const animatedStyle = useAnimatedStyle(() => {
    const progress = animationProgress.value;
    
    const translateX = interpolate(
      progress,
      [0, 1],
      [0, Math.cos((angle * Math.PI) / 180) * radius]
    );
    
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, Math.sin((angle * Math.PI) / 180) * radius]
    );
    
    const scale = interpolate(progress, [0, 0.5, 1], [0, 0.8, 1]);
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.5, 1]);
    
    return {
      transform: [
        { translateX },
        { translateY },
        { scale }
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.filterButtonContainer, animatedStyle]}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected && styles.selectedFilterButton
        ]}
        onPress={() => onPress(option.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: option.icon }}
          style={[
            styles.filterIcon,
            isSelected && styles.selectedFilterIcon
          ]}
        />
      </TouchableOpacity>
      <Text style={styles.filterLabel}>{option.label}</Text>
    </Animated.View>
  );
};

interface FloatingFilterMenuProps {
  onFilterSelect: (filterId: string) => void;
  selectedFilters: string[];
}

const FloatingFilterMenu: React.FC<FloatingFilterMenuProps> = ({
  onFilterSelect,
  selectedFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animationProgress = useSharedValue(0);
  const rotation = useSharedValue(0);

  const filterOptions = [
    {
      id: 'tim-o-ghep',
      label: 'Tìm ở ghép',
      icon: Icons.IconChanGaGoi || '',
    },
    {
      id: 'tim-phong-lan-can',
      label: 'Tìm phòng lân cận',
      icon: Icons.IconLocation || '',
    },
    {
      id: 'van-chuyen',
      label: 'Vận chuyển',
      icon: Icons.IconGuiXe || '',
    },
    {
      id: 'noi-that-gia-re',
      label: 'Nội thất giá rẻ',
      icon: Icons.IconSofa || '',
    },
  ];

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      animationProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      rotation.value = withTiming(45, { duration: 300 });
    } else {
      animationProgress.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      rotation.value = withTiming(0, { duration: 300 });
    }
  };

  const handleFilterPress = (filterId: string) => {
    onFilterSelect(filterId);
  };

  // Main button animation
  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  // Background overlay animation
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationProgress.value, [0, 1], [0, 0.3]),
      pointerEvents: isOpen ? 'auto' : 'none',
    };
  });

  return (
    <View style={styles.container}>
      {/* Background overlay */}
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Filter option buttons */}
      {filterOptions.map((option, index) => (
        <FilterButton
          key={option.id}
          option={option}
          index={index}
          isSelected={selectedFilters.includes(option.id)}
          animationProgress={animationProgress}
          onPress={handleFilterPress}
          isOpen={isOpen}
        />
      ))}

      {/* Main toggle button */}
      <Animated.View style={[styles.mainButton, mainButtonStyle]}>
        <TouchableOpacity
          style={styles.mainButtonTouchable}
          onPress={toggleMenu}
          activeOpacity={0.9}
        >
          {isOpen ? (
            <Text style={styles.closeIcon}>✕</Text>
          ) : (
            <Image
              source={{ uri: Icons.IconSearch }}
              style={styles.mainIcon}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default FloatingFilterMenu;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: responsiveSpacing(100),
    right: responsiveSpacing(20),
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'black',
    zIndex: 1,
  },
  overlayTouchable: {
    flex: 1,
  },
  mainButton: {
    width: responsiveIcon(60),
    height: responsiveIcon(60),
    borderRadius: responsiveIcon(30),
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 3,
  },
  mainButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.white,
  },
  closeIcon: {
    fontSize: responsiveFont(20),
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
  },
  filterButtonContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  filterButton: {
    width: responsiveIcon(50),
    height: responsiveIcon(50),
    borderRadius: responsiveIcon(25),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  selectedFilterButton: {
    backgroundColor: Colors.limeGreen,
  },
  filterIcon: {
    width: responsiveIcon(20),
    height: responsiveIcon(20),
    tintColor: '#666',
  },
  selectedFilterIcon: {
    tintColor: Colors.white,
  },
  filterLabel: {
    marginTop: responsiveSpacing(4),
    fontSize: responsiveFont(10),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: responsiveSpacing(60),
  },
}); 