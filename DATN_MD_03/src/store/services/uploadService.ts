import {Platform} from 'react-native';
import api from '../../api/api';

export type ImageFile = {
  path: string; // uri kiểu file://...
  mime: string; // image/jpeg hoặc image/png
  filename?: string; // tên file (nếu không có sẽ tạo tên mặc định)
};

export const uploadRoomPhotos = async (images: ImageFile[]) => {
  const formData = new FormData();

  images.forEach((img, index) => {
    const fileName = img.filename || `photo_${Date.now()}_${index}.jpg`;

    formData.append('photos', {
      uri:
        Platform.OS === 'android' ? img.path : img.path.replace('file://', ''),
      type: img.mime,
      name: fileName,
    } as any); // 👈 bắt buộc phải ép kiểu `any` trong React Native
  });

  try {
    const response = await api.post('/upload/room-photos', formData);

    console.log('✅ Upload thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload thất bại:', error);
    throw error;
  }
};

export const deleteRoomPhoto = async (fileName: string) => {
  try {
    const response = await api.delete(`/upload/rooms/${fileName}`);

    console.log('✅ Xóa ảnh thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi xóa ảnh:', error);
    throw error;
  }
};
