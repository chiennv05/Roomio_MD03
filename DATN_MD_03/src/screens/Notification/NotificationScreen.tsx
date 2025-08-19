import {View, StyleSheet, Alert, StatusBar, Animated} from 'react-native';
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
import NotificationScreenHeader from './components/NotificationScreenHeader';
import NotificationHeader from './components/NotificationHeader';
import NotificationListContainer, {
  FormattedNotification,
} from './components/NotificationListContainer';
import NotificationDetailModal from './components/NotificationDetailModal';
import LoadingAnimation from '../../components/LoadingAnimation';
import {useCustomAlert} from './components';
import {Colors} from '../../theme/color';
import {responsiveSpacing} from '../../utils/responsive';
import CustomAlertModalNotification from '../../components/CutomAlaertModalNotification';

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
  const {
    alertConfig,
    visible: alertVisible,
    hideAlert,
    showSuccess,
  } = useCustomAlert();

  const [activeTab, setActiveTab] = useState<
    'all' | 'schedule' | 'bill' | 'contract'
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

  // Handle navigation from notification tap
  useEffect(() => {
    const params = route.params as any;
    if (params?.fromPush && params?.notificationId) {
      console.log('Opened from notification:', params.notificationId);

      // Show success message
      setTimeout(() => {
        showSuccess(
          'Đã mở từ thông báo!',
          'Thông báo đã được mở thành công',
          true,
        );
      }, 1000);

      // Optionally, find and highlight the specific notification
      // or open its detail modal
      const targetNotification = notifications.find(
        notif => (notif._id || (notif as any).id) === params.notificationId,
      );

      if (targetNotification) {
        // Auto-open the notification detail modal
        const formatted: FormattedNotification = {
          id: targetNotification._id || '',
          title: getNotificationTitle(targetNotification.type),
          content: targetNotification.content,
          time: formatRelativeTime(targetNotification.createdAt),
          date: formatFullDate(targetNotification.createdAt),
          isRead: targetNotification.status === 'read',
          type: targetNotification.type,
        };
        setTimeout(() => {
          setSelectedNotification(formatted);
          setModalVisible(true);
        }, 1500);
      }
    }
  }, [route.params, notifications, showSuccess]);

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

  // Function để navigate đến màn hình hóa đơn
  const navigateToBillScreen = (invoiceId?: string | null) => {
    closeModal();
    if (invoiceId) {
      // Nếu có invoiceId, navigate đến chi tiết hóa đơn
      navigation.navigate('BillDetails', {invoiceId});
    } else {
      // Nếu không có invoiceId, navigate đến danh sách hóa đơn
      navigation.navigate('Bill');
    }
  };

  // Function để navigate đến màn hình hợp đồng
  const navigateToContractScreen = (roomId?: string | null) => {
    closeModal();

    // Kiểm tra nếu có selectedNotification để lấy thêm thông tin
    if (selectedNotification) {
      const originalNotification = notifications.find(
        n => n._id === selectedNotification.id,
      );

      // Nếu có thông báo gốc và có rentRequestData, navigate đến AddContract
      if (
        originalNotification &&
        originalNotification.rentRequestData?.tenantInfo
      ) {
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

    // Nếu có roomId, navigate đến chi tiết phòng
    if (roomId) {
      console.log('Navigate to room detail with roomId:', roomId);
      navigation.navigate('DetailRoomLandlord', {id: roomId});
    } else {
      // Fallback: navigate đến quản lý hợp đồng
      console.log('Navigate to contract management');
      navigation.navigate('ContractManagement');
    }
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
    (tab: 'all' | 'schedule' | 'bill' | 'contract') => {
      setActiveTab(tab);
    },
    [],
  );

  // Handle menu press
  const handleMenuPress = useCallback(() => {
    console.log('Menu pressed');
  }, []);

  // Filter notifications based on active tab
  const getFilteredNotifications = useCallback(() => {
    switch (activeTab) {
      case 'schedule':
        return notifications.filter(n => n.type === 'lichXemPhong');
      case 'bill':
        return notifications.filter(n => n.type === 'thanhToan');
      case 'contract':
        return notifications.filter(n => n.type === 'hopDong');
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
      <View style={[styles.safeArea, {backgroundColor: Colors.backgroud}]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <NotificationScreenHeader onMenuPress={handleMenuPress} />
        <View style={styles.loadingContainer}>
          <LoadingAnimation size="large" color={Colors.limeGreen} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header trên cùng chứa tiêu đề + tabs */}
      <View style={styles.headerPlain}>
        <SafeAreaView>
          <NotificationScreenHeader onMenuPress={handleMenuPress} />
          <NotificationHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unreadCount={unreadCount}
          />
        </SafeAreaView>
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
        {/* Enhanced header with glass effect */}
        <View style={styles.headerContainer} />

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
      <NotificationDetailModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={closeModal}
        onNavigateToBill={navigateToBillScreen}
        onNavigateToContract={navigateToContractScreen}
        onNavigateToRoomManagement={navigateToRoomManagement}
        onNavigateToSupport={navigateToSupport}
      />

      {/* Custom Alert Modal */}
      <CustomAlertModalNotification
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
    </View>
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
    backgroundColor: Colors.backgroud,
  },
  headerPlain: {
    paddingBottom: responsiveSpacing(20),
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: -responsiveSpacing(15), // Overlap effect
  },
  headerContainer: {
    backgroundColor: 'transparent',
    marginHorizontal: responsiveSpacing(16),
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: responsiveSpacing(12),
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: responsiveSpacing(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;
