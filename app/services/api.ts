// app/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许跨域请求携带凭证
});

// 请求拦截器添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // 使用类型断言
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('网络错误：无法连接到服务器，请确保后端服务已启动');
    } else if (error.response) {
      // 服务器返回错误状态码
      console.error('服务器错误：', error.response.data);
    } else {
      console.error('请求错误：', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;