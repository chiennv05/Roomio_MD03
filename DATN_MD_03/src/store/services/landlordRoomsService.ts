import api from '../../api/api';
import {Room} from '../../types';

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
export const createLandlordRoomsService = async (room: Room) => {
  console.log('room', room);
  try {
    const response = await api.post('/landlord/rooms', room);
    console.log(response);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Tạo phòng thất bại');
    }

    console.log(response);
    return response.data;
  } catch (error: any) {
    // Nếu muốn log lỗi chi tiết:
    console.error('Lỗi khi tạo phòng:', error.response?.data || error.message);
    throw error;
  }
};
