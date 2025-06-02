// app/services/payment.ts

import api from './api'

// 支付方式枚举
export type PaymentMethod = "wechat_pay" | "alipay" | "credit_card" | "bank_transfer"

// 支付状态枚举
export type PaymentStatus = "pending" | "successful" | "failed" | "refunded" | "processing"

// 支付记录接口
export interface PaymentRecord {
  id: number
  lease_id: number
  tenant_id: number
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  description: string | null
  transaction_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

// 分页响应接口
export interface PaginatedPaymentResponse {
  data: PaymentRecord[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

// 创建支付请求接口
export interface PaymentCreateInput {
  amount: number
  payment_method: PaymentMethod
  description?: string
  payment_gateway_payload?: Record<string, any>
}

// 获取指定合同的支付记录
export const getLeasePayments = async (
  leaseId: number, 
  page: number = 1, 
  pageSize: number = 10
): Promise<PaginatedPaymentResponse> => {
  try {
    const response = await api.get(`/payments/leases/${leaseId}`, {
      params: {
        page,
        page_size: pageSize
      }
    })
    // 确保返回的数据符合 PaginatedPaymentResponse 类型
    const data = response.data as PaginatedPaymentResponse
    return data
  } catch (error) {
    console.error('获取支付记录失败:', error)
    throw error
  }
}

// 获取单个支付记录详情
export const getPaymentDetail = async (paymentId: number): Promise<PaymentRecord> => {
  try {
    const response = await api.get(`/payments/${paymentId}`)
    // 确保返回的数据符合 PaymentRecord 类型
    const data = response.data as PaymentRecord
    return data
  } catch (error) {
    console.error('获取支付记录详情失败:', error)
    throw error
  }
}

// 为指定合同创建支付记录
export const createLeasePayment = async (
  leaseId: number, 
  data: PaymentCreateInput
): Promise<PaymentRecord> => {
  try {
    const response = await api.post(`/payments/leases/${leaseId}`, data)
    // 确保返回的数据符合 PaymentRecord 类型
    const responseData = response.data as PaymentRecord
    return responseData
  } catch (error) {
    console.error('创建支付记录失败:', error)
    throw error
  }
}