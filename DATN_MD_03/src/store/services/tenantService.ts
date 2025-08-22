import axios from 'axios';
import { TenantFilters, TenantsApiResponse, TenantDetailResponse } from '../../types/Tenant';
import { API_CONFIG } from '../../configs';

/**
 * Lấy danh sách người thuê của chủ trọ
 * @param token Token xác thực
 * @param filters Các tham số lọc (page, limit, search, status)
 */
export const getTenants = async (
  token: string,
  filters: TenantFilters = { page: 1, limit: 10 }
): Promise<TenantsApiResponse> => {
  try {
    // Xây dựng query string từ filters
    const queryParams = new URLSearchParams();

    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }

    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    if (filters.search && filters.search.trim() !== '') {
      queryParams.append('search', filters.search.trim());
    }

    if (filters.status && filters.status !== '--') {
      queryParams.append('status', filters.status);
    }

    const queryString = queryParams.toString();
    const url = `${API_CONFIG.BASE_URL}/landlord/tenants${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Nếu server trả về lỗi với message
      throw new Error(error.response.data?.message || 'Không thể lấy danh sách người thuê');
    }
    throw new Error('Lỗi kết nối đến máy chủ');
  }
};

/**
 * Lấy chi tiết thông tin của một người thuê
 * @param token Token xác thực
 * @param tenantId ID của người thuê
 */
export const getTenantDetails = async (token: string, tenantId: string): Promise<TenantDetailResponse> => {
  try {
    const url = `${API_CONFIG.BASE_URL}/landlord/tenants/${tenantId}`;

    const response = await axios.get<TenantDetailResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'Không thể lấy thông tin chi tiết người thuê');
    }
    throw new Error('Lỗi kết nối đến máy chủ');
  }
};
