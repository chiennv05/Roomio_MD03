import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { API_CONFIG, APP_CONFIG } from '../configs';


// ===== Kiểu dữ liệu =====
type ApiResponse<T = any> = AxiosResponse<T>;

type ApiError = {
  isError: true;
  message: string;
  status?: number;
  data?: any;
};

type ApiResult<T = any> = ApiResponse<T> | ApiError;

// ===== Cấu hình mặc định =====
const commonConfigs: AxiosRequestConfig = {
  baseURL: `${API_CONFIG.BASE_URL}/`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    buildversion: APP_CONFIG.BUILD_VERSION,
    buildnumber: APP_CONFIG.BUILD_NUMBER,
    platform: Platform.OS,
  },
};

const instance: AxiosInstance = axios.create(commonConfigs);

// ===== Request Interceptor: tự động gắn token nếu có =====
instance.interceptors.request.use(
  async config => {
    try {
      const session = await EncryptedStorage.getItem('user_session');
      if (session) {
        const { token, expire } = JSON.parse(session);
        const isExpired = new Date(expire) < new Date();

        if (token && !isExpired) {
          // ✅ Chuẩn Axios 1.9.0
          const headers = config.headers as AxiosHeaders;
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
    } catch (err) {
      console.warn('Không lấy được token:', err);
    }

    return config;
  },
  error => Promise.reject(error),
);
// ===== Response Interceptor: xử lý lỗi chung =====
instance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {

    const { status } = error.response || {};

    switch (status) {
      case 401:
        console.log('🔒 Lỗi xác thực - có thể cần đăng nhập lại');
        break;
      case 403:
        console.log('🚫 Không có quyền truy cập');
        break;
      case 404:
        console.log('🔍 Không tìm thấy tài nguyên');
        break;
      case 500:
        console.log('🔥 Lỗi server nội bộ');
        break;
      default:
        console.log('❗️ Lỗi không xác định');
    }

    return Promise.reject(error);
  },
);

// ===== Hàm xử lý kết quả =====
const responseBody = <T>(response: AxiosResponse<T>): ApiResponse<T> =>
  response;


const responseError = (error: AxiosError): ApiError => ({
  isError: true,
  message: error.message || 'Lỗi không xác định',
  status: error.response?.status,
  data: error.response?.data,
});


// ===== API wrapper =====
export const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.get<T>(url, config).then(responseBody).catch(responseError),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.post<T>(url, data, config).then(responseBody).catch(responseError),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.put<T>(url, data, config).then(responseBody).catch(responseError),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResult<T>> =>
    instance.delete<T>(url, config).then(responseBody).catch(responseError),

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
