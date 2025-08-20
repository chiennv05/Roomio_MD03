import {View, StyleSheet, Alert, StatusBar, Animated, Linking} from 'react-native';
import React, {useEffect, useCallback, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/route';
import {RootState, AppDispatch} from '../../store';
import {
  fetchNotifications,
  refreshNotifications,
  loadMoreNotifications,
  markAsRead,
  deleteNotificationById,
} from '../../store/slices/notificationSlice';
import EmptyNotification from './components/EmptyNotification';
import UIHeader from '../ChuTro/MyRoom/components/UIHeader';
import NotificationHeader from './components/NotificationHeader';
import NotificationListContainer, {
  FormattedNotification,
} from './components/NotificationListContainer';
// import CustomAlertModal from '../../components/CustomAlertModal';
import LoadingAnimation from '../../components/LoadingAnimation';
import {useCustomAlert} from './components';
import {Colors} from '../../theme/color';
import {responsiveSpacing} from '../../utils/responsive';
import CustomAlertModalNotification from '../../components/CutCusomAlaertModalNotification';
import {Icons} from '../../assets/icons';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NotificationScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const route = useRoute();
  const {user, token} = useSelector((state: RootState) => state.auth);
  const {
    loading,
    notifications,
    pagination,
    unreadCount,
    refreshing,
    loadingMore,
  } = useSelector((state: RootState) => state.notification);

  // Custom Alert Hook
  const {alertConfig, visible: alertVisible, hideAlert} = useCustomAlert();

  const [activeTab, setActiveTab] = useState<
    'all' | 'heThong' | 'hopDong' | 'thanhToan' | 'hoTro'
  >('all');

  // State cho modal chi tiết thông báo
  const [selectedNotification, setSelectedNotification] =
    useState<FormattedNotification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Load notifications khi component mount với animation
  useEffect(() => {
    if (user && token) {
      dispatch(fetchNotifications({token, page: 1, limit: 20}));
    }

    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, user, token, fadeAnim, slideAnim]);

  // Handle navigation from notification tap: chỉ vào màn Thông báo, KHÔNG mở dialog
  useEffect(() => {
    const params = route.params as any;
    if (params?.fromPush) {
      console.log(
        'Opened from status-bar notification → stay on Notification list',
      );
      // Đảm bảo không hiện bất kỳ modal nào
      setModalVisible(false);
      setSelectedNotification(null);
      // Optional: có thể refresh nhanh danh sách để người dùng thấy mục mới
      // if (user && token) dispatch(refreshNotifications({ token, limit: 20 }));
    }
  }, [route.params]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (user && token) {
      dispatch(refreshNotifications({token, limit: 20}));
    }
  }, [dispatch, user, token]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (user && token && pagination?.hasNextPage && !loadingMore && !loading) {
      dispatch(
        loadMoreNotifications({
          token,
          page: pagination.page + 1,
          limit: 20,
        }),
      );
    }
  }, [dispatch, user, token, pagination, loadingMore, loading]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      if (user && token) {
        dispatch(markAsRead({notificationId, token}));
      }
    },
    [dispatch, user, token],
  );

  // Handle delete notification
  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      if (user && token) {
        Alert.alert(
          'Xác nhận xóa',
          'Bạn có chắc chắn muốn xóa thông báo này?',
          [
            {
              text: 'Hủy',
              style: 'cancel',
            },
            {
              text: 'Xóa',
              style: 'destructive',
              onPress: () => {
                dispatch(deleteNotificationById({notificationId, token}));
              },
            },
          ],
          {cancelable: true},
        );
      }
    },
    [dispatch, user, token],
  );

  // Function để hiển thị modal chi tiết thông báo
  const showNotificationDetail = (notification: FormattedNotification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  // Function để đóng modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  // Function để navigate đến màn hình hóa đơn (có kiểm tra id hợp lệ)
  const navigateToBillScreen = (invoiceId?: string | null) => {
    closeModal();
    const valid =
      !!invoiceId && /^(?:[0-9a-f]{24}|[A-Za-z0-9_-]{6,})$/.test(invoiceId);
    if (valid) {
      navigation.navigate('BillDetails', {invoiceId: invoiceId!});
    } else {
      navigation.navigate('Bill');
    }
  };

  // Function để navigate đến màn hình hợp đồng
  const navigateToContractScreen = (_roomId?: string | null) => {
    closeModal();

    // Nếu là chủ trọ và đây là thông báo yêu cầu thuê -> sang AddContract
    if (user?.role === 'chuTro' && selectedNotification) {
      const originalNotification = notifications.find(
        n => n._id === selectedNotification.id,
      );
      if (originalNotification?.rentRequestData?.tenantInfo) {
        console.log(
          'Navigate to AddContract with notificationId:',
          selectedNotification.id,
        );
        navigation.navigate('AddContract', {
          notificationId: selectedNotification.id,
        });
        return;
      }
    }

    // Người thuê: đưa sang màn hợp đồng của người thuê
    if (user?.role === 'nguoiThue') {
      console.log('Navigate to tenant contracts');
      navigation.navigate('ContractLessee');
      return;
    }

    // Chủ trọ: đưa sang màn quản lý hợp đồng
    if (user?.role === 'chuTro') {
      console.log('Navigate to landlord contract management');
      navigation.navigate('ContractManagement');
      return;
    }

    // Fallback
    navigation.navigate('ContractLessee');
  };

  // Function để navigate đến màn hình quản lý phòng
  const navigateToRoomManagement = () => {
    closeModal();
    console.log('Navigate to room management');
    navigation.navigate('LandlordRoom');
  };

  // Function để navigate đến màn hình hỗ trợ
  const navigateToSupport = () => {
    closeModal();
    console.log('Navigate to support screen');
    navigation.navigate('SupportScreen');
  };

  // Extract phone number from content
  const extractPhoneNumber = (text: string): string | null => {
    if (!text) {
      return null;
    }
    // Match Vietnamese phones: +84 or 0 followed by 9-10 digits, allow spaces/dots
    const cleaned = text.replace(/[^+\d]/g, ' ');
    const candidates = cleaned.match(/(\+84\s?\d{9,10}|0\s?\d{9,10})/g);
    if (!candidates || candidates.length === 0) {
      return null;
    }
    let phone = candidates[0].replace(/\s|\./g, '');
    if (phone.startsWith('+84')) {
      phone = '0' + phone.slice(3);
    }
    return phone;
  };

  const shouldShowCallButton = (): boolean => {
    if (!selectedNotification) {
      return false;
    }
    const content = (selectedNotification.content || '').toLowerCase();
    const hasPhone = !!extractPhoneNumber(selectedNotification.content || '');
    const isViewSchedule =
      content.includes('xem phòng') ||
      content.includes('đặt lịch') ||
      content.includes('muốn thuê phòng');
    return hasPhone && isViewSchedule;
  };

  const handleCall = () => {
    const phone = extractPhoneNumber(selectedNotification?.content || '');
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Không tìm thấy số điện thoại hợp lệ');
    }
  };

  // Handle notification press - Hiển thị modal chi tiết
  const handleNotificationPress = useCallback(
    (notification: FormattedNotification) => {
      // Mark as read first
      if (!notification.isRead) {
        handleMarkAsRead(notification.id);
      }

      // Hiển thị modal chi tiết cho tất cả loại thông báo
      showNotificationDetail(notification);
    },
    [handleMarkAsRead],
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: 'all' | 'heThong' | 'hopDong' | 'thanhToan' | 'hoTro') => {
      setActiveTab(tab);
    },
    [],
  );

  // Filter notifications based on active tab
  const getFilteredNotifications = useCallback(() => {
    switch (activeTab) {
      case 'heThong':
        return notifications.filter(n => n.type === 'heThong');
      case 'hopDong':
        return notifications.filter(n => n.type === 'hopDong');
      case 'thanhToan':
        return notifications.filter(n => n.type === 'thanhToan');
      case 'hoTro':
        return notifications.filter(n => n.type === 'hoTro');
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  // Convert Redux notification data to component format
  const formattedNotifications: FormattedNotification[] =
    getFilteredNotifications().map(notification => ({
      id: notification._id || '',
      title: getNotificationTitle(notification.type),
      content: notification.content,
      time: formatRelativeTime(notification.createdAt),
      date: formatFullDate(notification.createdAt),
      isRead: notification.status === 'read',
      type: notification.type,
    }));

  // Loading state với beautiful animation
  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.headerContainer}>
          <UIHeader
            title="Thông báo"
            iconLeft={Icons.IconArrowLeft}
            onPressLeft={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingAnimation size="large" color={Colors.limeGreen} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header và Filter gộp chung */}
      <View style={styles.headerContainer}>
        <UIHeader
          title="Thông báo"
          iconLeft={Icons.IconArrowLeft}
          onPressLeft={() => navigation.goBack()}
        />
        <NotificationHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
        />
      </View>

      {/* Main content with animation */}
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        {/* Content area */}
        <View style={styles.contentArea}>
          {formattedNotifications.length === 0 ? (
            <EmptyNotification />
          ) : (
            <NotificationListContainer
              notifications={formattedNotifications}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
              onMarkAsRead={handleNotificationPress}
              onDeleteNotification={handleDeleteNotification}
            />
          )}
        </View>
      </Animated.View>

      {/* Modal chi tiết thông báo */}
      <CustomAlertModalNotification
        visible={modalVisible}
        title={selectedNotification?.title || 'Thông báo'}
        message={selectedNotification?.content || ''}
        onClose={closeModal}
        isRead={selectedNotification?.isRead || false}
        type="info"
        buttons={(() => {
          const arr: Array<{text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' | 'primary'}> = [];
          if (shouldShowCallButton()) {
            arr.push({
              text: 'Gọi',
              onPress: handleCall,
              style: 'default',
            });
          }
          const isCreateContract = (() => {
            if (!selectedNotification) {
              return false;
            }
            const originalNotification = notifications.find(
              n => n._id === selectedNotification.id,
            );
            return !!originalNotification?.rentRequestData?.tenantInfo;
          })();

          arr.push({
            text: isCreateContract ? 'Tạo Hợp Đồng' : 'Xem chi tiết',
            onPress: () => {
              closeModal();
              if (selectedNotification) {
                switch (selectedNotification.type) {
                  case 'thanhToan':
                    navigateToBillScreen();
                    break;
                  case 'hopDong':
                    const originalNotification = notifications.find(
                      n => n._id === selectedNotification.id,
                    );
                    if (originalNotification?.rentRequestData?.tenantInfo) {
                      navigation.navigate('AddContract', {
                        notificationId: selectedNotification.id,
                      });
                    } else {
                      navigateToContractScreen();
                    }
                    break;
                  case 'heThong':
                    navigateToRoomManagement();
                    break;
                  case 'hoTro':
                    navigateToSupport();
                    break;
                  default:
                    navigateToRoomManagement();
                    break;
                }
              }
            },
            style: 'default',
          });
          arr.push({text: 'Đóng', onPress: closeModal, style: 'cancel'});
          return arr;
        })()}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModalNotification
        visible={alertVisible}
        title={alertConfig?.title}
        message={alertConfig?.message || ''}
        onClose={hideAlert}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
      />
    </SafeAreaView>
  );
};

// Helper function để format ngày đầy đủ (VD: "24/06/2025")
const formatFullDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();

    // Kiểm tra nếu là hôm nay
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'Hôm nay';
    }

    // Kiểm tra nếu là hôm qua
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return 'Hôm qua';
    }

    // Format DD/MM/YYYY
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return 'Không xác định';
  }
};

// Helper function để format thời gian tương đối (VD: "2 giờ trước")
const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      const minutes = Math.floor(diffInMinutes);
      return `${minutes} phút trước`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} giờ trước`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  } catch (error) {
    return 'Không xác định';
  }
};

// Helper function để get notification title
const getNotificationTitle = (type: string): string => {
  switch (type) {
    case 'heThong':
      return 'Thông báo hệ thống';
    case 'hopDong':
      return 'Thông báo hợp đồng';
    case 'thanhToan':
      return 'Thông báo thanh toán';
    case 'hoTro':
      return 'Thông báo hỗ trợ';
    case 'lichXemPhong':
      return 'Lịch xem phòng';
    default:
      return 'Thông báo';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    paddingBottom: responsiveSpacing(8),
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(16),
    paddingTop: responsiveSpacing(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;
