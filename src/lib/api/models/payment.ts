/**
 * 支付状态类型
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * 支付类型
 */
export type PaymentType = 'rent' | 'deposit' | 'service_fee' | 'maintenance' | 'other';

/**
 * 支付方式
 */
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'alipay' | 'wechat_pay' | 'cash' | 'other';

/**
 * 支付模型
 */
export interface Payment {
  id: string;
  lease_id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  type: PaymentType;
  method?: PaymentMethod;
  status: PaymentStatus;
  due_date: string;
  paid_date?: string;
  transaction_id?: string;
  receipt_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 支付创建请求
 */
export interface PaymentCreateInput {
  lease_id: string;
  amount: number;
  type: PaymentType;
  due_date: string;
  description?: string;
}

/**
 * 支付处理请求
 */
export interface PaymentProcessInput {
  payment_id: string;
  method: PaymentMethod;
  // 支付网关可能需要的其他信息
  card_number?: string;
  card_expiry?: string;
  card_cvc?: string;
  bank_account?: string;
}

/**
 * 支付退款请求
 */
export interface PaymentRefundInput {
  payment_id: string;
  reason: string;
  amount?: number; // 部分退款时使用
}

/**
 * 租金账单
 */
export interface RentInvoice {
  id: string;
  lease_id: string;
  payment_id?: string;
  amount: number;
  period_start: string;
  period_end: string;
  due_date: string;
  is_paid: boolean;
  paid_date?: string;
  is_overdue: boolean;
  overdue_days?: number;
  late_fee?: number;
  created_at: string;
  updated_at: string;
} 