import { ApiRoom } from '../types/Room';
import { getImageUrl } from '../configs'; // Import hàm tạo URL hình ảnh từ config
import { Room } from '../types/Room';

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

// Utility function để validate room theo logic AND
export const validateRoomByFilters = (
  room: Room,
  selectedAmenities: string[],
  selectedFurniture: string[],
  selectedRegions: string[] = [],
  priceRange?: { min: number; max: number },
  areaRange?: { min: number; max: number }
): boolean => {
  // Nếu không có filter nào được chọn, hiển thị tất cả
  if (selectedAmenities.length === 0 && 
      selectedFurniture.length === 0 && 
      selectedRegions.length === 0 && 
      !priceRange && 
      !areaRange) {
    return true;
  }

  // Kiểm tra regions/districts - phải thuộc một trong các khu vực được chọn
  if (selectedRegions.length > 0) {
    const roomDistrict = room.location.district;
    const roomProvince = room.location.province;
    
    // Kiểm tra xem phòng có thuộc khu vực được chọn không
    const isInSelectedRegion = selectedRegions.some(region => {
      // So sánh với district hoặc province của phòng
      return roomDistrict?.toLowerCase().includes(region.toLowerCase()) ||
             roomProvince?.toLowerCase().includes(region.toLowerCase()) ||
             region.toLowerCase().includes(roomDistrict?.toLowerCase() || '') ||
             region.toLowerCase().includes(roomProvince?.toLowerCase() || '');
    });
    
    if (!isInSelectedRegion) {
      return false;
    }
  }

  // Kiểm tra price range
  if (priceRange) {
    if (room.rentPrice < priceRange.min || room.rentPrice > priceRange.max) {
      return false;
    }
  }

  // Kiểm tra area range
  if (areaRange) {
    if (room.area < areaRange.min || room.area > areaRange.max) {
      return false;
    }
  }

  // Kiểm tra amenities - phải có TẤT CẢ amenities được chọn
  if (selectedAmenities.length > 0) {
    const hasAllAmenities = selectedAmenities.every(amenity => 
      room.amenities.includes(amenity)
    );
    if (!hasAllAmenities) {
      return false;
    }
  }

  // Kiểm tra furniture - phải có TẤT CẢ furniture được chọn  
  if (selectedFurniture.length > 0) {
    const hasAllFurniture = selectedFurniture.every(furniture => 
      room.furniture.includes(furniture)
    );
    if (!hasAllFurniture) {
      return false;
    }
  }

  return true;
};

// Debug function để log chi tiết về việc filter
export const debugRoomFilter = (
  room: Room,
  selectedAmenities: string[],
  selectedFurniture: string[],
  selectedRegions: string[] = [],
  priceRange?: { min: number; max: number },
  areaRange?: { min: number; max: number }
) => {
  console.log(`🏠 Room ${room.roomNumber}:`);
  console.log(`   📍 Location: ${room.location.district}, ${room.location.province}`);
  console.log(`   💰 Price: ${room.rentPrice.toLocaleString()}đ`);
  console.log(`   📐 Area: ${room.area}m²`);
  console.log(`   📋 Available amenities: [${room.amenities.join(', ')}]`);
  console.log(`   🛋️ Available furniture: [${room.furniture.join(', ')}]`);
  console.log(`   🔍 Required regions: [${selectedRegions.join(', ')}]`);
  console.log(`   🔍 Required amenities: [${selectedAmenities.join(', ')}]`);
  console.log(`   🔍 Required furniture: [${selectedFurniture.join(', ')}]`);
  if (priceRange) console.log(`   🔍 Price range: ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}đ`);
  if (areaRange) console.log(`   🔍 Area range: ${areaRange.min} - ${areaRange.max}m²`);
  
  const regionMatch = selectedRegions.length === 0 || selectedRegions.some(region => {
    const roomDistrict = room.location.district?.toLowerCase() || '';
    const roomProvince = room.location.province?.toLowerCase() || '';
    const searchRegion = region.toLowerCase();
    return roomDistrict.includes(searchRegion) || 
           roomProvince.includes(searchRegion) ||
           searchRegion.includes(roomDistrict) ||
           searchRegion.includes(roomProvince);
  });
  
  const priceMatch = !priceRange || (room.rentPrice >= priceRange.min && room.rentPrice <= priceRange.max);
  const areaMatch = !areaRange || (room.area >= areaRange.min && room.area <= areaRange.max);
  const amenitiesMatch = selectedAmenities.length === 0 || 
    selectedAmenities.every(amenity => room.amenities.includes(amenity));
  const furnitureMatch = selectedFurniture.length === 0 || 
    selectedFurniture.every(furniture => room.furniture.includes(furniture));
  
  console.log(`   ✅ Region match: ${regionMatch}`);
  console.log(`   ✅ Price match: ${priceMatch}`);
  console.log(`   ✅ Area match: ${areaMatch}`);
  console.log(`   ✅ Amenities match: ${amenitiesMatch}`);
  console.log(`   ✅ Furniture match: ${furnitureMatch}`);
  console.log(`   📊 Should show: ${regionMatch && priceMatch && areaMatch && amenitiesMatch && furnitureMatch}`);
  console.log('   ---');
};

// Format room data for display
export const formatRoomData = (room: Room) => {
  return {
    id: room._id,
    roomNumber: room.roomNumber,
    area: room.area,
    rentPrice: room.rentPrice,
    amenities: room.amenities,
    furniture: room.furniture,
    location: room.location.addressText,
  };
}; 