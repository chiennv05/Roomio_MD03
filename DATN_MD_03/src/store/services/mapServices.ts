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
    return data.display_name || 'Không rõ địa chỉ';
  } catch (error) {
    console.error('Lỗi reverse geocoding:', error);
    return 'Không lấy được địa chỉ';
  }
};
