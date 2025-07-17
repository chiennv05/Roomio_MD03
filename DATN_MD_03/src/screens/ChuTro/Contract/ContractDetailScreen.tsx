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
  SCREEN,
} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {
  deleteContract,
  extendContractThunk,
  fetchContractDetail,
  terminateContractThunk,
} from '../../../store/slices/contractSlice';
import {getContractStatusInfo} from './components/ContractItem';
import {UIHeader} from '../MyRoom/components';
import {handleViewPDF, handlePickImages} from './utils/contractEvents';
import {getPriceUnitLabel} from './utils/getPriceUnitLabel';
import InfoRow from './components/InfoRow';
import ModalLoading from '../AddRoom/components/ModalLoading';
import ModalShowImageContract from './components/ModalShowImageContract';
import ItemTitle from '../AddRoom/components/ItemTitle ';
import ItemImage from './components/ItemImage';
import {useContractImageActions} from '../AddRoom/hooks/useContractImageActions';
import ContractMenu from './components/ContractMenu';
import ModalConfirmContract from './components/ModalConfirmContract';
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

  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'extend' | 'terminate' | null>(null);
  const [value, setValue] = useState('');
  const {contractId} = route.params;
  const {onDeleteAllImages, onDeleteImage} =
    useContractImageActions(contractId);

  const {
    selectedContract,
    selectedContractLoading,
    selectedContractError,
    uploadingImages,
  } = useSelector((state: RootState) => state.contract);

  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isVisibleImage, setIsVisibleImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => {
    dispatch(fetchContractDetail(contractId));
  }, [contractId, dispatch]);

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
      handleViewPDF(
        selectedContract,
        contractId,
        dispatch,
        navigation,
        setGeneratingPDF,
      );
    }
  };

  const onPickImages = () => {
    handlePickImages(selectedContract, contractId, dispatch);
  };

  const onViewImage = (index: number) => {
    setSelectedImageIndex(index);
    setIsVisibleImage(true);
  };
  const handleDeleteAllImage = () => {
    if (!selectedContract) return;

    const allowedStatuses = ['draft', 'pending_signature', 'pending_approval'];

    if (!allowedStatuses.includes(selectedContract.status)) {
      Alert.alert(
        'Không thể xóa ảnh',
        'Chỉ có thể xóa ảnh hợp đồng ở trạng thái Nháp, Chờ ký hoặc Chờ duyệt.',
      );
      return;
    }

    onDeleteAllImages();
  };
  const onDeleteOneImage = (fileName: string) => {
    if (!selectedContract) return;

    const allowedStatuses = ['draft', 'pending_signature', 'pending_approval'];

    if (!allowedStatuses.includes(selectedContract.status)) {
      Alert.alert(
        'Không thể xóa ảnh',
        'Chỉ có thể xóa ảnh hợp đồng ở trạng thái Nháp, Chờ ký hoặc Chờ duyệt.',
      );
      return;
    }

    onDeleteImage(fileName);
  };

  // gia hạn hợp đồng
  const onExtendContract = () => {
    if (!selectedContract) return;
    if (selectedContract.status !== 'pending_signature') {
      Alert.alert(
        'Không thể gia hạn',
        'Chỉ có thể gia hạn hợp đồng ở trạng thái Chờ ký.',
      );
      return;
    }
    setAction('extend');
    setValue('');
    setShowModal(true);
  };

  const onTerminateContract = () => {
    if (!selectedContract) return;
    if (selectedContract.status === 'terminated') {
      Alert.alert('Không thể chấm dứt', 'Hợp đồng đã bị chấm dứt trước đó.');
      return;
    }
    if (selectedContract.status === 'draft') {
      Alert.alert(
        'Không thể chấm dứt',
        'Hợp đồng ở trạng thái Nháp không thể chấm dứt.',
      );
      return;
    }
    if (selectedContract.status === 'pending_signature') {
      Alert.alert(
        'Không thể chấm dứt',
        'Hợp đồng ở trạng thái Chờ ký không thể chấm dứt.',
      );
      return;
    }
    if (selectedContract.status === 'pending_approval') {
      Alert.alert(
        'Không thể chấm dứt',
        'Hợp đồng ở trạng thái Chờ duyệt không thể chấm dứt.',
      );
      return;
    }
    if (selectedContract.status === 'rejected') {
      Alert.alert(
        'Không thể chấm dứt',
        'Hợp đồng đã bị từ chối không thể chấm dứt.',
      );
      return;
    }

    setAction('terminate');
    setValue('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedContract) return;

    try {
      if (action === 'extend') {
        const months = parseInt(value.trim());
        if (isNaN(months) || months <= 0) {
          Alert.alert('Lỗi', 'Vui lòng nhập số tháng hợp lệ.');
          return;
        }

        await dispatch(
          extendContractThunk({
            contractId: selectedContract._id,
            months,
          }),
        ).unwrap();

        Alert.alert('Thành công', 'Gia hạn hợp đồng thành công');
        setShowModal(false);
      } else if (action === 'terminate') {
        if (value.trim() === '') {
          Alert.alert('Lỗi', 'Vui lòng nhập lý do chấm dứt');
          return;
        }

        await dispatch(
          terminateContractThunk({
            contractId: selectedContract._id,
            reason: value.trim(),
          }),
        ).unwrap();

        Alert.alert('Thành công', 'Chấm dứt hợp đồng thành công');
        setShowModal(false);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Thao tác thất bại');
    }
  };

  // Hiển thị màn hình loading
  if (selectedContractLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
            iconRight={
              <ContractMenu
                onEdit={() => {}}
                onExtend={() => {}}
                onTerminate={() => {}}
                onDeleteContract={() => {}}
              />
            }
          />
        </View>
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
        <View style={styles.headerContainer}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
            iconRight={
              <ContractMenu
                onEdit={() => {}}
                onExtend={() => {}}
                onTerminate={() => {}}
                onDeleteContract={() => {}}
              />
            }
          />
        </View>
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
        <View style={styles.headerContainer}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
            iconRight={
              <ContractMenu
                onEdit={() => {}}
                onExtend={() => {}}
                onTerminate={() => {}}
                onDeleteContract={() => {}}
              />
            }
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không tìm thấy thông tin hợp đồng
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGoUpdateContract = () => {
    const allowedStatuses = ['draft', 'pending_signature', 'pending_approval'];

    if (selectedContract && allowedStatuses.includes(selectedContract.status)) {
      navigation.navigate('UpdateContract', {
        contract: selectedContract,
      });
    } else {
      Alert.alert(
        'Không thể chỉnh sửa',
        'Chỉ có thể chỉnh sửa hợp đồng ở trạng thái Nháp, Chờ ký hoặc Chờ duyệt.',
      );
    }
  };

  const contract = selectedContract;
  const imageList = contract.signedContractImages || [];

  const handleDeleteContract = async () => {
    const allowedStatuses = ['draft', 'pending_signature', 'pending_approval'];

    if (!allowedStatuses.includes(contract?.status)) {
      Alert.alert(
        'Không thể xóa',
        'Chỉ có thể xóa hợp đồng ở trạng thái nháp, chờ ký hoặc chờ duyệt.',
      );
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa hợp đồng này không?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteContract(contract._id)).unwrap();
            Alert.alert('Thành công', 'Hợp đồng đã được xóa thành công', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (error: any) {
            Alert.alert(
              'Lỗi',
              error?.message || 'Có lỗi xảy ra khi xóa hợp đồng',
            );
          }
        },
      },
    ]);
  };

  const statusInfo = getContractStatusInfo(contract.status);
  const canUploadImages =
    contract.status === 'pending_signature' ||
    contract.status === 'pending_approval';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <UIHeader
            title="Chi tiết hợp đồng"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={handleGoBack}
            iconRight={
              <ContractMenu
                onEdit={handleGoUpdateContract}
                onExtend={onExtendContract}
                onTerminate={onTerminateContract}
                onDeleteContract={handleDeleteContract}
              />
            }
            color={Colors.white}
          />
        </View>

        {/* Trạng thái hợp đồng */}
        <View style={styles.statusContainer}>
          <View>
            <Text style={styles.textContract}>Mã hợp đồng</Text>
            <Text style={styles.textCodeContract}>{contract._id}</Text>
          </View>
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
              <ItemTitle
                title="Ảnh hợp đồng đã ký"
                icon={Icons.IconTrashCan}
                onPress={handleDeleteAllImage}
              />
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
                    onDelete={onDeleteOneImage}
                  />
                )}
              />
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
        <ModalLoading loading={true} visible={generatingPDF} />
        <ModalShowImageContract
          visible={isVisibleImage}
          images={imageList}
          initialIndex={selectedImageIndex}
          onClose={() => setIsVisibleImage(false)}
        />
        <ModalConfirmContract
          visible={showModal}
          onClose={() => setShowModal(false)}
          action={action}
          value={value}
          setValue={setValue}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(20),
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    marginBottom: verticalScale(8),
    width: SCREEN.width,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    width: SCREEN.width,
    paddingBottom: verticalScale(10),
  },
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    width: SCREEN.width,
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginBottom: verticalScale(10),
    fontWeight: '700',
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
    width: SCREEN.width * 0.8,
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
  textContract: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.black,
    fontWeight: '700',
  },
  textCodeContract: {
    fontFamily: Fonts.Roboto_Regular,
    fontSize: responsiveFont(16),
    color: Colors.black,
    marginVertical: verticalScale(10),
  },
});

export default ContractDetailScreen;
