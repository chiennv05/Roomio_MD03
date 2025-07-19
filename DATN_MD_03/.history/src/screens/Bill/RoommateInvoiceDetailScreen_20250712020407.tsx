import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Modal,
  RefreshControl,
  ImageSourcePropType,
  Platform
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRoommateInvoiceDetails, markAsPaid } from '../../store/slices/billSlice';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { Colors } from '../../theme/color';
import { Icons } from '../../assets/icons';
import { scale, verticalScale } from '../../utils/responsive';
import { formatDate } from '../../utils/formatDate';
import { InvoiceStatus, BillStatus } from '../../types/Bill';

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(amount);
};

// Hàm lấy các thông tin cần thiết từ roommateInvoice
const extractInvoiceInfo = (invoice: any) => {
  // Lấy thông tin phòng
  const roomNumber = invoice?.contractId?.contractInfo?.roomNumber || 'Không xác định';
  
  // Lấy thông tin người thuê
  const tenantName = invoice?.contractId?.contractInfo?.tenantName || 
                    (invoice?.tenantId && typeof invoice.tenantId === 'object' ? 
                     invoice.tenantId.fullName : 'Không xác định');
  
  // Lấy kỳ hóa đơn
  const period = invoice?.period ? `${invoice.period.month}/${invoice.period.year}` :
                (invoice?.month && invoice?.year ? `${invoice.month}/${invoice.year}` : 'Không xác định');

  // Lấy địa chỉ phòng
  const roomAddress = invoice?.contractId?.contractInfo?.roomAddress || '';
  
  // Lấy hạn thanh toán
  const dueDate = invoice?.dueDate ? formatDate(invoice.dueDate) : 'Không xác định';
  
  return {
    roomNumber,
    tenantName,
    period,
    roomAddress,
    dueDate
  };
};

// Mở rộng type cho trạng thái hóa đơn để hỗ trợ API trả về
// type ExtendedInvoiceStatus = InvoiceStatus | BillStatus;

type RoommateInvoiceDetailScreenRouteProp = RouteProp<RootStackParamList, 'RoommateInvoiceDetails'>;
type RoommateInvoiceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoommateInvoiceDetails'>;

type Props = {
  route: RoommateInvoiceDetailScreenRouteProp;
  navigation: RoommateInvoiceDetailScreenNavigationProp;
};

const RoommateInvoiceDetailScreen = ({ route, navigation }: Props) => {
  const { invoiceId } = route.params;
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const { roommateInvoice, loading, markAsPaidLoading, markAsPaidSuccess, markAsPaidError } = useAppSelector(state => state.bill);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');

  const loadInvoiceDetails = useCallback(() => {
    if (token && invoiceId) {
      dispatch(fetchRoommateInvoiceDetails({ token, invoiceId }));
    } else {
      Alert.alert('Lỗi', 'Không thể tải thông tin hóa đơn');
    }
  }, [dispatch, token, invoiceId]);

  useEffect(() => {
    loadInvoiceDetails();
  }, [loadInvoiceDetails]);

  // Thêm log khi roommateInvoice thay đổi
  useEffect(() => {
    if (roommateInvoice) {
      console.log('Roommate invoice loaded in detail screen:', {
        id: roommateInvoice._id,
        isRoommate: roommateInvoice.isRoommate,
        status: roommateInvoice.status
      });
    }
  }, [roommateInvoice]);

  // Xử lý khi thanh toán thành công hoặc thất bại
  useEffect(() => {
    if (markAsPaidSuccess) {
      Alert.alert('Thành công', 'Đã đánh dấu hóa đơn là đã thanh toán');
      loadInvoiceDetails(); // Tải lại chi tiết hóa đơn
    }
    if (markAsPaidError) {
      Alert.alert('Lỗi', markAsPaidError);
    }
  }, [markAsPaidSuccess, markAsPaidError, loadInvoiceDetails]);

  const handleMarkAsPaid = () => {
    if (!token || !invoiceId) return;
    
    setShowPaymentModal(true);
  };

  const confirmMarkAsPaid = () => {
    if (!token || !invoiceId || !selectedPaymentMethod) return;

    dispatch(markAsPaid({
      token,
      invoiceId,
      paymentMethod: selectedPaymentMethod
    }));
    
    setShowPaymentModal(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInvoiceDetails();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return { text: 'Bản nháp', color: Colors.gray };
      case 'issued':
        return { text: 'Đã phát hành', color: Colors.primary };
      case 'paid':
        return { text: 'Đã thanh toán', color: Colors.success };
      case 'overdue':
        return { text: 'Quá hạn', color: Colors.error };
      case 'canceled':
        return { text: 'Đã hủy', color: Colors.gray };
      case 'pending_confirmation':
        return { text: 'Chờ xác nhận', color: Colors.warning };
      case 'pending':
        return { text: 'Chưa thanh toán', color: Colors.warning };
      default:
        return { text: 'Không xác định', color: Colors.gray };
    }
  };

  // Xác định nếu người dùng hiện tại là người thuê (không phải chủ trọ)
  const isTenant = user?.role === 'nguoiThue';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!roommateInvoice) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin hóa đơn</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadInvoiceDetails}>
          <Text style={styles.reloadButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Lấy trạng thái hóa đơn
  const status = getStatusText(roommateInvoice.status);
  
  // Trích xuất thông tin từ hóa đơn
  const { roomNumber, tenantName, period, roomAddress, dueDate } = extractInvoiceInfo(roommateInvoice);

  // Kiểm tra các item
  const hasItems = roommateInvoice.items && Array.isArray(roommateInvoice.items) && roommateInvoice.items.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Image
                        source={require('../../assets/icons/icon_arrow_back.png')}
                        style={styles.backIcon}
                    />

          </TouchableOpacity>
          <Text style={styles.headerText}>Chi tiết hóa đơn người ở cùng</Text>
          <View style={styles.placeholderView} />
        </View>

        {/* Invoice Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thông tin hóa đơn</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>

          {roommateInvoice.invoiceNumber && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Mã hóa đơn:</Text>
              <Text style={styles.value}>{roommateInvoice.invoiceNumber}</Text>
            </View>
          )}
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Phòng:</Text>
            <Text style={styles.value}>{roomNumber}</Text>
          </View>
          
          {roomAddress && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Địa chỉ:</Text>
              <Text style={styles.value}>{roomAddress}</Text>
            </View>
          )}
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Người thuê:</Text>
            <Text style={styles.value}>{tenantName}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.label}>Kỳ hóa đơn:</Text>
            <Text style={styles.value}>Tháng {period}</Text>
          </View>

          {/* Ẩn hạn thanh toán
          <View style={styles.cardRow}>
            <Text style={styles.label}>Hạn thanh toán:</Text>
            <Text style={styles.value}>{dueDate}</Text>
          </View>
          */}

          {/* Ẩn ngày phát hành
          {roommateInvoice.issueDate && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Ngày phát hành:</Text>
              <Text style={styles.value}>{formatDate(roommateInvoice.issueDate)}</Text>
            </View>
          )}
          */}
          
          <View style={styles.cardRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={[styles.value, { color: status.color }]}>{status.text}</Text>
          </View>

          {/* Ẩn phương thức thanh toán
          {roommateInvoice.paymentMethod && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Phương thức:</Text>
              <Text style={styles.value}>
                {roommateInvoice.paymentMethod === 'cash' ? 'Tiền mặt' : 
                 roommateInvoice.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 
                 roommateInvoice.paymentMethod}
              </Text>
            </View>
          )}
          */}
          
          {roommateInvoice.status === 'paid' && roommateInvoice.paymentDate && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Đã thanh toán:</Text>
              <Text style={styles.value}>{formatDate(roommateInvoice.paymentDate)}</Text>
            </View>
          )}

          {roommateInvoice.note && (
            <View style={styles.cardRow}>
              <Text style={styles.label}>Ghi chú:</Text>
              <Text style={styles.value}>{roommateInvoice.note}</Text>
            </View>
          )}
        </View>

        {/* Invoice Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          
          {hasItems ? (
            <>
              {roommateInvoice.items?.map((item, index) => {
                // Xác định giá trị hiển thị dựa trên loại mục
                const isRent = item.category === 'rent';
                const isUtility = item.category === 'utility' && item.type === 'variable';
                const isService = item.category === 'service' || (item.category === 'utility' && item.type !== 'variable');
                
                return (
                  <View key={item._id || index} style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemName, isRent ? styles.rentItemName : {}]}>{item.name}</Text>
                      <Text style={[styles.itemAmount, isRent ? styles.rentItemAmount : {}]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                    
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                    
                    {isUtility && item.previousReading !== undefined && item.currentReading !== undefined ? (
                      <Text style={styles.itemDescription}>
                        Chỉ số: {item.previousReading} → {item.currentReading} ({item.currentReading - item.previousReading} đơn vị)
                      </Text>
                    ) : isService && item.isPerPerson ? (
                      <Text style={styles.itemCalculation}>
                        {item.quantity} x {formatCurrency(item.unitPrice)} x {item.personCount || 1} người
                      </Text>
                    ) : (
                      <Text style={styles.itemCalculation}>
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </Text>
                    )}
                  </View>
                );
              })}
              
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalAmount}>{formatCurrency(roommateInvoice.totalAmount)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noItemsText}>Không có thông tin chi tiết</Text>
          )}
        </View>

        {/* Action buttons - using type assertion to allow 'pending' status */}
        {isTenant && roommateInvoice.status === 'pending' && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleMarkAsPaid}
            disabled={markAsPaidLoading}
          >
            {markAsPaidLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>Đánh dấu đã thanh toán</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption, 
                selectedPaymentMethod === 'cash' && styles.selectedPaymentOption
              ]}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <Text style={styles.paymentOptionText}>Tiền mặt</Text>
              {selectedPaymentMethod === 'cash' && (
                <Image source={Icons.IconCheck as ImageSourcePropType} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'bank_transfer' && styles.selectedPaymentOption
              ]}
              onPress={() => setSelectedPaymentMethod('bank_transfer')}
            >
              <Text style={styles.paymentOptionText}>Chuyển khoản ngân hàng</Text>
              {selectedPaymentMethod === 'bank_transfer' && (
                <Image source={Icons.IconCheck as ImageSourcePropType} style={styles.checkIcon} />
              )}
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmMarkAsPaid}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
    marginTop: 10
  },
  scrollContainer: {
    padding: scale(16),
    paddingTop: 0, // Remove top padding as header will have its own padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontSize: scale(16),
    color: Colors.black,
    marginBottom: scale(16),
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
  },
  reloadButtonText: {
    color: Colors.white,
    fontSize: scale(14),
    fontWeight: '500',
  },
  headerContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    marginBottom: scale(16),
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dearkOlive,
    textAlign: 'center',
    flex: 1,
  },
  placeholderView: {
    width: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: scale(8),
    padding: scale(16),
    marginBottom: scale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  cardTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: Colors.black,
  },
  statusBadge: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(10),
    borderRadius: scale(16),
  },
  statusText: {
    fontSize: scale(12),
    fontWeight: '500',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },
  label: {
    fontSize: scale(14),
    color: Colors.mediumGray,
    flex: 1,
  },
  value: {
    fontSize: scale(14),
    fontWeight: '500',
    color: Colors.black,
    flex: 2,
    textAlign: 'right',
  },
  itemContainer: {
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: scale(15),
    fontWeight: '500',
    color: Colors.black,
    flex: 1,
  },
  rentItemName: {
    fontWeight: '600',
    fontSize: scale(16),
  },
  itemAmount: {
    fontSize: scale(15),
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'right',
  },
  rentItemAmount: {
    fontSize: scale(16),
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: scale(13),
    color: Colors.mediumGray,
    marginTop: scale(2),
    marginBottom: scale(2),
  },
  itemCalculation: {
    fontSize: scale(12),
    color: Colors.mediumGray,
    marginTop: scale(2),
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(16),
    paddingTop: scale(16),
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  totalLabel: {
    fontSize: scale(16),
    fontWeight: '600',
    color: Colors.black,
  },
  totalAmount: {
    fontSize: scale(16),
    fontWeight: '600',
    color: Colors.primary,
  },
  noItemsText: {
    fontSize: scale(14),
    color: Colors.mediumGray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: scale(16),
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: scale(14),
    borderRadius: scale(8),
    alignItems: 'center',
    marginBottom: scale(16),
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: scale(16),
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: scale(20),
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: scale(20),
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(16),
    paddingHorizontal: scale(12),
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: scale(8),
    marginBottom: scale(12),
  },
  selectedPaymentOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  paymentOptionText: {
    fontSize: scale(16),
    color: Colors.black,
  },
  checkIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(20),
  },
  modalButton: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
    marginRight: scale(10),
  },
  cancelButtonText: {
    color: Colors.black,
    fontSize: scale(14),
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    marginLeft: scale(10),
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: scale(14),
    fontWeight: '500',
  },
});

export default RoommateInvoiceDetailScreen; 