import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {fetchContractDetail} from '../../../store/slices/contractSlice';
import {RootStackParamList} from '../../../types/route';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, scale} from '../../../utils/responsive';
import {formatDate} from '../../../utils/formatDate';
// import {ContractTenantResponse} from '../../../types/Contract';

type ContractTenantsNavigationProp = StackNavigationProp<RootStackParamList>;

interface TenantCardProps {
  fullName: string;
  email: string;
  phone: string;
  status?: string;
  isMainTenant?: boolean;
}

const ContractTenantsScreen = () => {
  const navigation = useNavigation<ContractTenantsNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ContractTenants'>>();
  const {contractId} = route.params;

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const {selectedContract, selectedContractLoading, selectedContractError} =
    useSelector((state: RootState) => state.contract);

  useEffect(() => {
    if (token && contractId) {
      dispatch(fetchContractDetail(contractId));
    }
  }, [dispatch, token, contractId]);

  const renderTenantCard = ({fullName, email, phone, status, isMainTenant = false}: TenantCardProps) => (
    <View key={`tenant-${email}`} style={styles.tenantCard}>
      <View style={styles.tenantHeader}>
        <Image source={{uri: Icons.IconPersonDefault}} style={styles.tenantIcon} />
        <View style={styles.tenantHeaderInfo}>
          <Text style={styles.tenantName}>{fullName}</Text>
          <Text style={styles.tenantRole}>
            {isMainTenant ? 'Người thuê chính' : 'Người ở cùng'}
          </Text>
        </View>
        {isMainTenant && status && (
          <View style={[styles.statusBadge, {
            backgroundColor: status === 'active' ? Colors.limeGreenLight : Colors.lightGray,
          }]}>
            <Text style={[styles.statusText, {
              color: status === 'active' ? Colors.darkGreen : Colors.darkGray,
            }]}>
              {status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tenantInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{phone}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={{uri: Icons.IconArrowLeft}} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách người thuê</Text>
      </View>

      {selectedContractLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : selectedContractError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{selectedContractError}</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {selectedContract && selectedContract.contractInfo && (
            <>
              {/* Thông tin phòng */}
              <View style={styles.roomInfoCard}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomNumber}>
                    Phòng {typeof selectedContract.roomId === 'object' ? selectedContract.roomId.roomNumber : ''}
                  </Text>
                  <View style={styles.occupancyInfo}>
                    <Text style={styles.occupancyText}>
                      {selectedContract.contractInfo.tenantCount}/{selectedContract.contractInfo.maxOccupancy} người
                    </Text>
                  </View>
                </View>
              </View>

              {/* Thông tin hợp đồng */}
              <View style={styles.contractInfoCard}>
                <View style={styles.contractHeader}>
                  <Image source={{uri: Icons.IconHome}} style={styles.contractIcon} />
                  <Text style={styles.contractTitle}>Thông tin hợp đồng</Text>
                </View>
                <View style={styles.contractInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <Text style={[
                      styles.infoValue,
                      {color: selectedContract.status === 'active' ? Colors.darkGreen : Colors.darkGray},
                    ]}>
                      {selectedContract.status === 'active' ? 'Đang hiệu lực' : 'Hết hạn'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(selectedContract.contractInfo.startDate)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(selectedContract.contractInfo.endDate)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Danh sách người thuê */}
              <View style={styles.tenantsSection}>
                {/* Người thuê chính */}
                {selectedContract.contractInfo.tenantName && renderTenantCard({
                  fullName: selectedContract.contractInfo.tenantName,
                  email: selectedContract.contractInfo.tenantEmail,
                  phone: selectedContract.contractInfo.tenantPhone,
                  isMainTenant: true,
                })}

                {/* Người ở cùng */}
                {selectedContract.contractInfo.coTenants &&
                 selectedContract.contractInfo.coTenants.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Người ở cùng ({selectedContract.contractInfo.coTenants.length})
                    </Text>
                    {selectedContract.contractInfo.coTenants.map((coTenant: any) => {
                      return renderTenantCard({
                        fullName: coTenant.username || coTenant.fullName,
                        email: coTenant.email,
                        phone: coTenant.phone,
                      });
                    })}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    padding: scale(8),
  },
  backIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.black,
  },
  headerTitle: {
    flex: 1,
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    textAlign: 'center',
    marginRight: scale(32),
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: responsiveFont(16),
    color: Colors.darkGreen,
    fontFamily: Fonts.Roboto_Regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(16),
  },
  errorText: {
    fontSize: responsiveFont(16),
    color: Colors.red,
    fontFamily: Fonts.Roboto_Regular,
    textAlign: 'center',
  },
  roomInfoCard: {
    backgroundColor: Colors.white,
    margin: scale(16),
    borderRadius: scale(12),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roomInfo: {
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  occupancyInfo: {
    backgroundColor: Colors.limeGreenLight,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(16),
  },
  occupancyText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  contractInfoCard: {
    backgroundColor: Colors.white,
    margin: scale(16),
    marginTop: 0,
    padding: scale(16),
    borderRadius: scale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  contractIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  contractTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  contractInfo: {
    gap: scale(8),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  infoValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  tenantsSection: {
    margin: scale(16),
    marginTop: 0,
    gap: scale(16),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(8),
  },
  tenantCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  tenantIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  tenantHeaderInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  tenantRole: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
  },
  statusBadge: {
    backgroundColor: Colors.limeGreenLight,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(16),
  },
  statusText: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  tenantInfo: {
    gap: scale(8),
  },
});

export default ContractTenantsScreen;
