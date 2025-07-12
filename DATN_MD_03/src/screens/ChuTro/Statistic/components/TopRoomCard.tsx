import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface TopRoomCardProps {
  roomNumber: string;
  rentPrice: number;
  photo: string;
  viewCount: number;
  favoriteCount: number;
  onPress: () => void;
}

const TopRoomCard = ({
  roomNumber,
  rentPrice,
  photo,
  viewCount,
  favoriteCount,
  onPress,
}: TopRoomCardProps) => {
  // Format money
  const formatMoney = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View
        style={[styles.borderLeft, {backgroundColor: Colors.primaryGreen}]}
      />
      <Image
        source={
          photo
            ? {uri: photo}
            : require('../../../../assets/images/image_backgroud_button.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.roomNumber} numberOfLines={1}>
          Phòng {roomNumber}
        </Text>
        <Text style={styles.price}>{formatMoney(rentPrice)} đ/tháng</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Image
              source={require('../../../../assets/icons/icon_view_light.png')}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{viewCount}</Text>
            <Text style={styles.statLabel}>Lượt xem</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TopRoomCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  borderLeft: {
    width: 5,
    height: '100%',
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: responsiveSpacing(12),
  },
  roomNumber: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  price: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.primaryGreen,
    marginBottom: responsiveSpacing(8),
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: responsiveSpacing(4),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: responsiveSpacing(16),
  },
  statIcon: {
    width: 16,
    height: 16,
    marginRight: responsiveSpacing(4),
    tintColor: Colors.darkGray,
  },
  statValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginRight: responsiveSpacing(4),
  },
  statLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
});
