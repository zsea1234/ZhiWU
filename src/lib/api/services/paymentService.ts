import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Payment,
  PaymentCreateInput,
  PaymentProcessInput,
  PaymentRefundInput,
  RentInvoice,
} from '../models/payment';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 支付服务
 * 处理支付相关的API请求
 */
export const paymentService = {
  /**
   * 获取支付列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页支付列表
   */
  getPayments: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<Payment>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Payment>>(API_ENDPOINTS.PAYMENTS.BASE, config);
  },
  
  /**
   * 获取指定支付
   * @param id 支付ID
   * @returns 支付详情
   */
  getPaymentById: async (id: string): Promise<Payment> => {
    return apiClient.get<Payment>(API_ENDPOINTS.PAYMENTS.BY_ID(id));
  },
  
  /**
   * 创建支付
   * @param data 支付创建数据
   * @returns 创建的支付
   */
  createPayment: async (data: PaymentCreateInput): Promise<Payment> => {
    return apiClient.post<Payment, PaymentCreateInput>(API_ENDPOINTS.PAYMENTS.BASE, data);
  },
  
  /**
   * 处理支付
   * @param id 支付ID
   * @param data 处理数据
   * @returns 更新后的支付
   */
  processPayment: async (id: string, data: PaymentProcessInput): Promise<Payment> => {
    return apiClient.post<Payment, PaymentProcessInput>(API_ENDPOINTS.PAYMENTS.PROCESS(id), data);
  },
  
  /**
   * 退款
   * @param id 支付ID
   * @param data 退款数据
   * @returns 更新后的支付
   */
  refundPayment: async (id: string, data: PaymentRefundInput): Promise<Payment> => {
    return apiClient.post<Payment, PaymentRefundInput>(API_ENDPOINTS.PAYMENTS.REFUND(id), data);
  },
  
  /**
   * 获取租金账单列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页账单列表
   */
  getInvoices: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<RentInvoice>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<RentInvoice>>(API_ENDPOINTS.PAYMENTS.INVOICES, config);
  },
  
  /**
   * 获取指定账单
   * @param id 账单ID
   * @returns 账单详情
   */
  getInvoiceById: async (id: string): Promise<RentInvoice> => {
    return apiClient.get<RentInvoice>(API_ENDPOINTS.PAYMENTS.INVOICE_BY_ID(id));
  },
  
  /**
   * 获取租客的支付列表
   * @param status 支付状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页支付列表
   */
  getTenantPayments: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Payment>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'tenant',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Payment>>(API_ENDPOINTS.PAYMENTS.BASE, config);
  },
  
  /**
   * 获取房东的支付列表
   * @param status 支付状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页支付列表
   */
  getLandlordPayments: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Payment>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'landlord',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Payment>>(API_ENDPOINTS.PAYMENTS.BASE, config);
  },
  
  /**
   * 获取指定租约的支付列表
   * @param leaseId 租约ID
   * @param status 支付状态过滤
   * @returns 支付列表
   */
  getLeasePayments: async (leaseId: string, status?: string): Promise<Payment[]> => {
    const config: ApiRequestConfig = {
      params: {
        lease_id: leaseId,
        status,
      },
    };
    
    return apiClient.get<Payment[]>(API_ENDPOINTS.PAYMENTS.BASE, config);
  },
  
  /**
   * 获取指定租约的账单列表
   * @param leaseId 租约ID
   * @param isPaid 是否已支付过滤
   * @returns 账单列表
   */
  getLeaseInvoices: async (leaseId: string, isPaid?: boolean): Promise<RentInvoice[]> => {
    const config: ApiRequestConfig = {
      params: {
        lease_id: leaseId,
        is_paid: isPaid !== undefined ? String(isPaid) : undefined,
      },
    };
    
    return apiClient.get<RentInvoice[]>(API_ENDPOINTS.PAYMENTS.INVOICES, config);
  },
}; 