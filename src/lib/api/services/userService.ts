import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  User,
  UserProfile,
  UserUpdateInput,
  PasswordUpdateInput,
  UserNotificationSettings
} from '../models/user';
import { ApiPaginatedResponse } from '../client/types';
import { LoginInput, AuthResponse } from '../models/auth';

/**
 * 用户角色类型
 */
export type UserRole = 'tenant' | 'landlord' | 'admin';

/**
 * 用户模型接口
 */
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户登录请求
 */
export interface LoginRequest {
  username_or_email: string;
  password: string;
  remember_me?: boolean;
  role: UserRole;
}

/**
 * 用户注册请求
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

/**
 * 用户服务
 * 处理用户相关的API请求
 */
export const userService = {
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
      // 保存用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  /**
   * 检查用户是否已认证
   * @returns 是否已认证
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem('access_token');
  },

  /**
   * 获取当前用户信息
   * @returns 当前用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.CURRENT);
  },

  /**
   * 获取用户个人资料
   * @returns 用户个人资料
   */
  getUserProfile: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE);
  },

  /**
   * 更新用户信息
   * @param data 用户更新数据
   * @returns 更新后的用户信息
   */
  updateUser: async (data: UserUpdateInput): Promise<User> => {
    return apiClient.patch<User, UserUpdateInput>(API_ENDPOINTS.USERS.CURRENT, data);
  },

  /**
   * 更新用户密码
   * @param data 密码更新数据
   * @returns 操作成功消息
   */
  updatePassword: async (data: PasswordUpdateInput): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }, PasswordUpdateInput>(API_ENDPOINTS.USERS.PASSWORD, data);
  },

  /**
   * 上传用户头像
   * @param file 头像文件
   * @returns 上传结果，包含头像URL
   */
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.post<{ avatar_url: string }, FormData>(API_ENDPOINTS.USERS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 获取用户通知设置
   * @returns 用户通知设置
   */
  getNotificationSettings: async (): Promise<UserNotificationSettings> => {
    return apiClient.get<UserNotificationSettings>(API_ENDPOINTS.USERS.NOTIFICATION_SETTINGS);
  },

  /**
   * 更新用户通知设置
   * @param settings 通知设置
   * @returns 更新后的通知设置
   */
  updateNotificationSettings: async (
    settings: Partial<UserNotificationSettings>
  ): Promise<UserNotificationSettings> => {
    return apiClient.patch<UserNotificationSettings, Partial<UserNotificationSettings>>(
      API_ENDPOINTS.USERS.NOTIFICATION_SETTINGS,
      settings
    );
  },

  /**
   * 获取指定用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  getUserById: async (userId: string): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(userId));
  },

  /**
   * 获取用户列表
   * @param page 页码
   * @param limit 每页数量
   * @param role 用户角色过滤
   * @returns 分页用户列表
   */
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<ApiPaginatedResponse<User>> => {
    return apiClient.get<ApiPaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, {
      params: { page, limit, role },
    });
  },
}; 