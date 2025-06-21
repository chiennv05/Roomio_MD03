import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface RoomInfoProps {
  name: string;
  price: string;
  address: string;
  roomCode: string;
  area: number; // Chỉ dùng area thực từ API
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  name,
  price,
  address,
  roomCode,
  area,
}) => {
  return (
    <View style={styles.container}>
      {/* Title và Price */}
      <Text style={styles.title} numberOfLines={2}>{name}</Text>
      <Text style={styles.priceText}>{price}/ tháng</Text>

      {/* Room Code */}
      <View style={styles.roomCodeContainer}>
        <View style={styles.roomCodeIcon}>
          <Image 
            source={{ uri: Icons.IconRoom }}
            style={styles.roomCodeIconImage}
          />
        </View>
        <Text style={styles.roomCode}>Mã phòng: {roomCode}</Text>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <View style={styles.addressIcon}>
          <Image 
            source={{ uri: Icons.IconLocation }}
            style={styles.addressIconImage}
          />
        </View>
        <Text style={styles.address}>{address}</Text>
      </View>

      {/* Thông tin - Chỉ hiển thị diện tích thực */}
      <Text style={styles.sectionTitle}>Thông tin</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Image 
              source={{ uri: Icons.IconArea }}
              style={styles.infoIconImage}
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Diện tích</Text>
            <Text style={styles.infoValue}>{area}m²</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
    lineHeight: responsiveFont(24),
  },
  priceText: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(16),
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  roomCodeIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomCodeIconText: {
    fontSize: 16,
  },
  roomCodeIconImage: {
    width: 16,
    height: 16,
    tintColor: Colors.darkGreen,
  },
  roomCode: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(24),
  },
  addressIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  addressIconText: {
    fontSize: 16,
  },
  addressIconImage: {
    width: 16,
    height: 16,
    tintColor: Colors.darkGreen,
  },
  address: {
    flex: 1,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    lineHeight: responsiveFont(18),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  infoContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: responsiveSpacing(16),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  infoIconText: {
    fontSize: 20,
  },
  infoIconImage: {
    width: 20,
    height: 20,
    tintColor: Colors.darkGreen,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: responsiveSpacing(2),
  },
  infoValue: {
    fontSize: responsiveFont(16),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default RoomInfo;
