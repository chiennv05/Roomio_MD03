import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {
  fetchTenantDetails,
  resetTenantDetail,
} from '../../../store/slices/tenantSlice';
import {RootStackParamList} from '../../../types/route';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, scale} from '../../../utils/responsive';
import {formatDate} from '../../../utils/formatDate';
import {amenitiesOptions} from '../AddRoom/utils/amenitiesOptions';
import {furnitureOptions} from '../AddRoom/utils/furnitureOptions';
import {Contract, CustomService} from '../../../types/Contract';

const TenantDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TenantDetail'>>();
  const {tenantId} = route.params;

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const {selectedTenant, activeContract, detailLoading} =
    useSelector((state: RootState) => state.tenant);

  useEffect(() => {
    if (token && tenantId) {
      dispatch(fetchTenantDetails({token, tenantId}));
    }
    return () => {
      dispatch(resetTenantDetail());
    };
  }, [dispatch, token, tenantId]);

  const getIconSource = (iconBase: string): ImageSourcePropType => {
    const iconKey = `${iconBase}Default` as keyof typeof Icons;
    const icon = Icons[iconKey];
    return {uri: icon || Icons.IconHomeDefaut};
  };

  const renderStatusBadge = (status: string) => (
    <View style={[
      styles.statusBadge,
      {backgroundColor: status === 'active' ? Colors.darkGreen : Colors.darkGray},
    ]}>
      <Text style={styles.statusText}>
        {status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
      </Text>
    </View>
  );

  const renderAmenitiesAndFurniture = (contract: Contract) => {
    if (!contract.contractInfo) return null;

    const hasAmenities = contract.contractInfo.amenities?.length > 0;
    const hasFurniture = contract.contractInfo.furniture?.length > 0;

    if (!hasAmenities && !hasFurniture) return null;

    return (
      <View style={styles.amenitiesSection}>
        <View style={styles.amenitiesHeader}>
          <Image 
            source={{uri: Icons.IconHomeDefaut}} 
            style={styles.amenitiesIcon} 
          />
          <Text style={styles.amenitiesTitle}>Tiện ích và Nội thất</Text>
        </View>

        {hasAmenities && (
          <>
            <Text style={styles.sectionSubtitle}>Tiện ích</Text>
            <View style={styles.amenitiesList}>
              {contract.contractInfo.amenities.map((item: string, index: number) => {
                const amenityOption = amenitiesOptions.find(opt => opt.value === item);
                if (!amenityOption?.iconBase) return null;
                
                return (
                  <View key={`amenity-${index}`} style={styles.amenityItem}>
                    <Image 
                      source={getIconSource(amenityOption.iconBase)} 
                      style={styles.itemIcon} 
                    />
                    <Text style={styles.amenityText}>{amenityOption.label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {hasAmenities && hasFurniture && (
          <View style={styles.separator} />
        )}

        {hasFurniture && (
          <>
            <Text style={styles.sectionSubtitle}>Nội thất</Text>
            <View style={styles.amenitiesList}>
              {contract.contractInfo.furniture.map((item: string, index: number) => {
                const furnitureOption = furnitureOptions.find(opt => opt.value === item);
                if (!furnitureOption?.iconBase) return null;
                
                return (
                  <View key={`furniture-${index}`} style={styles.amenityItem}>
                    <Image 
                      source={getIconSource(furnitureOption.iconBase)} 
                      style={styles.itemIcon} 
                    />
                    <Text style={styles.amenityText}>{furnitureOption.label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {detailLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Image source={{uri: Icons.IconArrowLeft}} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết người thuê</Text>
          </View>

          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {selectedTenant && activeContract && (
              <>
                {/* Thông tin cá nhân */}
                <View style={styles.section}>
                  {/* Header */}
                  <View style={styles.headerContainer}>
                    <Image source={{uri: Icons.IconPersonDefault}} style={styles.headerIcon} />
                    <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
                  </View>

                  {/* Personal Info Card */}
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Họ và tên</Text>
                      <Text style={styles.value}>{selectedTenant.fullName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.label}>CCCD/CMND</Text>
                      <Text style={styles.value}>{selectedTenant.identityNumber}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Ngày sinh</Text>
                      <Text style={styles.value}>{formatDate(selectedTenant.birthDate)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Số điện thoại</Text>
                      <Text style={styles.value}>{selectedTenant.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Email</Text>
                      <Text style={styles.value}>{selectedTenant.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Địa chỉ</Text>
                      <Text style={styles.value}>{selectedTenant.address}</Text>
                    </View>

                    {/* Người ở cùng section */}
                    {activeContract.contractInfo.coTenants && activeContract.contractInfo.coTenants.length > 0 && (
                      <View style={styles.coTenantsSection}>
                        <View style={styles.coTenantsHeader}>
                          <Image source={{uri: Icons.IconPersonDefault}} style={styles.smallIcon} />
                          <Text style={styles.coTenantsTitle}>
                            Người ở cùng ({activeContract.contractInfo.coTenants.length} người)
                          </Text>
                        </View>

                        {activeContract.contractInfo.coTenants.map((coTenant, index) => (
                          <View key={coTenant.userId} style={styles.coTenantRow}>
                            <View style={styles.indexBadge}>
                              <Text style={styles.indexText}>{index + 1}</Text>
                            </View>
                            <View style={styles.coTenantInfo}>
                              <Text style={styles.coTenantName}>{coTenant.fullName}</Text>
                              <Text style={styles.coTenantPhone}>{coTenant.phone}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Hợp đồng section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Image source={{uri: Icons.IconHome}} style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Hợp đồng hiện tại</Text>
                  </View>
                  <View style={styles.contractStatus}>
                    {renderStatusBadge(activeContract.status)}
                  </View>

                  {/* Nút xem danh sách người thuê */}
                  {activeContract && activeContract._id && (
                    <TouchableOpacity 
                      style={styles.viewTenantsButton}
                      onPress={() => {
                        if (activeContract._id) {
                          navigation.navigate('ContractTenants', {
                            contractId: activeContract._id
                          });
                        }
                      }}
                    >
                      <Image source={{uri: Icons.IconPersonDefault}} style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Xem danh sách người thuê</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Phòng</Text>
                      <Text style={styles.infoValue}>{activeContract.contractInfo.roomNumber}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Địa chỉ</Text>
                      <Text style={styles.infoValue}>{activeContract.contractInfo.roomAddress}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Diện tích</Text>
                      <Text style={styles.infoValue}>{`${activeContract.contractInfo.roomArea}m²`}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tiền thuê</Text>
                      <Text style={styles.infoValue}>{`${activeContract.contractInfo.monthlyRent.toLocaleString('vi-VN')}đ/tháng`}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tiền cọc</Text>
                      <Text style={styles.infoValue}>{`${activeContract.contractInfo.deposit.toLocaleString('vi-VN')}đ`}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
                      <Text style={styles.infoValue}>{formatDate(activeContract.contractInfo.startDate)}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Ngày kết thúc</Text>
                      <Text style={styles.infoValue}>{formatDate(activeContract.contractInfo.endDate)}</Text>
                    </View>
                  </View>

                  {/* Dịch vụ & Tiện ích */}
                  <View style={styles.servicesContainer}>
                    <Text style={styles.subSectionTitle}>Dịch vụ</Text>
                    <View style={styles.servicesList}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Điện</Text>
                        <Text style={styles.infoValue}>
                          {`${activeContract.contractInfo.serviceFees.electricity.toLocaleString('vi-VN')}đ/${
                            activeContract.contractInfo.serviceFeeConfig.electricity === 'perUsage' ? 'kWh' :
                            activeContract.contractInfo.serviceFeeConfig.electricity === 'perPerson' ? 'người' :
                            'phòng'
                          }`}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Nước</Text>
                        <Text style={styles.infoValue}>
                          {`${activeContract.contractInfo.serviceFees.water.toLocaleString('vi-VN')}đ/${
                            activeContract.contractInfo.serviceFeeConfig.water === 'perUsage' ? 'm³' :
                            activeContract.contractInfo.serviceFeeConfig.water === 'perPerson' ? 'người' :
                            'phòng'
                          }`}
                        </Text>
                      </View>
                      {activeContract.contractInfo.customServices.map((service: CustomService) => (
                        <View key={service.name} style={styles.infoItem}>
                          <Text style={styles.infoLabel}>{service.name}</Text>
                          <Text style={styles.infoValue}>
                            {`${service.price.toLocaleString('vi-VN')}đ/${
                              service.type === 'perPerson' ? 'người' :
                              service.type === 'perRoom' ? 'phòng' :
                              'lần sử dụng'
                            }`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Tiện ích và Nội thất */}
                  {renderAmenitiesAndFurniture(activeContract)}

                  {/* Nội quy & Điều khoản */}
                  <View style={styles.rulesContainer}>
                    <Text style={styles.subSectionTitle}>Nội quy & Điều khoản</Text>
                    <Text style={styles.ruleText}>{activeContract.contractInfo.rules}</Text>
                    <Text style={styles.ruleText}>{activeContract.contractInfo.additionalTerms}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </>
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
  section: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    margin: scale(16),
    padding: scale(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  sectionIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  infoContainer: {
    gap: scale(12),
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    flex: 1,
  },
  infoValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
  },
  contractStatus: {
    alignItems: 'flex-start',
    marginBottom: scale(16),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(16),
  },
  statusText: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  servicesContainer: {
    marginTop: scale(16),
  },
  subSectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(12),
  },
  servicesList: {
    gap: scale(8),
  },
  coTenantsContainer: {
    marginTop: scale(16),
  },
  coTenantsSection: {
    marginTop: scale(16),
    backgroundColor: Colors.backgroud,
    borderRadius: scale(12),
    padding: scale(12),
  },
  coTenantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  smallIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  coTenantsTitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  coTenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  indexBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: Colors.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  indexText: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  coTenantInfo: {
    flex: 1,
  },
  coTenantName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(2),
  },
  coTenantPhone: {
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
  amenitiesSection: {
    marginTop: scale(16),
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(16),
  },
  amenitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  amenitiesIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  amenitiesTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  sectionSubtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(12),
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroud,
    paddingVertical: scale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(20),
    minWidth: '45%',
  },
  itemIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  amenityText: {
    fontSize: responsiveFont(13),
    color: Colors.textGray,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: scale(16),
  },
  rulesContainer: {
    marginTop: scale(16),
  },
  ruleText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: scale(8),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkGreen,
    padding: scale(16),
    borderRadius: scale(8),
    marginHorizontal: scale(16),
    marginBottom: scale(16),
  },
  headerIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.white,
    marginRight: scale(8),
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(16),
    marginHorizontal: scale(16),
    padding: scale(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scale(8),
  },
  label: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    flex: 1,
  },
  value: {
    fontSize: responsiveFont(14),
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
  },
  viewTenantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(16),
  },
  buttonIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  buttonText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
});

export default TenantDetailScreen;
