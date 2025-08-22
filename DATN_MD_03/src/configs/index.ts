// Cấu hình API - Chỉ cần thay đổi BASE_URL ở đây để đổi địa chỉ server
export const API_CONFIG = {
  BASE_URL: 'http://125.212.229.71:4000', // Địa chỉ server API - thay đổi ở đây khi cần
  TIMEOUT: 10000, // Thời gian chờ tối đa cho mỗi request (10 giây)
  API_VERSION: '1.0.0', // Phiên bản API hiện tại
};

// Cấu hình ứng dụng
export const APP_CONFIG = {
  BUILD_VERSION: '1.0.0',
  BUILD_NUMBER: 1,
};

// Hàm tiện ích để tạo URL đầy đủ cho API endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Hàm tiện ích để tạo URL đầy đủ cho hình ảnh
export const getImageUrl = (relativePath: string): string => {
  return `${API_CONFIG.BASE_URL}${relativePath}`;
};
