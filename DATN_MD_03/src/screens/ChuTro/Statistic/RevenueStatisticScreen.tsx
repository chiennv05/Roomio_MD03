import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
  SCREEN,
} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';

import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';

type RevenueStatisticScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const RevenueStatisticScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<RevenueStatisticScreenNavigationProp>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {data, loading} = useSelector((state: RootState) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const fetchData = useCallback(async () => {
    if (user?.auth_token) {
      dispatch(fetchDashboard(user.auth_token));
    }
  }, [dispatch, user?.auth_token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Format money
  const formatMoney = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  if (loading && !refreshing && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.backgroud}
        barStyle="dark-content"
        translucent
      />
      <View style={[styles.headerContainer, {marginTop: statusBarHeight + 5}]}>
        <UIHeader
          title="Thống kê doanh thu"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          color={Colors.backgroud}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Stats Grid - consistent with main Statistic screen */}
        <View style={styles.statsGrid}>
          {/* Tổng doanh thu */}
          <View style={[styles.statCard, styles.revenueCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconTienCoc}}
                style={styles.statIcon}
              />
            </View>
            <Text style={[styles.statValue, styles.revenueValue]}>
              {formatMoney(data?.revenue?.totalRevenue || 0)} đ
            </Text>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
          </View>

          {/* Giá thuê trung bình */}
          <View style={[styles.statCard, styles.avgCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconLightReport}}
                style={styles.statIcon}
              />
            </View>
            <Text style={[styles.statValue, styles.avgValue]}>
              {formatMoney(data?.revenue?.averageRent || 0)} đ
            </Text>
            <Text style={styles.statLabel}>Giá thuê TB</Text>
          </View>

        </View>


        {/* Revenue Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.iconBadge, {backgroundColor: Colors.lightBlueBackground}]}>
                  <Image source={{uri: Icons.IconRoom}} style={[styles.breakdownIcon, {tintColor: Colors.brandPrimary}]} />
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
                  <Image source={{uri: Icons.IconServiceSelected}} style={[styles.breakdownIcon, {tintColor: Colors.darkGreen}]} />
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
                  <Image source={{uri: Icons.IconUnion}} style={[styles.breakdownIcon, {tintColor: Colors.accentSupport}]} />
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
            style={styles.quickCard}
          >
            <LinearGradient
              colors={[Colors.limeGreen, '#E9FFB7']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.quickGradient}
            >
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
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RevenueStatisticScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(24),
  },
  // New stats grid styles
  statsGrid: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(12),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (SCREEN.width - responsiveSpacing(16) * 2 - responsiveSpacing(12)) / 2,
    borderRadius: scale(16),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  revenueCard: {
    backgroundColor: Colors.brandPrimary, // Emerald - giống màn chính
  },
  avgCard: {
    backgroundColor: Colors.accentSupport, // Cyan - giống màn chính
  },
  occupancyCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentSupport,
  },
  statIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Giống màn chính
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(10),
  },
  statIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.white, // Giống màn chính
  },
  statValue: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white, // Giống màn chính
  },
  statLabel: {
    marginTop: responsiveSpacing(4),
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white, // Giống màn chính
    opacity: 0.9,
  },
  revenueValue: { color: Colors.white },
  avgValue: { color: Colors.white },
  occupancyValue: { color: Colors.accentSupport },
  chartSection: {
    marginTop: responsiveSpacing(8),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
  },
  breakdownContainer: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
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
  colorDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: responsiveSpacing(8),
  },
  // icon badge for breakdown
  iconBadge: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(8),
  },
  breakdownIcon: {
    width: scale(16),
    height: scale(16),
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
  quickIcon: {width: scale(18), height: scale(18), tintColor: Colors.darkGray},
  quickText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.dearkOlive},
  quickArrow: {width: scale(18), height: scale(18), tintColor: Colors.dearkOlive},
});
