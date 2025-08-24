import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../../../utils/responsive';
import {Icons} from '../../../../assets/icons';

type RevenueTabNavigationProp = StackNavigationProp<RootStackParamList>;

interface RevenueTabProps {
  data: any;
  formatMoney: (value: number) => string;
}

const RevenueTab: React.FC<RevenueTabProps> = ({data, formatMoney}) => {
  const navigation = useNavigation<RevenueTabNavigationProp>();

  // Simple example value for average rent display
  const getExampleAverageRent = () => {
    return 2966666; // Example: 2.966.666 đ
  };

  return (
    <View style={styles.tabContent}>
      {/* Stats Grid - Full-width layout for Revenue tab */}
      <View style={styles.singleColumnContainer}>
        {/* Tổng doanh thu */}
        <View style={[styles.overviewCardFull, styles.cardTotal]}>
          <View style={styles.statHeader}>
            <Image
              source={{uri: Icons.IconTienCoc}}
              style={styles.statIcon}
            />
            <Text style={styles.overviewLabel}>Tổng doanh thu</Text>
          </View>
          <Text style={styles.overviewValue}>{formatMoney(data?.revenue?.totalRevenue || 0)} đ</Text>
        </View>

        {/* Giá thuê trung bình */}
        <View style={[styles.overviewCardFull, styles.cardRented]}>
          <View style={styles.statHeader}>
            <Image
              source={{uri: Icons.IconGiaTrungBinh}}
              style={styles.statIcon}
            />
            <Text style={styles.overviewLabel}>Giá thuê TB</Text>
          </View>
          <Text style={styles.overviewValue}>{formatMoney(getExampleAverageRent())} đ</Text>
        </View>
      </View>

      {/* Revenue Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Image source={{uri: Icons.IconRoom}} style={[styles.breakdownIcon, {tintColor: Colors.darkGreen}]} />
              <Text style={styles.breakdownLabel}>Tiền thuê phòng</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatMoney((data?.revenue?.totalRevenue || 0) * 0.8)} đ
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Image source={{uri: Icons.IconServiceSelected}} style={[styles.breakdownIcon, {tintColor: Colors.darkGreen}]} />
              <Text style={styles.breakdownLabel}>Phí dịch vụ</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatMoney((data?.revenue?.totalRevenue || 0) * 0.15)} đ
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Image source={{uri: Icons.IconTienCoc}} style={[styles.breakdownIcon, {tintColor: Colors.darkGreen}]} />
              <Text style={styles.breakdownLabel}>Phí khác</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatMoney((data?.revenue?.totalRevenue || 0) * 0.05)} đ
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Bill')}
          style={[styles.quickCard, {backgroundColor: Colors.limeGreen}]}
        >
          <View style={styles.quickGradient}>
            <View style={styles.quickLeft}>
              <View style={styles.quickIconWrap}>
                <Image
                  source={{uri: Icons.IconThanhToan}}
                  style={styles.quickIcon}
                />
              </View>
              <Text style={styles.quickText}>Xem tất cả hóa đơn</Text>
            </View>
            <Image
              source={{uri: Icons.IconArrowRight}}
              style={styles.quickArrow}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RevenueTab;

const styles = StyleSheet.create({
  tabContent: {
    paddingBottom: responsiveSpacing(16),
  },
  singleColumnContainer: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(20),
  },
  overviewCardFull: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTotal: {},
  cardRented: {},
  cardOccupancy: {},
  cardAvgRevenue: {},
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(12),
  },
  statIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  overviewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  overviewLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  overviewValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flexWrap: 'nowrap',
  },
  breakdownContainer: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(10),
  },
  breakdownCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    width: scale(16),
    height: scale(16),
    marginRight: responsiveSpacing(8),
  },
  breakdownLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  breakdownValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  actionsContainer: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  quickCard: {
    borderRadius: scale(14),
    overflow: 'hidden',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  quickGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  quickLeft: {flexDirection: 'row', alignItems: 'center'},
  quickIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(10),
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(10),
  },
  quickIcon: {
    width: scale(18), 
    height: scale(18), 
    tintColor: Colors.darkGreen,
  },
  quickText: {
    fontFamily: Fonts.Roboto_Bold, 
    fontSize: responsiveFont(16), 
    color: Colors.black,
  },
  quickArrow: {
    width: scale(12), 
    height: scale(18), 
    tintColor: Colors.black,
  },
});