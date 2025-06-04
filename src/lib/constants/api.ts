/**
 * API相关常量
 */

// API基础URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// API超时时间（毫秒）
export const API_TIMEOUT = 15000;

// API端点
export const API_ENDPOINTS = {
  // 认证
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    MFA_SETUP: '/auth/mfa/setup',
    MFA_VERIFY: '/auth/mfa/verify',
  },
  
  // 用户
  USERS: {
    BASE: '/users',
    CURRENT: '/users/me',
    PASSWORD: '/users/me/password',
    AVATAR: '/users/me/avatar',
  },
  
  // 房源
  PROPERTIES: {
    BASE: '/properties',
    DETAIL: (id: string) => `/properties/${id}`,
    IMAGES: (id: string) => `/properties/${id}/images`,
    STATUS: (id: string) => `/properties/${id}/status`,
  },
  
  // 预约
  BOOKINGS: {
    BASE: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    APPROVE: (id: string) => `/bookings/${id}/approve`,
    REJECT: (id: string) => `/bookings/${id}/reject`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  
  // 租约
  LEASES: {
    BASE: '/leases',
    DETAIL: (id: string) => `/leases/${id}`,
    SIGN: (id: string) => `/leases/${id}/sign`,
    TERMINATE: (id: string) => `/leases/${id}/terminate`,
  },
  
  // 支付
  PAYMENTS: {
    BASE: '/payments',
    DETAIL: (id: string) => `/payments/${id}`,
    LEASE: (leaseId: string) => `/payments/leases/${leaseId}`,
  },
  
  // 维修
  MAINTENANCE: {
    BASE: '/maintenance',
    DETAIL: (id: string) => `/maintenance/${id}`,
    STATUS: (id: string) => `/maintenance/${id}/status`,
  },
  
  // 消息
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: (id: string) => `/messages/conversations/${id}`,
    UNREAD: '/messages/unread',
  },
}; 