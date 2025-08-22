// Diagnostic helper (not used in production)
import {Alert, NativeModules, PermissionsAndroid, Platform} from 'react-native';
const {NotificationModule} = NativeModules as any;

export async function diagnoseNotifications() {
  const results: string[] = [];

  try {
    results.push(`Platform=${Platform.OS} v=${Platform.Version}`);

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
      );
      results.push(`POST_NOTIFICATIONS request=${res}`);
    }

    const enabled = await NotificationModule?.areNotificationsEnabled?.();
    results.push(`areNotificationsEnabled=${enabled}`);

    await NotificationModule?.show?.(
      'diag',
      'Test từ Roomio',
      'Nếu bạn thấy thông báo này, native đang OK',
    );
    results.push('Posted a test notification');
  } catch (e: any) {
    results.push(`Error: ${e?.message || e}`);
  }

  // Only show when explicitly called, not on app start
  Alert.alert('Diag Notifications', results.join('\n'));
}
