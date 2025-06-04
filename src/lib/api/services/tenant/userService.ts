import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'tenant' | 'landlord' | 'admin';
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  rental_history_summary?: string;
}

export interface UserUpdateInput {
  email?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
  enable_mfa?: boolean;
}

export const userService = {
  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/users/me');
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败：', error);
      throw error;
    }
  },

  // 更新当前用户信息
  updateCurrentUser: async (data: UserUpdateInput): Promise<User> => {
    try {
      const response = await api.put<User>('/users/me', data);
      return response.data;
    } catch (error) {
      console.error('更新用户信息失败：', error);
      throw error;
    }
  }
}; 