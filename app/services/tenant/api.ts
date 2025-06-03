// app/services/tenant/api.ts
import axios, { AxiosResponse } from 'axios';
import { authApi } from '../api/auth';
import { AuthResponse } from '../api/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// 认证状态管理
let isAuthenticated = false;
let currentUser: AuthResponse['user'] | null = null;

// 检查认证状态
const checkAuth = async () => {
  try {
    const response: AxiosResponse<AuthResponse['user']> = await authApi.getCurrentUser();
    const user = response.data;
    if (user.role !== 'tenant') {
      throw new Error('需要租户权限');
    }
    isAuthenticated = true;
    currentUser = user;
    return user;
  } catch (error) {
    isAuthenticated = false;
    currentUser = null;
    throw new Error('请先登录');
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 请求拦截器
api.interceptors.request.use(async (config) => {
  // 每次请求前检查认证状态
  await checkAuth();
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 认证失败，清除认证状态
      isAuthenticated = false;
      currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      window.location.href = '/login';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('网络错误：无法连接到服务器，请确保后端服务已启动');
    } else if (error.response) {
      console.error('服务器错误：', error.response.data);
    } else {
      console.error('请求错误：', error.message);
    }
    return Promise.reject(error);
  }
);

// 导出认证相关方法
export const tenantAuth = {
  checkAuth,
  getCurrentUser: () => currentUser,
  isAuthenticated: () => isAuthenticated,
};

export default api;