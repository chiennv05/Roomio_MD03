import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../../theme/color';
import { Room } from '../../../types/Room';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
  verticalScale,
  moderateScale,
  responsiveIcon,
} from '../../../utils/responsive';
import { Fonts } from '../../../theme/fonts';
import { getImageUrl } from '../../../configs';
import { Icons } from '../../../assets/icons';

// Interface định nghĩa props cho component RoomCard
interface RoomCardProps {
  item: Room;
  onPress: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ item, onPress }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = item.photos?.map(photo => getImageUrl(photo)) || [];

  const onScroll = useCallback((event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  }, []);

  const renderCarouselItem = ({item: imageItem}: {item: string}) => (
    <View style={styles.carouselItemContainer}>
      <Image source={{uri: imageItem}} style={styles.carouselImage} />
      <LinearGradient
        colors={['#00000080', '#FFFFFF00']}
        style={styles.imageOverlay}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
    </View>
  );

  const handleCardPress = () => {
    if (item._id) {
      onPress(item._id);
    } else {
      console.warn('Room ID is undefined, cannot navigate');
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('vi-VN')}đ/tháng`;
  };

  return (
    <View style={styles.outerWrapper}>
      <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.8}>
        {/* Container chứa carousel với viền tròn */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            renderItem={renderCarouselItem}
            keyExtractor={(imageItem, index) => `${item._id}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.carousel}
          />

          {/* Price tag overlay */}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {formatPrice(item.rentPrice || 0)}
            </Text>
          </View>

          {/* Progress bars */}
          {images.length > 1 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBars}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: index === currentImageIndex
                          ? '#BAFD00'
                          : 'rgba(255, 255, 255, 0.4)',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Thông tin phòng */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
          <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: Icons.IconHome }} style={styles.icon} />
              <Text style={styles.infoText} numberOfLines={1}>
                   Phòng:  {item.roomNumber}
              </Text>
            </View>
            <Text style={styles.separator}>|</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image source={{ uri: Icons.IconLocation }} style={styles.icon} />
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
                {item.location.district}, {item.location.province}
              </Text>
            </View>
            <Text style={styles.separator}>|</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: Icons.IconArea }} style={styles.icon} />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.area}m²
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  outerWrapper: {
    width: scale(372),
    alignSelf: 'center',
    marginVertical: verticalScale(8),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    padding: responsiveSpacing(16),
  },
  carouselContainer: {
    position: 'relative',
    height: verticalScale(200),
    borderRadius: moderateScale(6),
    overflow: 'hidden',
  },
  carouselItemContainer: {
    width: scale(340),
    height: verticalScale(200),
    borderRadius: moderateScale(10),
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(8),
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: moderateScale(10),
  },
  priceTag: {
    position: 'absolute',
    bottom: responsiveSpacing(15),
    left: responsiveSpacing(7),
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(6),
    borderRadius: moderateScale(8),
  },
  priceText: {
    color: Colors.limeGreen,
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(8),
    left: responsiveSpacing(20),
    right: responsiveSpacing(20),
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
    height: moderateScale(4),
    borderRadius: moderateScale(2),
  },
  info: {
    paddingHorizontal: responsiveSpacing(4),
    paddingTop: responsiveSpacing(8),
    paddingBottom: responsiveSpacing(12),
  },
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    lineHeight: responsiveFont(20),
    marginBottom: responsiveSpacing(6),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: responsiveSpacing(4),
  },
  icon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.gray60,
  },
  infoText: {
    fontSize: responsiveFont(14),
    lineHeight: responsiveFont(18),
    color: Colors.gray60,
    fontFamily: Fonts.Roboto_Regular,
  },
  addressText: {
    fontSize: responsiveFont(14),
    lineHeight: responsiveFont(18),
    color: Colors.gray60,
    fontFamily: Fonts.Roboto_Regular,
    flex: 1,
    marginRight: responsiveSpacing(8),
  },
  separator: {
    fontSize: responsiveFont(14),
    lineHeight: responsiveFont(18),
    color: Colors.gray60,
    fontFamily: Fonts.Roboto_Regular,
    marginHorizontal: responsiveSpacing(8),
  },
  carousel: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: moderateScale(6),
  },
});
