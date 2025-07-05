import api from '../../api/api';

// api get danh sách bài đăng

export const getLandlordRoomsService = async (token: string) => {
  try {
    const response = await api.get('/landlord/rooms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success === false) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
