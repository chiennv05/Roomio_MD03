import {NavigationContainerRef} from '@react-navigation/native';
import {RootStackParamList} from '../../../types/route';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reference to navigation container
let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

// Set navigation reference
export const setNavigationRef = (ref: NavigationContainerRef<RootStackParamList>) => {
  navigationRef = ref;
};

// Handle notification tap and navigate to notification screen
export const handleNotificationTap = async (notificationId?: string) => {
  try {
    console.log('Handling notification tap, ID:', notificationId);
    
    // Wait for navigation to be ready
    if (!navigationRef?.isReady()) {
      console.log('Navigation not ready, waiting...');
      await new Promise(resolve => {
        const checkReady = () => {
          if (navigationRef?.isReady()) {
            resolve(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    // Navigate to notification screen
    if (navigationRef?.isReady()) {
      console.log('Navigating to Notification screen');
      
      // Reset to UITab first if not already there
      const currentRoute = navigationRef.getCurrentRoute();
      console.log('Current route:', currentRoute?.name);
      
      if (currentRoute?.name !== 'UITab') {
        navigationRef.reset({
          index: 0,
          routes: [{name: 'UITab'}],
        });
        
        // Wait a bit for tab navigation to settle
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Navigate to notification screen
      navigationRef.navigate('Notification', {
        notificationId: notificationId || undefined,
        fromPush: true,
      });
      
      // Mark that we handled a notification tap
      await AsyncStorage.setItem('notification:lastTap', Date.now().toString());
      
      console.log('Successfully navigated to Notification screen');
    } else {
      console.error('Navigation ref not ready');
    }
  } catch (error) {
    console.error('Error handling notification tap:', error);
  }
};

// Check if app was opened from notification
export const checkNotificationLaunch = async () => {
  try {
    const lastTap = await AsyncStorage.getItem('notification:lastTap');
    const now = Date.now();
    
    // If last tap was within 5 seconds, consider it a recent notification tap
    if (lastTap && (now - parseInt(lastTap)) < 5000) {
      console.log('App likely opened from notification');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking notification launch:', error);
    return false;
  }
};

// Handle app state change from background to foreground
export const handleAppStateChange = async (nextAppState: string) => {
  if (nextAppState === 'active') {
    // Check if app was opened from notification
    const fromNotification = await checkNotificationLaunch();
    
    if (fromNotification) {
      console.log('App activated from notification, navigating...');
      // Small delay to ensure app is fully loaded
      setTimeout(() => {
        handleNotificationTap();
      }, 1000);
    }
  }
};

// Initialize notification handling
export const initNotificationHandler = () => {
  console.log('Notification handler initialized');
  
  // Listen for app state changes
  const {AppState} = require('react-native');
  AppState.addEventListener('change', handleAppStateChange);
  
  return () => {
    AppState.removeEventListener('change', handleAppStateChange);
  };
};
