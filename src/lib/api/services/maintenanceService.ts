import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  MaintenanceRequest,
  MaintenanceRequestCreateInput,
  MaintenanceRequestUpdateInput,
  MaintenanceStatusUpdateInput,
  MaintenanceFeedbackInput,
} from '../models/maintenance';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 维修服务
 * 处理维修相关的API请求
 */
export const maintenanceService = {
  /**
   * 获取维修请求列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页维修请求列表
   */
  getMaintenanceRequests: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<MaintenanceRequest>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<MaintenanceRequest>>(API_ENDPOINTS.MAINTENANCE.BASE, config);
  },
  
  /**
   * 获取指定维修请求
   * @param id 维修请求ID
   * @returns 维修请求详情
   */
  getMaintenanceRequestById: async (id: string): Promise<MaintenanceRequest> => {
    return apiClient.get<MaintenanceRequest>(API_ENDPOINTS.MAINTENANCE.BY_ID(id));
  },
  
  /**
   * 创建维修请求
   * @param data 维修请求创建数据
   * @returns 创建的维修请求
   */
  createMaintenanceRequest: async (data: MaintenanceRequestCreateInput): Promise<MaintenanceRequest> => {
    return apiClient.post<MaintenanceRequest, MaintenanceRequestCreateInput>(
      API_ENDPOINTS.MAINTENANCE.BASE,
      data
    );
  },
  
  /**
   * 更新维修请求
   * @param id 维修请求ID
   * @param data 维修请求更新数据
   * @returns 更新后的维修请求
   */
  updateMaintenanceRequest: async (
    id: string,
    data: MaintenanceRequestUpdateInput
  ): Promise<MaintenanceRequest> => {
    return apiClient.patch<MaintenanceRequest, MaintenanceRequestUpdateInput>(
      API_ENDPOINTS.MAINTENANCE.BY_ID(id),
      data
    );
  },
  
  /**
   * 更新维修请求状态
   * @param id 维修请求ID
   * @param data 状态更新数据
   * @returns 更新后的维修请求
   */
  updateMaintenanceStatus: async (
    id: string,
    data: MaintenanceStatusUpdateInput
  ): Promise<MaintenanceRequest> => {
    return apiClient.patch<MaintenanceRequest, MaintenanceStatusUpdateInput>(
      API_ENDPOINTS.MAINTENANCE.STATUS(id),
      data
    );
  },
  
  /**
   * 提交维修反馈
   * @param id 维修请求ID
   * @param data 反馈数据
   * @returns 更新后的维修请求
   */
  submitMaintenanceFeedback: async (
    id: string,
    data: MaintenanceFeedbackInput
  ): Promise<MaintenanceRequest> => {
    return apiClient.post<MaintenanceRequest, MaintenanceFeedbackInput>(
      API_ENDPOINTS.MAINTENANCE.FEEDBACK(id),
      data
    );
  },
  
  /**
   * 上传维修请求图片
   * @param id 维修请求ID
   * @param file 图片文件
   * @returns 上传结果
   */
  uploadMaintenanceImage: async (id: string, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.post<{ image_url: string }, FormData>(
      `${API_ENDPOINTS.MAINTENANCE.BY_ID(id)}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  
  /**
   * 获取租客的维修请求列表
   * @param status 维修请求状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页维修请求列表
   */
  getTenantMaintenanceRequests: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<MaintenanceRequest>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'tenant',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<MaintenanceRequest>>(API_ENDPOINTS.MAINTENANCE.BASE, config);
  },
  
  /**
   * 获取房东的维修请求列表
   * @param status 维修请求状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页维修请求列表
   */
  getLandlordMaintenanceRequests: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<MaintenanceRequest>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'landlord',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<MaintenanceRequest>>(API_ENDPOINTS.MAINTENANCE.BASE, config);
  },
  
  /**
   * 获取指定房源的维修请求列表
   * @param propertyId 房源ID
   * @param status 维修请求状态过滤
   * @returns 维修请求列表
   */
  getPropertyMaintenanceRequests: async (
    propertyId: string,
    status?: string
  ): Promise<MaintenanceRequest[]> => {
    const config: ApiRequestConfig = {
      params: {
        property_id: propertyId,
        status,
      },
    };
    
    return apiClient.get<MaintenanceRequest[]>(API_ENDPOINTS.MAINTENANCE.BASE, config);
  },
}; 