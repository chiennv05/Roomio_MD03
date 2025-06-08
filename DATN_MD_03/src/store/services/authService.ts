import {RegisterPayload} from '../../types';
import api from '../../api/api';

export const register = async (data: RegisterPayload) => {
  try {
    const response = await api.post('/auth/register', data);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};
