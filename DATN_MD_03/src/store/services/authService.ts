import {LoginPayload, RegisterPayload} from '../../types';
import api from '../../api/api';

export const register = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const login = async (data: LoginPayload) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const checkProfileAPI = async (token: string) => {
  try {
    const response = await api.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', {email});
    if (response.status === 401) {
      throw new Error(response.data.message);
    }
    if (response.status === 404) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const verifyOTP = async (email: string, code: string) => {
  try {
    const response = await api.post('/auth/verify-reset-code', {email, code});
    if (response.data.success === false) {
      throw new Error(response.data.message);
    }

    console.log(response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (
  email: string,
  resetToken: string,
  newPassword: string,
) => {
  try {
    const response = await api.post('/auth/reset-password', {
      email,
      resetToken,
      newPassword,
    });
    console.log('response', response);
    if (!response?.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
