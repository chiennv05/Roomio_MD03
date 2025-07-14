// components/ModalShowImageContract.tsx
import React, {useState, useRef, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {Icons} from '../../../../assets/icons';
import {Colors} from '../../../../theme/color';
import {
  scale,
  verticalScale,
  responsiveFont,
} from '../../../../utils/responsive';

const {width, height} = Dimensions.get('window');

interface ModalShowImageContractProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ModalShowImageContract: React.FC<ModalShowImageContractProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (visible && flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: initialIndex * width,
        animated: false,
      });
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const renderItem = ({item}: {item: string}) => (
    <View style={styles.imageContainer}>
      <Image source={{uri: item}} style={styles.image} resizeMode="contain" />
    </View>
  );

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) setCurrentIndex(index);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Image
            source={{uri: Icons.IconDelete}}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>

        {/* Image carousel */}
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          onScroll={onScroll}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          onScrollToIndexFailed={({index}) => {
            flatListRef.current?.scrollToOffset({
              offset: index * width,
              animated: false,
            });
          }}
        />

        {/* Indicator */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>

        {/* Optional arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.arrowBtn, styles.leftArrow]}
                onPress={() =>
                  flatListRef.current?.scrollToOffset({
                    offset: (currentIndex - 1) * width,
                    animated: true,
                  })
                }>
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.arrowBtn, styles.rightArrow]}
                onPress={() =>
                  flatListRef.current?.scrollToOffset({
                    offset: (currentIndex + 1) * width,
                    animated: true,
                  })
                }>
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default ModalShowImageContract;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.black + 'dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: verticalScale(40),
    right: scale(20),
    zIndex: 10,
  },
  imageContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: height * 0.75,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    alignSelf: 'center',
    backgroundColor: Colors.black + '80',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  indicatorText: {
    color: '#fff',
    fontSize: verticalScale(14),
  },
  arrowBtn: {
    position: 'absolute',
    top: height / 2 - 20,
    padding: scale(10),
    backgroundColor: Colors.black + '80',
    borderRadius: scale(20),
    zIndex: 10,
  },
  leftArrow: {
    left: scale(20),
  },
  rightArrow: {
    right: scale(20),
  },
  arrowText: {
    color: '#fff',
    fontSize: responsiveFont(24),
  },
});
