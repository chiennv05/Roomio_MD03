import { api } from '../../api/api';
import { RoomsApiResponse, RoomFilters } from '../../types/Room';

export const roomService = {
  getRooms: async (filters: RoomFilters = {}): Promise<RoomsApiResponse> => {
    const params = new URLSearchParams();
    
    // Default values
    params.append('maxDistance', (filters.maxDistance || 10000).toString());
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());
    
    // Optional filters
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.minArea) {
      params.append('minArea', filters.minArea.toString());
    }
    if (filters.maxArea) {
      params.append('maxArea', filters.maxArea.toString());
    }
    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach(amenity => {
        params.append('amenities[]', amenity);
      });
    }
    if (filters.furniture && filters.furniture.length > 0) {
      filters.furniture.forEach(furniture => {
        params.append('furniture[]', furniture);
      });
    }
    if (filters.districts && filters.districts.length > 0) {
      filters.districts.forEach(district => {
        params.append('districts[]', district);
      });
    }

    const response = await api.get<RoomsApiResponse>(`home/rooms?${params.toString()}`);
    
    if ('isError' in response) {
      throw new Error(response.message);
    }
    
    return response.data;
  },
}; 