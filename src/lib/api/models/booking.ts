/**
 * 预约状态类型
 */
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

/**
 * 预约模型
 */
export interface Booking {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  booking_date: string; // ISO格式日期
  booking_time: string; // 24小时制时间 (HH:MM)
  status: BookingStatus;
  note?: string;
  feedback?: BookingFeedback;
  created_at: string;
  updated_at: string;
}

/**
 * 预约反馈
 */
export interface BookingFeedback {
  id: string;
  booking_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

/**
 * 创建预约请求
 */
export interface BookingCreateInput {
  property_id: string;
  booking_date: string;
  booking_time: string;
  note?: string;
}

/**
 * 更新预约请求
 */
export interface BookingUpdateInput {
  booking_date?: string;
  booking_time?: string;
  note?: string;
}

/**
 * 预约状态更新请求
 */
export interface BookingStatusUpdateInput {
  status: BookingStatus;
  reason?: string;
}

/**
 * 预约反馈创建请求
 */
export interface BookingFeedbackInput {
  rating: number;
  comment?: string;
} 