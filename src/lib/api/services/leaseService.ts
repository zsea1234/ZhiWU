import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Lease,
  LeaseCreateInput,
  LeaseUpdateInput,
  LeaseSignInput,
  LeaseTerminateInput,
  LeaseRenewInput,
} from '../models/lease';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 租约服务
 * 处理租约相关的API请求
 */
export const leaseService = {
  /**
   * 获取租约列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页租约列表
   */
  getLeases: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<Lease>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Lease>>(API_ENDPOINTS.LEASES.BASE, config);
  },
  
  /**
   * 获取指定租约
   * @param id 租约ID
   * @returns 租约详情
   */
  getLeaseById: async (id: string): Promise<Lease> => {
    return apiClient.get<Lease>(API_ENDPOINTS.LEASES.BY_ID(id));
  },
  
  /**
   * 创建租约
   * @param data 租约创建数据
   * @returns 创建的租约
   */
  createLease: async (data: LeaseCreateInput): Promise<Lease> => {
    return apiClient.post<Lease, LeaseCreateInput>(API_ENDPOINTS.LEASES.BASE, data);
  },
  
  /**
   * 更新租约
   * @param id 租约ID
   * @param data 租约更新数据
   * @returns 更新后的租约
   */
  updateLease: async (id: string, data: LeaseUpdateInput): Promise<Lease> => {
    return apiClient.patch<Lease, LeaseUpdateInput>(API_ENDPOINTS.LEASES.BY_ID(id), data);
  },
  
  /**
   * 签署租约
   * @param id 租约ID
   * @param data 签署数据
   * @returns 更新后的租约
   */
  signLease: async (id: string, data: LeaseSignInput): Promise<Lease> => {
    return apiClient.post<Lease, LeaseSignInput>(API_ENDPOINTS.LEASES.SIGN(id), data);
  },
  
  /**
   * 终止租约
   * @param id 租约ID
   * @param data 终止数据
   * @returns 更新后的租约
   */
  terminateLease: async (id: string, data: LeaseTerminateInput): Promise<Lease> => {
    return apiClient.post<Lease, LeaseTerminateInput>(API_ENDPOINTS.LEASES.TERMINATE(id), data);
  },
  
  /**
   * 续签租约
   * @param id 租约ID
   * @param data 续签数据
   * @returns 新的租约
   */
  renewLease: async (id: string, data: LeaseRenewInput): Promise<Lease> => {
    return apiClient.post<Lease, LeaseRenewInput>(API_ENDPOINTS.LEASES.RENEW(id), data);
  },
  
  /**
   * 获取租约文档
   * @param id 租约ID
   * @returns 文档URL
   */
  getLeaseDocument: async (id: string): Promise<{ document_url: string }> => {
    return apiClient.get<{ document_url: string }>(API_ENDPOINTS.LEASES.DOCUMENT(id));
  },
  
  /**
   * 获取租客的租约列表
   * @param status 租约状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页租约列表
   */
  getTenantLeases: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Lease>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'tenant',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Lease>>(API_ENDPOINTS.LEASES.BASE, config);
  },
  
  /**
   * 获取房东的租约列表
   * @param status 租约状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页租约列表
   */
  getLandlordLeases: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Lease>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'landlord',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Lease>>(API_ENDPOINTS.LEASES.BASE, config);
  },
  
  /**
   * 获取指定房源的租约
   * @param propertyId 房源ID
   * @param status 租约状态过滤
   * @returns 租约列表
   */
  getPropertyLeases: async (propertyId: string, status?: string): Promise<Lease[]> => {
    const config: ApiRequestConfig = {
      params: {
        property_id: propertyId,
        status,
      },
    };
    
    return apiClient.get<Lease[]>(API_ENDPOINTS.LEASES.BASE, config);
  },
}; 