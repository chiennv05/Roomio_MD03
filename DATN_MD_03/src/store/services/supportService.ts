import api from '../../api/api';
import { Support } from '../../types/Support';

export interface SupportRequestsResponse {
  success: boolean;
  message: string;
  data: {
    supportRequests: Support[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    summary: {
      totalRequests: number;
      openRequests: number;
      processingRequests: number;
      completedRequests: number;
    };
  };
}

export const supportService = {
  // Get all support requests with optional filtering
  getSupportRequests: async (params: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const { status, category, page = 1, limit = 10 } = params;
    let url = `/support/my-requests?page=${page}&limit=${limit}`;
    
    if (status) {
      url += `&status=${status}`;
    }
    
    if (category) {
      url += `&category=${category}`;
    }
    
    return api.get<SupportRequestsResponse>(url);
  },

  // Create a new support request
  createSupportRequest: async (supportData: Omit<Support, '_id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating support request with data:', supportData);
    const result = await api.post<{ success: boolean; message: string; data: Support }>('/support/create', supportData);
    console.log('Support request creation result:', result);
    return result;
  },

  // Get a single support request by ID
  getSupportRequestById: async (id: string) => {
    return api.get<{ success: boolean; message: string; data: Support }>(`/support/${id}`);
  },
  
  // Update a support request
  updateSupportRequest: async (id: string, supportData: Partial<Omit<Support, '_id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>>) => {
    return api.put<{ success: boolean; message: string; data: Support }>(`/support/${id}`, supportData);
  },
  
  // Delete a support request by ID
  deleteSupportRequest: async (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/support/${id}`);
  }
};

export default supportService; 