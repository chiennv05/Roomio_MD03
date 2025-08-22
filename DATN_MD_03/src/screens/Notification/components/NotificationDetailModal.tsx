import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Colors} from '../../../theme/color';
import {Fonts} from '../../../theme/fonts';
import {responsiveFont, scale} from '../../../utils/responsive';
import {FormattedNotification} from './NotificationListContainer';
import {CustomAlertModal, useCustomAlert} from './index';

interface NotificationDetailModalProps {
  visible: boolean;
  notification: FormattedNotification | null;
  onClose: () => void;
  onNavigateToBill: (invoiceId?: string | null) => void;
  onNavigateToContract: (roomId?: string | null) => void;
  onNavigateToRoomManagement: () => void;
  onNavigateToSupport: () => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  visible,
  notification,
  onClose,
  onNavigateToBill,
  onNavigateToContract,
  onNavigateToRoomManagement,
  onNavigateToSupport,
}) => {
  // Custom Alert Hook
  const {
    alertConfig,
    visible: alertVisible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showConfirm,
    showNotificationAlert,
  } = useCustomAlert();
  // Function để extract invoiceId từ notification content (tránh bắt "mới"/"tháng")
  const extractInvoiceIdFromContent = (content: string): string | null => {
    if (!content) return null;

    // Chỉ chấp nhận các pattern rõ ràng cho mã hóa đơn
    const patterns: RegExp[] = [
      /mã\s*hóa\s*đơn\s*[:#-]?\s*([A-Za-z0-9_-]{6,})/i, // "Mã hóa đơn: ABC123"
      /invoice\s*id\s*[:#-]?\s*([A-Za-z0-9_-]{6,})/i, // "Invoice ID: ..."
      /\b([0-9a-f]{24})\b/i, // MongoDB ObjectId
      /\bHD[-_]?\d{6,}\b/i, // Ví dụ: HD123456
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const candidate = match[1];
        // Loại bỏ các giá trị không hợp lệ (ví dụ từ ngữ, tháng/năm)
        if (
          candidate.length >= 6 &&
          !/[\/\s]/.test(candidate) &&
          !/(moi|mới|thang|tháng|vnd)/i.test(candidate)
        ) {
          return candidate;
        }
      }
    }
    return null;
  };

  // Function để extract roomId từ notification content cho hợp đồng
  const extractRoomIdFromContent = (content: string): string | null => {
    // Tìm kiếm pattern cho roomId trong content hợp đồng
    const patterns = [/phòng\s+([A-Za-z0-9]+)/i, /room\s+([A-Za-z0-9]+)/i];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleBillNavigation = () => {
    const invoiceId = extractInvoiceIdFromContent(notification?.content || '');
    onNavigateToBill(invoiceId);
  };

  const handleContractNavigation = () => {
    const roomId = extractRoomIdFromContent(notification?.content || '');
    onNavigateToContract(roomId);
  };

  // Function để xác định loại thông báo hợp đồng
  const getContractActionText = () => {
    const content = notification?.content || '';

    // Nếu là thông báo yêu cầu thuê phòng, hiển thị nút xử lý yêu cầu
    if (
      content.includes('muốn thuê phòng') ||
      content.includes('yêu cầu thuê')
    ) {
      return 'Xử lý yêu cầu thuê';
    }

    // Mặc định: điều hướng sang màn quản lý hợp đồng
    return 'Xem hợp đồng';
  };

  const renderActionButtons = () => {
    switch (notification?.type) {
      case 'thanhToan':
        return (
          <>
            <TouchableOpacity
              style={[styles.modalButton, styles.billButton]}
              onPress={handleBillNavigation}>
              <Text style={styles.billButtonText}>
                {extractInvoiceIdFromContent(notification?.content || '')
                  ? 'Xem chi tiết hóa đơn'
                  : 'Xem danh sách hóa đơn'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </>
        );

      case 'hopDong':
        return (
          <>
            <TouchableOpacity
              style={[styles.modalButton, styles.contractButton]}
              onPress={handleContractNavigation}>
              <Text style={styles.contractButtonText}>
                {getContractActionText()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </>
        );

      case 'heThong':
        return (
          <>
            <TouchableOpacity
              style={[styles.modalButton, styles.systemButton]}
              onPress={() => {
                const content = notification?.content || '';
                if (
                  content.includes('Bài đăng phòng') &&
                  content.includes('đã được duyệt')
                ) {
                  onNavigateToRoomManagement();
                } else {
                  onClose();
                }
              }}>
              <Text style={styles.systemButtonText}>
                {notification?.content?.includes('Bài đăng phòng')
                  ? 'Xem phòng của tôi'
                  : 'OK'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </>
        );

      case 'hoTro':
        return (
          <>
            <TouchableOpacity
              style={[styles.modalButton, styles.supportButton]}
              onPress={() => {
                showNotificationAlert(
                  'Thông báo hỗ trợ',
                  'Phản hồi từ Admin cho yêu cầu "gọi dang ký": ???',
                  '5 giờ trước',
                  () => {
                    onNavigateToSupport();
                    onClose();
                  },
                  'Xem hỗ trợ',
                );
              }}>
              <Text style={styles.supportButtonText}>Xem hỗ trợ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </>
        );

      default:
        return (
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {notification?.title || 'Chi tiết thông báo'}
              </Text>

              <Text style={styles.modalContentText}>
                {notification?.content || ''}
              </Text>

              <Text style={styles.modalTime}>
                {notification?.date} - {notification?.time}
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>{renderActionButtons()}</View>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message || ''}
        onClose={hideAlert}
        type={alertConfig?.type}
        timestamp={alertConfig?.timestamp}
        icon={alertConfig?.icon}
        showIcon={alertConfig?.showIcon}
        buttons={alertConfig?.buttons}
        customStyles={alertConfig?.customStyles}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    maxHeight: '80%',
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: scale(20),
    maxHeight: scale(400),
  },
  modalTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
    marginBottom: scale(12),
    textAlign: 'center',
  },
  modalContentText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
    lineHeight: responsiveFont(22),
    marginBottom: scale(16),
  },
  modalTime: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: scale(20),
    paddingTop: scale(10),
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  billButton: {
    backgroundColor: Colors.limeGreen,
  },
  billButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
  contractButton: {
    backgroundColor: Colors.darkGreen,
  },
  contractButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  closeButton: {
    backgroundColor: Colors.lightGray,
  },
  closeButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  systemButton: {
    backgroundColor: Colors.info,
  },
  systemButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
  supportButton: {
    backgroundColor: Colors.warning,
  },
  supportButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.black,
  },
});

export default NotificationDetailModal;
