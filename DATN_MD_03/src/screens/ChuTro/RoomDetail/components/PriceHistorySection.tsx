import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../../utils/responsive';

interface PriceHistory {
  price: number;
  dateChanged: string;
  reason: string;
}

interface PriceHistorySectionProps {
  priceHistory: PriceHistory[] | undefined;
  formatNumber: (num: number) => string;
}

const PriceHistorySection: React.FC<PriceHistorySectionProps> = ({
  priceHistory,
  formatNumber,
}) => {
  if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Lịch sử giá</Text>
      {priceHistory.map((item: PriceHistory, index: number) => (
        <View key={index} style={styles.priceHistoryItem}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giá:</Text>
            <Text style={styles.infoValue}>{formatNumber(item.price)} đ/tháng</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày thay đổi:</Text>
            <Text style={styles.infoValue}>
              {new Date(item.dateChanged).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lý do:</Text>
            <Text style={[styles.infoValue, {textAlign: 'right'}]}>{item.reason}</Text>
          </View>
          {index < priceHistory.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
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
    marginBottom: responsiveSpacing(15),
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
  priceHistoryItem: {
    marginBottom: responsiveSpacing(10),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: responsiveSpacing(10),
  },
});

export default PriceHistorySection; 