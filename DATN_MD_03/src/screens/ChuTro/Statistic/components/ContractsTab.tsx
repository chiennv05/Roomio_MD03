import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../../types/route';
import {Colors} from '../../../../theme/color';
import {Fonts} from '../../../../theme/fonts';
import {
  responsiveFont,
  responsiveSpacing,
  scale,
} from '../../../../utils/responsive';
import {API_CONFIG} from '../../../../configs';

type ContractsTabNavigationProp = StackNavigationProp<RootStackParamList>;

interface ContractsTabProps {
  data: any;
  getContractStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
  navigateToContractDetail: (contractId: string) => void;
}

const ContractsTab: React.FC<ContractsTabProps> = ({
  data,
  getContractStatusText,
  formatDate,
  navigateToContractDetail,
}) => {
  const navigation = useNavigation<ContractsTabNavigationProp>();

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

  console.log('object', data);

  return (
    <View style={styles.tabContent}>
      {/* Stats Grid - consistent with room tab style */}
      <View style={styles.overviewContainer}>
        {/* Tổng hợp đồng */}
        <View style={[styles.overviewCardSimple, styles.cardTotal]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image
              source={require('../../../../assets/icons/icon_contract.png')}
              style={[styles.overviewIcon, {tintColor: Colors.brandPrimary}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Tổng hợp đồng</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.totalContracts || 0}
            </Text>
          </View>
        </View>

        {/* Đang hiệu lực */}
        <View style={[styles.overviewCardSimple, styles.cardRented]}>
          <View style={[styles.iconBadge, styles.iconWrap]}>
            <Image
              source={require('../../../../assets/icons/icon_check.png')}
              style={[styles.overviewIcon, {tintColor: Colors.limeGreen}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Đang hiệu lực</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.activeContracts || 0}
            </Text>
          </View>
        </View>

        {/* Chờ ký */}
        <View style={[styles.overviewCardSimple, styles.cardAvailable]}>
          <View style={[styles.iconBadge, styles.iconWrapNeutral]}>
            <Image
              source={require('../../../../assets/icons/icon_select_date.png')}
              style={[styles.overviewIcon, {tintColor: Colors.mediumGray}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Chờ ký</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.pendingContracts || 0}
            </Text>
          </View>
        </View>

        {/* Đã hết hạn */}
        <View style={[styles.overviewCardSimple, styles.cardExpired]}>
          <View style={[styles.iconBadge, styles.iconWrapWarning]}>
            <Image
              source={require('../../../../assets/icons/icon_warning.png')}
              style={[styles.overviewIcon, {tintColor: Colors.lightRed}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Đã hết hạn</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.expiredContracts || 0}
            </Text>
          </View>
        </View>

        {/* Đã chấm dứt */}
        <View style={[styles.overviewCardSimple, styles.cardPending]}>
          <View style={[styles.iconBadge, styles.iconWrapWarning]}>
            <Image
              source={require('../../../../assets/icons/icon_warning.png')}
              style={[styles.overviewIcon, {tintColor: Colors.lightRed}]}
            />
          </View>
          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>Đã chấm dứt</Text>
            <Text style={styles.overviewValue}>
              {data?.overview?.terminatedContracts || 0}
            </Text>
          </View>
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
                source={require('../../../../assets/icons/icon_light_report.png')}
                style={styles.performanceIcon}
              />
            </View>
            <Text style={styles.performanceTitle}>Trạng thái hợp đồng</Text>
          </View>

          <View style={styles.performanceStats}>
            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceDot,
                  {backgroundColor: Colors.limeGreen},
                ]}
              />
              <Text style={styles.performanceLabel}>Đang hiệu lực</Text>
              <Text style={styles.performanceValue}>
                {data?.overview?.activeContracts || 0}
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceDot,
                  {backgroundColor: Colors.mediumGray},
                ]}
              />
              <Text style={styles.performanceLabel}>Chờ ký</Text>
              <Text style={styles.performanceValue}>
                {data?.overview?.pendingContracts || 0}
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[styles.performanceDot, {backgroundColor: '#ffc107'}]}
              />
              <Text style={styles.performanceLabel}>Chờ duyệt</Text>
              <Text style={styles.performanceValue}>
                {data?.overview?.pendingContracts || 0}
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceDot,
                  {backgroundColor: Colors.lightRed},
                ]}
              />
              <Text style={styles.performanceLabel}>Đã hết hạn</Text>
              <Text style={styles.performanceValue}>
                {data?.overview?.expiredContracts || 0}
              </Text>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceDot,
                  {backgroundColor: Colors.lightRed},
                ]}
              />
              <Text style={styles.performanceLabel}>Đã chấm dứt</Text>
              <Text style={styles.performanceValue}>
                {data?.overview?.terminatedContracts || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Contracts - Beautiful Design */}
      <View style={styles.contractsContainer}>
        <Text style={styles.modernSectionTitle}>Hợp đồng gần đây</Text>
        {data?.recentContracts && data.recentContracts.length > 0 ? (
          data.recentContracts
            .filter(
              (contract: any) =>
                contract.roomId &&
                contract.roomId.roomNumber !== 'Phòng đã bị xóa' &&
                Array.isArray(contract.roomId.photos) &&
                contract.roomId.photos.length > 0,
            )
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
                      source={{
                        uri: `${API_CONFIG.BASE_URL}${contract.roomId.photos[0]}`,
                      }}
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
                      <View
                        style={[
                          styles.contractStatusBadge,
                          {
                            backgroundColor: getContractStatusBgColor(
                              contract.status,
                            ),
                          },
                        ]}>
                        <Text
                          style={[
                            styles.contractStatusText,
                            {
                              color: getContractStatusTextColor(
                                contract.status,
                              ),
                            },
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
                      source={require('../../../../assets/icons/icon_arrow_right.png')}
                      style={styles.arrowIcon}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Image
              source={require('../../../../assets/icons/icon_contract.png')}
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
          style={[styles.quickCard, {backgroundColor: Colors.limeGreen}]}>
          <View style={styles.quickGradient}>
            <View style={styles.quickLeft}>
              <View style={styles.quickIconWrap}>
                <Image
                  source={require('../../../../assets/icons/icon_contract.png')}
                  style={styles.quickIcon}
                />
              </View>
              <Text style={styles.quickText}>Xem tất cả hợp đồng</Text>
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

export default ContractsTab;

const styles = StyleSheet.create({
  tabContent: {
    paddingBottom: responsiveSpacing(16),
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(16),
    justifyContent: 'space-between',
    // Allow for 5 cards: 2-2-1 layout
  },
  overviewCardSimple: {
    width: '48%',
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
  cardAvailable: {},
  cardExpired: {},
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
  iconWrapWarning: {
    backgroundColor: 'rgba(255, 56, 60, 0.1)', // Light red background matching Colors.lightRed
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
  modernAnalysisSection: {
    marginTop: responsiveSpacing(16),
    paddingHorizontal: responsiveSpacing(16),
  },
  modernSectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(16),
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
    paddingHorizontal: responsiveSpacing(16),
  },
  modernContractCard: {
    backgroundColor: Colors.white,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: responsiveSpacing(40),
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
