import {NativeModules, Platform, PermissionsAndroid} from 'react-native';
const {NotificationModule} = NativeModules as any;

export async function showNativeLocalNotification(id: string, title: string, message: string) {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
        );
      }
    } catch {}
  }
  NotificationModule?.show?.(id, title, message);
}

