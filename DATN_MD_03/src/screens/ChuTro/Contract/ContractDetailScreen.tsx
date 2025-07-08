import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../../types/route';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {SCREEN, scale, verticalScale, responsiveFont} from '../../../utils/responsive';
import {Icons} from '../../../assets/icons';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {fetchContractDetail, generateContractPDF} from '../../../store/slices/contractSlice';
import {getContractStatusInfo} from './components/ContractItem';

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
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
};

const ContractDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ContractDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const {contractId} = route.params;
  
  // Để theo dõi hình ảnh đang xem
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);

  const {selectedContract, selectedContractLoading, selectedContractError} = useSelector(
    (state: RootState) => state.contract,
  );

  useEffect(() => {
    // Tải thông tin chi tiết hợp đồng
    dispatch(fetchContractDetail(contractId));
  }, [contractId, dispatch]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Xử lý xem ảnh đã ký
  const handleViewImage = (index: number) => {
    setSelectedImageIndex(index);
    // Hiển thị ảnh đã ký trong chế độ xem toàn màn hình (có thể thực hiện sau)
    Alert.alert('Thông báo', 'Tính năng xem ảnh toàn màn hình sẽ được thực hiện sau');
  };

  // Hiển thị màn hình loading
  if (selectedContractLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
          <View style={styles.emptyView} />
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
          <View style={styles.emptyView} />
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Image
              source={{uri: Icons.IconArrowBack}}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
          <View style={styles.emptyView} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin hợp đồng</Text>
        </View>
      </SafeAreaView>
    );
  }

  const contract = selectedContract;
  const statusInfo = getContractStatusInfo(contract.status);

  // Xem PDF hợp đồng
  const handleViewPDF = async () => {
    try {
      // Hiển thị thông báo đang tải
      Alert.alert('Thông báo', 'Đang tạo file PDF hợp đồng...');
      
      // Gọi API để tạo PDF
      const response = await dispatch(generateContractPDF(contractId)).unwrap();
      
      console.log('PDF generation response:', JSON.stringify(response));
      
      if (response.success && response.data) {
        // Đây là URL để xem PDF
        const pdfUrl = `http://125.212.229.71:4000${response.data.viewPdfUrl}`;
        console.log('PDF URL:', pdfUrl);
        
        // Kiểm tra URL hợp lệ
        if (pdfUrl && pdfUrl.startsWith('http')) {
          // Cập nhật contract trong state nếu cần thiết
          if (response.data.status && response.data.contractPdfUrlFilename) {
            dispatch(fetchContractDetail(contractId));
          }
          
          // Mở PDF trong trình duyệt
          try {
            const canOpen = await Linking.canOpenURL(pdfUrl);
            
            if (canOpen) {
              await Linking.openURL(pdfUrl);
            } else {
              Alert.alert('Thông báo', 'Không thể mở URL PDF. Vui lòng thử lại sau.');
            }
          } catch (linkError) {
            console.error('Error opening URL:', linkError);
            Alert.alert('Thông báo', 'Không thể mở URL PDF. Vui lòng thử lại sau.');
          }
        } else {
          Alert.alert('Thông báo', 'URL PDF không hợp lệ: ' + pdfUrl);
        }
      } else {
        Alert.alert('Thông báo', 'Không thể tạo file PDF hợp đồng.');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Alert.alert('Lỗi', error?.message || 'Đã xảy ra lỗi khi tạo file PDF hợp đồng.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image
            source={{uri: Icons.IconArrowBack}}
            style={{width: 24, height: 24}}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hợp đồng</Text>
        <View style={styles.emptyView} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.value}>{contract.contractInfo.roomAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Diện tích:</Text>
            <Text style={styles.value}>{contract.contractInfo.roomArea} m²</Text>
          </View>
        </View>

        {/* Thông tin hợp đồng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày bắt đầu:</Text>
            <Text style={styles.value}>{formatFullDate(contract.contractInfo.startDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày kết thúc:</Text>
            <Text style={styles.value}>{formatFullDate(contract.contractInfo.endDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Thời hạn:</Text>
            <Text style={styles.value}>{contract.contractInfo.contractTerm} tháng</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Giá thuê:</Text>
            <Text style={styles.value}>{formatCurrency(contract.contractInfo.monthlyRent)}/tháng</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền đặt cọc:</Text>
            <Text style={styles.value}>{formatCurrency(contract.contractInfo.deposit)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số người tối đa:</Text>
            <Text style={styles.value}>{contract.contractInfo.maxOccupancy} người</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số người hiện tại:</Text>
            <Text style={styles.value}>{contract.contractInfo.tenantCount} người</Text>
          </View>
        </View>

        {/* Dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền điện:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.serviceFees.electricity)}
              /
              {contract.contractInfo.serviceFeeConfig.electricity === 'perUsage'
                ? 'số'
                : 'phòng'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tiền nước:</Text>
            <Text style={styles.value}>
              {formatCurrency(contract.contractInfo.serviceFees.water)}
              /
              {contract.contractInfo.serviceFeeConfig.water === 'perUsage'
                ? 'khối'
                : 'phòng'}
            </Text>
          </View>

          {/* Hiển thị các dịch vụ tùy chọn nếu có */}
          {contract.contractInfo.customServices &&
            contract.contractInfo.customServices.length > 0 && (
              <>
                {contract.contractInfo.customServices.map((service, index) => (
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

        {/* Nội thất và tiện ích */}
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
            <Text style={styles.value}>{contract.contractInfo.tenantPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{contract.contractInfo.tenantEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CCCD:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.tenantIdentityNumber}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>{contract.contractInfo.tenantAddress}</Text>
          </View>
        </View>

        {/* Thông tin chủ trọ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{contract.contractInfo.landlordName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{contract.contractInfo.landlordPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CCCD:</Text>
            <Text style={styles.value}>
              {contract.contractInfo.landlordIdentityNumber}
            </Text>
          </View>
        </View>

        {/* Thông tin người ở cùng */}
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
              contentContainerStyle={styles.imageContainer}
            >
              {contract.signedContractImages.map((imageUrl, index) => (
                <TouchableOpacity 
                  key={`signed-image-${index}`} 
                  style={styles.imageWrapper}
                  onPress={() => handleViewImage(index)}
                >
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
        {contract.statusHistory && 
        contract.statusHistory.length > 0 && (
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

        {/* Nội dung bổ sung và quy định */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy định</Text>
          <Text style={styles.contentText}>{contract.contractInfo.rules}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều khoản bổ sung</Text>
          <Text style={styles.contentText}>
            {contract.contractInfo.additionalTerms}
          </Text>
        </View>

        {/* Nút xem PDF - Luôn hiển thị nút này vì có thể tạo PDF mới */}
        <TouchableOpacity style={styles.pdfButton} onPress={handleViewPDF}>
          <Text style={styles.pdfButtonText}>
            {contract.contractPdfUrl ? 'Xem hợp đồng PDF' : 'Tạo hợp đồng PDF'}
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
    backgroundColor: Colors.backgroud,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray150,
  },
  backButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontFamily: Fonts.Roboto_Bold,
    fontSize: responsiveFont(18),
    color: Colors.black,
  },
  emptyView: {
    width: scale(40),
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