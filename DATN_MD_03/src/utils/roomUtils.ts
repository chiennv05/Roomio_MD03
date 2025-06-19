import { ApiRoom } from '../types/Room';
import { getImageUrl } from '../configs'; // Import hàm tạo URL hình ảnh từ config

// Interface định nghĩa cấu trúc dữ liệu cho component RoomCard
export interface RoomCardData {
  image: string; // Hình ảnh chính
  images: string[]; // Danh sách tất cả hình ảnh
  price: string; // Giá phòng đã format
  title: string; // Tiêu đề phòng
  detail: string; // Thông tin chi tiết (diện tích, địa chỉ)
}

// Hàm chuyển đổi dữ liệu từ API sang format phù hợp cho UI
export const convertApiRoomToRoom = (apiRoom: ApiRoom): RoomCardData => {
  // Chuyển đổi đường dẫn tương đối thành URL đầy đủ cho hình ảnh
  const images = apiRoom.photos.map(photo => getImageUrl(photo));
  
  // Format giá tiền theo định dạng Việt Nam (có dấu phẩy ngăn cách)
  const formattedPrice = `${apiRoom.rentPrice.toLocaleString('vi-VN')} VNĐ/tháng`;
  
  // Tạo chuỗi thông tin chi tiết gồm diện tích và địa chỉ
  const detail = `${apiRoom.area}m² • ${apiRoom.location.addressText}`;
  
  // Tạo tiêu đề từ mô tả hoặc số phòng nếu không có mô tả
  const title = apiRoom.description || `Phòng trọ ${apiRoom.roomNumber}`;
  
  return {
    image: images[0] || 'https://via.placeholder.com/300x200', // Hình đầu tiên làm hình chính
    images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'], // Danh sách hình hoặc hình mặc định
    price: formattedPrice,
    title: title,
    detail: detail,
  };
};

// Hàm format giá tiền theo định dạng Việt Nam
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('vi-VN')} đồng`;
};

// Hàm format diện tích với đơn vị m²
export const formatArea = (area: number): string => {
  return `${area}m²`;
};

// Hàm tạo URL đầy đủ cho hình ảnh từ đường dẫn tương đối
export const getFullImageUrl = (relativePath: string): string => {
  return getImageUrl(relativePath);
}; 