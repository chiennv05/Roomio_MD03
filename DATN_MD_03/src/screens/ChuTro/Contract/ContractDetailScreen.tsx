import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {scale, verticalScale, responsiveFont} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {fetchContractDetail} from '../../../store/slices/contractSlice';
import {getContractStatusInfo} from './components/ContractItem';
import {UIHeader} from '../MyRoom/components';
import {
  handleViewPDF,
  handlePickImages,
  handleViewImage,
} from './utils/contractEvents';

// Format tiền tệ
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('vi-VN') + ' đ';
};

// Format ngày tháng đầy đủ
const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Format thời gian lịch sử
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()} ${hours}:${minutes}`;
};

const ContractDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ContractDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const {contractId} = route.params;

  const {
    selectedContract,
    selectedContractLoading,
    selectedContractError,
    uploadingImages,
  } = useSelector((state: RootState) => state.contract);

  useEffect(() => {
    dispatch(fetchContractDetail(contractId));
  }, [contractId, dispatch]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Event Handlers
  const onViewPDF = () => {
    if (selectedContract) {
      handleViewPDF(selectedContract, contractId, dispatch, navigation);
    }
  };

  const onPickImages = () => {
    handlePickImages(selectedContract, contractId, dispatch);
  };

  const onViewImage = (index: number) => {
    handleViewImage(index);
  };

  // Hiển thị màn hình loading
  if (selectedContractLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <UIHeader
          title="Chi tiết hợp đồng"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkGreen} />
          <Text style={styles.loadingText}>Đang tải thông tin hợp đồng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi
  if (selectedContractError) {
    return (
      <SafeAreaView style={styles.container}>
        <UIHeader
          title="Chi tiết hợp đồng"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          iconRight={Icons.IconEditBlack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Có lỗi xảy ra: {selectedContractError}. Vui lòng thử lại.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchContractDetail(contractId))}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Trường hợp không có dữ liệu
  if (!selectedContract) {
    return (
      <SafeAreaView style={styles.container}>
        <UIHeader
          title="Chi tiết hợp đồng"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
          iconRight={Icons.IconEditBlack}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin hợp đồng
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGoUpdateContract = () => {
    console.log('updta');
    navigation.navigate('UpdateContract', {
      contract: selectedContract,
    });
  };
  const contract = selectedContract;
  const statusInfo = getContractStatusInfo(contract.status);
  const canUploadImages = contract.status === 'pending_signature';

  return (
    <SafeAreaView style={styles.container}>
      <UIHeader
        title="Chi tiết hợp đồng"
        iconLeft={Icons.IconArrowLeft}
        onPressLeft={handleGoBack}
        iconRight={Icons.IconEditBlack}
        onPressRight={handleGoUpdateContract}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Trạng thái hợp đồng */}
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>Trạng thái hợp đồng</Text>
          <View
            style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Thông tin phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin phòng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số phòng:</Text>
            <Text style={styles.value}>{contract.contractInfo.roomNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.roomAddress}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Diện tích:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.roomArea} m²
            </Text>
          </View>
        </View>

        {/* Thông tin hợp đồng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày bắt đầu:</Text>
            <Text style={styles.value}>
              {formatFullDate(contract.contractInfo.startDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày kết thúc:</Text>
            <Text style={styles.value}>
              {formatFullDate(contract.contractInfo.endDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời hạn:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.contractTerm} tháng
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Giá thuê:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.monthlyRent)}/tháng
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền đặt cọc:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.deposit)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số người tối đa:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.maxOccupancy} người
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số người hiện tại:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantCount} người
            </Text>
          </View>
        </View>

        {/* Dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền điện:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.serviceFees.electricity)}/
              {contract.contractInfo.serviceFeeConfig.electricity === 'perUsage'
                ? 'số'
                : 'phòng'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền nước:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.serviceFees.water)}/
              {contract.contractInfo.serviceFeeConfig.water === 'perUsage'
                ? 'khối'
                : 'phòng'}
            </Text>
          </View>

          {/* Dịch vụ tùy chọn */}
          {contract.contractInfo.customServices &&
            contract.contractInfo.customServices.length > 0 && (
              <>
                {contract.contractInfo.customServices.map(service => (
                  <View key={service._id} style={styles.infoRow}>
                    <Text style={styles.label}>{service.name}:</Text>
                    <Text style={styles.value}>
                      {formatCurrency(service.price)}/
                      {service.priceType === 'perPerson'
                        ? 'người'
                        : service.priceType === 'perRoom'
                        ? 'phòng'
                        : 'lần sử dụng'}
                    </Text>
                  </View>
                ))}
              </>
            )}
        </View>

        {/* Nội thất */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội thất</Text>
          <View style={styles.tagContainer}>
            {contract.contractInfo.furniture.map((item, index) => (
              <View key={`furniture-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tiện ích */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.tagContainer}>
            {contract.contractInfo.amenities.map((item, index) => (
              <View key={`amenity-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Thông tin người thuê */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người thuê</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{contract.contractInfo.tenantName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantPhone}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantEmail}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CCCD:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantIdentityNumber}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantAddress}
            </Text>
          </View>
        </View>

        {/* Thông tin chủ trọ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.landlordName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.landlordPhone}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CCCD:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.landlordIdentityNumber}
            </Text>
          </View>
        </View>

        {/* Người ở cùng */}
        {contract.contractInfo.coTenants &&
          contract.contractInfo.coTenants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Người ở cùng</Text>
              {contract.contractInfo.coTenants.map((coTenant, index) => (
                <View key={coTenant._id || index} style={styles.coTenantItem}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tên:</Text>
                    <Text style={styles.value}>{coTenant.username}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{coTenant.email}</Text>
                  </View>
                  {coTenant.phone && (
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Điện thoại:</Text>
                      <Text style={styles.value}>{coTenant.phone}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Ảnh hợp đồng đã ký */}
        {contract.signedContractImages &&
          contract.signedContractImages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ảnh hợp đồng đã ký</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageContainer}>
                {contract.signedContractImages.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={`signed-image-${index}`}
                    style={styles.imageWrapper}
                    onPress={() => onViewImage(index)}>
                    <Image
                      source={{uri: imageUrl}}
                      style={styles.contractImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        {/* Lịch sử trạng thái */}
        {contract.statusHistory && contract.statusHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử hợp đồng</Text>
            {contract.statusHistory.map((history, index) => {
              const statusInfo = getContractStatusInfo(history.status);
              return (
                <View key={history._id || index} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {formatDateTime(history.date)}
                    </Text>
                    <View
                      style={[
                        styles.historyStatus,
                        {backgroundColor: statusInfo.color},
                      ]}>
                      <Text style={styles.historyStatusText}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyNote}>{history.note}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Quy định */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy định</Text>
          <Text style={styles.contentText}>{contract.contractInfo.rules}</Text>
        </View>

        {/* Điều khoản bổ sung */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều khoản bổ sung</Text>
          <Text style={styles.contentText}>
            {contract.contractInfo.additionalTerms}
          </Text>
        </View>

        {/* Nút upload ảnh */}
        {canUploadImages && (
          <TouchableOpacity
            style={[styles.pdfButton, uploadingImages && styles.disabledButton]}
            onPress={onPickImages}
            disabled={uploadingImages}>
            <Text style={styles.pdfButtonText}>
              {uploadingImages ? 'Đang upload...' : 'Upload ảnh hợp đồng ký'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Nút xem PDF */}
        <TouchableOpacity style={styles.pdfButton} onPress={onViewPDF}>
          <Text style={styles.pdfButtonText}>
            {contract.status === 'draft'
              ? 'Tạo Hợp đồng PDF'
              : 'Xem Hợp đồng PDF'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(8),
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: verticalScale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: verticalScale(8),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
  },
  label: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.textGray,
    width: scale(100),
  },
  value: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
    flex: 1,
  },
  contentText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.black,
    lineHeight: verticalScale(22),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  statusText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.red,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(10),
    backgroundColor: Colors.darkGreen,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.white,
  },
  pdfButton: {
    backgroundColor: Colors.darkGreen,
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },
  pdfButtonText: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.white,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 16,
    marginRight: scale(8),
    marginBottom: verticalScale(8),
  },
  tagText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.black,
  },
  coTenantItem: {
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  imageContainer: {
    paddingVertical: verticalScale(8),
  },
  imageWrapper: {
    marginRight: scale(10),
  },
  contractImage: {
    width: scale(200),
    height: scale(280),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  historyItem: {
    marginBottom: verticalScale(12),
    padding: scale(10),
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  historyDate: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(12),
    color: Colors.textGray,
  },
  historyStatus: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: 10,
  },
  historyStatusText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(10),
    color: Colors.white,
  },
  historyNote: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(13),
    color: Colors.black,
  },
  bottomSpace: {
    height: verticalScale(20),
  },
});

export default ContractDetailScreen;
