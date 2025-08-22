import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {API_CONFIG} from '../../../../configs';

interface TopRoomCardFancyProps {
  roomNumber: string;
  rentPrice: number;
  photo: string;
  viewCount: number;
  favoriteCount: number;
  onPress: () => void;
}

// Simpler, compact stripe layout using project colors
const TopRoomCardFancy = ({
  roomNumber,
  rentPrice,
  photo,
  viewCount,
  favoriteCount,
  onPress,
}: TopRoomCardFancyProps) => {
  const formatMoney = (value: number) => value.toLocaleString('vi-VN');
  const baseUrl = photo ? `${API_CONFIG.BASE_URL}${photo}` : '';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        <Image
          source={
            baseUrl
              ? {uri: baseUrl}
              : require('../../../../assets/images/image_backgroud_button.png')
          }
          style={styles.thumb}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          Phòng {roomNumber}
        </Text>
        <Text style={styles.price}>{formatMoney(rentPrice)} đ/tháng</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Image
              source={require('../../../../assets/icons/icon_view_light.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{viewCount}</Text>
            <Text style={styles.statLabel}>Lượt xem</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.statItem}>
            <Image
              source={require('../../../../assets/icons/icon_heart_favourite.png')}
              style={styles.statIcon}
            />
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Yêu thích</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TopRoomCardFancy;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    padding: responsiveSpacing(10),
  },
  thumbWrap: {
    width: responsiveSpacing(96),
    height: responsiveSpacing(72),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: responsiveSpacing(10),
  },
  thumb: {width: '100%', height: '100%'},
  content: {flex: 1, justifyContent: 'center'},
  title: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    marginBottom: responsiveSpacing(8),
  },
  price: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.brandPrimary,
    marginBottom: responsiveSpacing(8),
  },
  stats: {flexDirection: 'row', alignItems: 'center'},
  statItem: {flexDirection: 'row', alignItems: 'center'},
  statIcon: {
    width: 16,
    height: 16,
    marginRight: responsiveSpacing(4),
    tintColor: Colors.textSecondary,
  },
  statValue: {
    fontSize: responsiveFont(13),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
    marginRight: responsiveSpacing(4),
  },
  statLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray200,
    marginHorizontal: responsiveSpacing(10),
  },
});

