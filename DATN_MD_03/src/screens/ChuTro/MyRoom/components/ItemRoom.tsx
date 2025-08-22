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
import LinearGradient from 'react-native-linear-gradient';

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
                <LinearGradient
                  colors={['#00000080', '#FFFFFF00']}
                  style={styles.imageOverlay}
                  start={{x: 0, y: 1}}
                  end={{x: 0, y: 0}}
                />
              </View>
            ))}
          </ScrollView>
          <View
            style={[styles.containerStatus, {backgroundColor: status.color}]}>
            <Text style={[styles.textStatus, {color: status.textColor}]}>
              {status.label}
            </Text>
          </View>
          <View style={styles.priceOverlay}>
            <Text style={styles.priceOverlayText}>
              {item.rentPrice?.toLocaleString('vi-VN')}/ tháng
            </Text>
          </View>

          {images.length > 1 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBars}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor:
                          index === currentImageIndex
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

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.description}
          </Text>

          <View style={styles.detailContainer}>
            <Image source={{uri: Icons.IconRoomOutline}} style={styles.icon} />
            <Text style={styles.detail}>Số phòng: {item.roomNumber}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Image
              source={{uri: Icons.IconLocationGray}}
              style={styles.iconLoaction}
            />
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
    paddingTop: responsiveSpacing(8),
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
  },
  priceOverlay: {
    position: 'absolute',
    bottom: responsiveSpacing(30),
    left: responsiveSpacing(7),
    paddingHorizontal: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(6),
    borderRadius: moderateScale(8),
  },
  priceOverlayText: {
    color: Colors.limeGreen,
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(16),
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
  iconLoaction: {
    width: moderateScale(16),
    height: moderateScale(16),
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
    borderRadius: moderateScale(20),
    backgroundColor: Colors.limeGreen,
    position: 'absolute',
    zIndex: 1000,
    top: responsiveSpacing(24),
    right: responsiveSpacing(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStatus: {
    fontSize: responsiveFont(18),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(8),
  },
  containerViewAndArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(5),
  },
  imageOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 6,
    height: '50%',
    borderRadius: moderateScale(16),
  },
});
