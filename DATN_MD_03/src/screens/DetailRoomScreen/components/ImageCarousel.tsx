import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { responsiveSpacing, SCREEN } from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { getImageUrl } from '../../../configs';

const SCREEN_WIDTH = SCREEN.width;
const CAROUSEL_HEIGHT = SCREEN_WIDTH * 0.75;

interface ImageCarouselProps {
  images: string[];
}

interface AnimatedImageProps {
  image: string;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({ image, index, scrollX }) => {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      'clamp'
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      'clamp'
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']
    );

    return {
      backgroundColor,
    };
  });

  return (
    <View style={styles.imageContainer}>
      <Animated.View style={[styles.imageWrapper, imageStyle]}>
        <Image
          source={{ uri: getImageUrl(image) }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
    </View>
  );
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((image, index) => (
          <AnimatedImage
            key={`${index}-${image}`}
            image={image}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* Indicators */}
      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(20),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(186, 253, 0, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.limeGreen,
    width: 24,
  },
});

export default ImageCarousel;
