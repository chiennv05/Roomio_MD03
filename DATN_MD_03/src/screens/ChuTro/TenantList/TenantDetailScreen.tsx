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
import {Contract} from '../../../types/Contract';
import HeaderWithBack from './components/HeaderWithBack';
import InfoRow from './components/InfoRow';
import { CustomService } from '../../../types/Room';

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

  const renderStatusBadge = (status: string) => {
    let statusText = 'Không xác định';
    let bgColor = Colors.gray;
    
    switch(status) {
      case 'active':
        statusText = 'Đang hoạt động';
        bgColor = Colors.darkGreen;
        break;
      case 'expired':
        statusText = 'Hết hạn';
        bgColor = Colors.darkGray;
        break;
      case 'pending':
        statusText = 'Chờ xác nhận';
        bgColor = Colors.warning;
        break;
      case 'needs_resigning':
        statusText = 'Cần gia hạn';
        bgColor = Colors.lightRed;
        break;
    }
    
    return (
      <View style={[styles.statusBadge, {backgroundColor: bgColor}]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    );
  };



  const renderAmenitiesAndFurniture = (contract: Contract) => {
    if (!contract.contractInfo) return null;

    const hasAmenities = contract.contractInfo.amenities?.length > 0;
    const hasFurniture = contract.contractInfo.furniture?.length > 0;

    if (!hasAmenities && !hasFurniture) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionIconContainer}>
          <Image source={{uri: Icons.IconHomeDefaut}} style={styles.sectionHeaderIcon} />
          <Text style={styles.sectionIconText}>Tiện ích và Nội thất</Text>
        </View>

        {hasAmenities && (
          <>
            <Text style={styles.subSectionTitle}>Tiện ích</Text>
            <View style={styles.amenitiesList}>
              {contract.contractInfo.amenities.map((item: string, index: number) => {
                const amenityOption = amenitiesOptions.find(opt => opt.label === item);
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
            <Text style={styles.subSectionTitle}>Nội thất</Text>
            <View style={styles.amenitiesList}>
              {contract.contractInfo.furniture.map((item: string, index: number) => {
                const furnitureOption = furnitureOptions.find(opt => opt.label === item);
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

  if (!selectedTenant || !activeContract) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack title="Chi tiết người thuê" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin người thuê</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (detailLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack title="Chi tiết người thuê" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderWithBack title="Chi tiết người thuê" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Thẻ thông tin người thuê */}
        <View style={styles.tenantCardContainer}>
          <View style={styles.tenantCard}>
            <View style={styles.tenantAvatarContainer}>
              <Image 
                source={{uri: Icons.IconPersonDefaut}} 
                style={styles.tenantAvatar} 
              />
            </View>
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>{selectedTenant.fullName}</Text>
              <Text style={styles.tenantPhone}>{selectedTenant.phone}</Text>
              {renderStatusBadge(activeContract.status)}
            </View>
          </View>
        </View>

        {/* Thông tin cá nhân */}
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Image source={{uri: Icons.IconPersonDefaut}} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionIconText}>Thông tin cá nhân</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <InfoRow label="Họ và tên" value={selectedTenant.fullName} />
            <InfoRow label="CCCD/CMND" value={selectedTenant.identityNumber} />
            <InfoRow label="Ngày sinh" value={formatDate(selectedTenant.birthDate)} />
            <InfoRow label="Số điện thoại" value={selectedTenant.phone} />
            <InfoRow label="Email" value={selectedTenant.email} />
            <InfoRow label="Địa chỉ" value={selectedTenant.address} />
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
                <Image source={{uri: Icons.IconPersonDefaut}} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Xem danh sách người thuê</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Người ở cùng */}
          {activeContract.contractInfo.coTenants && activeContract.contractInfo.coTenants.length > 0 && (
            <View style={styles.coTenantsSection}>
              <View style={styles.coTenantsHeader}>
                <Image source={{uri: Icons.IconPersonDefaut}} style={styles.smallIcon} />
                <Text style={styles.coTenantsTitle}>
                  Người ở cùng ({activeContract.contractInfo.coTenants.length})
                </Text>
              </View>

              {activeContract.contractInfo.coTenants.map((coTenant, index) => (
                <View key={index} style={styles.coTenantCard}>
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.coTenantInfo}>
                    <Text style={styles.coTenantName}>{coTenant.username || 'Không có tên'}</Text>
                    <Text style={styles.coTenantPhone}>{coTenant.phone || 'Không có SĐT'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Hợp đồng hiện tại */}
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Image source={{uri: Icons.IconHome}} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionIconText}>Hợp đồng hiện tại</Text>
          </View>

          <View style={styles.infoContainer}>
            <InfoRow label="Phòng" value={activeContract.contractInfo.roomNumber} bold />
            <InfoRow label="Địa chỉ" value={activeContract.contractInfo.roomAddress} />
            <InfoRow label="Diện tích" value={`${activeContract.contractInfo.roomArea}m²`} />
            <InfoRow 
              label="Tiền thuê" 
              value={`${activeContract.contractInfo.monthlyRent.toLocaleString('vi-VN')}đ/tháng`} 
              bold 
            />
            <InfoRow 
              label="Tiền cọc" 
              value={`${activeContract.contractInfo.deposit.toLocaleString('vi-VN')}đ`} 
            />
            <InfoRow label="Ngày bắt đầu" value={formatDate(activeContract.contractInfo.startDate)} />
            <InfoRow label="Ngày kết thúc" value={formatDate(activeContract.contractInfo.endDate)} />
          </View>
        </View>

        {/* Dịch vụ */}
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Image source={{uri: Icons.IconElectrical}} style={styles.sectionHeaderIcon} />
            <Text style={styles.sectionIconText}>Dịch vụ</Text>
          </View>
          <View style={styles.servicesList}>
            <InfoRow 
              label="Điện" 
              value={`${activeContract.contractInfo.serviceFees.electricity.toLocaleString('vi-VN')}đ/${
                activeContract.contractInfo.serviceFeeConfig.electricity === 'perUsage' ? 'kWh' :
                activeContract.contractInfo.serviceFeeConfig.electricity === 'perPerson' ? 'người' :
                'phòng'
              }`}
            />
            <InfoRow 
              label="Nước" 
              value={`${activeContract.contractInfo.serviceFees.water.toLocaleString('vi-VN')}đ/${
                activeContract.contractInfo.serviceFeeConfig.water === 'perUsage' ? 'm³' :
                activeContract.contractInfo.serviceFeeConfig.water === 'perPerson' ? 'người' :
                'phòng'
              }`}
            />
            {activeContract.contractInfo.customServices.map((service: CustomService, index: number) => (
              <InfoRow 
                key={`${service.name}-${index}`} 
                label={service.name} 
                value={`${service.price.toLocaleString('vi-VN')}đ/${
                  service.priceType === 'perPerson' ? 'người' :
                  service.priceType === 'perRoom' ? 'phòng' :
                  'lần sử dụng'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Tiện ích và Nội thất */}
        {renderAmenitiesAndFurniture(activeContract)}

        {/* Nội quy & Điều khoản */}
        {(activeContract.contractInfo.rules || activeContract.contractInfo.additionalTerms) && (
          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Image source={{uri: Icons.IconCheck}} style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionIconText}>Nội quy & Điều khoản</Text>
            </View>
            
            {activeContract.contractInfo.rules && (
              <>
                <Text style={styles.subSectionTitle}>Nội quy</Text>
                <Text style={styles.ruleText}>{activeContract.contractInfo.rules}</Text>
              </>
            )}
            
            {activeContract.contractInfo.additionalTerms && (
              <>
                <Text style={styles.subSectionTitle}>Điều khoản bổ sung</Text>
                <Text style={styles.ruleText}>{activeContract.contractInfo.additionalTerms}</Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroud,
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
  errorText: {
    fontSize: responsiveFont(16),
    color: Colors.error,
    fontFamily: Fonts.Roboto_Regular,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    margin: scale(16),
    marginBottom: scale(8),
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
  sectionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: scale(8),
    marginBottom: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  sectionHeaderIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: Colors.darkGreen,
    marginRight: scale(8),
  },
  sectionIconText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  tenantCardContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(8),
  },
  tenantCard: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tenantAvatarContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: Colors.limeGreenLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  tenantAvatar: {
    width: scale(30),
    height: scale(30),
    tintColor: Colors.darkGreen,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(4),
  },
  tenantPhone: {
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    marginBottom: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(16),
    alignSelf: 'flex-start',
  },
  statusText: {
    color: Colors.white,
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Bold,
  },
  infoContainer: {
    gap: scale(12),
  },
  subSectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(12),
    marginTop: scale(8),
  },
  servicesList: {
    gap: scale(8),
  },
  coTenantsSection: {
    marginTop: scale(16),
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: Colors.lightGray,
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
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
  },
  coTenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(8),
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
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    paddingVertical: scale(8),
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
    color: Colors.black,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: scale(16),
  },
  ruleText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginBottom: scale(8),
    lineHeight: scale(20),
  },
  viewTenantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.limeGreenLight,
    padding: scale(12),
    borderRadius: scale(8),
    marginTop: scale(8),
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
