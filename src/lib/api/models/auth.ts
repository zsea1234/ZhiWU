import { User } from './user';

/**
 * 登录请求参数
 */
export interface LoginInput {
  username_or_email: string;
  password: string;
  remember_me?: boolean;
  role?: 'tenant' | 'landlord' | 'admin';
}

/**
 * 注册请求参数
 */
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: 'tenant' | 'landlord' | 'admin';
}

/**
 * 认证响应数据
 */
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

/**
 * 多因素认证设置请求
 */
export interface MfaSetupInput {
  mfa_type: 'sms' | 'totp';
  phone?: string;
}

/**
 * 多因素认证设置响应
 */
export interface MfaSetupResponse {
  secret?: string;
  qr_code_url?: string;
  verification_required: boolean;
}

/**
 * 多因素认证验证请求
 */
export interface MfaVerifyInput {
  code: string;
  mfa_token: string;
}

/**
 * 密码重置请求
 */
export interface PasswordResetRequestInput {
  email: string;
}

/**
 * 密码重置确认请求
 */
export interface PasswordResetConfirmInput {
  token: string;
  password: string;
  password_confirm: string;
} 