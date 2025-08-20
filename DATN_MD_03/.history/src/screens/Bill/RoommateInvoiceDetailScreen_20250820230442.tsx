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
  Platform,
  UIManager,
  LayoutAnimation,
  StatusBar,
} from 'react-native';
import LoadingAnimationWrapper from '../../components/LoadingAnimationWrapper';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRoommateInvoiceDetails, markAsPaid } from '../../store/slices/billSlice';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/route';
import { Colors } from '../../theme/color';
import { Icons } from '../../assets/icons';
import { scale, verticalScale, responsiveSpacing } from '../../utils/responsive';
import { formatDate } from '../../utils/formatDate';
import { InvoiceStatus, BillStatus } from '../../types/Bill';
import CustomAlertModal from '../../components/CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlrert';

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Lấy ngày bắt đầu tính hoá đơn: ưu tiên issueDate -> createdAt -> period
  // let startDate = 'Không xác định';
  // if (invoice?.issueDate) {
  //   startDate = formatDate(invoice.issueDate);
  // } else if (invoice?.createdAt) {
  //   startDate = formatDate(invoice.createdAt);
  // } else if (invoice?.period) {
  //   if (typeof invoice.period === 'string') {
  //     startDate = formatDate(invoice.period);
  //   } else if (invoice.period.month && invoice.period.year) {
  //     const d = new Date(invoice.period.year, invoice.period.month - 1, 1);
  //     startDate = formatDate(d.toISOString());
  //   }
  // }

  return {
    roomNumber,
    tenantName,
    period,
    roomAddress,
    dueDate,
    // startDate,
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
  const isFocused = useIsFocused();
  
  // Sử dụng CustomAlertModal hook
  const { showAlert, showSuccess, showError, showConfirm, visible, alertConfig, hideAlert } = useCustomAlert();
  
  const { roommateInvoice, loading, markAsPaidLoading, markAsPaidSuccess, markAsPaidError } = useAppSelector(state => state.bill);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Bật LayoutAnimation cho Android để có hiệu ứng mở/đóng mượt mà
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggleItemExpanded = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKey(prev => (prev === key ? null : key));
  };

  const loadInvoiceDetails = useCallback(() => {
    if (token && invoiceId) {
      dispatch(fetchRoommateInvoiceDetails({ token, invoiceId }));
          } else {
        showError('Không thể tải thông tin hóa đơn');
      }
  }, [dispatch, token, invoiceId]);

  useEffect(() => {
    loadInvoiceDetails();
  }, [loadInvoiceDetails]);

  //

  // Xử lý khi thanh toán thành công hoặc thất bại
  useEffect(() => {
    if (markAsPaidSuccess) {
      showSuccess('Đã đánh dấu hóa đơn là đã thanh toán');
      loadInvoiceDetails(); // Tải lại chi tiết hóa đơn
    }
    if (markAsPaidError) {
      showError(markAsPaidError);
    }
  }, [markAsPaidSuccess, markAsPaidError, loadInvoiceDetails]);

  const handleMarkAsPaid = () => {
    if (!token || !invoiceId) {return;}

    setShowPaymentModal(true);
  };

  const confirmMarkAsPaid = () => {
    if (!token || !invoiceId || !selectedPaymentMethod) {return;}

    dispatch(markAsPaid({
      token,
      invoiceId,
      paymentMethod: selectedPaymentMethod,
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
        return { text: 'Chưa thanh toán', color: Colors.primary };
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
    case 'paid':
        return Colors.limeGreen;
    case 'pending':
        return '#17A2B8'; // Xanh dương
    case 'pending_confirmation':
        return '#007BFF'; // Xanh dương đậm (đã đổi từ vàng)
    case 'issued':
        return '#FFC107'; // Vàng (đã đổi từ xanh dương đậm)
    case 'overdue':
        return '#DC3545'; // Đỏ
    case 'draft':
        return '#6C757D'; // Xám
    case 'canceled':
        return '#343A40'; // Đen xám
    default:
        return Colors.mediumGray;
    }
};

  // Get category text
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'rent':
        return 'Tiền phòng';
      case 'utility':
        return 'Tiền điện';
      case 'service':
        return 'Phí dịch vụ';
      case 'maintenance':
        return 'Phí đỗ xe';
      default:
        return 'Khác';
    }
  };

  // Hàm helper để lấy icon cho từng loại item
  const getItemIcon = (item: any) => {
    const itemName = item.name?.toLowerCase() || '';
    const category = item.category;
    
    // Kiểm tra tên item cụ thể trước
    if (itemName.includes('điện') || itemName.includes('electricity')) {
      return require('../../assets/icons/icon_electrical.png');
    }
    if (itemName.includes('nước') || itemName.includes('water')) {
      return require('../../assets/icons/icon_tien_nuoc.png');
    }
    if (itemName.includes('wifi') || itemName.includes('internet')) {
      return require('../../assets/icons/icon_wifi.png');
    }
    if (itemName.includes('đỗ xe') || itemName.includes('parking') || itemName.includes('xe')) {
      return require('../../assets/icons/icon_thang_may.png');
    }
    if (itemName.includes('vệ sinh') || itemName.includes('sanitation')) {
      return require('../../assets/icons/icon_ve_sinh.png');
    }
    if (itemName.includes('điều hòa') || itemName.includes('air')) {
      return require('../../assets/icons/icon_dieu_hoa.png');
    }
    if (itemName.includes('tủ lạnh') || itemName.includes('fridge')) {
      return require('../../assets/icons/icon_tu_lanh.png');
    }
    if (itemName.includes('máy giặt') || itemName.includes('washing')) {
      return require('../../assets/icons/icon_may_giat.png');
    }
    if (itemName.includes('bàn ghế') || itemName.includes('table')) {
      return require('../../assets/icons/icon_table_chair_default.png');
    }
    if (itemName.includes('tủ quần áo') || itemName.includes('wardrobe')) {
      return require('../../assets/icons/icon_tu_quan_ao.png');
    }
    if (itemName.includes('sofa')) {
      return require('../../assets/icons/icon_sofa.png');
    }
    if (itemName.includes('quạt') || itemName.includes('fan')) {
      return require('../../assets/icons/icon_quat_tran.png');
    }
    if (itemName.includes('gương') || itemName.includes('mirror')) {
      return require('../../assets/icons/icon_guong.png');
    }
    if (itemName.includes('bình nóng lạnh') || itemName.includes('water heater')) {
      return require('../../assets/icons/icon_nong_lanh.png');
    }
    if (itemName.includes('kệ bếp') || itemName.includes('kitchen')) {
      return require('../../assets/icons/icon_ke_bep.png');
    }
    if (itemName.includes('giường') || itemName.includes('bed')) {
      return require('../../assets/icons/icon_giuong_ngu.png');
    }
    if (itemName.includes('chăn') || itemName.includes('ga') || itemName.includes('đệm')) {
      return require('../../assets/icons/icon_chan_ga_goi.png');
    }
    if (itemName.includes('rèm') || itemName.includes('curtain')) {
      return require('../../assets/icons/icon_rem_cua.png');
    }
    if (itemName.includes('đồ gia dụng') || itemName.includes('appliance')) {
      return require('../../assets/icons/icon_do_gia_dung_default.png');
    }
    
    // Fallback theo category
    switch (category) {
      case 'rent':
        return require('../../assets/icons/icon_room.png');
      case 'utility':
        return require('../../assets/icons/icon_electrical.png');
      case 'service':
        return require('../../assets/icons/icon_ve_sinh.png');
      case 'maintenance':
        return require('../../assets/icons/icon_thang_may.png');
      default:
        return require('../../assets/icons/icon_room.png');
    }
  };

  // Xác định nếu người dùng hiện tại là người thuê (không phải chủ trọ)
  const isTenant = user?.role === 'nguoiThue';

  const renderHeader = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    return (
      <View style={{ paddingTop: statusBarHeight, alignItems: 'center', marginBottom: 30 }}>
        <UIHeader
          title={'Chi tiết hóa đơn người ở cùng'}
          iconLeft={'back'}
          onPressLeft={handleGoBack}
        />
      </View>
    );
  };

  const renderInvoiceInfo = () => {
    if (!roommateInvoice) return null;

    const { roomNumber, tenantName, period, roomAddress, dueDate } = extractInvoiceInfo(roommateInvoice);
    const status = getStatusText(roommateInvoice.status);

    return (
      <View style={styles.invoiceSummaryCard}>
        <View style={styles.roomNumberRow}>
          <Text style={styles.roomNumber}>{roomNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(roommateInvoice.status) }]}>
            <Text style={styles.statusBadgeText}>{status.text}</Text>
          </View>
        </View>
        
        <View style={styles.invoiceDetailsGrid}>
          {roommateInvoice.invoiceNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã hóa đơn</Text>
              <Text style={styles.detailValue}>{roommateInvoice.invoiceNumber}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Người thuê</Text>
            <Text style={styles.detailValue}>{tenantName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kỳ hóa đơn</Text>
            <Text style={styles.detailValue}>Tháng {period}</Text>
          </View>
          {/* Ngày bắt đầu: không sử dụng */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hạn thanh toán</Text>
            <Text style={styles.detailValue}>{dueDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Địa chỉ</Text>
            <Text style={styles.detailValue}>{roomAddress || 'Không có địa chỉ'}</Text>
          </View>
          {roommateInvoice.status === 'paid' && roommateInvoice.paymentDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Đã thanh toán</Text>
              <Text style={styles.detailValue}>{formatDate(roommateInvoice.paymentDate)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderInvoiceItems = () => {
    if (!roommateInvoice || !roommateInvoice.items || roommateInvoice.items.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <Text style={styles.emptyMessage}>Không có thông tin chi tiết</Text>
        </View>
      );
    }

    const items = roommateInvoice.items;

    const renderItemDetails = (item: any, align: 'left' | 'right') => {
      const rows: { label: string; value: string }[] = [];
      if (item.description) {rows.push({ label: 'Mô tả', value: item.description });}
      if (item.quantity > 0) {
        rows.push({ label: 'Số lượng', value: `${item.quantity}` });
      }
      rows.push({ label: 'Đơn giá', value: `${item.unitPrice.toLocaleString('vi-VN')}VND${item.category === 'rent' ? '/tháng' : ''}` });
      if (item.isPerPerson) {
        rows.push({ label: 'Tính theo người', value: `${item.personCount || 1} người` });
      }
      if (item.previousReading !== undefined) {
        rows.push({ label: 'Chỉ số cũ', value: `${item.previousReading}` });
      }
      if (item.currentReading !== undefined) {
        rows.push({ label: 'Chỉ số mới', value: `${item.currentReading}` });
      }
      // Thêm dòng hiển thị số đã sử dụng
      if (item.previousReading !== undefined && item.currentReading !== undefined) {
        const usage = item.currentReading - item.previousReading;
        rows.push({ label: 'Số đã sử dụng', value: `${usage}` });
      }
      if (roommateInvoice?.dueDate) {
        rows.push({ label: 'Hạn thanh toán', value: formatDate(roommateInvoice.dueDate) });
      }

      const sideStyle = align === 'left' ? styles.expandedDetailConnectedLeft : styles.expandedDetailConnectedRight;

      return (
        <View style={[styles.expandedDetailContainer, sideStyle]}>
          <Text style={styles.expandedDetailTitle}>Chi tiết {item.name || getCategoryText(item.category)}</Text>
          {rows.map((row, idx) => (
            <View key={idx} style={styles.itemDetailRow}>
              <Text style={styles.itemDetailLabel}>{row.label}</Text>
              <Text style={styles.itemDetailValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      );
    };

    return (
      <View style={styles.itemsContainer}>
        <View style={styles.itemsGrid}>
          {(() => {
            const rows: React.ReactNode[] = [];
            for (let i = 0; i < items.length; i += 2) {
              const left = items[i];
              const right = items[i + 1];
              const leftKey = String(left._id || i);
              const rightKey = right ? String(right._id || i + 1) : null;
              const isLeftExpanded = expandedKey === leftKey;
              const isRightExpanded = rightKey ? expandedKey === rightKey : false;
              rows.push(
                <View key={`row-${i}`} style={[styles.itemsRow, (isLeftExpanded || isRightExpanded) && styles.itemsRowExpanded]}>
                  <TouchableOpacity style={[styles.itemCard, isLeftExpanded && styles.itemCardExpanded, isLeftExpanded && styles.itemCardExpandedLeft]} activeOpacity={0.85} onPress={() => toggleItemExpanded(leftKey)}>
                    <View style={styles.itemHeaderRow}>
                      <View style={styles.itemIconContainer}>
                        <Image source={getItemIcon(left)} style={styles.itemIcon} resizeMode="contain" />
                      </View>
                      <Text style={styles.itemCardName}>{left.name || getCategoryText(left.category)}</Text>
                    </View>
                    <Text style={styles.itemCardAmount}>{left.amount.toLocaleString('vi-VN')}VND</Text>
                  </TouchableOpacity>
                  {right && (
                    <TouchableOpacity style={[styles.itemCard, isRightExpanded && styles.itemCardExpanded, isRightExpanded && styles.itemCardExpandedRight]} activeOpacity={0.85} onPress={() => rightKey && toggleItemExpanded(rightKey)}>
                      <View style={styles.itemHeaderRow}>
                        <View style={styles.itemIconContainer}>
                          <Image source={getItemIcon(right)} style={styles.itemIcon} resizeMode="contain" />
                        </View>
                        <Text style={styles.itemCardName}>{right.name || getCategoryText(right.category)}</Text>
                      </View>
                      <Text style={styles.itemCardAmount}>{right.amount.toLocaleString('vi-VN')}VND</Text>
                    </TouchableOpacity>
                  )}
                  {!right && <View style={{ width: '49%' }} />}
                </View>
              );
              if (isLeftExpanded) {
                rows.push(<View key={`detail-${leftKey}`}>{renderItemDetails(left, 'left')}</View>);
              } else if (isRightExpanded && right) {
                rows.push(<View key={`detail-${rightKey}`}>{renderItemDetails(right, 'right')}</View>);
              }
            }
            return rows;
          })()}
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (!roommateInvoice) return null;

    return (
      <View style={styles.totalAmountSection}>
        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountLabel}>Tổng tiền</Text>
          <Text style={styles.totalAmountValue}>
            {roommateInvoice.totalAmount.toLocaleString('vi-VN')}VND
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingAnimationWrapper 
          visible={isFocused && true}
          message="Đang tải thông tin hóa đơn..."
          size="large"
        />
      </SafeAreaView>
    );
  }

  if (!roommateInvoice) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin hóa đơn</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={loadInvoiceDetails}>
            <Text style={styles.reloadButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {renderInvoiceInfo()}
        {renderInvoiceItems()}
        {renderSummary()}
      </ScrollView>

      {/* Action buttons - using type assertion to allow 'pending' status */}
      {isTenant && roommateInvoice.status === 'pending' && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleMarkAsPaid}
            disabled={markAsPaidLoading}
          >
            {markAsPaidLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.paymentButtonText}>Đánh dấu đã thanh toán</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
                selectedPaymentMethod === 'cash' && styles.selectedPaymentOption,
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
                selectedPaymentMethod === 'bank_transfer' && styles.selectedPaymentOption,
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

      {/* CustomAlertModal */}
      <CustomAlertModal
        visible={visible}
        title={alertConfig?.title || 'Thông báo'}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
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
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroud,
    position: 'relative',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
  },
  placeholderView: {
    width: 24,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 10,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.dearkOlive,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    color: Colors.mediumGray,
    fontStyle: 'italic',
    marginVertical: 10,
  },
  // New styles for the new design
  invoiceSummaryCard: {
    backgroundColor: Colors.white,
    marginTop: 10,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: 20,
    borderRadius: 8,
    marginHorizontal: 15,
  },
  roomNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roomNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  invoiceDetailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  itemsContainer: {
    backgroundColor: 'transparent',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  itemsGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },
  itemsRowExpanded: {
    marginBottom: -1,
  },
  itemCard: {
    width: '49%',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'flex-start',
  },
  itemCardExpanded: {
    backgroundColor: '#BAFD00',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: -5,
    borderColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingBottom: 25,
  },
  itemCardExpandedLeft: {
    borderBottomLeftRadius: 0,
  },
  itemCardExpandedRight: {
    borderBottomRightRadius: 0,
  },
  itemIconContainer: {
    marginBottom: 0,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
    justifyContent: 'flex-start',
  },
  itemIcon: {
    width: 20,
    height: 20,
  },
  itemCardName: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'left',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDetailLabel: {
    fontSize: 12,
    color: Colors.black,
    flex: 1,
    fontWeight: '500',
  },
  itemDetailValue: {
    fontSize: 12,
    color: Colors.black,
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  expandedDetailContainer: {
    width: '100%',
    backgroundColor: '#BAFD00',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 0,
  },
  expandedDetailConnectedLeft: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -5,
    paddingTop: 0,
  },
  expandedDetailConnectedRight: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    marginTop: -5,
    paddingTop: 0,
  },
  expandedDetailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 10,
  },
  totalAmountSection: {
    backgroundColor: 'transparent',
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  totalAmountContainer: {
    backgroundColor: '#BAFD00',
    borderRadius: 10,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 80,
    width: '100%',
    marginHorizontal: 0,
  },
  totalAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
    textAlign: 'left',
  },
  totalAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'left',
  },
  paymentButtonContainer: {
    padding: 15,
    marginBottom: 15,
  },
  paymentButton: {
    backgroundColor: '#BAFD00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginHorizontal: 0,
  },
  paymentButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
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
