/**
 * 通知类型
 */
export type NotificationType = 
  | 'booking_request'
  | 'booking_approved'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'lease_created'
  | 'lease_signed'
  | 'lease_expired'
  | 'payment_due'
  | 'payment_received'
  | 'payment_overdue'
  | 'maintenance_request'
  | 'maintenance_updated'
  | 'message_received'
  | 'system';

/**
 * 通知模型
 */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  data?: Record<string, any>; // 附加数据，用于链接到特定实体
  created_at: string;
  updated_at: string;
}

/**
 * 通知过滤参数
 */
export interface NotificationFilterParams {
  is_read?: boolean;
  type?: NotificationType;
  start_date?: string;
  end_date?: string;
}

/**
 * 通知统计
 */
export interface NotificationStats {
  total: number;
  unread: number;
  booking: number;
  lease: number;
  payment: number;
  maintenance: number;
  message: number;
  system: number;
}

/**
 * 通知偏好设置
 */
export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  booking_notifications: boolean;
  lease_notifications: boolean;
  payment_notifications: boolean;
  maintenance_notifications: boolean;
  message_notifications: boolean;
  marketing_notifications: boolean;
}

/**
 * 更新通知偏好设置请求
 */
export interface UpdateNotificationPreferencesInput {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  booking_notifications?: boolean;
  lease_notifications?: boolean;
  payment_notifications?: boolean;
  maintenance_notifications?: boolean;
  message_notifications?: boolean;
  marketing_notifications?: boolean;
} 