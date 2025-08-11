import api from '../../api/api';

export const getFilterOptions = async () => {
  try {
    const response = await api.get('/filters/options');
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
