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
import {getPriceUnitLabel} from './utils/getPriceUnitLabel';
import InfoRow from './components/InfoRow';

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
          <InfoRow label="Tên phòng" value={contract.contractInfo.roomNumber} />
          <InfoRow label="Địa chỉ" value={contract.contractInfo.roomAddress} />
          <InfoRow
            label="Diện tích"
            value={`${contract.contractInfo.roomArea} m²`}
          />
        </View>

        {/* Thông tin hợp đồng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>

          <InfoRow
            label="Ngày bắt đầu"
            value={formatFullDate(contract.contractInfo.startDate)}
          />
          <InfoRow
            label="Ngày kết thúc"
            value={formatFullDate(contract.contractInfo.endDate)}
          />
          <InfoRow
            label="Thời hạn"
            value={`${contract.contractInfo.contractTerm} tháng`}
          />
          <InfoRow
            label="Giá thuê"
            value={`${formatCurrency(contract.contractInfo.monthlyRent)}/tháng`}
          />
          <InfoRow
            label="Tiền đặt cọc"
            value={formatCurrency(contract.contractInfo.deposit)}
          />
          <InfoRow
            label="Số người tối đa"
            value={`${contract.contractInfo.maxOccupancy} người`}
          />
          <InfoRow
            label="Số người hiện tại"
            value={`${contract.contractInfo.tenantCount} người`}
          />
        </View>

        {/* Dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>

          <InfoRow
            label="Tiền điện"
            value={`${formatCurrency(
              contract.contractInfo.serviceFees.electricity,
            )}/${getPriceUnitLabel(
              contract.contractInfo.serviceFeeConfig.electricity,
              'electricity',
            )}`}
          />

          <InfoRow
            label="Tiền nước"
            value={`${formatCurrency(
              contract.contractInfo.serviceFees.water,
            )}/${getPriceUnitLabel(
              contract.contractInfo.serviceFeeConfig.water,
              'water',
            )}`}
          />

          {/* Dịch vụ tùy chọn */}
          {contract.contractInfo.customServices &&
            contract.contractInfo.customServices.length > 0 &&
            contract.contractInfo.customServices.map(service => (
              <InfoRow
                key={service._id}
                label={service.name}
                value={`${formatCurrency(service.price)}/${getPriceUnitLabel(
                  service.priceType,
                )}`}
              />
            ))}
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

          <InfoRow label="Họ tên" value={contract.contractInfo.tenantName} />
          <InfoRow
            label="Số điện thoại"
            value={contract.contractInfo.tenantPhone}
          />
          <InfoRow label="Email" value={contract.contractInfo.tenantEmail} />
          <InfoRow
            label="CCCD"
            value={contract.contractInfo.tenantIdentityNumber}
          />
          <InfoRow
            label="Địa chỉ"
            value={contract.contractInfo.tenantAddress}
          />
        </View>

        {/* Thông tin chủ trọ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>

          <InfoRow label="Họ tên" value={contract.contractInfo.landlordName} />
          <InfoRow
            label="Số điện thoại"
            value={contract.contractInfo.landlordPhone}
          />
          <InfoRow
            label="CCCD"
            value={contract.contractInfo.landlordIdentityNumber}
          />
        </View>

        {/* Người ở cùng */}
        {contract.contractInfo.coTenants &&
          contract.contractInfo.coTenants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Người ở cùng</Text>

              {contract.contractInfo.coTenants.map((coTenant, index) => (
                <View key={coTenant._id || index} style={styles.coTenantItem}>
                  <InfoRow label="Tên" value={coTenant.username} />
                  <InfoRow label="Email" value={coTenant.email} />
                  {coTenant.phone && (
                    <InfoRow label="Điện thoại" value={coTenant.phone} />
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
