import PushNotification, {Importance} from 'react-native-push-notification';
import {Platform, Alert, Vibration} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NotificationType} from '../types/Notification';

export interface LocalNotificationData {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  soundName?: string;
  vibrate?: boolean;
  playSound?: boolean;
}

class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Khởi tạo notification manager
  public initialize(): void {
    if (this.isInitialized) return;

    PushNotification.configure({
      // Callback khi nhận notification (app foreground)
      onNotification: function (notification) {
        console.log('📱 Notification received:', notification);
        
        // Xử lý khi user tap vào notification
        if (notification.userInteraction) {
          NotificationManager.getInstance().handleNotificationTap(notification);
        }
        
        // Callback bắt buộc cho iOS
        if (notification.finish) {
          notification.finish(PushNotification.FetchResult.NoData);
        }
      },

      // Callback khi đăng ký FCM token thành công
      onRegister: function (token) {
        console.log('🔑 FCM Token:', token);
        NotificationManager.getInstance().saveFCMToken(token.token);
      },

      // Quyền notification (iOS)
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Hiển thị notification khi app ở foreground
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Tạo notification channel cho Android
    this.createNotificationChannels();
    this.isInitialized = true;
  }

  // Tạo notification channels cho Android
  private createNotificationChannels(): void {
    if (Platform.OS === 'android') {
      // Channel chính
      PushNotification.createChannel(
        {
          channelId: 'roomio-main',
          channelName: 'Roomio Main',
          channelDescription: 'Thông báo chính của Roomio',
          playSound: true,
          soundName: 'notification_sound.mp3',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`📢 Main channel created: ${created}`)
      );

      // Channel cho hợp đồng
      PushNotification.createChannel(
        {
          channelId: 'roomio-contract',
          channelName: 'Hợp đồng',
          channelDescription: 'Thông báo về hợp đồng',
          playSound: true,
          soundName: 'notification_bell.wav',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`📋 Contract channel created: ${created}`)
      );

      // Channel cho thanh toán
      PushNotification.createChannel(
        {
          channelId: 'roomio-payment',
          channelName: 'Thanh toán',
          channelDescription: 'Thông báo về thanh toán',
          playSound: true,
          soundName: 'notification_sound.mp3',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`💰 Payment channel created: ${created}`)
      );

      // Channel cho lịch xem phòng
      PushNotification.createChannel(
        {
          channelId: 'roomio-schedule',
          channelName: 'Lịch xem phòng',
          channelDescription: 'Thông báo về lịch xem phòng',
          playSound: true,
          soundName: 'notification_bell.wav',
          importance: Importance.DEFAULT,
          vibrate: false,
        },
        (created) => console.log(`📅 Schedule channel created: ${created}`)
      );
    }
  }

  // Hiển thị local notification
  public showLocalNotification(data: LocalNotificationData): void {
    const {
      id,
      title,
      message,
      type,
      data: notificationData,
      soundName = 'notification_sound.mp3',
      vibrate = true,
      playSound = true,
    } = data;

    // Chọn channel dựa trên type
    const channelId = this.getChannelId(type);
    
    // Tạo notification
    PushNotification.localNotification({
      id: id,
      title: title,
      message: message,
      channelId: channelId,
      playSound: playSound,
      soundName: soundName,
      vibrate: vibrate,
      vibration: vibrate ? 300 : 0,
      userInfo: {
        type: type,
        data: notificationData,
        notificationId: id,
      },
      actions: ['Xem chi tiết', 'Đóng'],
      invokeApp: true,
      autoCancel: true,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      bigText: message,
      subText: this.getTypeDisplayName(type),
      color: '#86B600',
      priority: 'high',
      visibility: 'public',
      importance: 'high',
    });

    // Vibration cho iOS
    if (Platform.OS === 'ios' && vibrate) {
      Vibration.vibrate([0, 250, 250, 250]);
    }

    console.log(`🔔 Local notification sent: ${title}`);
  }

  // Lấy channel ID dựa trên type
  private getChannelId(type: NotificationType): string {
    switch (type) {
      case 'hopDong':
        return 'roomio-contract';
      case 'thanhToan':
        return 'roomio-payment';
      case 'lichXemPhong':
        return 'roomio-schedule';
      default:
        return 'roomio-main';
    }
  }

  // Lấy tên hiển thị của type
  private getTypeDisplayName(type: NotificationType): string {
    switch (type) {
      case 'hopDong':
        return 'Hợp đồng';
      case 'thanhToan':
        return 'Thanh toán';
      case 'lichXemPhong':
        return 'Lịch xem phòng';
      case 'hoTro':
        return 'Hỗ trợ';
      default:
        return 'Thông báo';
    }
  }

  // Xử lý khi user tap vào notification
  private handleNotificationTap(notification: any): void {
    console.log('👆 Notification tapped:', notification);
    
    const {type, data, notificationId} = notification.userInfo || {};
    
    // Emit event để các component khác có thể lắng nghe
    // Có thể sử dụng EventEmitter hoặc Redux action
    this.navigateToScreen(type, data);
  }

  // Navigate đến màn hình tương ứng
  private navigateToScreen(type: NotificationType, data: any): void {
    // TODO: Implement navigation logic
    console.log(`🧭 Navigate to screen for type: ${type}`, data);
  }

  // Lưu FCM token
  private async saveFCMToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('fcm_token', token);
      console.log('💾 FCM Token saved:', token);
    } catch (error) {
      console.error('❌ Error saving FCM token:', error);
    }
  }

  // Lấy FCM token
  public async getFCMToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('fcm_token');
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  // Xóa tất cả notifications
  public clearAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
    console.log('🗑️ All notifications cleared');
  }

  // Xóa notification theo ID
  public clearNotification(id: string): void {
    PushNotification.cancelLocalNotifications({id: id});
    console.log(`🗑️ Notification ${id} cleared`);
  }

  // Lấy số lượng notifications
  public getDeliveredNotifications(callback: (notifications: any[]) => void): void {
    PushNotification.getDeliveredNotifications(callback);
  }

  // Set badge number (iOS)
  public setBadgeNumber(number: number): void {
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(number);
    }
  }

  // Request permissions
  public async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions()
        .then((permissions) => {
          console.log('✅ Notification permissions:', permissions);
          resolve(permissions.alert && permissions.sound);
        })
        .catch((error) => {
          console.error('❌ Error requesting permissions:', error);
          resolve(false);
        });
    });
  }

  // Check permissions
  public checkPermissions(callback: (permissions: any) => void): void {
    PushNotification.checkPermissions(callback);
  }
}

export default NotificationManager;
