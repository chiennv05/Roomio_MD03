import {HeadlessJsTaskEvent} from 'react-native';
import {getUserSession} from '../../../store/services/storageService';
import {pollOnce} from './NotificationPoller';

export const headlessTask = async (_event: HeadlessJsTaskEvent) => {
  try {
    const sess = await getUserSession();
    const token: string | null = sess?.token || null;
    if (token) {
      await pollOnce(token);
    }
  } catch (e) {}
};
