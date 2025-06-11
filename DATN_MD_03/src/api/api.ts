import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {Platform} from 'react-native';

// Kiểu cho response trả về sau khi gọi API thành công
type ApiResponse<T = any> = AxiosResponse<T>;

// Kiểu cho response khi có lỗi
type ApiError = {
  isError: true;
  message: string;
  status?: number;
  data?: any;
};

// Union type cho kết quả trả về từ API (thành công hoặc lỗi)
type ApiResult<T = any> = ApiResponse<T> | ApiError;

const commonConfigs: AxiosRequestConfig = {
  baseURL: 'http://125.212.229.71:4000/',
  timeout: 10000,
  headers: {
    buildversion: '1.0.0',
    buildnumber: 1,
    platform: Platform.OS,
  },
};

const instance: AxiosInstance = axios.create(commonConfigs);

// Request interceptor
instance.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
instance.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const {status} = error.response || {};

    switch (status) {
      case 401:
        console.log('Unauthorized');
        break;
      case 403:
        console.log('Forbidden');
        break;
      case 404:
        console.log('Not Found');
        break;
      case 500:
        console.log('Internal Server Error');
        break;
      default:
        console.log('Unknown Error');
    }

    return Promise.reject(error);
  },
);

// Hàm xử lý khi gọi thành công
const responseBody = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  return response;
};

// Hàm xử lý khi gọi thất bại
const responseError = (error: AxiosError): ApiError => {
  return {
    isError: true,
    message: error.message || 'Unknown Error',
    status: error.response?.status,
    data: error.response?.data,
  };
};

// Export các phương thức API
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
