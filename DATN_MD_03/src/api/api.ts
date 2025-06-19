import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {Platform} from 'react-native';
import { API_CONFIG, APP_CONFIG } from '../configs'; // Import cấu hình từ file config tập trung

// Định nghĩa kiểu dữ liệu cho response khi API thành công
type ApiResponse<T = any> = AxiosResponse<T>;

// Định nghĩa kiểu dữ liệu cho response khi API có lỗi
type ApiError = {
  isError: true;
  message: string; // Thông báo lỗi
  status?: number; // Mã lỗi HTTP (404, 500, ...)
  data?: any; // Dữ liệu lỗi từ server
};

// Kiểu dữ liệu chung cho kết quả API (có thể thành công hoặc lỗi)
type ApiResult<T = any> = ApiResponse<T> | ApiError;

// Cấu hình chung cho tất cả request API
const commonConfigs: AxiosRequestConfig = {
  baseURL: `${API_CONFIG.BASE_URL}/`, // Sử dụng base URL từ config
  timeout: API_CONFIG.TIMEOUT, // Thời gian chờ từ config
  headers: {
    buildversion: APP_CONFIG.BUILD_VERSION, // Phiên bản app
    buildnumber: APP_CONFIG.BUILD_NUMBER, // Số build
    platform: Platform.OS, // Hệ điều hành (iOS/Android)
  },
};

// Tạo instance axios với cấu hình chung
const instance: AxiosInstance = axios.create(commonConfigs);

// Interceptor cho request - xử lý trước khi gửi request
instance.interceptors.request.use(
  config => {
    // Có thể thêm token, log request ở đây
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor cho response - xử lý response trả về
instance.interceptors.response.use(
  response => response, // Trả về response nếu thành công
  (error: AxiosError) => {
    // Xử lý các lỗi HTTP khác nhau
    const {status} = error.response || {};

    switch (status) {
      case 401:
        console.log('Lỗi xác thực - Cần đăng nhập lại');
        break;
      case 403:
        console.log('Không có quyền truy cập');
        break;
      case 404:
        console.log('Không tìm thấy dữ liệu');
        break;
      case 500:
        console.log('Lỗi server nội bộ');
        break;
      default:
        console.log('Lỗi không xác định');
    }

    return Promise.reject(error);
  },
);

// Hàm xử lý response khi API call thành công
const responseBody = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  return response;
};

// Hàm xử lý response khi API call thất bại
const responseError = (error: AxiosError): ApiError => {
  return {
    isError: true,
    message: error.message || 'Lỗi không xác định',
    status: error.response?.status,
    data: error.response?.data,
  };
};

// Export object chứa tất cả phương thức HTTP để gọi API
export const api = {
  // Phương thức GET - lấy dữ liệu
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.get<T>(url, config).then(responseBody).catch(responseError),

  // Phương thức POST - tạo mới dữ liệu
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.post<T>(url, data, config).then(responseBody).catch(responseError),

  // Phương thức PUT - cập nhật toàn bộ dữ liệu
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.put<T>(url, data, config).then(responseBody).catch(responseError),

  // Phương thức DELETE - xóa dữ liệu
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.delete<T>(url, config).then(responseBody).catch(responseError),

  // Phương thức PATCH - cập nhật một phần dữ liệu
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance
      .patch<T>(url, data, config)
      .then(responseBody)
      .catch(responseError),
};

export default api;
