import {NativeModules} from 'react-native';
const {NotificationScheduler} = NativeModules as any;

export function scheduleNative(intervalMinutes = 15) {
  if (NotificationScheduler?.schedule) {
    NotificationScheduler.schedule(intervalMinutes);
  }
}

export function cancelNative() {
  if (NotificationScheduler?.cancel) {
    NotificationScheduler.cancel();
  }
}

