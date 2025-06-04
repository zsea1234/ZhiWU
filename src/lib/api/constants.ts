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
    PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
  },
  
  // 用户
  USERS: {
    BASE: '/users',
    CURRENT: '/users/me',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/me/profile',
    PASSWORD: '/users/me/password',
    AVATAR: '/users/me/avatar',
    NOTIFICATION_SETTINGS: '/users/me/notification-settings',
  },
  
  // 房源
  PROPERTIES: {
    BASE: '/properties',
    BY_ID: (id: string) => `/properties/${id}`,
    IMAGES: (id: string) => `/properties/${id}/images`,
    VIDEOS: (id: string) => `/properties/${id}/videos`,
    STATUS: (id: string) => `/properties/${id}/status`,
    AMENITIES: '/properties/amenities',
    SEARCH: '/properties/search',
    RECOMMENDATIONS: '/properties/recommendations',
  },
  
  // 预约
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    APPROVE: (id: string) => `/bookings/${id}/approve`,
    REJECT: (id: string) => `/bookings/${id}/reject`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
    FEEDBACK: (id: string) => `/bookings/${id}/feedback`,
  },
  
  // 租约
  LEASES: {
    BASE: '/leases',
    BY_ID: (id: string) => `/leases/${id}`,
    SIGN: (id: string) => `/leases/${id}/sign`,
    TERMINATE: (id: string) => `/leases/${id}/terminate`,
    RENEW: (id: string) => `/leases/${id}/renew`,
    DOCUMENT: (id: string) => `/leases/${id}/document`,
  },
  
  // 支付
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    PROCESS: (id: string) => `/payments/${id}/process`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    INVOICES: '/payments/invoices',
    INVOICE_BY_ID: (id: string) => `/payments/invoices/${id}`,
  },
  
  // 维修
  MAINTENANCE: {
    BASE: '/maintenance',
    BY_ID: (id: string) => `/maintenance/${id}`,
    STATUS: (id: string) => `/maintenance/${id}/status`,
    FEEDBACK: (id: string) => `/maintenance/${id}/feedback`,
  },
  
  // 消息
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION_BY_ID: (id: string) => `/messages/conversations/${id}`,
    MESSAGES: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
    MESSAGE_BY_ID: (conversationId: string, messageId: string) => 
      `/messages/conversations/${conversationId}/messages/${messageId}`,
    UNREAD_COUNT: '/messages/unread',
    READ_STATUS: (messageId: string) => `/messages/${messageId}/read`,
  },

  // 通知
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // 系统
  SYSTEM: {
    HEALTH: '/system/health',
    VERSION: '/system/version',
    STATS: '/system/stats',
  },
}; 