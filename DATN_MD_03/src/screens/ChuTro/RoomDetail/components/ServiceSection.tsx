import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';
import {Room} from '../../../../types';

interface ServiceSectionProps {
  room: Room;
  formatNumber: (num: number) => string;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({room, formatNumber}) => {
  const getPriceTypeText = (type: string | undefined) => {
    if (!type) return 'số';
    switch (type) {
      case 'perRoom':
        return 'phòng';
      case 'perPerson':
        return 'người';
      case 'perUsage':
        return 'số';
      default:
        return type;
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Phí dịch vụ</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Điện:</Text>
        <Text style={styles.infoValue}>
          {formatNumber(room.location?.servicePrices?.electricity || 0)}{' '}
          đ/{getPriceTypeText(room.location?.servicePriceConfig?.electricity)}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Nước:</Text>
        <Text style={styles.infoValue}>
          {formatNumber(room.location?.servicePrices?.water || 0)}{' '}
          đ/{getPriceTypeText(room.location?.servicePriceConfig?.water)}
        </Text>
      </View>

      {room.customServices && room.customServices.length > 0 && (
        <>
          {room.customServices.map((service, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{service.name}:</Text>
              <Text style={styles.infoValue}>
                {formatNumber(service.price || 0)}{' '}
                đ/{getPriceTypeText(service.priceType)}
              </Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(15),
    marginTop: responsiveSpacing(15),
    borderRadius: 10,
    padding: responsiveSpacing(15),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: responsiveSpacing(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(5),
  },
  infoLabel: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    flex: 1,
  },
  infoValue: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
    fontFamily: Fonts.Roboto_Bold,
  },
});

export default ServiceSection; 