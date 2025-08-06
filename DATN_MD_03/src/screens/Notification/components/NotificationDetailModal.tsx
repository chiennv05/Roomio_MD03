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
  // Function để extract invoiceId từ notification content
  const extractInvoiceIdFromContent = (content: string): string | null => {
    // Tìm kiếm pattern cho invoiceId trong content
    const patterns = [
      /hóa đơn\s+([A-Za-z0-9]+)/i,
      /invoice\s+([A-Za-z0-9]+)/i,
      /ID:\s*([A-Za-z0-9]+)/i,
      /mã\s+hóa\s+đơn:\s*([A-Za-z0-9]+)/i,
      /([0-9a-f]{24})/i, // MongoDB ObjectId pattern
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1];
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

    // Kiểm tra nếu là thông báo yêu cầu thuê phòng
    if (
      content.includes('muốn thuê phòng') ||
      content.includes('yêu cầu thuê')
    ) {
      return 'Xử lý yêu cầu thuê';
    }

    // Kiểm tra nếu là thông báo phê duyệt hợp đồng
    if (
      content.includes('đã được admin phê duyệt') ||
      content.includes('có hiệu lực')
    ) {
      const roomId = extractRoomIdFromContent(content);
      return roomId ? `Xem phòng ${roomId}` : 'Xem hợp đồng';
    }

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
              onPress={onNavigateToSupport}>
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
