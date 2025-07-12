import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {
  StatItem,
  StatGroup,
  StatChart,
  TopRoomCard,
  RecentContractItem,
} from './components';
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

  const navigateToRoomDetail = (roomId: string) => {
    navigation.navigate('DetailRoomLandlord', {id: roomId});
  };

  const navigateToContractDetail = (contractId: string) => {
    navigation.navigate('ContractDetail', {contractId});
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header Banner */}
        <View style={[styles.headerContainer, {marginTop: statusBarHeight}]}>
          <ImageBackground
            source={require('../../../assets/images/image_backgroud_button.png')}
            style={styles.headerBanner}
            imageStyle={{opacity: 0.8, borderRadius: 16}}>
            <View style={styles.bannerContent}>
              <Text style={styles.welcomeText}>
                Xin chào, {data?.user?.fullName || 'Chủ trọ'}
              </Text>
              <Text style={styles.subtitle}>
                Tổng quan về tình hình kinh doanh
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Thông số quan trọng</Text>
          <StatItem
            title="Tổng số phòng"
            value={data?.overview?.totalRooms || 0}
            color={Colors.primaryGreen}
            icon={require('../../../assets/icons/icon_home.png')}
          />
        </View>

        {/* Room Stats */}
        <StatGroup
          title="Phòng trọ"
          icon={require('../../../assets/icons/icon_room.png')}
          backgroundColor={Colors.lightGreenBackground}>
          <StatItem
            title="Phòng đã thuê"
            value={data?.overview?.rentedRooms || 0}
            color={Colors.darkGreen}
            icon={require('../../../assets/icons/icon_sofa.png')}
          />
          <StatItem
            title="Phòng còn trống"
            value={data?.overview?.availableRooms || 0}
            color={Colors.limeGreen}
            icon={require('../../../assets/icons/icon_area.png')}
          />
          <StatItem
            title="Phòng chờ duyệt"
            value={data?.overview?.pendingRooms || 0}
            color={Colors.mediumGray}
            icon={require('../../../assets/icons/icon_wifi.png')}
          />
        </StatGroup>

        {/* Revenue Stats */}
        <StatGroup
          title="Doanh thu"
          icon={require('../../../assets/icons/icon_area_black.png')}
          backgroundColor={Colors.lightBlueBackground}>
          <StatItem
            title="Tổng doanh thu"
            value={`${formatMoney(data?.revenue?.totalRevenue || 0)} đ`}
            color={Colors.darkGreen}
            icon={require('../../../assets/icons/icon_map.png')}
          />
          <StatItem
            title="Giá thuê trung bình"
            value={`${formatMoney(data?.revenue?.averageRent || 0)} đ`}
            color={Colors.primaryGreen}
            icon={require('../../../assets/icons/icon_add.png')}
          />
          <StatItem
            title="Tỷ lệ lấp đầy"
            value={`${data?.revenue?.occupancyRate || 0}%`}
            color={Colors.limeGreen}
            icon={require('../../../assets/icons/icon_map.png')}
          />
        </StatGroup>

        {/* Contract Stats */}
        <StatGroup
          title="Hợp đồng"
          icon={require('../../../assets/icons/icon_ban_ghe.png')}
          backgroundColor={Colors.lightYellowBackground}>
          <StatItem
            title="Tổng hợp đồng"
            value={data?.overview?.totalContracts || 0}
            color={Colors.primaryGreen}
            icon={require('../../../assets/icons/icon_arrow_right.png')}
          />
          <StatItem
            title="Đang chờ ký"
            value={data?.overview?.pendingContracts || 0}
            color={Colors.mediumGray}
            icon={require('../../../assets/icons/icon_arrow_right.png')}
          />
          <StatItem
            title="Đang hiệu lực"
            value={data?.overview?.activeContracts || 0}
            color={Colors.darkGreen}
            icon={require('../../../assets/icons/icon_arrow_right.png')}
          />
          <StatItem
            title="Đã hết hạn"
            value={data?.overview?.expiredContracts || 0}
            color={Colors.red}
            icon={require('../../../assets/icons/icon_arrow_right.png')}
          />
        </StatGroup>

        {/* Invoice Stats */}
        <StatGroup
          title="Hóa đơn"
          icon={require('../../../assets/icons/icon_arrow_down.png')}
          backgroundColor={Colors.lightPurpleBackground}>
          <StatItem
            title="Tổng hóa đơn"
            value={data?.invoices?.totalInvoices || 0}
            color={Colors.primaryGreen}
            icon={require('../../../assets/icons/icon_arrow_left.png')}
          />
          <StatItem
            title="Đã thanh toán"
            value={data?.invoices?.paidInvoices || 0}
            color={Colors.darkGreen}
            icon={require('../../../assets/icons/icon_arrow_left.png')}
          />
          <StatItem
            title="Đã phát hành"
            value={data?.invoices?.issuedInvoices || 0}
            color={Colors.limeGreen}
            icon={require('../../../assets/icons/icon_arrow_left.png')}
          />
          <StatItem
            title="Đã quá hạn"
            value={data?.invoices?.overdueInvoices || 0}
            color={Colors.red}
            icon={require('../../../assets/icons/icon_arrow_left.png')}
          />
        </StatGroup>

        {/* Tenant Stats */}
        <StatGroup
          title="Người thuê"
          icon={require('../../../assets/icons/fluent_person_regular.png')}
          backgroundColor={Colors.lightOrangeBackground}>
          <StatItem
            title="Tổng người thuê"
            value={data?.tenants?.totalTenants || 0}
            color={Colors.primaryGreen}
            icon={require('../../../assets/icons/fluent_person_regular.png')}
          />
          <StatItem
            title="Người thuê hoạt động"
            value={data?.tenants?.activeTenants || 0}
            color={Colors.darkGreen}
            icon={require('../../../assets/icons/fluent_person_regular.png')}
          />
        </StatGroup>

        {/* Monthly Charts */}
        {data?.monthlyStats && (
          <View style={styles.chartsContainer}>
            <Text style={styles.sectionTitle}>Biểu đồ thống kê</Text>

            <StatChart
              title="Số phòng trọ"
              data={data.monthlyStats.rooms}
              labels={data.monthlyStats.labels}
              color={Colors.primaryGreen}
            />

            <StatChart
              title="Số hợp đồng"
              data={data.monthlyStats.contracts}
              labels={data.monthlyStats.labels}
              color={Colors.limeGreen}
            />

            <StatChart
              title="Doanh thu (VNĐ)"
              data={data.monthlyStats.revenue}
              labels={data.monthlyStats.labels}
              color={Colors.darkGreen}
            />

            <StatChart
              title="Tỷ lệ lấp đầy (%)"
              data={data.monthlyStats.occupancyRate}
              labels={data.monthlyStats.labels}
              color={Colors.mediumGray}
            />
          </View>
        )}

        {/* Top Rooms */}
        <View style={styles.topRoomsContainer}>
          <Text style={styles.sectionTitle}>Phòng được xem nhiều nhất</Text>
          {data?.topViewedRooms && data.topViewedRooms.length > 0 ? (
            data.topViewedRooms.map((room: any, index: number) => (
              <TopRoomCard
                key={`view-${room._id}-${index}`}
                roomNumber={room.roomNumber}
                rentPrice={room.rentPrice}
                photo={room.photos?.[0] || ''}
                viewCount={room.stats?.viewCount || 0}
                favoriteCount={room.stats?.favoriteCount || 0}
                onPress={() => navigateToRoomDetail(room._id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu</Text>
          )}
        </View>

        {/* Top Favorite Rooms */}
        <View style={styles.topRoomsContainer}>
          <Text style={styles.sectionTitle}>Phòng được yêu thích nhất</Text>
          {data?.topFavoriteRooms && data.topFavoriteRooms.length > 0 ? (
            data.topFavoriteRooms.map((room: any, index: number) => (
              <TopRoomCard
                key={`fav-${room._id}-${index}`}
                roomNumber={room.roomNumber}
                rentPrice={room.rentPrice}
                photo={room.photos?.[0] || ''}
                viewCount={room.stats?.viewCount || 0}
                favoriteCount={room.stats?.favoriteCount || 0}
                onPress={() => navigateToRoomDetail(room._id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu</Text>
          )}
        </View>

        {/* Recent Contracts */}
        <View style={styles.contractsContainer}>
          <Text style={styles.sectionTitle}>Hợp đồng gần đây</Text>
          {data?.recentContracts && data.recentContracts.length > 0 ? (
            data.recentContracts.map((contract: any, index: number) => (
              <RecentContractItem
                key={`contract-${contract._id}-${index}`}
                roomNumber={contract.roomId.roomNumber}
                roomPhoto={contract.roomId.photos?.[0] || ''}
                tenantName={contract.tenantId.fullName}
                status={contract.status}
                date={contract.createdAt}
                onPress={() => navigateToContractDetail(contract._id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Không có hợp đồng gần đây</Text>
          )}
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
});
