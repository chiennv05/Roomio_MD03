import api from '../../api/api';
import {Room} from '../../types';

// api get danh sách bài đăng

export const getLandlordRoomsService = async ({
  status = '',
  approvalStatus = '',
  page = 1,
  limit = 10,
  roomName = '',
}: {
  status?: string;
  approvalStatus?: string;
  page?: number;
  limit?: number;
  roomName?: string;
}) => {
  try {
    const response = await api.get('/landlord/rooms', {
      params: {
        status,
        approvalStatus,
        page,
        limit,
        roomName,
      },
    });
    console.log(response);
    if (response.data.success === false) {
      throw new Error(response.data.message);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLandlordRoomsService = async (room: Room) => {
  try {
    const response = await api.post('/landlord/rooms', room);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Tạo phòng thất bại');
    }
    return response.data;
  } catch (error: any) {
    // Nếu muốn log lỗi chi tiết:
    throw error;
  }
};

/**
 * Lấy chi tiết một phòng trọ theo ID
 */
export const getLandlordRoomDetailService = async (roomId: string) => {
  try {
    const response = await api.get(`/landlord/rooms/${roomId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể lấy chi tiết phòng');
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Cập nhật thông tin phòng trọ
 */
export const updateLandlordRoomService = async (roomId: string, room: Room) => {
  try {
    console.log('Updating room with data:', room);

    const response = await api.put(`/landlord/rooms/${roomId}`, room);
    console.log('Update service response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Cập nhật phòng thất bại');
    }

    // Trả về toàn bộ response.data để thunk có thể xử lý
    return response.data;
  } catch (error: any) {
    console.error(
      'Lỗi khi cập nhật phòng:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Xóa phòng trọ
 */
export const deleteLandlordRoomService = async (roomId: string) => {
  try {
    const response = await api.delete(`/landlord/rooms/${roomId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Xóa phòng thất bại');
    }

    return response.data;
  } catch (error: any) {
    console.error('Lỗi khi xoá phòng:', error.response?.data || error.message);
    throw error;
  }
};
