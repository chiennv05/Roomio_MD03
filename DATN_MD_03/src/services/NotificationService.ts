import NotificationManager from './NotificationManager';
import {NotificationType, Notification} from '../types/Notification';
import {store} from '../store';
import {fetchNotifications} from '../store/slices/notificationSlice';

export interface PushNotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  notificationId?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationManager: NotificationManager;
  private isListening = false;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.notificationManager = NotificationManager.getInstance();
  }

  // Khởi tạo service
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing NotificationService...');
    
    // Khởi tạo NotificationManager
    this.notificationManager.initialize();
    
    // Request permissions
    const hasPermissions = await this.notificationManager.requestPermissions();
    if (!hasPermissions) {
      console.warn('⚠️ Notification permissions not granted');
      return;
    }

    // Bắt đầu lắng nghe notifications
    this.startListening();
    
    console.log('✅ NotificationService initialized successfully');
  }

  // Bắt đầu lắng nghe notifications
  private startListening(): void {
    if (this.isListening) return;
    
    // TODO: Setup WebSocket hoặc polling để lắng nghe notifications từ server
    this.setupNotificationPolling();
    this.isListening = true;
  }

  // Setup polling để check notifications mới từ server
  private setupNotificationPolling(): void {
    // Poll mỗi 30 giây để check notifications mới
    setInterval(async () => {
      await this.checkForNewNotifications();
    }, 30000);
  }

  // Check notifications mới từ server
  private async checkForNewNotifications(): Promise<void> {
    try {
      const state = store.getState();
      const {user, token} = state.auth;
      
      if (!user || !token) return;

      // Dispatch action để fetch notifications mới
      const result = await store.dispatch(fetchNotifications({
        token,
        page: 1,
        limit: 5
      }));

      if (fetchNotifications.fulfilled.match(result)) {
        const newNotifications = result.payload.notifications;
        await this.processNewNotifications(newNotifications);
      }
    } catch (error) {
      console.error('❌ Error checking new notifications:', error);
    }
  }

  // Xử lý notifications mới
  private async processNewNotifications(notifications: Notification[]): Promise<void> {
    const state = store.getState();
    const existingNotifications = state.notification.notifications;
    
    // Tìm notifications mới (chưa có trong store)
    const newNotifications = notifications.filter(notification => 
      !existingNotifications.find(existing => existing._id === notification._id)
    );

    // Hiển thị notification cho mỗi notification mới
    for (const notification of newNotifications) {
      await this.showNotificationForNewItem(notification);
    }
  }

  // Hiển thị notification cho item mới
  private async showNotificationForNewItem(notification: Notification): Promise<void> {
    const title = this.getNotificationTitle(notification.type);
    const message = notification.content;

    await this.showLocalNotification({
      id: notification._id || Date.now().toString(),
      title,
      message,
      type: notification.type,
      data: {
        notificationId: notification._id,
        type: notification.type,
        rentRequestData: notification.rentRequestData,
        billData: notification.billData,
      }
    });
  }

  // Hiển thị local notification
  public async showLocalNotification(payload: {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
  }): Promise<void> {
    this.notificationManager.showLocalNotification({
      id: payload.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      data: payload.data,
      soundName: this.getSoundForType(payload.type),
      vibrate: true,
      playSound: true,
    });
  }

  // Xử lý push notification từ server
  public handlePushNotification(payload: PushNotificationPayload): void {
    console.log('📨 Received push notification:', payload);
    
    // Hiển thị notification
    this.notificationManager.showLocalNotification({
      id: payload.notificationId || Date.now().toString(),
      title: payload.title,
      message: payload.body,
      type: payload.type,
      data: payload.data,
      soundName: this.getSoundForType(payload.type),
      vibrate: true,
      playSound: true,
    });

    // Refresh notifications trong app
    this.refreshNotifications();
  }

  // Refresh notifications trong app
  private async refreshNotifications(): Promise<void> {
    try {
      const state = store.getState();
      const {user, token} = state.auth;
      
      if (user && token) {
        store.dispatch(fetchNotifications({token, page: 1, limit: 20}));
      }
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
    }
  }

  // Lấy title cho notification dựa trên type
  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case 'hopDong':
        return '📋 Hợp đồng mới';
      case 'thanhToan':
        return '💰 Thông báo thanh toán';
      case 'lichXemPhong':
        return '📅 Lịch xem phòng';
      case 'hoTro':
        return '🆘 Hỗ trợ';
      case 'heThong':
        return '⚙️ Thông báo hệ thống';
      default:
        return '🔔 Thông báo mới';
    }
  }

  // Lấy sound file cho từng type
  private getSoundForType(type: NotificationType): string {
    switch (type) {
      case 'hopDong':
      case 'lichXemPhong':
        return 'notification_bell.wav';
      case 'thanhToan':
        return 'notification_sound.mp3';
      default:
        return 'notification_sound.mp3';
    }
  }

  // Test notification
  public async testNotification(type: NotificationType = 'heThong'): Promise<void> {
    const testMessages = {
      hopDong: 'Bạn có hợp đồng mới cần xem xét',
      thanhToan: 'Hóa đơn tháng 12 đã được tạo',
      lichXemPhong: 'Bạn có lịch xem phòng vào 14:00 ngày mai',
      hoTro: 'Yêu cầu hỗ trợ của bạn đã được phản hồi',
      heThong: 'Hệ thống sẽ bảo trì vào 2:00 AM',
    };

    await this.showLocalNotification({
      id: `test-${Date.now()}`,
      title: this.getNotificationTitle(type),
      message: testMessages[type],
      type: type,
      data: {test: true}
    });
  }

  // Lấy FCM token
  public async getFCMToken(): Promise<string | null> {
    return await this.notificationManager.getFCMToken();
  }

  // Clear notifications
  public clearAllNotifications(): void {
    this.notificationManager.clearAllNotifications();
  }

  public clearNotification(id: string): void {
    this.notificationManager.clearNotification(id);
  }

  // Set badge number
  public setBadgeNumber(number: number): void {
    this.notificationManager.setBadgeNumber(number);
  }

  // Check permissions
  public checkPermissions(): Promise<any> {
    return new Promise((resolve) => {
      this.notificationManager.checkPermissions(resolve);
    });
  }

  // Stop listening
  public stopListening(): void {
    this.isListening = false;
    // TODO: Cleanup polling, WebSocket connections
  }
}

export default NotificationService;
