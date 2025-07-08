import {Platform} from 'react-native';
import api from '../../api/api';

export type ImageFile = {
  path: string; // uri kiểu file://...
  mime: string; // image/jpeg hoặc image/png
  filename?: string; // tên file (nếu không có sẽ tạo tên mặc định)
};

export const uploadRoomPhotos = async (images: ImageFile[]) => {
  const formData = new FormData();

  console.log('Chuẩn bị upload', images.length, 'ảnh:', images);
  
  images.forEach((img, index) => {
    const fileName = img.filename || `photo_${Date.now()}_${index}.jpg`;

    console.log(`Đang xử lý ảnh ${index}:`, {
      path: img.path,
      mime: img.mime,
      fileName: fileName
    });

    formData.append('photos', {
      uri:
        Platform.OS === 'android' ? img.path : img.path.replace('file://', ''),
      type: img.mime,
      name: fileName,
    } as any); // 👈 bắt buộc phải ép kiểu `any` trong React Native
  });

  try {
    console.log('Đang gửi formData lên server:', formData);
    const response = await api.post('/upload/room-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload thất bại:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
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
