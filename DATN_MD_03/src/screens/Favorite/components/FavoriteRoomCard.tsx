import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../theme/color';
import { Room } from '../../../types/Room';
import {
  SCREEN,
  responsiveFont,
  responsiveSpacing,
  moderateScale,
} from '../../../utils/responsive';
import { Fonts } from '../../../theme/fonts';
import { getImageUrl } from '../../../configs';
import { Icons } from '../../../assets/icons';
import { RootState, AppDispatch } from '../../../store';
import { toggleFavorite } from '../../../store/slices/roomSlice';

// Interface định nghĩa props cho component FavoriteRoomCard
interface FavoriteRoomCardProps {
  item: Room;
  onPress: (roomId: string) => void;
}

const FavoriteRoomCard: React.FC<FavoriteRoomCardProps> = ({ item, onPress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { toggleFavoriteLoading } = useSelector((state: RootState) => state.room);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Chuyển đổi đường dẫn hình ảnh từ API thành URL đầy đủ
  const images = item.photos?.map(photo => getImageUrl(photo)) || [];

  // Hàm xử lý khi người dùng scroll qua các hình ảnh
  const handleScroll = (event: any) => {
    const slideSize = SCREEN.width - responsiveSpacing(32);
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  // Hàm xử lý khi nhấn vào card
  const handleCardPress = () => {
    if (item._id) {
      onPress(item._id);
    } else {
      console.warn('Room ID is undefined, cannot navigate');
    }
  };

  // Hàm xử lý toggle favorite
  const handleToggleFavorite = useCallback((event: any) => {
    event.stopPropagation(); // Prevent card press

    if (!user?.auth_token || !item._id) {return;}

    dispatch(toggleFavorite({
      roomId: item._id,
      token: user.auth_token,
    }));
  }, [dispatch, user?.auth_token, item._id]);

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.8}>
      {/* Container chứa carousel với viền tròn */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((imageUri: string, index: number) => (
            <View key={index} style={styles.carouselItemContainer}>
              <Image source={{ uri: imageUri }} style={styles.carouselImage} />
            </View>
          ))}
        </ScrollView>

        {/* Heart Icon - Top Right */}
        <TouchableOpacity
          style={styles.heartContainer}
          onPress={handleToggleFavorite}
          disabled={toggleFavoriteLoading}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: Icons.IconHeartFavourite }}
            style={styles.heartIcon}
          />
        </TouchableOpacity>

        {/* Price tag overlay ở góc dưới bên trái */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceOverlayText}>
            {item.rentPrice?.toLocaleString('vi-VN')}/ tháng
          </Text>
        </View>

        {/* Các chấm indicator */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Phần thông tin phòng trọ */}
      <View style={styles.info}>
        <Text style={styles.title}>{item.description}</Text>
        <View style={styles.detailContainer}>
          <Image source={{ uri: Icons.IconHome }} style={styles.icon} />
          <Text style={styles.detail}>Mã phòng: {item.roomNumber}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Image source={{ uri: Icons.IconLocation }} style={styles.icon} />
          <Text style={styles.detail}>
            {item.location.ward}, {item.location.district}, {item.location.province}
          </Text>
        </View>
        <View style={styles.detailContainer}>
          <Image source={{ uri: Icons.IconArea }} style={styles.icon} />
          <Text style={styles.detail}>{item.area}m²</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FavoriteRoomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    marginBottom: responsiveSpacing(20),
    marginHorizontal: responsiveSpacing(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
  heartContainer: {
    position: 'absolute',
    top: responsiveSpacing(24),
    right: responsiveSpacing(24),
    width: responsiveSpacing(40),
    height: responsiveSpacing(40),
    borderRadius: responsiveSpacing(20),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  heartIcon: {
    width: responsiveSpacing(24),
    height: responsiveSpacing(24),
    // Don't use tintColor for red heart icon
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    padding: responsiveSpacing(20),
    backgroundColor: Colors.white,
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
    marginBottom: responsiveSpacing(14),
    lineHeight: responsiveFont(24),
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(10),
    paddingVertical: responsiveSpacing(3),
  },
  icon: {
    width: moderateScale(18),
    height: moderateScale(18),
    marginRight: responsiveSpacing(12),
    marginTop: responsiveSpacing(2),
    tintColor: Colors.darkGreen,
  },
  detail: {
    color: Colors.black,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    flex: 1,
    lineHeight: responsiveFont(20),
  },
});
