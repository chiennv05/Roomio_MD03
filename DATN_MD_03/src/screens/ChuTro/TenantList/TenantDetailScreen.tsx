import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {fetchTenantDetails, resetTenantDetail} from '../../../store/slices/tenantSlice';
import {RootStackParamList} from '../../../types/route';
import {Icons} from '../../../assets/icons';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  responsiveFont,
  scale,
  verticalScale,
} from '../../../utils/responsive';
import {getImageUrl} from '../../../configs';

// Import các component tái sử dụng
import HeaderWithBack from './components/HeaderWithBack';
import StatusBadge from './components/StatusBadge';
import InfoRow from './components/InfoRow';
import {LoadingView, ErrorView} from './components/LoadingAndError';
import {formatDate, formatMoney} from '../../../utils/formatUtils';

type TenantDetailScreenRouteProp = RouteProp<RootStackParamList, 'TenantDetail'>;

const TenantDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TenantDetailScreenRouteProp>();
  const {tenantId} = route.params;
  
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const {
    selectedTenant,
    activeContract,
    contractHistory,
    totalContracts,
    detailLoading,
    detailError,
  } = useSelector((state: RootState) => state.tenant);

  useEffect(() => {
    if (token && tenantId) {
      dispatch(fetchTenantDetails({token, tenantId}));
    }
    
    // Cleanup khi unmount
    return () => {
      dispatch(resetTenantDetail());
    };
  }, [dispatch, token, tenantId]);

  // Xử lý URL hình ảnh phòng
  const getRoomPhotoUrl = (photoPath: string) => {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    return getImageUrl(photoPath);
  };

  // Render khi đang loading
  if (detailLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Chi tiết người thuê" />
        <LoadingView message="Đang tải dữ liệu..." />
      </SafeAreaView>
    );
  }

  // Render khi có lỗi
  if (detailError) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Chi tiết người thuê" />
        <ErrorView 
          error={detailError} 
          onRetry={() => dispatch(fetchTenantDetails({token: token || '', tenantId}))} 
        />
      </SafeAreaView>
    );
  }

  // Render khi không có dữ liệu
  if (!selectedTenant) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithBack title="Chi tiết người thuê" />
        <ErrorView 
          error="Không tìm thấy thông tin người thuê" 
          onRetry={() => navigation.goBack()} 
          retryText="Quay lại"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBack title="Chi tiết người thuê" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Thông tin người thuê */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <InfoRow label="Họ và tên:" value={selectedTenant.fullName} />
          <InfoRow label="Tài khoản:" value={selectedTenant.username} />
          <InfoRow label="CCCD/CMND:" value={selectedTenant.identityNumber || 'Chưa cập nhật'} />
          <InfoRow label="Ngày sinh:" value={formatDate(selectedTenant.birthDate)} />
          <InfoRow label="Số điện thoại:" value={selectedTenant.phone || 'Chưa cập nhật'} />
          <InfoRow label="Email:" value={selectedTenant.email} />
          <InfoRow label="Địa chỉ:" value={selectedTenant.address || 'Chưa cập nhật'} />
          <InfoRow label="Ngày tạo tài khoản:" value={formatDate(selectedTenant.createdAt)} />
        </View>
        
        {/* Hợp đồng hiện tại */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hợp đồng hiện tại</Text>
          {activeContract ? (
            <>
              <StatusBadge status={activeContract.status} size="medium" />
              
              <View style={styles.contractDetail}>
                <View style={styles.roomImageContainer}>
                  <Image 
                    source={{uri: getRoomPhotoUrl(activeContract.room.photo)}} 
                    style={styles.roomImage}
                    defaultSource={Icons.IconRomManagement as any} 
                  />
                </View>
                
                <View style={styles.contractInfo}>
                  <InfoRow label="Phòng:" value={activeContract.room.roomNumber} />
                  <InfoRow label="Thuê từ:" value={formatDate(activeContract.startDate)} />
                  <InfoRow label="Đến:" value={formatDate(activeContract.endDate)} />
                  <InfoRow label="Giá thuê:" value={formatMoney(activeContract.monthlyRent)} />
                  <InfoRow label="Số người ở:" value={activeContract.tenantCount.toString()} />
                </View>
              </View>
              
              {activeContract.coTenants && activeContract.coTenants.length > 0 && (
                <View style={styles.coTenantsContainer}>
                  <Text style={styles.coTenantsTitle}>Người ở cùng:</Text>
                  {activeContract.coTenants.map((coTenant, index) => (
                    <View key={index} style={styles.coTenantItem}>
                      <Text style={styles.coTenantName}>
                        {index + 1}. {coTenant.username || coTenant.email}
                      </Text>
                      <Text style={styles.coTenantDetail}>
                        Email: {coTenant.email}
                      </Text>
                      {coTenant.phone ? (
                        <Text style={styles.coTenantDetail}>
                          SĐT: {coTenant.phone}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>Người thuê hiện không có hợp đồng hoạt động nào</Text>
          )}
        </View>
        
        {/* Lịch sử hợp đồng */}
        {contractHistory && contractHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử hợp đồng ({totalContracts})</Text>
            {contractHistory.map((contract, index) => (
              <View key={index} style={styles.historyItem}>
                <StatusBadge status={contract.status} size="small" />
                
                <InfoRow label="Phòng:" value={contract.room.roomNumber} />
                <InfoRow 
                  label="Thời gian:" 
                  value={`${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}`} 
                />
                <InfoRow label="Giá thuê:" value={formatMoney(contract.monthlyRent)} />
                <InfoRow label="Ngày tạo:" value={formatDate(contract.createdAt)} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: scale(16),
    marginBottom: verticalScale(16),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGreen,
    marginBottom: verticalScale(12),
  },
  contractDetail: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
  },
  roomImageContainer: {
    width: scale(100),
    height: scale(100),
    marginRight: scale(12),
    borderRadius: 8,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contractInfo: {
    flex: 1,
  },
  coTenantsContainer: {
    marginTop: verticalScale(16),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  coTenantsTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: verticalScale(8),
  },
  coTenantItem: {
    marginBottom: verticalScale(8),
    paddingLeft: scale(8),
  },
  coTenantName: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  coTenantDetail: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  historyItem: {
    marginBottom: verticalScale(16),
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  emptyText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    textAlign: 'center',
    marginVertical: verticalScale(20),
  },
});

export default TenantDetailScreen; 