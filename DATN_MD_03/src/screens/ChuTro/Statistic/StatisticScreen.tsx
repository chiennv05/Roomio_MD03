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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {AppDispatch, RootState} from '../../../store';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, responsiveSpacing} from '../../../utils/responsive';
import {fetchDashboard, clearDashboardData} from '../../../store/slices/dashboardSlice';
import {MainBarChart, OverviewTab, RoomsTab, RevenueTab, ContractsTab} from './components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {LoadingAnimation} from '../../../components';
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';
import {scale, SCREEN} from '../../../utils/responsive';

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [primaryTab, setPrimaryTab] = useState<'overview' | 'rooms' | 'revenue' | 'contracts'>('overview');
  const [selectedMonth, _setSelectedMonth] = useState(8); // Tháng được chọn, mặc định tháng 8
  const [chartTab, setChartTab] = useState<'revenue' | 'rooms' | 'contracts'>('revenue'); // Tab con trong biểu đồ


  // Lấy chiều cao của thanh trạng thái
  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (user?.auth_token) {
      // Check if user has changed or force refresh is requested
      const userChanged = currentUserId !== user._id;
      if (userChanged || forceRefresh || !data) {
        // Clear existing data when user changes to prevent showing stale data
        if (userChanged) {
          setCurrentUserId(user._id || null);
          dispatch(clearDashboardData()); // Clear cached data
        }
        dispatch(fetchDashboard(user.auth_token));
      }
    }
  }, [dispatch, user?.auth_token, user?._id, currentUserId, data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Detect user changes and force refresh
  useEffect(() => {
    if (user?._id && currentUserId && currentUserId !== user._id) {
      // User has changed, force refresh data
      fetchData(true);
    }
  }, [user?._id, currentUserId, fetchData]);

  // Initial load and user tracking
  useEffect(() => {
    if (user?._id && !currentUserId) {
      setCurrentUserId(user._id || null);
      fetchData(true);
    }
  }, [user?._id, currentUserId, fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true); // Force refresh on manual pull-to-refresh
    setRefreshing(false);
  };

  // Thêm hàm xử lý quay lại
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Navigation helper functions
  const navigateToRoomDetail = (roomId: string) => {
    navigation.navigate('DetailRoomLandlord', {id: roomId});
  };

  const navigateToContractDetail = (contractId: string) => {
    navigation.navigate('ContractDetail', {contractId});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Xử lý khi người dùng chọn tab trong biểu đồ
  const handleChartTabChange = (tabType: 'revenue' | 'rooms' | 'contracts') => {
    // Chỉ thay đổi tab con trong biểu đồ, không thay đổi primaryTab
    setChartTab(tabType);
  };

  // Helper functions for contract status
  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hiệu lực';
      case 'pending_signature': return 'Chờ ký';
      case 'expired': return 'Hết hạn';
      case 'terminated': return 'Đã chấm dứt';
      case 'cancelled': return 'Đã chấm dứt';
      case 'draft': return 'Nháp';
      case 'pending_approval': return 'Chờ duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchData(true)}>
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
        
        {/* Primary Navigation Tabs */}
        <View style={styles.primaryTabsWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.primaryTabsContainer}
          >
          <TouchableOpacity
            style={[styles.primaryTab, primaryTab === 'overview' && styles.primaryTabActive]}
            onPress={() => setPrimaryTab('overview')}
          >
            <Text style={[styles.primaryTabText, primaryTab === 'overview' && styles.primaryTabTextActive]}>
              Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryTab, primaryTab === 'rooms' && styles.primaryTabActive]}
            onPress={() => setPrimaryTab('rooms')}
          >
            <Text style={[styles.primaryTabText, primaryTab === 'rooms' && styles.primaryTabTextActive]}>
              Phòng trọ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryTab, primaryTab === 'revenue' && styles.primaryTabActive]}
            onPress={() => setPrimaryTab('revenue')}
          >
            <Text style={[styles.primaryTabText, primaryTab === 'revenue' && styles.primaryTabTextActive]}>
              Doanh thu
            </Text>
          </TouchableOpacity>
                      <TouchableOpacity
              style={[styles.primaryTab, primaryTab === 'contracts' && styles.primaryTabActive]}
              onPress={() => setPrimaryTab('contracts')}
            >
              <Text style={[styles.primaryTabText, primaryTab === 'contracts' && styles.primaryTabTextActive]}>
                Hợp đồng
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab-specific Content */}
        {primaryTab === 'overview' && (
          <OverviewTab data={data} formatMoney={formatMoney} />
        )}

        {/* Phòng trọ Tab Content */}
        {primaryTab === 'rooms' && (
          <RoomsTab 
            data={data} 
            navigateToRoomDetail={navigateToRoomDetail} 
            navigation={navigation} 
          />
        )}

        {/* Hợp đồng Tab Content */}
        {primaryTab === 'contracts' && (
          <ContractsTab 
            data={data}
            getContractStatusText={getContractStatusText}
            formatDate={formatDate}
            navigateToContractDetail={navigateToContractDetail}
          />
        )}

        {/* Doanh thu Tab Content */}
        {primaryTab === 'revenue' && (
          <RevenueTab data={data} formatMoney={formatMoney} />
        )}



        {/* Main Chart - chỉ hiển thị ở tab Tổng quan */}
        {primaryTab === 'overview' && (
          <View style={styles.chartsContainer}>
            <MainBarChart
              title={`Biểu đồ ${chartTab === 'revenue' ? 'doanh thu' : 
                     chartTab === 'rooms' ? 'phòng trọ' : 'hợp đồng'} 6 tháng đầu năm 2025`}
              chartType={chartTab}
              onNavigate={(direction: 'prev' | 'next') => {
                console.log(`Navigating ${direction}`);
                // Handle navigation logic here if needed
              }}
              onMonthSelect={(month) => {
                console.log(`Selected month: ${month}`);
                // Handle month selection if needed
              }}
              onTabChange={handleChartTabChange}
            />
          </View>
        )}

        {/* Bottom Summary Card - chỉ hiển thị ở tab Tổng quan */}
        {primaryTab === 'overview' && (
          <View style={styles.bottomRevenueCard}>
            <Text style={styles.bottomRevenueTitle}>
              {chartTab === 'revenue' && `Doanh thu tháng ${selectedMonth}`}
              {chartTab === 'rooms' && `Số phòng tháng ${selectedMonth}`}
              {chartTab === 'contracts' && `Hợp đồng tháng ${selectedMonth}`}
            </Text>
            <Text style={styles.bottomRevenueValue}>
              {chartTab === 'revenue' && `${formatMoney(data?.monthlyStats?.revenue?.[selectedMonth - 3] || 0)} VND`}
              {chartTab === 'rooms' && `${data?.monthlyStats?.rooms?.[selectedMonth - 3] || 0} Phòng`}
              {chartTab === 'contracts' && `${data?.monthlyStats?.contracts?.[selectedMonth - 3] || 0} Hợp đồng`}
            </Text>
          </View>
        )}

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
  
  // Primary Navigation Tabs
  primaryTabsWrapper: {
    marginHorizontal: responsiveSpacing(-6),
    marginTop: responsiveSpacing(20),
  },
  primaryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: responsiveSpacing(24),
    gap: responsiveSpacing(8),
    height: 44,
  },
  primaryTab: {
    paddingVertical: responsiveSpacing(12),
    paddingHorizontal: responsiveSpacing(16),
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 121,
    height: 44,
  },
  primaryTabActive: {
    backgroundColor: Colors.limeGreen,
  },
  primaryTabText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(13),
    color: Colors.black,
  },
  primaryTabTextActive: {
    color: Colors.black,
    fontFamily: Fonts.Roboto_Bold,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(20),
    gap: responsiveSpacing(16),
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  whiteCard: {
    backgroundColor: Colors.white,
  },
  statHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
  },
  statIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.darkGreen,
    marginRight: responsiveSpacing(8),
  },
  statLabel: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(12),
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },



  // Charts Container
  chartsContainer: {
    backgroundColor: Colors.limeGreen,
    paddingBottom: responsiveSpacing(20),
    borderRadius: 16,
    marginHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(24), // Thêm khoảng cách phía trên
    marginBottom: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Bottom Revenue Card
  bottomRevenueCard: {
    backgroundColor: Colors.limeGreen,
    marginHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(8), // Giảm khoảng cách từ 20 xuống 8
    padding: responsiveSpacing(20),
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.limeGreen,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomRevenueTitle: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(8),
  },
  bottomRevenueValue: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(20),
    color: Colors.black,
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
  headerContainer: {
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingHorizontal: responsiveSpacing(16),
    paddingVertical: responsiveSpacing(8),
  },

  // Tab Content
  tabContent: {
    flex: 1,
  },

  // Section Container
  sectionContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(20),
    padding: responsiveSpacing(16),
    borderRadius: 16,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: responsiveSpacing(16),
  },

  // Room Item
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  roomRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.limeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsiveSpacing(12),
  },
  roomRankText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.black,
  },
  roomInfo: {
    flex: 1,
  },
  roomNumber: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  roomPrice: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(13),
    color: Colors.darkGreen,
    marginBottom: responsiveSpacing(2),
  },
  roomStats: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.textSecondary,
  },

  // Contract Item (for old style - keep for compatibility)
  contractItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  contractInfo: {
    flex: 1,
  },
  contractRoom: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(14),
    color: Colors.black,
    marginBottom: responsiveSpacing(4),
  },
  contractPrice: {
    fontFamily: Fonts.Roboto_Medium,
    fontSize: responsiveFont(12),
    color: Colors.darkGreen,
  },
  contractStatus: {
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(6),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Rooms Tab Styles from RoomStatisticScreen
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
    justifyContent: 'space-between',
  },
  singleColumnContainer: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
  },
  overviewCardFull: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(80),
  },
  overviewCardSimple: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(12),
    marginBottom: responsiveSpacing(12),
    borderWidth: 1,
    borderColor: Colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(80),
  },
  cardTotal: {},
  cardRented: {},
  cardAvailable: {},
  cardPending: {},
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
  iconWrapNeutral: {
    backgroundColor: Colors.neutralSoft,
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  overviewIcon: {
    width: scale(20),
    height: scale(20),
  },
  overviewContent: {
    flex: 1,
    justifyContent: 'center',
  },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(10),
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveSpacing(8),
    tintColor: Colors.textSecondary,
  },
  topRoomsContainer: {
    marginTop: responsiveSpacing(16),
  },
  noDataText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    marginVertical: responsiveSpacing(20),
  },
  actionsContainer: {
    marginTop: responsiveSpacing(8),
    paddingHorizontal: responsiveSpacing(16),
    paddingBottom: responsiveSpacing(12),
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
  quickIcon: {width: scale(18), height: scale(18), tintColor: Colors.darkGreen},
  quickText: {fontFamily: Fonts.Roboto_Bold, fontSize: responsiveFont(16), color: Colors.white},
  quickArrow: {width: scale(18), height: scale(18), tintColor: Colors.white},

  // Revenue Tab Styles from RevenueStatisticScreen
  revenueStatsGrid: {
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(12),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  revenueStatCard: {
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
    backgroundColor: Colors.brandPrimary,
  },
  avgCard: {
    backgroundColor: Colors.accentSupport,
  },
  revenueStatIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSpacing(10),
  },
  revenueStatIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.white,
  },
  revenueStatValue: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  revenueStatLabel: {
    marginTop: responsiveSpacing(4),
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.white,
    opacity: 0.9,
  },
  revenueValue: { color: Colors.white },
  avgValue: { color: Colors.white },
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

  // Contract Tab Styles from ContractStatisticScreen
  contractStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(16),
    gap: responsiveSpacing(12),
  },
  contractStatCard: {
    width: '47%',
    borderRadius: 12,
    padding: responsiveSpacing(12),
    alignItems: 'center',
    minHeight: scale(100),
    justifyContent: 'center',
  },
  contractCard: {
    backgroundColor: '#E3F2FD',
  },
  activeCard: {
    backgroundColor: '#E8F5E8',
  },
  pendingCard: {
    backgroundColor: '#FFF8E1',
  },
  expiredCard: {
    backgroundColor: '#F8F9FA',
  },
  contractStatIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveSpacing(8),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractStatIcon: {
    width: scale(20),
    height: scale(20),
  },
  contractStatValue: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    marginBottom: responsiveSpacing(2),
  },
  contractStatLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: responsiveFont(14),
  },
  modernSectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  modernAnalysisSection: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  performanceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: responsiveSpacing(20),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSpacing(16),
  },
  performanceIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  performanceIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.white,
  },
  performanceTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  performanceStats: {
    gap: responsiveSpacing(12),
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
  },
  performanceDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: responsiveSpacing(12),
  },
  performanceLabel: {
    flex: 1,
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  performanceValue: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  contractsContainer: {
    marginTop: responsiveSpacing(16),
  },
  modernContractCard: {
    backgroundColor: Colors.white,
    marginHorizontal: responsiveSpacing(16),
    marginBottom: responsiveSpacing(12),
    borderRadius: 16,
    padding: responsiveSpacing(16),
    shadowColor: Colors.shadowDefault,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractImageContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(12),
    overflow: 'hidden',
    marginRight: responsiveSpacing(12),
  },
  contractImage: {
    width: '100%',
    height: '100%',
  },
  contractRoomTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(4),
  },
  contractTenant: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textSecondary,
    marginBottom: responsiveSpacing(8),
  },
  contractMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contractStatusBadge: {
    paddingHorizontal: responsiveSpacing(8),
    paddingVertical: responsiveSpacing(4),
    borderRadius: scale(12),
  },
  contractStatusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Medium,
  },
  contractDate: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  contractArrow: {
    marginLeft: responsiveSpacing(8),
  },
  arrowIcon: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.mediumGray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing(40),
    marginHorizontal: responsiveSpacing(16),
  },
  emptyIcon: {
    width: scale(48),
    height: scale(48),
    tintColor: Colors.textGray,
    marginBottom: responsiveSpacing(12),
  },
  emptyText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },
  contractQuickCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: responsiveSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(16),
  },
  contractQuickIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.accentContract + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  contractQuickIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.accentContract,
  },
});