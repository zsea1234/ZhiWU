import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  MfaSetupInput,
  MfaSetupResponse,
  MfaVerifyInput,
  PasswordResetRequestInput,
  PasswordResetConfirmInput
} from '../models/auth';
import { User } from '../models/user';

/**
 * 认证服务
 * 处理用户认证相关的API请求
 */
export const authService = {
  /**
   * 用户登录
   * @param data 登录数据
   * @returns 认证响应
   */
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse, LoginInput>(API_ENDPOINTS.AUTH.LOGIN, data);
    
    // 保存令牌到本地存储
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  /**
   * 用户注册
   * @param data 注册数据
   * @returns 认证响应
   */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse, RegisterInput>(API_ENDPOINTS.AUTH.REGISTER, data);
    
    // 保存令牌到本地存储
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  /**
   * 用户登出
   * @returns 登出结果
   */
  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
      
      // 清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      return response;
    } catch (error) {
      // 即使API调用失败，也清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      throw error;
    }
  },
  
  /**
   * 刷新访问令牌
   * @returns 新的认证响应
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refresh_token: refreshToken }
    );
    
    // 更新本地存储中的令牌
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  },
  
  /**
   * 设置多因素认证
   * @param data MFA设置数据
   * @returns MFA设置响应
   */
  setupMfa: async (data: MfaSetupInput): Promise<MfaSetupResponse> => {
    return apiClient.post<MfaSetupResponse, MfaSetupInput>(API_ENDPOINTS.AUTH.MFA_SETUP, data);
  },
  
  /**
   * 验证多因素认证
   * @param data MFA验证数据
   * @returns 认证响应
   */
  verifyMfa: async (data: MfaVerifyInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse, MfaVerifyInput>(API_ENDPOINTS.AUTH.MFA_VERIFY, data);
    
    // 保存令牌到本地存储
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  /**
   * 请求密码重置
   * @param data 密码重置请求数据
   * @returns 操作结果
   */
  requestPasswordReset: async (data: PasswordResetRequestInput): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }, PasswordResetRequestInput>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
      data
    );
  },
  
  /**
   * 确认密码重置
   * @param data 密码重置确认数据
   * @returns 操作结果
   */
  confirmPasswordReset: async (data: PasswordResetConfirmInput): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }, PasswordResetConfirmInput>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM,
      data
    );
  },
  
  /**
   * 获取当前认证状态
   * @returns 是否已认证
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!localStorage.getItem('access_token');
  },
  
  /**
   * 获取存储的用户信息
   * @returns 用户信息或null
   */
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userJson = localStorage.getItem('user');
    
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },
}; 