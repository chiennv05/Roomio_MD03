import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Room} from '../../../types/Room';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, responsiveIcon, responsiveSpacing} from '../../../utils/responsive';
import {getImageUrl} from '../../../configs';

type RoomCardNavigationProp = StackNavigationProp<RootStackParamList, 'DetailRoom'>;

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({room}) => {
  const navigation = useNavigation<RoomCardNavigationProp>();

  const handleNavigateToDetail = () => {
    if (room._id) {
      navigation.navigate('DetailRoom', {roomId: room._id});
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleNavigateToDetail}
      activeOpacity={0.8}>
      
      {/* Image Container */}
      {room.photos && room.photos.length > 0 ? (
        <View style={styles.imageContainer}>
          <Image
            source={{uri: getImageUrl(room.photos[0])}}
            style={styles.image}
            resizeMode="cover"
            defaultSource={{uri: Icons.IconHome}}
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, styles.imagePlaceholder]}>
          <Image
            source={{uri: Icons.IconHome}}
            style={styles.placeholderIcon}
          />
        </View>
      )}

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {room.description || 'Phòng trọ'}
        </Text>
        
        {/* Price */}
        <Text style={styles.price}>
          {(room.rentPrice || 0).toLocaleString('vi-VN')}đ/tháng
        </Text>
        
        {/* Location */}
        <View style={styles.locationRow}>
          <Image
            source={{uri: Icons.IconLocation}}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {room.location?.addressText || 'Đang cập nhật địa chỉ'}
          </Text>
        </View>
        
        {/* Area */}
        <View style={styles.areaRow}>
          <Image
            source={{uri: Icons.IconArea}}
            style={styles.areaIcon}
          />
          <Text style={styles.areaText}>
            {room.area || 0}m²
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: responsiveSpacing(16),
    padding: responsiveSpacing(16),
    marginHorizontal: responsiveSpacing(0), // Bỏ margin horizontal vì đã có trong bottomContainer
    marginBottom: responsiveSpacing(0),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: responsiveSpacing(80),
    height: responsiveSpacing(80),
    borderRadius: responsiveSpacing(12),
    overflow: 'hidden',
    backgroundColor: Colors.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: responsiveIcon(40),
    height: responsiveIcon(40),
    tintColor: Colors.darkGray,
  },
  infoContainer: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
    lineHeight: responsiveFont(18),
  },
  price: {
    fontSize: responsiveFont(15),
    fontFamily: Fonts.Roboto_Bold,
    color: '#4CAF50', // Green color giống trong hình
    marginBottom: responsiveSpacing(6),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  locationIcon: {
    width: responsiveIcon(12),
    height: responsiveIcon(12),
    tintColor: '#666666',
    marginRight: responsiveSpacing(4),
  },
  locationText: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: '#666666',
    fontFamily: Fonts.Roboto_Regular,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(0),
  },
  areaIcon: {
    width: responsiveIcon(12),
    height: responsiveIcon(12),
    tintColor: '#666666',
    marginRight: responsiveSpacing(4),
  },
  areaText: {
    fontSize: responsiveFont(12),
    color: '#666666',
    fontFamily: Fonts.Roboto_Regular,
  },
  roomCountText: {
    fontSize: responsiveFont(12),
    color: '#666666',
    fontFamily: Fonts.Roboto_Regular,
  },
});

export default RoomCard;