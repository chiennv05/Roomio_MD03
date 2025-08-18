import {DeviceEventEmitter, AppState, AppStateStatus} from 'react-native';
import {handleNotificationTap, setNavigationRef} from './NotificationNavigationHandler';
import {NavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../../../types/route';

class NotificationEventListener {
  private static instance: NotificationEventListener;
  private listeners: Array<() => void> = [];
  private isInitialized = false;

  static getInstance(): NotificationEventListener {
    if (!NotificationEventListener.instance) {
      NotificationEventListener.instance = new NotificationEventListener();
    }
    return NotificationEventListener.instance;
  }

  // Initialize the event listener
  initialize(navigationRef: NavigationContainerRef<RootStackParamList>) {
    if (this.isInitialized) {
      console.log('NotificationEventListener already initialized');
      return;
    }

    console.log('Initializing NotificationEventListener');
    
    // Set navigation reference
    setNavigationRef(navigationRef);

    // Listen for notification tap events from native
    const notificationTapListener = DeviceEventEmitter.addListener(
      'notificationTapped',
      this.handleNotificationTapped.bind(this)
    );

    // Listen for app state changes
    const appStateListener = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );

    // Store listeners for cleanup
    this.listeners.push(
      () => notificationTapListener.remove(),
      () => appStateListener?.remove()
    );

    this.isInitialized = true;
    console.log('NotificationEventListener initialized successfully');
  }

  // Handle notification tap event
  private handleNotificationTapped = (data?: any) => {
    console.log('Notification tapped event received:', data);
    
    // Navigate to notification screen
    setTimeout(() => {
      handleNotificationTap(data?.notificationId);
    }, 500); // Small delay to ensure app is ready
  };

  // Handle app state changes
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('App state changed to:', nextAppState);
    
    if (nextAppState === 'active') {
      // App became active, check if it was from notification
      setTimeout(() => {
        this.checkForPendingNotification();
      }, 1000);
    }
  };

  // Check for pending notification navigation
  private checkForPendingNotification = async () => {
    try {
      // You can implement additional logic here to check
      // if there's a pending notification to handle
      console.log('Checking for pending notifications...');
    } catch (error) {
      console.error('Error checking pending notifications:', error);
    }
  };

  // Manually trigger notification navigation (for testing)
  triggerNotificationNavigation = (notificationId?: string) => {
    console.log('Manually triggering notification navigation');
    this.handleNotificationTapped({notificationId});
  };

  // Cleanup listeners
  cleanup() {
    console.log('Cleaning up NotificationEventListener');
    this.listeners.forEach(removeListener => removeListener());
    this.listeners = [];
    this.isInitialized = false;
  }

  // Check if initialized
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export default NotificationEventListener.getInstance();
