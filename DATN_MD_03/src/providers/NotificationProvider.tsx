import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useSelector} from 'react-redux';
import NotificationService from '../services/NotificationService';
import {RootState} from '../store';
import {NotificationType} from '../types/Notification';

interface NotificationContextType {
  isInitialized: boolean;
  hasPermissions: boolean;
  fcmToken: string | null;
  testNotification: (type?: NotificationType) => Promise<void>;
  clearAllNotifications: () => void;
  setBadgeNumber: (number: number) => void;
  checkPermissions: () => Promise<any>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({children}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  
  const {user, token} = useSelector((state: RootState) => state.auth);
  const {unreadCount} = useSelector((state: RootState) => state.notification);
  
  const notificationService = NotificationService.getInstance();

  // Khởi tạo notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔄 Initializing notifications...');
        
        await notificationService.initialize();
        
        // Check permissions
        const permissions = await notificationService.checkPermissions();
        setHasPermissions(permissions.alert && permissions.sound);
        
        // Get FCM token
        const token = await notificationService.getFCMToken();
        setFcmToken(token);
        
        setIsInitialized(true);
        console.log('✅ Notifications initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
        setIsInitialized(false);
      }
    };

    initializeNotifications();
  }, []);

  // Update badge number khi unreadCount thay đổi
  useEffect(() => {
    if (isInitialized && hasPermissions) {
      notificationService.setBadgeNumber(unreadCount);
    }
  }, [unreadCount, isInitialized, hasPermissions]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', nextAppState);
      
      if (nextAppState === 'active') {
        // App came to foreground - refresh notifications
        console.log('🔄 App active - refreshing notifications');
      } else if (nextAppState === 'background') {
        // App went to background
        console.log('📱 App backgrounded');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Test notification function
  const testNotification = async (type: NotificationType = 'heThong') => {
    if (!isInitialized) {
      console.warn('⚠️ Notification service not initialized');
      return;
    }
    
    await notificationService.testNotification(type);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    if (isInitialized) {
      notificationService.clearAllNotifications();
    }
  };

  // Set badge number
  const setBadgeNumber = (number: number) => {
    if (isInitialized) {
      notificationService.setBadgeNumber(number);
    }
  };

  // Check permissions
  const checkPermissions = async () => {
    if (isInitialized) {
      return await notificationService.checkPermissions();
    }
    return null;
  };

  const contextValue: NotificationContextType = {
    isInitialized,
    hasPermissions,
    fcmToken,
    testNotification,
    clearAllNotifications,
    setBadgeNumber,
    checkPermissions,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook để sử dụng NotificationContext
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
