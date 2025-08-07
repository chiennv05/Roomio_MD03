import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import {Colors} from '../../theme/color';
import {Fonts} from '../../theme/fonts';
import {responsiveFont, responsiveSpacing, scale} from '../../utils/responsive';
import {useNotification} from '../../providers/NotificationProvider';
import {NotificationType} from '../../types/Notification';
import InAppNotification from '../../components/InAppNotification';

const NotificationTestScreen = () => {
  const {
    isInitialized,
    hasPermissions,
    fcmToken,
    testNotification,
    clearAllNotifications,
    setBadgeNumber,
    checkPermissions,
  } = useNotification();

  const [showInAppNotification, setShowInAppNotification] = useState(false);
  const [inAppNotificationData, setInAppNotificationData] = useState({
    title: '',
    message: '',
    type: 'heThong' as NotificationType,
  });
  const [badgeCount, setBadgeCount] = useState(0);

  // Test notification types
  const notificationTypes: {
    type: NotificationType;
    label: string;
    color: string;
  }[] = [
    {type: 'heThong', label: 'Hệ thống', color: Colors.info},
    {type: 'hopDong', label: 'Hợp đồng', color: Colors.primaryGreen},
    {type: 'thanhToan', label: 'Thanh toán', color: Colors.darkGreen},
    {type: 'lichXemPhong', label: 'Lịch xem phòng', color: Colors.limeGreen},
    {type: 'hoTro', label: 'Hỗ trợ', color: Colors.warning},
  ];

  const handleTestNotification = async (type: NotificationType) => {
    try {
      await testNotification(type);
      Alert.alert('✅ Thành công', `Đã gửi notification ${type}`);
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể gửi notification');
    }
  };

  const handleTestInAppNotification = (type: NotificationType) => {
    const messages = {
      heThong: {
        title: 'Thông báo hệ thống',
        message: 'Hệ thống sẽ bảo trì vào 2:00 AM ngày mai',
      },
      hopDong: {
        title: 'Hợp đồng mới',
        message: 'Bạn có hợp đồng mới cần xem xét và ký',
      },
      thanhToan: {
        title: 'Hóa đơn mới',
        message: 'Hóa đơn tháng 12/2024 đã được tạo - 2.500.000đ',
      },
      lichXemPhong: {
        title: 'Lịch xem phòng',
        message: 'Bạn có lịch xem phòng vào 14:00 ngày mai',
      },
      hoTro: {
        title: 'Phản hồi hỗ trợ',
        message: 'Yêu cầu hỗ trợ của bạn đã được phản hồi',
      },
    };

    setInAppNotificationData({
      title: messages[type].title,
      message: messages[type].message,
      type: type,
    });
    setShowInAppNotification(true);
  };

  const handleCheckPermissions = async () => {
    try {
      const permissions = await checkPermissions();
      Alert.alert(
        '🔐 Permissions Status',
        `Alert: ${permissions?.alert ? '✅' : '❌'}\n` +
          `Sound: ${permissions?.sound ? '✅' : '❌'}\n` +
          `Badge: ${permissions?.badge ? '✅' : '❌'}`,
      );
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể kiểm tra permissions');
    }
  };

  const handleClearNotifications = () => {
    clearAllNotifications();
    Alert.alert('🗑️ Đã xóa', 'Tất cả notifications đã được xóa');
  };

  const handleSetBadge = () => {
    const newCount = badgeCount + 1;
    setBadgeCount(newCount);
    setBadgeNumber(newCount);
    Alert.alert('🔢 Badge Updated', `Badge count: ${newCount}`);
  };

  const handleResetBadge = () => {
    setBadgeCount(0);
    setBadgeNumber(0);
    Alert.alert('🔢 Badge Reset', 'Badge count reset to 0');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔔 Notification Test</Text>
          <Text style={styles.headerSubtitle}>
            Test push notifications và in-app notifications
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>📊 Status</Text>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Initialized:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: isInitialized ? Colors.darkGreen : Colors.red},
              ]}>
              {isInitialized ? '✅ Yes' : '❌ No'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Permissions:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: hasPermissions ? Colors.darkGreen : Colors.red},
              ]}>
              {hasPermissions ? '✅ Granted' : '❌ Denied'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>FCM Token:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: fcmToken ? Colors.darkGreen : Colors.mediumGray},
              ]}>
              {fcmToken ? '✅ Available' : '⏳ Loading...'}
            </Text>
          </View>
        </View>

        {/* Push Notifications Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Push Notifications</Text>

          {notificationTypes.map(item => (
            <TouchableOpacity
              key={item.type}
              style={[styles.testButton, {borderLeftColor: item.color}]}
              onPress={() => handleTestNotification(item.type)}>
              <Text style={styles.testButtonText}>Test {item.label}</Text>
              <Text style={styles.testButtonSubtext}>Push notification</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* In-App Notifications Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📲 In-App Notifications</Text>

          {notificationTypes.map(item => (
            <TouchableOpacity
              key={`inapp-${item.type}`}
              style={[styles.testButton, {borderLeftColor: item.color}]}
              onPress={() => handleTestInAppNotification(item.type)}>
              <Text style={styles.testButtonText}>Show {item.label}</Text>
              <Text style={styles.testButtonSubtext}>In-app notification</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Badge Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 Badge Count</Text>

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Current: {badgeCount}</Text>

            <View style={styles.badgeButtons}>
              <TouchableOpacity
                style={styles.badgeButton}
                onPress={handleSetBadge}>
                <Text style={styles.badgeButtonText}>+1</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.badgeButton, styles.resetButton]}
                onPress={handleResetBadge}>
                <Text style={[styles.badgeButtonText, {color: Colors.white}]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCheckPermissions}>
            <Text style={styles.actionButtonText}>🔐 Check Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearNotifications}>
            <Text style={styles.actionButtonText}>
              🗑️ Clear All Notifications
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* In-App Notification */}
      <InAppNotification
        visible={showInAppNotification}
        title={inAppNotificationData.title}
        message={inAppNotificationData.message}
        type={inAppNotificationData.type}
        onPress={() => {
          Alert.alert('📱 Notification Pressed', inAppNotificationData.title);
          setShowInAppNotification(false);
        }}
        onDismiss={() => setShowInAppNotification(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroud,
  },
  scrollContent: {
    padding: responsiveSpacing(16),
  },
  header: {
    marginBottom: responsiveSpacing(24),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: responsiveFont(24),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(8),
  },
  headerSubtitle: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(20),
  },
  sectionTitle: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(12),
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSpacing(8),
  },
  statusLabel: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.darkGray,
  },
  statusValue: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
  },
  section: {
    marginBottom: responsiveSpacing(20),
  },
  testButton: {
    backgroundColor: Colors.white,
    borderRadius: scale(8),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  testButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  testButtonSubtext: {
    fontSize: responsiveFont(12),
    fontFamily: Fonts.Roboto_Regular,
    color: Colors.textGray,
    marginTop: responsiveSpacing(2),
  },
  badgeContainer: {
    backgroundColor: Colors.white,
    borderRadius: scale(12),
    padding: responsiveSpacing(16),
    alignItems: 'center',
  },
  badgeText: {
    fontSize: responsiveFont(18),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
    marginBottom: responsiveSpacing(12),
  },
  badgeButtons: {
    flexDirection: 'row',
    gap: responsiveSpacing(12),
  },
  badgeButton: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: responsiveSpacing(20),
    paddingVertical: responsiveSpacing(10),
    borderRadius: scale(8),
  },
  resetButton: {
    backgroundColor: Colors.red,
  },
  badgeButtonText: {
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.darkGray,
  },
  actionButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: scale(8),
    padding: responsiveSpacing(16),
    marginBottom: responsiveSpacing(8),
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: responsiveFont(16),
    fontFamily: Fonts.Roboto_Bold,
    color: Colors.white,
  },
});

export default NotificationTestScreen;
