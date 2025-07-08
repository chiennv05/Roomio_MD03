import {ImageUploadResult} from '../../../../types/ImageUploadResult';

export const formatPhotoUrls = (images: ImageUploadResult[]): string[] => {
  return images
    .filter(img => img && img.url) // Đảm bảo img và img.url tồn tại
    .map(img => {
      try {
        // Nếu url đã bắt đầu bằng '/api', trả về nguyên vẹn
        if (img.url.startsWith('/api')) {
          return img.url;
        }
        
        // Xử lý các trường hợp khác
        const path = img.url.includes('/api') 
          ? img.url.split('/api')[1] // lấy phần sau "/api"
          : img.url; // nếu không có '/api', giữ nguyên url
          
        return path.startsWith('/') ? '/api' + path : '/api/' + path;
      } catch (error) {
        console.error('Lỗi xử lý URL ảnh:', img, error);
        return img.url || ''; // Trả về url gốc hoặc chuỗi rỗng nếu không có
      }
    });
};
