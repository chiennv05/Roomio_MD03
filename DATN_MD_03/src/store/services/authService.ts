import {LoginPayload, LoginResponse, RegisterPayload} from '../../types';
import api from '../../api/api';

export const register = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);

    return response.data;
  } catch (error) {
    console.log(error);
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
