import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {Room} from '../../../../types/Room';
import {
  SCREEN,
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../../utils/responsive';
import {getImageUrl} from '../../../../configs';
import {Icons} from '../../../../assets/icons';
import {getStatusInfo} from '../constants/getStatusInfo';

interface RoomCardProps {
  item: Room;
  onPress: (roomId: string) => void;
  index: number;
}

const ItemRoom: React.FC<RoomCardProps> = ({item, onPress, index}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = item.photos?.map(photo => getImageUrl(photo)) || [];
  const status = getStatusInfo(item.status || '', item.approvalStatus || '');

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = SCREEN.width - responsiveSpacing(32);
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(newIndex);
  };

  const handleCardPress = () => {
    if (item._id) {
      onPress(item._id);
    } else {
      console.warn('Room ID is undefined, cannot navigate');
    }
  };

  return (
    <View style={{marginTop: index === 0 ? responsiveSpacing(15) : 0}}>
      <View style={[styles.containerStatus, {backgroundColor: status.color}]}>
        <Text style={[styles.textStatus, {color: status.textColor}]}>
          {status.label}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={handleCardPress}
        activeOpacity={0.8}>
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            {images.map((imageUri: string, idx: number) => (
              <View key={idx} style={styles.carouselItemContainer}>
                <Image source={{uri: imageUri}} style={styles.carouselImage} />
              </View>
            ))}
          </ScrollView>

          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              {item.rentPrice?.toLocaleString('vi-VN')}/ tháng
            </Text>
          </View>

          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    currentImageIndex === idx && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>

          <View style={styles.detailContainer}>
            <Image source={{uri: Icons.IconLocationGray}} style={styles.icon} />
            <Text style={styles.detail}>Số phòng: {item.roomNumber}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Image source={{uri: Icons.IconLocationGray}} style={styles.icon} />
            <Text
              style={[styles.detail, {width: SCREEN.width * 0.8}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.location.addressText}
            </Text>
          </View>
          <View style={styles.containerViewAndArea}>
            <View style={styles.detailContainer}>
              <Image source={{uri: Icons.IconUnion}} style={styles.icon} />
              <Text style={styles.detail}>{item.area} m²</Text>
            </View>
            <View style={styles.detailContainer}>
              <Image source={{uri: Icons.IconViewLight}} style={styles.icon} />
              <Text style={styles.detail}>
                {item.stats?.viewCount} Lượt xem
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ItemRoom);
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    marginBottom: responsiveSpacing(20),
    marginHorizontal: responsiveSpacing(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    marginTop: 10,
  },
  carouselContainer: {
    position: 'relative',
    paddingTop: responsiveSpacing(12),
    paddingBottom: responsiveSpacing(1),
  },
  carouselItemContainer: {
    width: SCREEN.width - responsiveSpacing(32),
    height: (SCREEN.width - responsiveSpacing(32)) * 0.65,
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: moderateScale(16),
    backgroundColor: Colors.lightGray,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: responsiveSpacing(36),
    left: responsiveSpacing(20),
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    borderRadius: moderateScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  priceOverlayText: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    fontWeight: 'bold',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(14),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: responsiveSpacing(3),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  activeDot: {
    backgroundColor: Colors.limeGreen,
    width: moderateScale(28),
    borderRadius: moderateScale(4),
    borderColor: Colors.limeGreen,
  },
  info: {
    padding: responsiveSpacing(10),
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
    lineHeight: responsiveFont(24),
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: responsiveSpacing(3),
  },
  icon: {
    width: moderateScale(18),
    height: moderateScale(18),
    marginRight: responsiveSpacing(12),
    marginTop: responsiveSpacing(2),
  },
  detail: {
    color: Colors.gray60,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    fontWeight: '600',
  },
  containerStatus: {
    width: moderateScale(120),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.limeGreen,
    position: 'absolute',
    zIndex: 1000,
    top: -responsiveSpacing(10),
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStatus: {
    fontSize: responsiveFont(18),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
  },
  containerViewAndArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(5),
  },
});
