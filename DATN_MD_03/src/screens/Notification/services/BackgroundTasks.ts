import BackgroundFetch from 'react-native-background-fetch';
import {pollOnce} from './NotificationPoller';
import {getUserSession} from '../../../store/services/storageService';
import {
  configurePushNotification,
  initNotificationChannels,
} from './LocalNotifier';
import {Platform} from 'react-native';

export async function configureBackgroundFetch() {
  // Ensure notification system is initialized (channels on Android)
  try {
    configurePushNotification();
    initNotificationChannels();
  } catch {}

  // Configure background-fetch.
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // minutes (Android clamps to >= 15)
      stopOnTerminate: false, // continue after app terminate
      startOnBoot: true, // auto start on device boot
      enableHeadless: true,
      forceAlarmManager: false,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId: string) => {
      try {
        const sess = await getUserSession();
        const token: string | null = sess?.token || null;
        if (token) {
          await pollOnce(token);
        }
      } finally {
        BackgroundFetch.finish(taskId);
      }
    },
    (error: any) => {
      // config error
    },
  );
}

export async function startBackgroundFetch() {
  await BackgroundFetch.start();
}

export async function stopBackgroundFetch() {
  await BackgroundFetch.stop();
}

// Headless-task for Android when app is terminated
export const BackgroundFetchHeadlessTask = async (event: any) => {
  try {
    const taskId = event.taskId;
    const isTimeout = event.timeout;

    // Initialize notification system for headless mode as well
    try {
      configurePushNotification();
      initNotificationChannels();
    } catch {}

    if (isTimeout) {
      BackgroundFetch.finish(taskId);
      return;
    }
    const sess = await getUserSession();
    const token: string | null = sess?.token || null;
    if (token) {
      await pollOnce(token);
    }
    BackgroundFetch.finish(taskId);
  } catch (e) {}
};
