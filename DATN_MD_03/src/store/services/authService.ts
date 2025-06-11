import {LoginPayload, RegisterPayload} from '../../types';
import api from '../../api/api';

export const register = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);

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

export const login = async (data: LoginPayload) => {
  try {
    const response = await api.post('/auth/login', data);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
