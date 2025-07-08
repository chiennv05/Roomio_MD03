import api from '../../api/api';
import {CreateContractPayload} from '../../types';

// Tạo hợp đồng từ thông báo
export const createContractFromNotification = async (
  data: CreateContractPayload,
) => {
  try {
    const response = await api.post('/contract/create-from-notification', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating contract from notification:', error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Lấy danh sách hợp đồng của người dùng
export const getMyContracts = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Thêm tham số phân trang nếu có
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const url = `/contract/my-contracts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user contracts:', error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Lấy chi tiết hợp đồng
export const getContractDetail = async (contractId: string) => {
  try {
    const response = await api.get(`/contract/${contractId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Tạo file PDF hợp đồng
export const generateContractPDF = async (contractId: string) => {
  try {
    const response = await api.post(`/contract/${contractId}/generate-pdf`);
    return response.data;
  } catch (error: any) {
    console.error(`Error generating PDF for contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Upload ảnh hợp đồng đã ký
export const uploadSignedContractImage = async (
  contractId: string,
  formData: FormData,
) => {
  try {
    const response = await api.post(
      `/contract/${contractId}/upload-signed`,
      formData,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      `Error uploading signed image for contract ${contractId}:`,
      error,
    );
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Admin phê duyệt hợp đồng
export const approveContract = async (contractId: string) => {
  try {
    const response = await api.put(`/contract/${contractId}/approve`);
    return response.data;
  } catch (error: any) {
    console.error(`Error approving contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Danh sách hợp đồng chờ phê duyệt
export const getPendingApprovalContracts = async () => {
  try {
    const response = await api.get('/contract/admin/pending-approval');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pending approval contracts:', error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Xem file PDF hợp đồng
export const viewPDFContract = async (contractId: string) => {
  try {
    const response = await api.get(`/contract/pdf/${contractId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error viewing PDF for contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Cập nhật thông tin hợp đồng
export const updateContract = async (
  contractId: string,
  data: CreateContractPayload,
) => {
  try {
    const response = await api.patch(`/contract/${contractId}/update`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Upload ảnh hợp đồng (khác ảnh đã ký)
export const uploadContractImages = async (
  contractId: string,
  formData: FormData,
) => {
  try {
    const response = await api.post(
      `/contract/${contractId}/upload-images`,
      formData,
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error uploading images for contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
// Xoá hợp đồng
export const deleteContract = async (contractId: string) => {
  try {
    const response = await api.delete(`/contract/${contractId}/delete`);
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Chấm dứt hợp đồng
export const terminateContract = async (contractId: string) => {
  try {
    const response = await api.patch(`/contract/${contractId}/terminate`);
    return response.data;
  } catch (error: any) {
    console.error(`Error terminating contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Gia hạn hợp đồng
export const extendContract = async (contractId: string, months: number) => {
  try {
    const response = await api.patch(`/contract/${contractId}/extend`, {
      months,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error extending contract ${contractId}:`, error);
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};

// Cập nhật danh sách người ở cùng
export const updateCoTenants = async (contractId: string) => {
  try {
    const response = await api.put(`/contract/${contractId}/co-tenants`);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error updating co-tenants for contract ${contractId}:`,
      error,
    );
    throw {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
};
