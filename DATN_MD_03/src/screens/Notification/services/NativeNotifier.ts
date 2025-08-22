import {NativeModules, Platform, PermissionsAndroid} from 'react-native';
const {NotificationModule} = NativeModules as any;

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
        );
        return res === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch {}
    return true; // dưới Android 13 không cần quyền
  }
  // iOS: tùy hệ thống, giả định đã cấp hoặc module native tự xử lý
  return true;
}

export async function showNativeLocalNotification(
  id: string,
  title: string,
  message: string,
) {
  // Đảm bảo đã yêu cầu quyền trước khi hiển thị trên Android 13+
  await requestNotificationPermission().catch(() => {});
  NotificationModule?.show?.(id, title, message);
}
