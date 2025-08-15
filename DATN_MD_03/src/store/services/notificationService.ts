import api from '../../api/api';
import {
  NotificationResponse,
  NotificationStatus,
  NotificationType,
} from '../../types/Notification';

export const getNotifications = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  options?: {status?: NotificationStatus; type?: NotificationType},
): Promise<NotificationResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await api.get(`/notification?${params.toString()}`, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
  token: string,
): Promise<any> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await api.patch(
      `/notification/${notificationId}/read`,
      {},
      {headers},
    );
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const markAllNotificationsAsRead = async (
  token: string,
): Promise<any> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await api.patch('/notification/read-all', {}, {headers});
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const deleteNotification = async (
  notificationId: string,
  token: string,
): Promise<any> => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await api.delete(`/notification/${notificationId}`, {
      headers,
    });
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
