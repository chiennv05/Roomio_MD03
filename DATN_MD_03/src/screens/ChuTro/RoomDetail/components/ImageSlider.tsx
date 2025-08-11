import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import {Colors} from '../../../../theme/color';
import {responsiveFont} from '../../../../utils/responsive';
import {getImageUrl} from '../../../../configs';

interface ImageSliderProps {
  photos: string[];
}

const {width} = Dimensions.get('window');

const ImageSlider: React.FC<ImageSliderProps> = ({photos}) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const renderImageItem = ({item}: {item: string}) => (
    <View style={styles.imageContainer}>
      <Image
        source={{uri: getImageUrl(item)}}
        style={styles.roomImage}
        resizeMode="cover"
      />
    </View>
  );

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.noImageContainer}>
        <Text style={styles.noImageText}>Không có hình ảnh</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageSliderContainer}>
      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderImageItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
      />

      {/* Dots indicator */}
      {photos.length > 1 && (
        <View style={styles.paginationContainer}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageSliderContainer: {
    width: '100%',
    height: width * 0.7,
    backgroundColor: Colors.lightGray,
  },
  imageContainer: {
    width: width,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.white,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: Colors.textGray,
    fontSize: responsiveFont(16),
  },
});

export default ImageSlider;
