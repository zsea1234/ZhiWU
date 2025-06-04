import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Property,
  PropertyCreateInput,
  PropertyUpdateInput,
  PropertyImage,
  PropertyVideo,
  PropertyAmenity,
} from '../models/property';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 房源服务
 * 处理房源相关的API请求
 */
export const propertyService = {
  /**
   * 获取房源列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页房源列表
   */
  getProperties: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<Property>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Property>>(API_ENDPOINTS.PROPERTIES.BASE, config);
  },
  
  /**
   * 获取指定房源
   * @param id 房源ID
   * @returns 房源详情
   */
  getPropertyById: async (id: string): Promise<Property> => {
    return apiClient.get<Property>(API_ENDPOINTS.PROPERTIES.BY_ID(id));
  },
  
  /**
   * 创建房源
   * @param data 房源创建数据
   * @returns 创建的房源
   */
  createProperty: async (data: PropertyCreateInput): Promise<Property> => {
    return apiClient.post<Property, PropertyCreateInput>(API_ENDPOINTS.PROPERTIES.BASE, data);
  },
  
  /**
   * 更新房源
   * @param id 房源ID
   * @param data 房源更新数据
   * @returns 更新后的房源
   */
  updateProperty: async (id: string, data: PropertyUpdateInput): Promise<Property> => {
    return apiClient.put<Property, PropertyUpdateInput>(API_ENDPOINTS.PROPERTIES.BY_ID(id), data);
  },
  
  /**
   * 删除房源
   * @param id 房源ID
   * @returns 操作结果
   */
  deleteProperty: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.PROPERTIES.BY_ID(id));
  },
  
  /**
   * 上传房源图片
   * @param propertyId 房源ID
   * @param file 图片文件
   * @param isPrimary 是否为主图
   * @param caption 图片说明
   * @returns 上传的图片信息
   */
  uploadPropertyImage: async (
    propertyId: string,
    file: File,
    isPrimary: boolean = false,
    caption?: string
  ): Promise<PropertyImage> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', String(isPrimary));
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    return apiClient.post<PropertyImage, FormData>(
      API_ENDPOINTS.PROPERTIES.IMAGES(propertyId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  
  /**
   * 删除房源图片
   * @param propertyId 房源ID
   * @param imageId 图片ID
   * @returns 操作结果
   */
  deletePropertyImage: async (propertyId: string, imageId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.PROPERTIES.IMAGES(propertyId)}/${imageId}`
    );
  },
  
  /**
   * 上传房源视频
   * @param propertyId 房源ID
   * @param file 视频文件
   * @param caption 视频说明
   * @returns 上传的视频信息
   */
  uploadPropertyVideo: async (
    propertyId: string,
    file: File,
    caption?: string
  ): Promise<PropertyVideo> => {
    const formData = new FormData();
    formData.append('video', file);
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    return apiClient.post<PropertyVideo, FormData>(
      API_ENDPOINTS.PROPERTIES.VIDEOS(propertyId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  
  /**
   * 删除房源视频
   * @param propertyId 房源ID
   * @param videoId 视频ID
   * @returns 操作结果
   */
  deletePropertyVideo: async (propertyId: string, videoId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `${API_ENDPOINTS.PROPERTIES.VIDEOS(propertyId)}/${videoId}`
    );
  },
  
  /**
   * 更新房源状态
   * @param id 房源ID
   * @param status 新状态
   * @returns 更新后的房源
   */
  updatePropertyStatus: async (id: string, status: string): Promise<Property> => {
    return apiClient.patch<Property, { status: string }>(
      API_ENDPOINTS.PROPERTIES.STATUS(id),
      { status }
    );
  },
  
  /**
   * 获取房源设施列表
   * @returns 设施列表
   */
  getAmenities: async (): Promise<PropertyAmenity[]> => {
    return apiClient.get<PropertyAmenity[]>(API_ENDPOINTS.PROPERTIES.AMENITIES);
  },
  
  /**
   * 搜索房源
   * @param params 搜索参数
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页房源列表
   */
  searchProperties: async (
    params: Record<string, any>,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Property>> => {
    const config: ApiRequestConfig = {
      params: {
        ...params,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Property>>(API_ENDPOINTS.PROPERTIES.SEARCH, config);
  },
  
  /**
   * 获取推荐房源
   * @param limit 数量限制
   * @returns 房源列表
   */
  getRecommendedProperties: async (limit: number = 5): Promise<Property[]> => {
    return apiClient.get<Property[]>(API_ENDPOINTS.PROPERTIES.RECOMMENDATIONS, {
      params: { limit },
    });
  },
}; 