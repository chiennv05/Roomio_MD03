import { ApiRoom } from '../types/Room';

// Interface cho UI components
export interface RoomCardData {
  image: string;
  images: string[];
  price: string;
  title: string;
  detail: string;
}

export const convertApiRoomToRoom = (apiRoom: ApiRoom): RoomCardData => {
  // Convert photos từ relative path sang full URL
  const baseUrl = 'http://125.212.229.71:4000';
  const images = apiRoom.photos.map(photo => `${baseUrl}${photo}`);
  
  // Format price với định dạng VN
  const formattedPrice = `${apiRoom.rentPrice.toLocaleString('vi-VN')} VNĐ/tháng`;
  
  // Create detail string với thông tin đầy đủ hơn
  const detail = `${apiRoom.area}m² • ${apiRoom.location.addressText}`;
  
  // Tạo title từ description hoặc room number
  const title = apiRoom.description || `Phòng trọ ${apiRoom.roomNumber}`;
  
  return {
    image: images[0] || 'https://via.placeholder.com/300x200', // First image as main image
    images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'],
    price: formattedPrice,
    title: title,
    detail: detail,
  };
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('vi-VN')} đồng`;
};

export const formatArea = (area: number): string => {
  return `${area}m²`;
};

export const getFullImageUrl = (relativePath: string): string => {
  const baseUrl = 'http://125.212.229.71:4000';
  return `${baseUrl}${relativePath}`;
}; 