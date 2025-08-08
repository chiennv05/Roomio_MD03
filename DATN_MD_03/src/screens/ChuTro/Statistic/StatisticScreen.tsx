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
import {responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {StatisticCard, MainChart} from './components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';

type StatisticScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DetailRoomLandlord'
>;

const StatisticScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StatisticScreenNavigationProp>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {data, loading, error} = useSelector(
    (state: RootState) => state.dashboard,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<'revenue' | 'rooms' | 'contracts'>(
    'revenue',
  );

  // Lấy chiều cao của thanh trạng thái
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

  // Thêm hàm xử lý quay lại
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Navigation functions cho các màn hình chi tiết
  const navigateToRoomStatistic = () => {
    navigation.navigate('RoomStatisticScreen');
  };

  const navigateToRevenueStatistic = () => {
    navigation.navigate('RevenueStatisticScreen');
  };

  const navigateToContractStatistic = () => {
    navigation.navigate('ContractStatisticScreen');
  };

  // Format money
  const formatMoney = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  // Helper function để lấy metric chính dựa trên chartType
  const getMainChartData = () => {
    switch (chartType) {
      case 'revenue':
        return {
          title: 'Doanh thu hàng tháng',
          mainValue: formatMoney(data?.revenue?.totalRevenue || 0),
          data: data?.monthlyStats?.revenue || [],
          valueType: 'revenue' as const,
        };

      case 'rooms':
        return {
          title: 'Phòng trọ hàng tháng',
          mainValue: (data?.overview?.totalRooms || 0).toString(),
          data: data?.monthlyStats?.rooms || [],
          valueType: 'rooms' as const,
        };

      case 'contracts':
        return {
          title: 'Hợp đồng hàng tháng',
          mainValue: (data?.overview?.totalContracts || 0).toString(),
          data: data?.monthlyStats?.contracts || [],
          valueType: 'contracts' as const,
        };

      default:
        return {
          title: 'Doanh thu hàng tháng',
          mainValue: formatMoney(data?.revenue?.totalRevenue || 0),
          data: data?.monthlyStats?.revenue || [],
          valueType: 'revenue' as const,
        };
    }
  };

  const mainChartData = getMainChartData();

  if (loading && !refreshing && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Đã có lỗi xảy ra khi tải thông tin thống kê'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Thống kê</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Main Chart */}
        <View
          style={[styles.chartsContainer, {marginTop: statusBarHeight + 20}]}>
          <MainChart
            title={mainChartData.title}
            subtitle={`Cập nhật: ${new Date().toLocaleTimeString(
              'vi-VN',
            )} Hôm nay`}
            mainValue={mainChartData.mainValue}
            data={mainChartData.data}
            labels={data?.monthlyStats?.labels || []}
            valueType={mainChartData.valueType}
          />
        </View>

        {/* Statistic Cards */}
        <View style={styles.quickStatsContainer}>
          <StatisticCard
            title="Phòng trọ"
            icon={require('../../../assets/icons/icon_room.png')}
            backgroundColor={Colors.lightGreenBackground}
            iconColor={Colors.darkGreen}
            stats={[
              {
                label: 'Tổng số phòng',
                value: data?.overview?.totalRooms || 0,
                color: Colors.darkGray,
              },
              {
                label: 'Đã thuê',
                value: data?.overview?.rentedRooms || 0,
                color: Colors.darkGreen,
              },
              {
                label: 'Còn trống',
                value: data?.overview?.availableRooms || 0,
                color: Colors.primaryGreen,
              },
              {
                label: 'Chờ duyệt',
                value: data?.overview?.pendingRooms || 0,
                color: Colors.mediumGray,
              },
            ]}
            onPress={navigateToRoomStatistic}
          />

          <StatisticCard
            title="Doanh thu"
            icon={require('../../../assets/icons/icon_area_black.png')}
            backgroundColor={Colors.lightGreenBackground}
            iconColor={Colors.darkGreen}
            stats={[
              {
                label: 'Tổng doanh thu',
                value: `${formatMoney(data?.revenue?.totalRevenue || 0)} đ`,
                color: Colors.darkGreen,
              },
              {
                label: 'Giá thuê TB',
                value: `${formatMoney(data?.revenue?.averageRent || 0)} đ`,
                color: Colors.primaryGreen,
              },
              {
                label: 'Tỷ lệ lấp đầy',
                value: `${data?.revenue?.occupancyRate || 0}%`,
                color: Colors.primaryGreen,
              },
            ]}
            onPress={navigateToRevenueStatistic}
          />

          <StatisticCard
            title="Hợp đồng"
            icon={require('../../../assets/icons/icon_ban_ghe.png')}
            backgroundColor={Colors.lightGreenBackground}
            iconColor={Colors.darkGreen}
            stats={[
              {
                label: 'Tổng hợp đồng',
                value: data?.overview?.totalContracts || 0,
                color: Colors.darkGray,
              },
              {
                label: 'Đang hiệu lực',
                value: data?.overview?.activeContracts || 0,
                color: Colors.darkGreen,
              },
              {
                label: 'Chờ ký',
                value: data?.overview?.pendingContracts || 0,
                color: Colors.mediumGray,
              },
              {
                label: 'Đã hết hạn',
                value: data?.overview?.expiredContracts || 0,
                color: Colors.lightRed,
              },
            ]}
            onPress={navigateToContractStatistic}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    paddingBottom: responsiveSpacing(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    padding: responsiveSpacing(20),
  },
  errorText: {
    fontSize: responsiveFont(14),
    color: Colors.red,
    textAlign: 'center',
    marginBottom: responsiveSpacing(16),
  },
  retryButton: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(10),
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  headerContainer: {
    paddingTop: responsiveSpacing(8),
  },
  headerBanner: {
    height: 120,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(16),
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    padding: responsiveSpacing(16),
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  welcomeText: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
    marginBottom: responsiveSpacing(4),
  },
  subtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white,
  },
  quickStatsContainer: {
    marginBottom: responsiveSpacing(16),
  },
  chartsContainer: {
    marginBottom: responsiveSpacing(16),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(10),
    paddingHorizontal: responsiveSpacing(16),
  },
  topRoomsContainer: {
    marginBottom: responsiveSpacing(24),
  },
  contractsContainer: {
    marginBottom: responsiveSpacing(24),
  },
  noDataText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    marginVertical: responsiveSpacing(20),
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
    width: 40,
  },
});
