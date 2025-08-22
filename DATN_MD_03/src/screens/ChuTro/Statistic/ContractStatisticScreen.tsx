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
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';
import {API_CONFIG} from '../../../configs';

type ContractStatisticScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

const ContractStatisticScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ContractStatisticScreenNavigationProp>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {data, loading} = useSelector((state: RootState) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  // Helper functions
  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hiệu lực';
      case 'pending_approval':
      case 'pending':
        return 'Chờ ký';
      case 'expired':
        return 'Đã hết hạn';
      case 'terminated':
      case 'cancelled':
        return 'Đã chấm dứt';
      case 'draft':
        return 'Nháp';
      default:
        return status;
    }
  };

  // Helper function to get readable text color for status badges
  const getContractStatusTextColor = (_status: string) => {
    // Using black for all status text for better readability
    return Colors.black;
  };

  // Helper function to get background color for status badges
  const getContractStatusBgColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.limeGreen + '20'; // Light lime green background to match performance dot
      case 'pending_signature':
      case 'draft':
        return Colors.mediumGray + '20'; // Light gray background to match performance dot
      case 'pending_approval':
        return '#ffc107' + '20'; // Light yellow background to match performance dot
      case 'expired':
      case 'terminated':
      case 'cancelled':
        return Colors.lightRed + '20'; // Light red background to match performance dot
      default:
        return Colors.mediumGray + '20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

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

  const navigateToContractDetail = (contractId: string) => {
    navigation.navigate('ContractDetail', {contractId});
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
          title="Thống kê hợp đồng"
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
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Tổng hợp đồng */}
          <View style={[styles.statCard, styles.contractCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconContract}}
                style={[styles.statIcon, {tintColor: Colors.accentContract}]}
              />
            </View>
            <Text style={[styles.statValue, {color: Colors.accentContract}]}>
              {data?.overview?.totalContracts || 0}
            </Text>
            <Text style={styles.statLabel}>Tổng hợp đồng</Text>
          </View>

          {/* Đang hiệu lực */}
          <View style={[styles.statCard, styles.activeCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconCheck}}
                style={[styles.statIcon, {tintColor: Colors.limeGreen}]}
              />
            </View>
            <Text style={[styles.statValue, {color: Colors.limeGreen}]}>
              {data?.overview?.activeContracts || 0}
            </Text>
            <Text style={styles.statLabel}>Đang hiệu lực</Text>
          </View>

          {/* Chờ ký */}
          <View style={[styles.statCard, styles.pendingCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconSelectDate}}
                style={[styles.statIcon, {tintColor: Colors.mediumGray}]}
              />
            </View>
            <Text style={[styles.statValue, {color: Colors.mediumGray}]}>
              {data?.overview?.pendingContracts || 0}
            </Text>
            <Text style={styles.statLabel}>Chờ ký</Text>
          </View>

          {/* Đã hết hạn */}
          <View style={[styles.statCard, styles.expiredCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={require('../../../assets/icons/icon_warning.png')}
                style={[styles.statIcon, {tintColor: Colors.lightRed}]}
              />
            </View>
            <Text style={[styles.statValue, {color: Colors.lightRed}]}>
              {data?.overview?.expiredContracts || 0}
            </Text>
            <Text style={styles.statLabel}>Đã hết hạn</Text>
          </View>

          {/* Đã chấm dứt */}
          <View style={[styles.statCard, styles.terminatedCard]}>
            <View style={styles.statIconContainer}>
              <Image
                source={{uri: Icons.IconWarning}}
                style={[styles.statIcon, {tintColor: Colors.lightRed}]}
              />
            </View>
            <Text style={[styles.statValue, {color: Colors.lightRed}]}>
              {data?.overview?.terminatedContracts || 0}
            </Text>
            <Text style={styles.statLabel}>Đã chấm dứt</Text>
          </View>
        </View>

        {/* Modern Analysis Section */}
        <View style={styles.modernAnalysisSection}>
          <Text style={styles.modernSectionTitle}>Phân tích chi tiết</Text>

          {/* Contract Performance Card */}
          <View style={styles.performanceCard}>

              <View style={styles.performanceHeader}>
                <View style={styles.performanceIconContainer}>
                  <Image
                    source={{uri: Icons.IconLightReport}}
                    style={styles.performanceIcon}
                  />
                </View>
                <Text style={styles.performanceTitle}>Hiệu suất hợp đồng</Text>
              </View>

              <View style={styles.performanceStats}>
                <View style={styles.performanceItem}>
                  <View style={[styles.performanceDot, {backgroundColor: Colors.limeGreen}]} />
                  <Text style={styles.performanceLabel}>Đang hiệu lực</Text>
                  <Text style={styles.performanceValue}>{data?.overview?.activeContracts || 0}</Text>
                </View>

                <View style={styles.performanceItem}>
                  <View style={[styles.performanceDot, {backgroundColor: Colors.mediumGray}]} />
                  <Text style={styles.performanceLabel}>Chờ ký</Text>
                  <Text style={styles.performanceValue}>{data?.overview?.pendingContracts || 0}</Text>
                </View>

                <View style={styles.performanceItem}>
                  <View style={[styles.performanceDot, {backgroundColor: '#ffc107'}]} />
                  <Text style={styles.performanceLabel}>Chờ duyệt</Text>
                  <Text style={styles.performanceValue}>{data?.overview?.pendingContracts || 0}</Text>
                </View>

                <View style={styles.performanceItem}>
                  <View style={[styles.performanceDot, {backgroundColor: Colors.lightRed}]} />
                  <Text style={styles.performanceLabel}>Đã hết hạn</Text>
                  <Text style={styles.performanceValue}>{data?.overview?.expiredContracts || 0}</Text>
                </View>

                <View style={styles.performanceItem}>
                  <View style={[styles.performanceDot, {backgroundColor: Colors.lightRed}]} />
                  <Text style={styles.performanceLabel}>Đã chấm dứt</Text>
                  <Text style={styles.performanceValue}>{data?.overview?.terminatedContracts || 0}</Text>
                </View>
              </View>
          </View>
        </View>

        {/* Recent Contracts - Beautiful Design */}
        <View style={styles.contractsContainer}>
          <Text style={styles.modernSectionTitle}>Hợp đồng gần đây</Text>
          {data?.recentContracts && data.recentContracts.length > 0 ? (
            data.recentContracts
              .slice(0, 4)
              .map((contract: any, index: number) => (
                <TouchableOpacity
                  key={`recent-${contract._id}-${index}`}
                  style={styles.modernContractCard}
                  onPress={() => navigateToContractDetail(contract._id)}
                  activeOpacity={0.8}>

                  <View style={styles.contractContent}>

                    {/* Room Image */}
                    <View style={styles.contractImageContainer}>
                      <Image
                        source={
                          contract.roomId.photos && contract.roomId.photos.length > 0
                            ? {uri: `${API_CONFIG.BASE_URL}${contract.roomId.photos[0]}`}
                            : require('../../../assets/images/image_backgroud_button.png')
                        }
                        style={styles.contractImage}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Contract Info */}
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractRoomTitle}>
                        Phòng {contract.roomId.roomNumber}
                      </Text>
                      <Text style={styles.contractTenant}>
                        {contract.tenantId.fullName}
                      </Text>
                      <View style={styles.contractMeta}>
                        <View style={[
                          styles.contractStatusBadge,
                          {backgroundColor: getContractStatusBgColor(contract.status)}
                        ]}>
                          <Text style={[
                            styles.contractStatusText,
                            {color: getContractStatusTextColor(contract.status)}
                          ]}>
                            {getContractStatusText(contract.status)}
                          </Text>
                        </View>
                        <Text style={styles.contractDate}>
                          {formatDate(contract.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {/* Arrow */}
                    <View style={styles.contractArrow}>
                      <Image
                        source={{uri: Icons.IconArrowRight}}
                        style={styles.arrowIcon}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Image
                source={{uri: Icons.IconContract}}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Chưa có hợp đồng nào</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.modernSectionTitle}>Thao tác nhanh</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ContractManagement')}
            style={styles.quickCard}>
            <View style={styles.quickCard}>
              <View style={styles.quickLeft}>
                <View style={styles.quickIconWrap}>
                  <Image
                    source={{uri: Icons.IconContract}}
                    style={styles.quickIcon}
                  />
                </View>
                <Text style={styles.quickText}>Xem tất cả hợp đồng</Text>
              </View>
              <Image
                source={{uri: Icons.IconArrowRight}}
                style={styles.quickArrow}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContractStatisticScreen;

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
  // Beautiful Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    marginTop: responsiveSpacing(16),
    gap: responsiveSpacing(12),
    // Support 5 cards with 2-2-1 layout
  },
  statCard: {
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
    backgroundColor: '#F8F9FA', // Xám nhạt hơn
  },
  terminatedCard: {
    backgroundColor: '#F1F5F9', // Light gray for terminated
  },
  statIconContainer: {
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
  statIcon: {
    width: scale(20),
    height: scale(20),
  },
  statValue: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    marginBottom: responsiveSpacing(2),
    flexWrap: 'nowrap',
  },
  statLabel: {
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
  // Modern Analysis Section
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
    backgroundColor: Colors.accentContract,
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
  noDataText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
    marginVertical: responsiveSpacing(20),
  },
  actionsContainer: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  quickCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: responsiveSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(16),
    // Bỏ shadow/elevation
  },
  quickLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.accentContract + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveSpacing(12),
  },
  quickIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
  },
  quickText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Medium,
    color: Colors.darkGray,
  },
  quickArrow: {
    width: scale(16),
    height: scale(16),
    tintColor: Colors.mediumGray,
  },
  // Modern Contract Cards
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
  contractInfo: {
    flex: 1,
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
  // Empty State
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
});
