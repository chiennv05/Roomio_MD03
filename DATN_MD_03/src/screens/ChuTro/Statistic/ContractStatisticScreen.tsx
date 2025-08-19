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
import {StatChart, RecentContractItem} from './components';
import UIHeader from '../MyRoom/components/UIHeader';
import {Icons} from '../../../assets/icons';

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
        {/* Contract Overview */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Tổng hợp đồng</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.totalContracts || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Đang hiệu lực</Text>
            <Text style={[styles.overviewValue, {color: Colors.darkGreen}]}>
              {data?.overview?.activeContracts || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Chờ ký</Text>
            <Text style={[styles.overviewValue, {color: Colors.mediumGray}]}>
              {data?.overview?.pendingContracts || 0}
            </Text>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Đã hết hạn</Text>
            <Text style={[styles.overviewValue, {color: Colors.red}]}>
              {data?.overview?.expiredContracts || 0}
            </Text>
          </View>
        </View>

        {/* Contract Chart */}
        {data?.monthlyStats && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Biểu đồ hợp đồng theo tháng</Text>
            <StatChart
              title="Số hợp đồng"
              data={data.monthlyStats.contracts}
              labels={data.monthlyStats.labels}
              color={Colors.primaryGreen}
            />
          </View>
        )}

        {/* Contract Status Breakdown */}
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>Phân loại theo trạng thái</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: Colors.darkGreen},
                  ]}
                />
                <Text style={styles.statusLabel}>Đang hiệu lực</Text>
              </View>
              <Text style={styles.statusValue}>
                {data?.overview?.activeContracts || 0}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: Colors.mediumGray},
                  ]}
                />
                <Text style={styles.statusLabel}>Chờ ký</Text>
              </View>
              <Text style={styles.statusValue}>
                {data?.overview?.pendingContracts || 0}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusLeft}>
                <View
                  style={[styles.statusDot, {backgroundColor: Colors.red}]}
                />
                <Text style={styles.statusLabel}>Đã hết hạn</Text>
              </View>
              <Text style={styles.statusValue}>
                {data?.overview?.expiredContracts || 0}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: Colors.primaryGreen},
                  ]}
                />
                <Text style={styles.statusLabel}>Đã gia hạn</Text>
              </View>
              <Text style={styles.statusValue}>
                {(data?.overview?.totalContracts || 0) -
                  (data?.overview?.activeContracts || 0) -
                  (data?.overview?.pendingContracts || 0) -
                  (data?.overview?.expiredContracts || 0)}
              </Text>
            </View>
          </View>
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

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ContractManagement')}>
            <Image
              source={require('../../../assets/icons/icon_ban_ghe.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Xem tất cả hợp đồng</Text>
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
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
    justifyContent: 'space-between',
  },
  overviewCard: {
    width: '48%',
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
  overviewLabel: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: responsiveSpacing(4),
  },
  overviewValue: {
    fontSize: responsiveFont(20),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
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
  statusContainer: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  statusCard: {
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
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginRight: responsiveSpacing(8),
  },
  statusLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  statusValue: {
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
