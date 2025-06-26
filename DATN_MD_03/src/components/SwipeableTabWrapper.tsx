import React from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/color';
import { Fonts } from '../theme/fonts';
import { responsiveFont, responsiveSpacing } from '../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width

interface SwipeableTabWrapperProps {
  children: React.ReactNode;
  currentTab: 'Search' | 'Favorite';
}

const SwipeableTabWrapper: React.FC<SwipeableTabWrapperProps> = ({ 
  children, 
  currentTab 
}) => {
  const navigation = useNavigation();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const navigateToTab = (tabName: string) => {
    (navigation as any).navigate(tabName);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;
      
      // Reset scale
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      
      // Determine if swipe is significant enough
      const shouldChangeTab = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;
      
      if (shouldChangeTab) {
        if (currentTab === 'Search' && translationX < 0) {
          // Swipe left from Search to Favorite
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
            runOnJS(navigateToTab)('Favorite');
            translateX.value = 0;
          });
        } else if (currentTab === 'Favorite' && translationX > 0) {
          // Swipe right from Favorite to Search
          translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => {
            runOnJS(navigateToTab)('Search');
            translateX.value = 0;
          });
        } else {
          // Return to original position
          translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
        }
      } else {
        // Return to original position
        translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  // Animated style for swipe indicators
  const leftIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          {children}
        </Animated.View>
      </PanGestureHandler>
      
      {/* Swipe Indicators */}
      {currentTab === 'Search' && (
        <Animated.View style={[styles.swipeIndicator, styles.rightIndicator, rightIndicatorStyle]}>
          <Text style={styles.indicatorText}>← Swipe để xem Yêu thích</Text>
        </Animated.View>
      )}
      
      {currentTab === 'Favorite' && (
        <Animated.View style={[styles.swipeIndicator, styles.leftIndicator, leftIndicatorStyle]}>
          <Text style={styles.indicatorText}>Swipe để xem Tìm kiếm →</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default SwipeableTabWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    borderRadius: responsiveSpacing(20),
    zIndex: 1000,
  },
  leftIndicator: {
    left: responsiveSpacing(20),
  },
  rightIndicator: {
    right: responsiveSpacing(20),
  },
  indicatorText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
  },
}); 