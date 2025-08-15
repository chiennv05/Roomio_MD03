import api from '../../api/api';
import {PlansResponse, SubscriptionsResponse} from '../../types';

export const fetchSubscriptions = async (
  token: string,
): Promise<SubscriptionsResponse> => {
  try {
    const response = await api.get('/subscription/subscriptions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as any;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const fetchPlans = async (): Promise<PlansResponse> => {
  try {
    const response = await api.get('/subscription/plans');
    return response.data as any;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const requestUpgradeQuote = async (
  token: string,
  plan: string,
): Promise<any> => {
  try {
    const response = await api.post(
      '/subscription/upgrade/quote',
      {plan},
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );
    return response.data as any;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Tạo yêu cầu nâng cấp gói (trả về QR để thanh toán)
export const createUpgradeRequest = async (
  token: string,
  plan: string,
): Promise<any> => {
  try {
    const response = await api.post(
      '/subscription/subscriptions',
      {plan},
      {
        headers: {Authorization: `Bearer ${token}`},
      },
    );
    return response.data as any;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};


