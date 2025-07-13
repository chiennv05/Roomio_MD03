import api from '../../api/api';
import {CreateContractPayload, UpdateContractPayload} from '../../types';

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

    const url = `/contract/my-contracts${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
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
    // Gọi đúng endpoint API
    const response = await api.get(`/contract/${contractId}`);

    // Trả về response đúng như API
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
    console.log(`Gọi API tạo PDF cho hợp đồng: ${contractId}`);
    const response = await api.post(`/contract/${contractId}/generate-pdf`);

    // Kiểm tra cấu trúc dữ liệu trả về
    if (!response.data || !response.data.success) {
      throw new Error('API không trả về dữ liệu hợp lệ');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Error generating PDF for contract ${contractId}:`, error);

    // Log thêm chi tiết lỗi để debug
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }

    throw {
      message:
        error.response?.data?.message ||
        error.message ||
        'Không thể tạo file PDF',
      status: error.response?.status,
    };
  }
};

// Upload ảnh hợp đồng đã ký
// Upload signed contract image
export const uploadSignedContractImage = async (
  contractId: string,
  formData: FormData,
) => {
  try {
    console.log('Uploading signed contract image for contract:', formData);

    const response = await api.post(
      `/contract/${contractId}/upload-signed`, // Sửa endpoint theo Postman
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      },
    );

    console.log('Upload response:', response.data);

    if (!response.data) {
      throw new Error('API không trả về dữ liệu');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Upload thất bại');
    }

    return response.data;
  } catch (error: any) {
    console.error(
      'Error uploading signed image for contract',
      contractId,
      ':',
      error,
    );
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(error.response.data?.message || 'Lỗi từ server');
    } else if (error.request) {
      throw new Error('Lỗi kết nối mạng');
    } else {
      throw new Error(error.message || 'Lỗi không xác định');
    }
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
  data: UpdateContractPayload,
) => {
  console.log(`Updating contract with ID: ${contractId}`, data);
  try {
    const response = await api.patch(`/contract/${contractId}/update`, data);
    console.log(`Update response for contract ${contractId}:`, response);
    
    // Kiểm tra response có đúng cấu trúc
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Cập nhật hợp đồng không thành công');
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`Error updating contract ${contractId}:`, error);
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
