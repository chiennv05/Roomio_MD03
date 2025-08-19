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
  } catch (err: any) {
    const message =
      err?.response?.data?.message || // ưu tiên message từ server
      err?.message || // fallback axios error
      'Tạo phòng thất bại';
    throw new Error(message);
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
    const response = await api.put(`/landlord/rooms/${roomId}`, room);

    if (!response.data.success) {
      const errorMsg =
        response.data.errors?.[0] ||
        response.data.message ||
        'Cập nhật phòng thất bại';

      // Ném ra để thunk xử lý
      throw new Error(errorMsg);
    }

    return response.data;
  } catch (error: any) {
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
