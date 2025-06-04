import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse, ApiRequestConfig } from './types';
import { handleApiError } from './errorHandler';

/**
 * 设置请求拦截器
 * @param axiosInstance Axios实例
 */
export const setupRequestInterceptors = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 获取存储的令牌
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;
      
      // 如果有令牌且不是跳过认证的请求，则添加认证头
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 添加通用头
      config.headers['Accept'] = 'application/json';
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
      
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
};

/**
 * 设置响应拦截器
 * @param axiosInstance Axios实例
 */
export const setupResponseInterceptors = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 处理成功响应
      // 如果响应包含data属性且不是原始数据类型，则直接返回data
      if (
        response.data !== null &&
        typeof response.data === 'object' &&
        !Array.isArray(response.data) &&
        'data' in response.data
      ) {
        return response.data;
      }
      
      return response.data;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as ApiRequestConfig;
      
      // 如果请求配置了跳过错误处理，则直接拒绝
      if (originalRequest?.skipErrorHandler) {
        return Promise.reject(error);
      }
      
      // 处理401错误（令牌过期）
      if (
        error.response?.status === 401 &&
        !originalRequest?.skipAuthRefresh &&
        !originalRequest?.url?.includes('auth/refresh') &&
        !originalRequest?.url?.includes('auth/login')
      ) {
        // 尝试刷新令牌
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          try {
            // 创建一个新的axios实例来避免循环
            const refreshResponse = await axiosInstance.post(
              '/auth/refresh',
              { refresh_token: refreshToken },
              { skipAuthRefresh: true }
            );
            
            // 更新存储的令牌
            if (refreshResponse.access_token) {
              localStorage.setItem('access_token', refreshResponse.access_token);
              
              if (refreshResponse.refresh_token) {
                localStorage.setItem('refresh_token', refreshResponse.refresh_token);
              }
              
              // 更新原始请求的认证头并重试
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.access_token}`;
              
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // 刷新令牌失败，清除令牌并重定向到登录页面
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            // 重定向到登录页面
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
        }
      }
      
      // 使用错误处理器处理其他错误
      return handleApiError(error);
    }
  );
};

/**
 * 为Axios实例设置所有拦截器
 * @param client Axios实例
 */
export function setupInterceptors(client: AxiosInstance): void {
  setupRequestInterceptors(client);
  setupResponseInterceptors(client);
} 