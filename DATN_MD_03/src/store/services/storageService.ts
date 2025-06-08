import EncryptedStorage from 'react-native-encrypted-storage';
import {User} from '../../types';

export const storeUserSession = async (
  token: string,
  user: User,
  credentials?: {username: string; password: string},
) => {
  const expireTime = new Date();
  expireTime.setDate(expireTime.getDate() + 30); // 30 ngày

  const session = {
    token,
    expire: expireTime.toISOString(),
    user,
    credentials, // ⬅️ lưu cả email & password để tự động đăng nhập
  };

  await EncryptedStorage.setItem('user_session', JSON.stringify(session));
};

export const getUserSession = async () => {
  const data = await EncryptedStorage.getItem('user_session');
  if (!data) return null;
  return JSON.parse(data);
};

export const clearUserSession = async () => {
  await EncryptedStorage.removeItem('user_session');
};
