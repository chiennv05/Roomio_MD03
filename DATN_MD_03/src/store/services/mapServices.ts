import axios from 'axios';

export const searchLocation = async (query: string) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5,
        countrycodes: 'vn',
      },
      headers: {
        'User-Agent': 'RoomioApp (roomioapp8@gmail.com)',
      },
    });
    console.log(res);

    return res.data;
  } catch (err) {
    console.error('Nominatim error:', err);
    return [];
  }
};

export async function geocodeFromText(text: string) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: text,
        format: 'json',
      },
      headers: {
        'Accept-Language': 'vi', // có thể thêm để ưu tiên tiếng Việt
      },
    });

    const data = res.data;

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Lỗi geocode:', error);
    return null;
  }
}

export const reverseGeocoding = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'ReactNativeApp/1.0',
        },
      },
    );

    const data = await response.json();
    console.log(data);
    return data.display_name || 'Không rõ địa chỉ';
  } catch (error) {
    console.error('Lỗi reverse geocoding:', error);
    return 'Không lấy được địa chỉ';
  }
};

// Hàm tính khoảng cách giữa hai điểm
export const calculateDistance = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<string> => {
  try {
    // Sử dụng Haversine formula để tính khoảng cách
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = toRad(destLat - originLat);
    const dLon = toRad(destLng - originLng);
    const lat1 = toRad(originLat);
    const lat2 = toRad(destLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Chuyển đổi khoảng cách thành định dạng phù hợp
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  } catch (error) {
    console.error('Lỗi khi tính khoảng cách:', error);
    throw error;
  }
};

// Hàm hỗ trợ chuyển đổi độ sang radian
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};
