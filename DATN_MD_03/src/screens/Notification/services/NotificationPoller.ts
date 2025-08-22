import AsyncStorage from '@react-native-async-storage/async-storage';
import {getNotifications} from '../../../store/services/notificationService';
import {showNativeLocalNotification} from './NativeNotifier';

let timer: any = null;
const DELIVERED_KEY = 'notification:delivered_ids';

async function getDeliveredSet(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(DELIVERED_KEY);
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

async function setDeliveredSet(s: Set<string>) {
  try {
    const arr = Array.from(s.values());
    await AsyncStorage.setItem(DELIVERED_KEY, JSON.stringify(arr));
  } catch {}
}

export async function pollOnce(token: string) {
  // Tôn trọng tùy chọn người dùng về bật/tắt thông báo
  try {
    const enabled = (await AsyncStorage.getItem('notif:enabled')) === '1';
    if (!enabled) {
      return;
    }
  } catch {}

  const res = await getNotifications(token, 1, 50);
  const list = res?.data?.notifications || [];
  const delivered = await getDeliveredSet();

  // Post status-bar notifications for all UNREAD items not yet delivered
  const toDeliver = list.filter(
    (n: any) =>
      !!n?._id && n?.status === 'unread' && !delivered.has(n._id as string),
  );

  for (const n of toDeliver) {
    const title = mapTypeToTitle(n?.type);
    const content = n?.content || '';
    await showNativeLocalNotification(String(n._id), title, content);
    delivered.add(String(n._id));
  }

  await setDeliveredSet(delivered);
}

export function startPolling(token: string, intervalMs = 60000) {
  if (timer) return;
  // initial
  pollOnce(token).catch(() => {});

  timer = setInterval(() => {
    pollOnce(token).catch(() => {});
  }, intervalMs);
}

export function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function mapTypeToTitle(type?: string): string {
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
}
