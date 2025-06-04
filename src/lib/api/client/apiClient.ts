import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants';
import { setupRequestInterceptors, setupResponseInterceptors } from './interceptors';
import { ApiClient, ApiRequestConfig } from './types';

/**
 * 创建API客户端实例
 * @param baseURL API基础URL
 * @param timeout 请求超时时间（毫秒）
 * @returns API客户端实例
 */
export const createApiClient = (
  baseURL: string = API_BASE_URL,
  timeout: number = API_TIMEOUT
): ApiClient => {
  // 创建Axios实例
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  // 设置拦截器
  setupRequestInterceptors(axiosInstance);
  setupResponseInterceptors(axiosInstance);
  
  // 创建API客户端
  const apiClient: ApiClient = {
    instance: axiosInstance,
    
    get: <T = any>(url: string, config?: ApiRequestConfig) => {
      return axiosInstance.get<any, T>(url, config);
    },
    
    post: <T = any, D = any>(url: string, data?: D, config?: ApiRequestConfig) => {
      return axiosInstance.post<any, T>(url, data, config);
    },
    
    put: <T = any, D = any>(url: string, data?: D, config?: ApiRequestConfig) => {
      return axiosInstance.put<any, T>(url, data, config);
    },
    
    patch: <T = any, D = any>(url: string, data?: D, config?: ApiRequestConfig) => {
      return axiosInstance.patch<any, T>(url, data, config);
    },
    
    delete: <T = any>(url: string, config?: ApiRequestConfig) => {
      return axiosInstance.delete<any, T>(url, config);
    },
  };
  
  return apiClient;
};

/**
 * 默认API客户端实例
 */
export const apiClient = createApiClient(); 