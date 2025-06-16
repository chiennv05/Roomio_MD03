import { ApiRoom } from '../types/Room';
import { Room } from '../screens/HomeScreen/types/Room';

export const convertApiRoomToRoom = (apiRoom: ApiRoom): Room => {
  // Convert photos từ relative path sang full URL
  const baseUrl = 'http://125.212.229.71:4000';
  const images = apiRoom.photos.map(photo => `${baseUrl}${photo}`);
  
  // Format price
  const formattedPrice = `${apiRoom.rentPrice.toLocaleString('vi-VN')} đồng`;
  
  // Create detail string
  const detail = `${apiRoom.area}m² | ${apiRoom.location.district} | ${apiRoom.roomNumber}`;
  
  return {
    image: images[0] || 'https://via.placeholder.com/300x200', // First image as main image
    images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'],
    price: formattedPrice,
    title: apiRoom.description || `Phòng ${apiRoom.roomNumber}`,
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