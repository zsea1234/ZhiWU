import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Booking,
  BookingCreateInput,
  BookingUpdateInput,
  BookingStatusUpdateInput,
  BookingFeedbackInput,
  BookingFeedback,
} from '../models/booking';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 预约服务
 * 处理预约相关的API请求
 */
export const bookingService = {
  /**
   * 获取预约列表
   * @param page 页码
   * @param limit 每页数量
   * @param params 查询参数
   * @returns 分页预约列表
   */
  getBookings: async (
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<ApiPaginatedResponse<Booking>> => {
    const config: ApiRequestConfig = {
      params: {
        page,
        limit,
        ...params,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BASE, config);
  },
  
  /**
   * 获取指定预约
   * @param id 预约ID
   * @returns 预约详情
   */
  getBookingById: async (id: string): Promise<Booking> => {
    return apiClient.get<Booking>(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  },
  
  /**
   * 创建预约
   * @param data 预约创建数据
   * @returns 创建的预约
   */
  createBooking: async (data: BookingCreateInput): Promise<Booking> => {
    return apiClient.post<Booking, BookingCreateInput>(API_ENDPOINTS.BOOKINGS.BASE, data);
  },
  
  /**
   * 更新预约
   * @param id 预约ID
   * @param data 预约更新数据
   * @returns 更新后的预约
   */
  updateBooking: async (id: string, data: BookingUpdateInput): Promise<Booking> => {
    return apiClient.patch<Booking, BookingUpdateInput>(API_ENDPOINTS.BOOKINGS.BY_ID(id), data);
  },
  
  /**
   * 取消预约
   * @param id 预约ID
   * @param reason 取消原因
   * @returns 更新后的预约
   */
  cancelBooking: async (id: string, reason?: string): Promise<Booking> => {
    return apiClient.post<Booking, { reason?: string }>(
      API_ENDPOINTS.BOOKINGS.CANCEL(id),
      { reason }
    );
  },
  
  /**
   * 批准预约
   * @param id 预约ID
   * @returns 更新后的预约
   */
  approveBooking: async (id: string): Promise<Booking> => {
    return apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.APPROVE(id));
  },
  
  /**
   * 拒绝预约
   * @param id 预约ID
   * @param reason 拒绝原因
   * @returns 更新后的预约
   */
  rejectBooking: async (id: string, reason: string): Promise<Booking> => {
    return apiClient.post<Booking, { reason: string }>(
      API_ENDPOINTS.BOOKINGS.REJECT(id),
      { reason }
    );
  },
  
  /**
   * 完成预约
   * @param id 预约ID
   * @returns 更新后的预约
   */
  completeBooking: async (id: string): Promise<Booking> => {
    return apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.COMPLETE(id));
  },
  
  /**
   * 提交预约反馈
   * @param id 预约ID
   * @param data 反馈数据
   * @returns 创建的反馈
   */
  submitBookingFeedback: async (id: string, data: BookingFeedbackInput): Promise<BookingFeedback> => {
    return apiClient.post<BookingFeedback, BookingFeedbackInput>(
      API_ENDPOINTS.BOOKINGS.FEEDBACK(id),
      data
    );
  },
  
  /**
   * 获取租客的预约列表
   * @param status 预约状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页预约列表
   */
  getTenantBookings: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Booking>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'tenant',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BASE, config);
  },
  
  /**
   * 获取房东的预约列表
   * @param status 预约状态过滤
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页预约列表
   */
  getLandlordBookings: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Booking>> => {
    const config: ApiRequestConfig = {
      params: {
        role: 'landlord',
        status,
        page,
        limit,
      },
    };
    
    return apiClient.get<ApiPaginatedResponse<Booking>>(API_ENDPOINTS.BOOKINGS.BASE, config);
  },
}; 