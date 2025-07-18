import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../../../store';
import {
  fetchTenantDetails,
  resetTenantDetail,
} from '../../../store/slices/tenantSlice';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, scale} from '../../../utils/responsive';
import {formatDate} from '../../../utils/formatDate';
import HeaderWithBack from './components/HeaderWithBack';

const TenantDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'TenantDetail'>>();
  const {tenantId} = route.params;
  const insets = useSafeAreaInsets();

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

  const renderInfoRow = (label: string, value: string | number) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  if (!selectedTenant || !activeContract) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack title="Chi tiết người thuê" backgroundColor={Colors.white} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin người thuê</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (detailLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderWithBack title="Chi tiết người thuê" backgroundColor={Colors.white} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

    return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <SafeAreaView style={[styles.safeArea, {paddingTop: insets.top}]}>
        <HeaderWithBack title="Chi tiết người thuê" backgroundColor={Colors.white} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Thông tin phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phòng</Text>
          {renderInfoRow('Số phòng', activeContract.contractInfo.roomNumber)}
          {renderInfoRow('Diện tích:', `${activeContract.contractInfo.roomArea}m²`)}
          {renderInfoRow('Số người tối đa', activeContract.contractInfo.maxOccupancy)}
          {renderInfoRow('Số người hiện tại', activeContract.contractInfo.tenantCount)}
          {renderInfoRow('Địa chỉ', activeContract.contractInfo.roomAddress)}
        </View>

        {/* Thông tin người đại diện */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người đại diện</Text>
          {renderInfoRow('Họ tên:', activeContract.contractInfo.landlordName)}
          {renderInfoRow('Số điện thoại:', activeContract.contractInfo.landlordPhone)}
                     {renderInfoRow('Email', 'Không có')}
          {renderInfoRow('CCCD', activeContract.contractInfo.landlordIdentityNumber)}
          {renderInfoRow('Ngày sinh', formatDate(activeContract.contractInfo.landlordBirthDate))}
          {renderInfoRow('Địa chỉ', activeContract.contractInfo.landlordAddress)}
        </View>

        {/* Thông tin người thuê chính */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
          {renderInfoRow('Họ tên:', selectedTenant.fullName)}
          {renderInfoRow('Số điện thoại:', selectedTenant.phone)}
          {renderInfoRow('Email', selectedTenant.email)}
          {renderInfoRow('CCCD', selectedTenant.identityNumber)}
          {renderInfoRow('Ngày sinh', formatDate(selectedTenant.birthDate))}
          {renderInfoRow('Địa chỉ', selectedTenant.address)}
        </View>

        {/* Thông tin các người thuê phụ */}
        {activeContract.contractInfo.coTenants && 
         activeContract.contractInfo.coTenants
           .filter(coTenant => coTenant.userId !== selectedTenant._id)
           .map((coTenant, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
            {renderInfoRow('Họ tên:', coTenant.username || 'Không có tên')}
            {renderInfoRow('Số điện thoại:', coTenant.phone || 'Không có')}
            {renderInfoRow('Email', coTenant.email || 'Không có')}
            {renderInfoRow('CCCD', coTenant.identityNumber || 'Không có')}
            {renderInfoRow('Ngày sinh', coTenant.birthDate ? formatDate(coTenant.birthDate) : 'Không có')}
            {renderInfoRow('Địa chỉ', coTenant.address || 'Không có')}
          </View>
                 ))}
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.backgroud,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginBottom: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    marginTop: scale(0),
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(16),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: scale(12),
    alignItems: 'flex-start',
  },
  label: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    width: scale(150),
  },
  value: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.black,
    flex: 1,
    lineHeight: scale(22),
  },
});

export default TenantDetailScreen;
