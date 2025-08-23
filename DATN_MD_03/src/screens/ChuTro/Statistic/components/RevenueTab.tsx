import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../../../utils/responsive';

type RevenueTabNavigationProp = StackNavigationProp<RootStackParamList>;

interface RevenueTabProps {
  data: any;
  formatMoney: (value: number) => string;
}

const RevenueTab: React.FC<RevenueTabProps> = ({data, formatMoney}) => {
  const navigation = useNavigation<RevenueTabNavigationProp>();

  return (
    <View style={styles.tabContent}>
      {/* Stats Grid - consistent with room tab style */}
      <View style={styles.singleColumnContainer}>
        {/* Tổng doanh thu */}
        <View style={[styles.overviewCardFull, styles.cardTotal]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image
              source={require('../../../../assets/icons/icon_tien_coc.png')}
              style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Tổng doanh thu</Text>
            <Text style={styles.overviewValue}>{formatMoney(data?.revenue?.totalRevenue || 0)} đ</Text>
          </View>
        </View>

        {/* Giá thuê trung bình */}
        <View style={[styles.overviewCardFull, styles.cardRented]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image
              source={require('../../../../assets/icons/icon_light_report.png')}
              style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Giá thuê TB</Text>
            <Text style={styles.overviewValue}>{formatMoney(data?.revenue?.averageRent || 0)} đ</Text>
          </View>
        </View>
      </View>

      {/* Revenue Breakdown */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBadge, {backgroundColor: Colors.lightBlueBackground}]}>
                <Image source={require('../../../../assets/icons/icon_room.png')} style={[styles.breakdownIcon, {tintColor: Colors.brandPrimary}]} />
              </View>
              <Text style={styles.breakdownLabel}>Tiền thuê phòng</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatMoney((data?.revenue?.totalRevenue || 0) * 0.8)} đ
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBadge, {backgroundColor: '#E9F7F0'}]}>
                <Image source={require('../../../../assets/icons/icon_servive_black.png')} style={[styles.breakdownIcon, {tintColor: Colors.darkGreen}]} />
              </View>
              <Text style={styles.breakdownLabel}>Phí dịch vụ</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatMoney((data?.revenue?.totalRevenue || 0) * 0.15)} đ
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBadge, {backgroundColor: '#F1F7FF'}]}>
                <Image source={require('../../../../assets/icons/icon_union.png')} style={[styles.breakdownIcon, {tintColor: Colors.accentSupport}]} />
              </View>
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
          style={[styles.quickCard, {backgroundColor: Colors.darkGreen}]}
        >
          <View style={styles.quickGradient}>
            <View style={styles.quickLeft}>
              <View style={styles.quickIconWrap}>
                <Image
                  source={require('../../../../assets/icons/icon_thanh_toan.png')}
                  style={styles.quickIcon}
                />
              </View>
              <Text style={styles.quickText}>Xem tất cả hóa đơn</Text>
            </View>
            <Image
              source={require('../../../../assets/icons/icon_arrow_right.png')}
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
    paddingTop: responsiveSpacing(16),
  },
  overviewCardFull: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(14),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTotal: {},
  cardRented: {},
  iconBadge: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  iconWrap: {
    backgroundColor: Colors.brandPrimarySoft,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  overviewIcon: {
    width: scale(20),
    height: scale(20),
  },
  overviewContent: {flex: 1},
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textSecondary,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.dearkOlive,
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
  },
  breakdownLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    marginLeft: responsiveSpacing(8),
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
    color: Colors.white,
  },
  quickArrow: {
    width: scale(18), 
    height: scale(18), 
    tintColor: Colors.white,
  },
});