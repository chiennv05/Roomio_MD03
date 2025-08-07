import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
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
} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';
import {StatChart} from './components';

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
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />

      {/* Header */}
      <View style={[styles.header, {marginTop: statusBarHeight}]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Image
            source={require('../../../assets/icons/icon_arrow_back.png')}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê doanh thu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Revenue Overview */}
        <View style={styles.overviewContainer}>
          <View style={[styles.overviewCard, styles.mainCard]}>
            <Text style={styles.overviewLabel}>Tổng doanh thu</Text>
            <Text style={[styles.overviewValue, styles.mainValue]}>
              {formatMoney(data?.revenue?.totalRevenue || 0)} đ
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Giá thuê TB</Text>
            <Text style={[styles.overviewValue, {color: Colors.primaryGreen}]}>
              {formatMoney(data?.revenue?.averageRent || 0)} đ
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Tỷ lệ lấp đầy</Text>
            <Text style={[styles.overviewValue, {color: Colors.darkGreen}]}>
              {data?.revenue?.occupancyRate || 0}%
            </Text>
          </View>
        </View>

        {/* Revenue Chart */}
        {data?.monthlyStats && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>
              Biểu đồ doanh thu theo tháng
            </Text>
            <StatChart
              title="Doanh thu (VNĐ)"
              data={data.monthlyStats.revenue}
              labels={data.monthlyStats.labels}
              color={Colors.primaryGreen}
            />
          </View>
        )}

        {/* Occupancy Rate Chart */}
        {data?.monthlyStats && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Tỷ lệ lấp đầy theo tháng</Text>
            <StatChart
              title="Tỷ lệ lấp đầy (%)"
              data={data.monthlyStats.occupancyRate}
              labels={data.monthlyStats.labels}
              color={Colors.darkGreen}
            />
          </View>
        )}

        {/* Revenue Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Chi tiết doanh thu</Text>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[
                    styles.colorDot,
                    {backgroundColor: Colors.primaryGreen},
                  ]}
                />
                <Text style={styles.breakdownLabel}>Tiền thuê phòng</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatMoney((data?.revenue?.totalRevenue || 0) * 0.8)} đ
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.colorDot, {backgroundColor: Colors.darkGreen}]}
                />
                <Text style={styles.breakdownLabel}>Phí dịch vụ</Text>
              </View>
              <Text style={styles.breakdownValue}>
                {formatMoney((data?.revenue?.totalRevenue || 0) * 0.15)} đ
              </Text>
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.colorDot, {backgroundColor: Colors.limeGreen}]}
                />
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
            style={styles.actionButton}
            onPress={() => navigation.navigate('Bill')}>
            <Image
              source={require('../../../assets/icons/icon_arrow_down.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Xem tất cả hóa đơn</Text>
            <Image
              source={require('../../../assets/icons/icon_arrow_right.png')}
              style={styles.arrowIcon}
            />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    padding: responsiveSpacing(8),
  },
  headerTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  placeholder: {
    width: scale(40),
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(24),
  },
  overviewContainer: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainCard: {
    backgroundColor: Colors.lightBlueBackground,
  },
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  mainValue: {
    fontSize: responsiveFont(24),
    color: Colors.darkGreen,
  },
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    width: scale(24),
    height: scale(24),
    marginRight: responsiveSpacing(12),
    tintColor: Colors.primaryGreen,
  },
  actionText: {
    flex: 1,
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  arrowIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.mediumGray,
  },
});
