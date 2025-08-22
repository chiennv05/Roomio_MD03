import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  Modal,
  Text,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  }, []);

  const handleImagePress = useCallback((index: number) => {
    setImageViewerIndex(index);
    setIsImageViewerVisible(true);
  }, []);

  const handleCloseImageViewer = useCallback(() => {
    setIsImageViewerVisible(false);
  }, []);

  const renderCarouselItem = useCallback(({item, index}: {item: string; index: number}) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => handleImagePress(index)}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.animatedImageWrapper, { transform: [{ scale }], opacity }]}>
          <Image
            source={{ uri: getImageUrl(item) }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Gradient overlay giống RoomCard */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)']}
            style={styles.gradient}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }, [handleImagePress, scrollX]);

  // Chuyển đổi mảng images thành format phù hợp với ImageViewer
  const imageViewerData = images.map(image => ({
    url: getImageUrl(image),
  }));

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={images}
        renderItem={renderCarouselItem}
        keyExtractor={(item, index) => `detail-${index}-${item}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.carousel}
      />

      {/* Progress bars giống RoomCard */}
      {images.length > 1 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBars}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: index === currentIndex
                      ? '#BAFD00'
                      : 'rgba(255, 255, 255, 0.4)',
                  },
                ]}
              />
            ))}
          </View>
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
  carousel: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(20),
    left: responsiveSpacing(40),
    right: responsiveSpacing(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: responsiveSpacing(4),
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
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
  animatedImageWrapper: {
    flex: 1,
  },
});

export default ImageCarousel;
