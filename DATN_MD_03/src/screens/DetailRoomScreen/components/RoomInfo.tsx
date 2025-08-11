import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont, responsiveIcon } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface RoomInfoProps {
  name: string;
  price: string;
  address: string;
  roomCode: string;
  area: number;
  maxOccupancy: number;
  deposit?: number; // Số tháng đặt cọc, default = 1
  onMapPress?: () => void; // Callback khi bấm vào icon map
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  name,
  price,
  address,
  roomCode,
  area,
  maxOccupancy,
  deposit = 1, // Default 1 tháng
  onMapPress,
}) => {
  // Chuẩn bị data cho 3 cột
  const infoItems = [
    {
      key: 'area',
      icon: Icons.IconArea,
      label: 'Diện tích',
      value: area ? `${area}m²` : '',
    },
    {
      key: 'maxOccupancy',
      icon: Icons.IconSoNguoi,
      label: 'Số người',
      value: maxOccupancy || '',
    },
    {
      key: 'deposit',
      icon: Icons.IconTienCoc,
      label: 'Đặt cọc',
      value: deposit ? `${deposit} tháng` : '',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Giá */}
      <Text style={styles.priceText}>{price}đ/tháng</Text>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>{name}</Text>

      {/* Room Code */}
      <View style={styles.roomCodeContainer}>
        <View style={styles.roomCodeIcon}>
          <Image
            source={{ uri: Icons.IconHome }}
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

      {/* Map Button */}
      {onMapPress && (
        <TouchableOpacity
          style={styles.mapButtonNew}
          onPress={onMapPress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: Icons.IconMap }}
            style={styles.mapIconNew}
          />
          <Text style={styles.mapText}>Bấm vào đây để xem vị trí phòng</Text>
        </TouchableOpacity>
      )}

      {/* Thông tin 3 cột ngang */}
      <Text style={styles.sectionTitle}>Thông tin</Text>
      <View style={styles.infoRowNoBg}>
        {infoItems.map(item => (
          <View style={styles.infoCol} key={item.key}>
            <Image source={{ uri: item.icon }} style={styles.infoIconImageNoBg} />
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  priceText: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(8),
  },
  title: {
    fontSize: responsiveFont(1),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    lineHeight: responsiveFont(1),
    marginBottom: responsiveSpacing(8),
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
    marginBottom: responsiveSpacing(8),
  },
  addressIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  addressIconImage: {
    width: 16,
    height: 16,
    tintColor: Colors.darkGreen,
  },
  address: {
    flex: 1,
    fontSize: responsiveFont(14),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Regular,
    lineHeight: responsiveFont(18),
  },
  mapButtonNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    padding: responsiveSpacing(12),
    borderRadius: responsiveSpacing(8),
    marginBottom: responsiveSpacing(16),
  },
  mapIconNew: {
    width: responsiveIcon(24),
    height: responsiveIcon(24),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  mapText: {
    fontSize: responsiveFont(14),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Bold,
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  infoRowNoBg: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsiveSpacing(8),
    marginTop: responsiveSpacing(4),
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconImageNoBg: {
    width: 32,
    height: 32,
    tintColor: Colors.darkGreen,
    marginBottom: responsiveSpacing(4),
  },
  infoLabel: {
    fontSize: responsiveFont(13),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: responsiveSpacing(2),
    textAlign: 'center',
  },
  infoValue: {
    fontSize: responsiveFont(17),
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
    textAlign: 'center',
  },
});

export default RoomInfo;
