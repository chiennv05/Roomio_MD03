import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  UIManager,
  LayoutAnimation,
  StatusBar,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {
  scale,
  verticalScale,
  responsiveFont,
  moderateScale,
  responsiveSpacing,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {fetchContractDetail} from '../../../store/slices/contractSlice';

import {UIHeader} from '../../ChuTro/MyRoom/components';
import {getPriceUnitLabel} from '../../ChuTro/Contract/utils/getPriceUnitLabel';
import InfoRow from '../../ChuTro/Contract/components/InfoRow';
import ModalShowImageContract from '../../ChuTro/Contract/components/ModalShowImageContract';
import ItemTitle from '../../ChuTro/AddRoom/components/ItemTitle ';
import {getContractStatusInfo} from '../../ChuTro/Contract/components/ContractItem';
import ItemImage from './components/ItemImage';
import ItemButtonGreen from '../../../components/ItemButtonGreen';

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

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ContractDetailLesseeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'ContractDetailLessee'>>();
  const dispatch = useDispatch<AppDispatch>();

  const {contractId} = route.params;

  const {selectedContract, selectedContractLoading, selectedContractError} =
    useSelector((state: RootState) => state.contract);

  const [isVisibleImage, setIsVisibleImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  useEffect(() => {
    dispatch(fetchContractDetail(contractId));
  }, [contractId, dispatch]);
  const toggleHistory = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowHistory(!showHistory);
  };
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Event Handlers
  const onViewPDF = () => {
    if (selectedContract) {
      if (selectedContract.status === 'terminated') {
        Alert.alert('Thông báo', 'Hợp đồng đã bị chấm dứt, không thể xem PDF.');
        return;
      }
      if (selectedContract.status === 'rejected') {
        Alert.alert('Thông báo', 'Hợp đồng đã bị từ chối, không thể xem PDF.');
        return;
      }
    }
    if (!selectedContract || !selectedContract.contractPdfUrl) {
      Alert.alert('Thông báo', 'Không có hợp đồng PDF để xem.');
      return;
    }
    navigation.navigate('PdfViewer', {
      pdfUrl: selectedContract?.contractPdfUrl || '',
    });
  };

  const onViewImage = (index: number) => {
    setSelectedImageIndex(index);
    setIsVisibleImage(true);
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  // Hiển thị màn hình loading
  if (selectedContractLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={[styles.content, {paddingTop: statusBarHeight}]}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen} />
            <Text style={styles.loadingText}>Đang tải thông tin hợp đồng...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị lỗi
  if (selectedContractError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={[styles.content, {paddingTop: statusBarHeight}]}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
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
        </View>
      </SafeAreaView>
    );
  }

  // Trường hợp không có dữ liệu
  if (!selectedContract) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={[styles.content, {paddingTop: statusBarHeight}]}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Không tìm thấy thông tin hợp đồng
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const contract = selectedContract;
  const imageList = contract.signedContractImages || [];
  const statusInfo = getContractStatusInfo(contract.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[styles.content, {paddingTop: statusBarHeight}]}>
        <UIHeader
          title="Chi tiết hợp đồng"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={handleGoBack}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
        {/* Trạng thái hợp đồng */}
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>Trạng thái hợp đồng</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: statusInfo.backgroudStatus},
            ]}>
            <Text style={[styles.statusText, {color: statusInfo.color}]}>
              {statusInfo.label}
            </Text>
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
            value={contract.contractInfo.tenantAddress || ''}
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
              <ItemTitle title="Ảnh hợp đồng đã ký" />
              <FlatList
                data={contract.signedContractImages}
                keyExtractor={(_, index) => `signed-image-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => (
                  <ItemImage
                    imageUrl={item}
                    index={index}
                    onViewImage={onViewImage}
                  />
                )}
              />
            </View>
          )}

        {/* Lịch sử trạng thái */}
        {contract.statusHistory && contract.statusHistory.length > 0 && (
          <View style={styles.section}>
            <ItemTitle
              title="Lịch sử hợp đồng"
              icon={showHistory ? Icons.IconArrowDown : Icons.IconArrowRight}
              onPress={toggleHistory}
              iconHeight={showHistory ? 14 : 24}
              iconWidth={showHistory ? 24 : 14}
            />
            {showHistory &&
              contract.statusHistory.map((history, index) => {
                const historyStatusInfo = getContractStatusInfo(history.status);
                return (
                  <View key={history._id || index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>
                        {formatDateTime(history.date)}
                      </Text>
                      <View style={[styles.historyStatus]}>
                        <Text style={styles.historyStatusText}>
                          {historyStatusInfo.label}
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

        {/* Nút xem PDF */}
        <View style={styles.pdfButton}>
          <ItemButtonGreen onPress={onViewPDF} title="Xem Hợp đồng PDF" />
        </View>
        <View style={styles.bottomSpace} />
        <ModalShowImageContract
          visible={isVisibleImage}
          images={imageList}
          initialIndex={selectedImageIndex}
          onClose={() => setIsVisibleImage(false)}
        />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.backgroud,
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
    borderRadius: moderateScale(20),
  },
  statusText: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(14),
    color: Colors.white,
    paddingHorizontal: responsiveSpacing(12),
    paddingVertical: responsiveSpacing(8),
    fontWeight: '500',
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
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
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
    backgroundColor: Colors.mediumGray,
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

export default ContractDetailLesseeScreen;
