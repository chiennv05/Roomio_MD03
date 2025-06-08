import {LoginPayload, LoginResponse, RegisterPayload} from '../../types';
import api from '../../api/api';

export const register = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);
    console.log('bên api', response);
    if (!response.data.success && response.status === 409) {
      throw new Error('');
    }
    return response.data;
  } catch (error: any) {
    throw {
      isError: true,
      message: error.message, // như: "Request failed with status code 409"
      status: error.response?.status,
      data: error.response?.data, // chứa message thật sự từ backend
    };
  }
};

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: LoginResponse;
  }>('/auth/login', data);
  return response.data.data;
};
