import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import ImageViewer from 'react-native-image-zoom-viewer';
import { responsiveSpacing, SCREEN } from '../../../utils/responsive';
import { Colors } from '../../../theme/color';
import { getImageUrl } from '../../../configs';
import { Icons } from '../../../assets/icons';

const SCREEN_WIDTH = SCREEN.width;
const CAROUSEL_HEIGHT = SCREEN_WIDTH * 0.75;

interface ImageCarouselProps {
  images: string[];
}

interface AnimatedImageProps {
  image: string;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: (index: number) => void;
}

const AnimatedImage: React.FC<AnimatedImageProps> = ({ image, index, scrollX, onPress }) => {
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
    <TouchableOpacity 
      style={styles.imageContainer}
      onPress={() => onPress(index)}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.imageWrapper, imageStyle]}>
        <Image
          source={{ uri: getImageUrl(image) }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
    </TouchableOpacity>
  );
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleImagePress = (index: number) => {
    setImageViewerIndex(index);
    setIsImageViewerVisible(true);
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerVisible(false);
  };

  // Chuyển đổi mảng images thành format phù hợp với ImageViewer
  const imageViewerData = images.map(image => ({
    url: getImageUrl(image),
  }));

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
            onPress={handleImagePress}
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

      {/* Image Zoom Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        onRequestClose={handleCloseImageViewer}
      >
        <ImageViewer
          imageUrls={imageViewerData}
          index={imageViewerIndex}
          onSwipeDown={handleCloseImageViewer}
          enableSwipeDown={true}
          enableImageZoom={true}
          doubleClickInterval={250}
          onClick={handleCloseImageViewer}
          backgroundColor="rgba(0,0,0,0.9)"
          onChange={(index?: number) => {
            if (index !== undefined) {
              setImageViewerIndex(index);
            }
          }}
          renderIndicator={(_currentIndex?: number, _allSize?: number) => (
            <View style={styles.zoomIndicatorContainer}>
              <View style={styles.zoomIndicator}>
                <Text style={styles.zoomIndicatorText}>
                  {imageViewerIndex + 1} / {images.length}
                </Text>
              </View>
            </View>
          )}
          renderHeader={() => (
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseImageViewer}
              >
                <Image source={{ uri: Icons.IconRemove }} 
                style={styles.closeButtonIcon} />
              </TouchableOpacity>
            </View>
          )}
        />
      </Modal>
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
  zoomIndicatorContainer: {
    position: 'absolute',
    top: responsiveSpacing(50),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  zoomIndicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
    borderRadius: 20,
  },
  zoomIndicatorText: {
    color: Colors.white,
    fontSize: responsiveSpacing(14),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: responsiveSpacing(50),
    right: responsiveSpacing(20),
    zIndex: 1000,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: responsiveSpacing(40),
    height: responsiveSpacing(40),
    borderRadius: responsiveSpacing(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: responsiveSpacing(20),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonIcon: {
    width: responsiveSpacing(20),
    height: responsiveSpacing(20),
    tintColor: Colors.white,
  },
});

export default ImageCarousel;
