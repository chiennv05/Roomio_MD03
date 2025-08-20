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
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {fetchDashboard} from '../../../store/slices/dashboardSlice';
import {StatisticCard, MainBarChart as MainChart} from './components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';

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
  const [chartType, setChartType] = useState<
    'revenue' | 'rooms' | 'contracts'
  >('revenue');

  // Segmented control animation for filter tabs (Option B)
  const [tabsW, setTabsW] = useState(0);
  const currentIndex = chartType === 'revenue' ? 0 : chartType === 'rooms' ? 1 : 2;
  const tabAnim = React.useRef(new Animated.Value(currentIndex)).current;
  useEffect(() => {
    Animated.timing(tabAnim, {
      toValue: currentIndex,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, tabAnim]);

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
        backgroundColor={Colors.backgroud}
        barStyle="dark-content"
        translucent
      />
      <View
        style={[
          styles.headerContainer,
          styles.headerContainerTopPad,
          {marginTop: statusBarHeight + 5},
        ]}>
        <UIHeader
          title="Thống kê"
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
        {/* Beautiful Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Tổng doanh thu - Green */}
          <View style={[styles.statCard, styles.revenueCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={require('../../../assets/icons/icon_tien_coc.png')}
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{formatMoney(data?.revenue?.totalRevenue || 4338000)}</Text>
            <Text style={styles.statLabel}>Tổng doanh thu</Text>
          </View>

          {/* Tổng phòng - Cyan */}
          <View style={[styles.statCard, styles.roomCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={require('../../../assets/icons/icon_room.png')}
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{data?.overview?.totalRooms || 4}</Text>
            <Text style={styles.statLabel}>Tổng phòng</Text>
          </View>

          {/* Hợp đồng - Blue */}
          <View style={[styles.statCard, styles.contractCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={require('../../../assets/icons/icon_contract.png')}
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{data?.overview?.totalContracts || 19}</Text>
            <Text style={styles.statLabel}>Hợp đồng</Text>
          </View>

          {/* Đang thuê - Teal */}
          <View style={[styles.statCard, styles.occupiedCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={require('../../../assets/icons/icon_person.png')}
                style={styles.statIcon}
              />
            </View>
            <Text style={styles.statValue}>{data?.overview?.rentedRooms || 3}</Text>
            <Text style={styles.statLabel}>Đang thuê</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          {/* Chart Tabs */}
          <View
            style={styles.chartTabs}
            onLayout={e => setTabsW(e.nativeEvent.layout.width)}
          >
            {(() => {
              const padding = responsiveSpacing(6);
              const segmentWidth = Math.max((tabsW - padding * 2) / 3, 0);
              return (
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    {
                      width: segmentWidth,
                      transform: [
                        {
                          translateX: tabAnim.interpolate({
                            inputRange: [0, 1, 2],
                            outputRange: [0, segmentWidth, segmentWidth * 2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })()}

            <TouchableOpacity
              style={[styles.chartTab]}
              onPress={() => setChartType('revenue')}
            >
              <Text style={[styles.chartTabText, chartType === 'revenue' && styles.chartTabTextActive]}>
                Doanh thu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartTab]}
              onPress={() => setChartType('rooms')}
            >
              <Text style={[styles.chartTabText, chartType === 'rooms' && styles.chartTabTextActive]}>
                Phòng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartTab]}
              onPress={() => setChartType('contracts')}
            >
              <Text style={[styles.chartTabText, chartType === 'contracts' && styles.chartTabTextActive]}>
                Hợp đồng
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Chart */}
        <View style={styles.chartsContainer}>
          <MainChart
            title={mainChartData.title}
            data={mainChartData.data}
            labels={data?.monthlyStats?.labels || []}
            color={
              mainChartData.valueType === 'revenue'
                ? Colors.brandPrimary
                : mainChartData.valueType === 'rooms'
                ? Colors.accentSupport
                : Colors.accentContract
            }
          />
        </View>

        {/* Modern Analysis Section */}
        <View style={styles.modernAnalysisSection}>
          <Text style={styles.modernSectionTitle}>Phân tích chi tiết</Text>

          {/* Doanh thu chi tiết - Green */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.modernAnalysisCard, styles.greenBorder]}
            onPress={navigateToRevenueStatistic}>
            <View style={[styles.modernCardBorder, {backgroundColor: Colors.brandPrimary}]} />
            <View style={styles.modernCardContent}>
              <View style={[styles.modernIconContainer, styles.greenIconBg]}>
                <Image
                  source={require('../../../assets/icons/icon_light_report.png')}
                  style={[styles.modernIcon, styles.greenIcon]}
                />
              </View>
              <View style={styles.modernTextContainer}>
                <Text style={styles.modernCardTitle}>Doanh thu chi tiết</Text>
                <Text style={styles.modernCardDesc}>
                  Biểu đồ xu hướng, phân tích hóa đơn và{'\n'}tỷ lệ lấp đầy
                </Text>
              </View>
              <View style={styles.modernArrowContainer}>
                <Image
                  source={require('../../../assets/icons/icon_arrow_right.png')}
                  style={styles.modernArrow}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Thống kê phòng trọ - Cyan */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.modernAnalysisCard, styles.cyanBorder]}
            onPress={navigateToRoomStatistic}>
            <View style={[styles.modernCardBorder, {backgroundColor: Colors.accentSupport}]} />
            <View style={styles.modernCardContent}>
              <View style={[styles.modernIconContainer, styles.cyanIconBg]}>
                <Image
                  source={require('../../../assets/icons/icon_room.png')}
                  style={[styles.modernIcon, styles.cyanIcon]}
                />
              </View>
              <View style={styles.modernTextContainer}>
                <Text style={styles.modernCardTitle}>Thống kê phòng trọ</Text>
                <Text style={styles.modernCardDesc}>
                  Xu hướng thuê, top phòng được quan{'\n'}tâm nhất
                </Text>
              </View>
              <View style={styles.modernArrowContainer}>
                <Image
                  source={require('../../../assets/icons/icon_arrow_right.png')}
                  style={styles.modernArrow}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Quản lý hợp đồng - Blue */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.modernAnalysisCard, styles.blueBorder]}
            onPress={navigateToContractStatistic}>
            <View style={[styles.modernCardBorder, {backgroundColor: Colors.accentContract}]} />
            <View style={styles.modernCardContent}>
              <View style={[styles.modernIconContainer, styles.blueIconBg]}>
                <Image
                  source={require('../../../assets/icons/icon_contract.png')}
                  style={[styles.modernIcon, styles.blueIcon]}
                />
              </View>
              <View style={styles.modernTextContainer}>
                <Text style={styles.modernCardTitle}>Quản lý hợp đồng</Text>
                <Text style={styles.modernCardDesc}>
                  Tình trạng hợp đồng, danh sách gần đây
                </Text>
              </View>
              <View style={styles.modernArrowContainer}>
                <Image
                  source={require('../../../assets/icons/icon_arrow_right.png')}
                  style={styles.modernArrow}
                />
              </View>
            </View>
          </TouchableOpacity>
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
  // New Beautiful Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(16),
    gap: responsiveSpacing(12),
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: responsiveSpacing(20),
    alignItems: 'center',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  revenueCard: {
    backgroundColor: Colors.brandPrimary, // Emerald
  },
  roomCard: {
    backgroundColor: Colors.accentSupport, // Cyan
  },
  contractCard: {
    backgroundColor: Colors.accentContract, // Blue
  },
  occupiedCard: {
    backgroundColor: Colors.accentSchedule, // Teal
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(12),
  },
  statIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  statValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(20),
    color: Colors.white,
    marginBottom: responsiveSpacing(4),
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(13),
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },

  // Chart Section
  chartSection: {
    marginTop: responsiveSpacing(24),
    paddingHorizontal: responsiveSpacing(16),
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.brandPrimarySoft,
    borderRadius: 26,
    padding: responsiveSpacing(6),
    marginBottom: responsiveSpacing(16),
    position: 'relative',
    overflow: 'hidden',
  },
  chartTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
  },
  chartTabActive: {
    backgroundColor: 'transparent',
  },
  chartTabText: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(13),
    color: Colors.textSecondary,
  },
  chartTabTextActive: {
    color: Colors.white,
  },
  tabIndicator: {
    position: 'absolute',
    top: responsiveSpacing(6),
    left: responsiveSpacing(6),
    bottom: responsiveSpacing(6),
    backgroundColor: Colors.brandPrimary,
    borderRadius: 20,
    shadowColor: Colors.shadowDefault,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: responsiveSpacing(24),
    paddingVertical: responsiveSpacing(10),
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  headerContainerTopPad: {
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

  chartsContainer: {
    marginTop: responsiveSpacing(10),
    marginBottom: responsiveSpacing(16),
  },

  // Modern Analysis Section
  modernAnalysisSection: {
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(24),
    marginBottom: responsiveSpacing(24),
  },
  modernSectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(20),
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(20),
  },
  modernAnalysisCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  modernCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  greenBorder: {
    borderLeftWidth: 0,
  },
  cyanBorder: {
    borderLeftWidth: 0,
  },
  blueBorder: {
    borderLeftWidth: 0,
  },
  modernCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(20),
    paddingLeft: responsiveSpacing(26), // Extra space for border
  },
  modernIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(16),
  },
  greenIconBg: {
    backgroundColor: Colors.brandPrimarySoft,
  },
  cyanIconBg: {
    backgroundColor: '#E0F7FA',
  },
  blueIconBg: {
    backgroundColor: '#E3F2FD',
  },
  modernIcon: {
    width: 28,
    height: 28,
  },
  greenIcon: {
    tintColor: Colors.brandPrimary,
  },
  cyanIcon: {
    tintColor: Colors.accentSupport,
  },
  blueIcon: {
    tintColor: Colors.accentContract,
  },
  modernTextContainer: {
    flex: 1,
  },
  modernCardTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(17),
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(6),
  },
  modernCardDesc: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textSecondary,
    lineHeight: responsiveFont(20),
  },
  modernArrowContainer: {
    marginLeft: responsiveSpacing(12),
  },
  modernArrow: {
    width: 24,
    height: 24,
    tintColor: '#CCCCCC',
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
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },
});
