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
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {room.description || 'Phòng trọ'}
        </Text>
        <Text style={styles.price}>
          Từ {(room.rentPrice || 0).toLocaleString('vi-VN')}đ/tháng
        </Text>
        <View style={styles.locationRow}>
          <Image
            source={{uri: Icons.IconLocation}}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {room.location?.addressText || 'Đang cập nhật địa chỉ'}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Image
            source={{uri: Icons.IconArea}}
            style={styles.statsIcon}
          />
          <Text style={styles.statsText}>
            Diện tích: {room.area || 0}m²
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
    borderRadius: responsiveSpacing(12),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(16),
  },
  imageContainer: {
    width: responsiveSpacing(80),
    height: responsiveSpacing(80),
    borderRadius: responsiveSpacing(8),
    overflow: 'hidden',
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
    width: responsiveIcon(32),
    height: responsiveIcon(32),
    tintColor: Colors.darkGray,
  },
  infoContainer: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
  },
  name: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  price: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(4),
  },
  locationIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(4),
  },
  locationText: {
    flex: 1,
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: responsiveIcon(16),
    height: responsiveIcon(16),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(4),
  },
  statsText: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
});

export default RoomCard;
