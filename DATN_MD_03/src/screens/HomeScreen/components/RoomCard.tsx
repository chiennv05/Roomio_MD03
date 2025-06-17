import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../theme/color';
import { Room } from '../../../types/Room';

const SCREEN = Dimensions.get('window');

interface RoomCardProps {
  item: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ item }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Sử dụng photos từ API response và tạo full URL
  const baseURL = 'http://125.212.229.71:4000';
  const images = item.photos?.map(photo => `${baseURL}${photo}`) || [];
  
  // Tính toán độ rộng thanh dựa trên số lượng ảnh
  const totalIndicatorWidth = 100; // Tổng độ rộng cho tất cả các thanh
  const margin = 2; // Khoảng cách giữa các thanh
  const dotWidth = Math.max((totalIndicatorWidth - (images.length - 1) * margin * 2) / images.length, 8);
  
  const handleScroll = (event: any) => {
    const slideSize = SCREEN.width - 32;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
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
        
                 {/* Dots indicator */}
         {images.length > 1 && (
           <View style={styles.dotsContainer}>
             {images.map((_: string, index: number) => (
               <View
                 key={index}
                 style={[
                   styles.dot,
                   { width: dotWidth },
                   currentImageIndex === index && styles.activeDot
                 ]}
               />
             ))}
           </View>
         )}
      </View>
      
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.description}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.price}>{item.rentPrice?.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        <Text style={styles.detail}>
          {item.location.addressText} || {item.area}m² || {item.roomNumber}
        </Text>
      </View>
    </View>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: SCREEN.width - 32,
    height: SCREEN.width * 0.5,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(186, 253, 0, 0.4)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#BAFD00',
  },
  info: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  priceTag: {
    backgroundColor: Colors.limeGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  price: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detail: {
    color: Colors.textGray,
    fontSize: 13,
  },
});
