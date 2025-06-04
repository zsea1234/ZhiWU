/**
 * 租约状态类型
 */
export type LeaseStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated' | 'renewed';

/**
 * 租金支付周期
 */
export type PaymentCycle = 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

/**
 * 租约模型
 */
export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  payment_cycle: PaymentCycle;
  payment_due_day: number; // 每月的第几天
  is_auto_renew: boolean;
  tenant_signed: boolean;
  tenant_signed_at?: string;
  landlord_signed: boolean;
  landlord_signed_at?: string;
  document_url?: string;
  terms_and_conditions: string;
  created_at: string;
  updated_at: string;
}

/**
 * 租约创建请求
 */
export interface LeaseCreateInput {
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  payment_cycle: PaymentCycle;
  payment_due_day: number;
  is_auto_renew: boolean;
  terms_and_conditions: string;
}

/**
 * 租约更新请求
 */
export interface LeaseUpdateInput {
  start_date?: string;
  end_date?: string;
  rent_amount?: number;
  deposit_amount?: number;
  payment_cycle?: PaymentCycle;
  payment_due_day?: number;
  is_auto_renew?: boolean;
  terms_and_conditions?: string;
}

/**
 * 租约签署请求
 */
export interface LeaseSignInput {
  signature: string; // Base64编码的签名图像
}

/**
 * 租约终止请求
 */
export interface LeaseTerminateInput {
  termination_date: string;
  reason: string;
  is_mutual_agreement: boolean;
}

/**
 * 租约续签请求
 */
export interface LeaseRenewInput {
  new_end_date: string;
  new_rent_amount?: number;
  new_terms_and_conditions?: string;
} 