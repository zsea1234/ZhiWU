/**
 * 用户角色类型
 */
export type UserRole = 'tenant' | 'landlord' | 'admin';

/**
 * 用户状态类型
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * 用户模型接口
 */
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 用户个人资料
 */
export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  id_card_number?: string;
  gender?: 'male' | 'female' | 'other';
  birth_date?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户更新请求
 */
export interface UserUpdateInput {
  email?: string;
  phone?: string;
  avatar?: string;
  profile?: Partial<UserProfile>;
}

/**
 * 密码更新请求
 */
export interface PasswordUpdateInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

/**
 * 用户通知设置
 */
export interface UserNotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
} 