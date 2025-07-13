import EncryptedStorage from 'react-native-encrypted-storage';

export const storeUserSession = async (token: string) => {
  const expireTime = new Date();
  expireTime.setDate(expireTime.getDate() + 30); // 30 ngày

  const session = {
    token,
    expire: expireTime.toISOString(),
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
