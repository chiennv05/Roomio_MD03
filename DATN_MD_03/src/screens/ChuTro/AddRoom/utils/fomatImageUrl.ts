import {ImageUploadResult} from '../../../../types/ImageUploadResult';

export const formatPhotoUrls = (images: ImageUploadResult[]): string[] => {
  return images.map(img => {
    const path = img.url.split('/api')[1]; // lấy phần sau "/api"
    return '/api' + path;
  });
};
