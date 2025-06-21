import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../../theme/color';
import { Fonts } from '../../../theme/fonts';
import { responsiveSpacing, responsiveFont } from '../../../utils/responsive';
import { Icons } from '../../../assets/icons';

interface ServicePricesType {
  electricity?: number;
  water?: number;
  cleaning?: number;
  parking?: number;
  internet?: number;
  elevator?: number;
}

interface ServiceFeesProps {
  servicePrices: ServicePricesType;
}

// Mapping cho service labels và icons
const serviceMapping = {
  electricity: { label: 'Điện', icon: Icons.IconTienDien, unit: '/kWh' },
  water: { label: 'Nước', icon: Icons.IconTienNuoc, unit: '/m³' },
  cleaning: { label: 'Vệ sinh', icon: Icons.IconVeSinh, unit: '/tháng' },
  parking: { label: 'Gửi xe', icon: Icons.IconGuiXe, unit: '/tháng' },
  internet: { label: 'Internet', icon: Icons.IconWifiMienPhi, unit: '/tháng' },
  elevator: { label: 'Thang máy', icon: Icons.IconThangMay, unit: '/tháng' },
};

const ServiceFees: React.FC<ServiceFeesProps> = ({ servicePrices }) => {
  // Lọc ra những service có giá > 0
  const activeServices = Object.entries(servicePrices)
    .filter(([_key, value]) => value && value > 0)
    .map(([key, value]) => ({
      key,
      value: value as number,
      ...serviceMapping[key as keyof typeof serviceMapping]
    }));

  // Nếu không có service nào thì không hiển thị section
  if (activeServices.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phí dịch vụ</Text>
      <View style={styles.grid}>
        {activeServices.map((service) => (
          <FeeItem
            key={service.key}
            icon={service.icon}
            label={service.label}
            value={`${service.value.toLocaleString('vi-VN')}${service.unit}`}
          />
        ))}
      </View>
    </View>
  );
};

interface FeeItemProps {
  icon: string | undefined;
  label: string;
  value: string;
}

const FeeItem: React.FC<FeeItemProps> = ({ icon, label, value }) => (
  <View style={styles.feeItem}>
    <View style={styles.feeIconContainer}>
      {icon ? (
        <Image source={{ uri: icon }} style={styles.feeIcon} resizeMode="contain" />
      ) : (
        <Text style={styles.feeIconText}>💰</Text>
      )}
    </View>
    <Text style={styles.feeLabel}>{label}</Text>
    <Text style={styles.feeValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveSpacing(16),
  },
  title: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: responsiveSpacing(16),
  },
  feeItem: {
    alignItems: 'center',
    width: '22%',
    minWidth: 80,
  },
  feeIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  feeIcon: {
    width: 20,
    height: 20,
  },
  feeLabel: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
    marginBottom: responsiveSpacing(4),
    textAlign: 'center',
  },
  feeValue: {
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    fontSize: responsiveFont(10),
    textAlign: 'center',
    lineHeight: responsiveFont(12),
  },
  feeIconText: {
    fontSize: responsiveFont(20),
    color: Colors.textGray,
    fontFamily: Fonts.Roboto_Regular,
  },
});

export default ServiceFees;
