import {Room} from '../types/Room';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Hàm tính khoảng cách giữa 2 điểm theo công thức Haversine
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Bán kính trái đất tính bằng mét
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
};

// Hàm kiểm tra quyền vị trí
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Yêu cầu quyền truy cập vị trí',
          message: 'Ứng dụng cần truy cập vị trí để hiển thị phòng gần bạn',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// Hàm lấy vị trí hiện tại
export const getCurrentPosition = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

// Hàm tính điểm số phòng dựa trên các yếu tố
export const calculateRoomScore = (room: Room): number => {
  let score = 0;

  // Điểm từ số lượt xem (stats.viewCount)
  const views = room.stats?.viewCount || 0;
  score += Math.min(views * 0.1, 50); // Tối đa 50 điểm từ views

  // Điểm từ số lượt yêu thích (stats.favoriteCount)
  const favorites = room.stats?.favoriteCount || 0;
  score += Math.min(favorites * 0.5, 30); // Tối đa 30 điểm từ favorites

  // Điểm từ số lượt hợp đồng (stats.contractCount)
  const contracts = room.stats?.contractCount || 0;
  score += Math.min(contracts * 0.3, 20); // Tối đa 20 điểm từ contracts

  // Điểm từ ngày tạo (phòng mới hơn có điểm cao hơn)
  if (room.createdAt) {
    const daysSinceCreated = (Date.now() - new Date(room.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 30 - daysSinceCreated * 0.5); // Giảm 0.5 điểm mỗi ngày
    score += Math.min(recencyScore, 30);
  }

  // Điểm từ trạng thái phòng
  if (room.status && room.status === 'available') {
    score += 10;
  }

  // Điểm từ số lượng tiện nghi
  const amenitiesCount = room.amenities?.length || 0;
  score += Math.min(amenitiesCount * 2, 20); // Tối đa 20 điểm từ tiện nghi

  // Điểm từ số lượng nội thất
  const furnitureCount = room.furniture?.length || 0;
  score += Math.min(furnitureCount * 1.5, 15); // Tối đa 15 điểm từ nội thất

  return score;
};

// Thuật toán sắp xếp phòng theo vị trí và độ phổ biến
export const sortRoomsByLocationAndPopularity = (
  rooms: Room[],
  userLocation?: {latitude: number; longitude: number},
  maxDistance: number = 6000, // 6km tính bằng mét
): Room[] => {
  if (!userLocation) {
    // Nếu không có vị trí người dùng, sắp xếp theo điểm số
    return rooms.sort((a, b) => calculateRoomScore(b) - calculateRoomScore(a));
  }

  // Tính khoảng cách cho từng phòng
  const roomsWithDistance = rooms.map(room => {
    const coordinates = room.location?.coordinates?.coordinates;
    let distance = Infinity;

    if (coordinates && coordinates.length === 2) {
      const [longitude, latitude] = coordinates;
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude,
      );
    }

    return {
      ...room,
      distance,
      score: calculateRoomScore(room),
    };
  });

  // Phân loại phòng
  const nearbyRooms = roomsWithDistance.filter(room => room.distance <= maxDistance);
  const distantRooms = roomsWithDistance.filter(room => room.distance > maxDistance);

  // Sắp xếp phòng gần theo khoảng cách (gần nhất lên đầu)
  const sortedNearbyRooms = nearbyRooms.sort((a, b) => {
    // Ưu tiên khoảng cách, sau đó đến điểm số
    const distanceDiff = a.distance - b.distance;
    if (Math.abs(distanceDiff) < 500) { // Nếu khoảng cách chênh lệch < 500m
      return b.score - a.score; // Sắp xếp theo điểm số
    }
    return distanceDiff; // Sắp xếp theo khoảng cách
  });

  // Sắp xếp phòng xa theo điểm số (phổ biến nhất lên đầu)
  const sortedDistantRooms = distantRooms.sort((a, b) => b.score - a.score);

  // Kết hợp: phòng gần trước, phòng xa sau
  return [...sortedNearbyRooms, ...sortedDistantRooms];
};

// Hàm format khoảng cách để hiển thị
export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
};
