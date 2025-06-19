import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../../theme/color';
import { Room } from '../../../types/Room';
import { RootStackParamList } from '../../../types/route';
import { 
  SCREEN, 
  responsiveFont, 
  responsiveSpacing,
  moderateScale 
} from '../../../utils/responsive';
import { Fonts } from '../../../theme/fonts';
import { getImageUrl } from '../../../configs'; // Import hàm tạo URL hình ảnh từ config

// Type cho navigation
type RoomCardNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

// Interface định nghĩa props cho component RoomCard
interface RoomCardProps {
  item: Room; // Dữ liệu phòng trọ
}

const RoomCard: React.FC<RoomCardProps> = ({ item }) => {
  const navigation = useNavigation<RoomCardNavigationProp>();
  
  // State để theo dõi hình ảnh hiện tại đang hiển thị
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Chuyển đổi đường dẫn hình ảnh từ API thành URL đầy đủ
  const images = item.photos?.map(photo => getImageUrl(photo)) || [];
  
  // Tính toán độ rộng của các chấm indicator dựa trên số lượng ảnh
  const totalIndicatorWidth = 100; // Tổng độ rộng cho tất cả các chấm indicator
  const margin = 2; // Khoảng cách giữa các chấm
  const dotWidth = Math.max((totalIndicatorWidth - (images.length - 1) * margin * 2) / images.length, 8);
  
  // Hàm xử lý khi người dùng scroll qua các hình ảnh
  const handleScroll = (event: any) => {
    const slideSize = SCREEN.width - responsiveSpacing(32);
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  // Hàm xử lý khi nhấn vào card để điều hướng sang DetailRoom
  const handleCardPress = () => {
    if (item._id) {
      console.log('Navigating to DetailRoom with roomId:', item._id);
      navigation.navigate('DetailRoom', { roomId: item._id });
    } else {
      console.warn('Room ID is undefined, cannot navigate');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.8}>
      {/* Container chứa hình ảnh và indicator */}
      <View style={styles.imageContainer}>
        {/* ScrollView ngang để swipe qua các hình ảnh */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {images.map((imageUri: string, index: number) => (
            <Image 
              key={index}
              source={{ uri: imageUri }} 
              style={styles.image} 
            />
          ))}
        </ScrollView>
        
        {/* Các chấm indicator hiển thị ảnh hiện tại (chỉ hiện khi có nhiều hơn 1 ảnh) */}
         {images.length > 1 && (
           <View style={styles.dotsContainer}>
             {images.map((_: string, index: number) => (
               <View
                 key={index}
                 style={[
                   styles.dot,
                   { width: dotWidth },
                   currentImageIndex === index && styles.activeDot // Highlight chấm của ảnh hiện tại
                 ]}
               />
             ))}
           </View>
         )}
      </View>
      
      {/* Phần thông tin phòng trọ */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.description}</Text>
          {/* Tag hiển thị giá phòng */}
          <View style={styles.priceTag}>
            <Text style={styles.price}>{item.rentPrice?.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        {/* Thông tin chi tiết: địa chỉ, diện tích, số phòng */}
        <Text style={styles.detail}>
          {item.location.addressText} || {item.area}m² || {item.roomNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginBottom: responsiveSpacing(16),
    marginHorizontal: responsiveSpacing(16),
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: SCREEN.width - responsiveSpacing(32),
    height: (SCREEN.width - responsiveSpacing(32)) * 0.5,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: responsiveSpacing(10),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: 'rgba(186, 253, 0, 0.4)',
    marginHorizontal: responsiveSpacing(2),
  },
  activeDot: {
    backgroundColor: Colors.limeGreen,
  },
  info: {
    padding: responsiveSpacing(12),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(15),
    flex: 1,
    color: Colors.black,
  },
  priceTag: {
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: moderateScale(6),
  },
  price: {
    color: Colors.white,
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(12),
  },
  detail: {
    color: Colors.textGray,
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Regular,
  },
});
