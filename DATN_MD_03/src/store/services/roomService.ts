import api from '../../api/api';
import {RoomFilters, DetailRoomResponse} from '../../types/Room';
import {sortRoomsByScore} from '../../utils/roomUtils';

export const getRooms = async (filters: RoomFilters = {}) => {
  try {
    const params = new URLSearchParams();

    // Add default params
    params.append('maxDistance', (filters.maxDistance || 10000).toString());
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());

    // Add optional filters với logic AND - gửi dưới dạng comma-separated string
    if (filters.amenities && filters.amenities.length > 0) {
      // Thử approach 1: Gửi như array riêng biệt (logic hiện tại)
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
      // Thử approach 2: Gửi như comma-separated string (backup approach)
      params.append('amenitiesAll', filters.amenities.join(','));
    }
    if (filters.furniture && filters.furniture.length > 0) {
      // Thử approach 1: Gửi như array riêng biệt (logic hiện tại)
      filters.furniture.forEach(furniture =>
        params.append('furniture', furniture),
      );
      // Thử approach 2: Gửi như comma-separated string (backup approach)
      params.append('furnitureAll', filters.furniture.join(','));
    }
    if (filters.minPrice)
      params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice)
      params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minArea) params.append('minArea', filters.minArea.toString());
    if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
    if (filters.districts && filters.districts.length > 0) {
      filters.districts.forEach(district =>
        params.append('districts', district),
      );
    }
    if (filters.search && filters.search.trim()) {
      params.append('search', filters.search.trim());
    }

    // Debug logging để kiểm tra
    const finalUrl = `/home/rooms?${params.toString()}`;
    // console.log('🔍 Filter Debug - URL:', finalUrl);
    // console.log('🔍 Filter Debug - Applied filters:', JSON.stringify(filters, null, 2));

    const response = await api.get(finalUrl);

    // Debug response
    // console.log('📦 Response Debug - Applied filters from backend:', response.data?.data?.appliedFilters);

    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

export const getRoomDetail = async (roomId: string, token?: string): Promise<DetailRoomResponse> => {
  try {
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    const response = await api.get(`/home/rooms/${roomId}`, {headers});
    
    // Kiểm tra xem response có phải là error không
    if ('isError' in response && response.isError) {
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// API để lấy related rooms theo thuật toán địa điểm
export const getRelatedRooms = async (
  currentRoomId: string,
  district?: string,
  province?: string,
  limit: number = 6,
) => {
  try {
    const params = new URLSearchParams();

    // Exclude current room
    params.append('exclude', currentRoomId);
    params.append('limit', limit.toString());

    // Priority 1: Same district
    if (district) {
      params.append('preferredDistrict', district);
    }

    // Priority 2: Same province
    if (province) {
      params.append('preferredProvince', province);
    }

    // Add sorting by location relevance
    params.append('sortBy', 'location_relevance');

    const finalUrl = `/home/rooms/related?${params.toString()}`;
    // console.log('🔗 Related Rooms Debug - URL:', finalUrl);
    // console.log('🔗 Related Rooms Debug - Current room:', currentRoomId);
    // console.log('🔗 Related Rooms Debug - District preference:', district);
    // console.log('🔗 Related Rooms Debug - Province preference:', province);

    const response = await api.get(finalUrl);

    // console.log('📦 Related Rooms Response:', response.data?.data?.rooms?.length || 0, 'rooms found');

    return response.data;
  } catch (error: any) {
    console.error('❌ Related Rooms Error:', error.message);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Fallback function để lấy related rooms từ API hiện tại
export const getRelatedRoomsFallback = async (
  currentRoomId: string,
  district?: string,
  province?: string,
  limit: number = 6,
) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', (limit * 3).toString()); // Lấy nhiều hơn để có options filter

    // Thử multiple strategies để lấy related rooms
    let response;
    let relatedRooms: any[] = [];

    // Strategy 1: Lọc theo district nếu có
    if (district) {
      const districtParams = new URLSearchParams();
      districtParams.append('limit', (limit * 2).toString());
      districtParams.append('districts', district);

      try {
        response = await api.get(`/home/rooms?${districtParams.toString()}`);
        if (response.data?.success && response.data?.data?.rooms) {
          relatedRooms = response.data.data.rooms.filter(
            (room: any) => room._id !== currentRoomId,
          );
        }
      } catch (error) {
        console.log('⚠️ District filter failed, trying general search...');
      }
    }

    // Strategy 2: Nếu chưa đủ, lấy thêm từ general API
    if (relatedRooms.length < limit) {
      response = await api.get(`/home/rooms?${params.toString()}`);

      if (response.data?.success && response.data?.data?.rooms) {
        const allRooms = response.data.data.rooms.filter(
          (room: any) => room._id !== currentRoomId,
        );

        // Merge và loại bỏ duplicates
        const existingIds = new Set(relatedRooms.map((room: any) => room._id));
        const additionalRooms = allRooms.filter(
          (room: any) => !existingIds.has(room._id),
        );

        relatedRooms = [...relatedRooms, ...additionalRooms];
      }
    }

    // Strategy 3: Smart sorting - kết hợp location similarity và room score
    if (relatedRooms.length > 0) {
      relatedRooms.sort((a: any, b: any) => {
        const aDistrict = a.location?.district?.toLowerCase() || '';
        const bDistrict = b.location?.district?.toLowerCase() || '';
        const aProvince = a.location?.province?.toLowerCase() || '';
        const bProvince = b.location?.province?.toLowerCase() || '';

        const targetDistrict = district?.toLowerCase() || '';
        const targetProvince = province?.toLowerCase() || '';

        // Tính điểm location match (0-2)
        let aLocationScore = 0;
        let bLocationScore = 0;

        // District match: +2 điểm
        if (aDistrict.includes(targetDistrict) || targetDistrict.includes(aDistrict)) aLocationScore += 2;
        if (bDistrict.includes(targetDistrict) || targetDistrict.includes(bDistrict)) bLocationScore += 2;

        // Province match: +1 điểm
        if (aProvince.includes(targetProvince) || targetProvince.includes(aProvince)) aLocationScore += 1;
        if (bProvince.includes(targetProvince) || targetProvince.includes(bProvince)) bLocationScore += 1;

        // Tính điểm popularity (views + favorites)
        const aPopularityScore = calculateRoomScore(a);
        const bPopularityScore = calculateRoomScore(b);

        // Kết hợp cả 2 điểm số (location có trọng số cao hơn)
        const LOCATION_WEIGHT = 0.7;
        const POPULARITY_WEIGHT = 0.3;

        const aFinalScore = (aLocationScore * LOCATION_WEIGHT) + (aPopularityScore * POPULARITY_WEIGHT);
        const bFinalScore = (bLocationScore * LOCATION_WEIGHT) + (bPopularityScore * POPULARITY_WEIGHT);

        return bFinalScore - aFinalScore;
      });
    }

    // Limit final results
    const finalRooms = relatedRooms.slice(0, limit);

    return {
      success: true,
      data: {
        rooms: finalRooms,
        total: finalRooms.length,
      },
    };
  } catch (error: any) {
    console.error('❌ Fallback Related Rooms Error:', error.message);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Hàm tính điểm popularity cho phòng
const calculateRoomScore = (room: any): number => {
  if (!room?.stats) return 0;
  
  const VIEW_WEIGHT = 1;
  const FAVORITE_WEIGHT = 2;
  
  const viewScore = (room.stats.viewCount || 0) * VIEW_WEIGHT;
  const favoriteScore = (room.stats.favoriteCount || 0) * FAVORITE_WEIGHT;
  
  return viewScore + favoriteScore;
};

// API để toggle favorite phòng trọ
export const toggleRoomFavorite = async (roomId: string, token: string) => {
  try {
    const endpoint = `/home/room/${roomId}/toggle-favorite`;
    
    const response = await api.post(endpoint, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Kiểm tra xem response có phải là error không
    if ('isError' in response && response.isError) {
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// API để lấy danh sách phòng yêu thích
export const getFavoriteRooms = async (token: string) => {
  try {
    const response = await api.get('/home/my-favorites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// API để tìm kiếm phòng theo từ khóa
export const searchRooms = async (
  searchQuery: string,
  filters: RoomFilters = {},
) => {
  try {
    const params = new URLSearchParams();

    // Add search as main parameter
    if (searchQuery && searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    // Add default params
    params.append('maxDistance', (filters.maxDistance || 10000).toString());
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());

    // Add optional filters
    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }
    if (filters.furniture && filters.furniture.length > 0) {
      filters.furniture.forEach(furniture =>
        params.append('furniture', furniture),
      );
    }
    if (filters.minPrice)
      params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice)
      params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minArea) params.append('minArea', filters.minArea.toString());
    if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
    if (filters.districts && filters.districts.length > 0) {
      filters.districts.forEach(district =>
        params.append('districts', district),
      );
    }

    const finalUrl = `/home/rooms?${params.toString()}`;
    console.log('🔍 Search API URL:', finalUrl);

    const response = await api.get(finalUrl);
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// API liên hệ đặt phòng
export const rentRequets = async (
  roomId: string,
  token: string,
  message: string,
) => {
  try {
    const response = await api.post(
      `/home/room/${roomId}/rent-request`,
      {message},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
