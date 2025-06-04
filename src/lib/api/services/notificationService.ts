import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Notification,
  NotificationFilterParams,
  NotificationPreferences,
  NotificationStats,
  UpdateNotificationPreferencesInput,
} from '../models/notification';
import { ApiPaginatedResponse } from '../client/types';

/**
 * 通知服务
 * 处理通知相关的API请求
 */
export const notificationService = {
  /**
   * 获取用户通知列表
   * @param page 页码
   * @param limit 每页数量
   * @param filters 过滤参数
   * @returns 分页通知列表
   */
  getNotifications: async (
    page: number = 1,
    limit: number = 10,
    filters?: NotificationFilterParams
  ): Promise<ApiPaginatedResponse<Notification>> => {
    return apiClient.get<ApiPaginatedResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      {
        params: {
          page,
          limit,
          ...filters,
        }
      }
    );
  },
  
  /**
   * 获取指定通知
   * @param id 通知ID
   * @returns 通知详情
   */
  getNotificationById: async (id: string): Promise<Notification> => {
    return apiClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  },
  
  /**
   * 标记通知为已读
   * @param id 通知ID
   * @returns 更新后的通知
   */
  markAsRead: async (id: string): Promise<Notification> => {
    return apiClient.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },
  
  /**
   * 标记所有通知为已读
   * @returns 操作结果
   */
  markAllAsRead: async (): Promise<{ success: boolean; count: number }> => {
    return apiClient.post<{ success: boolean; count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
  },
  
  /**
   * 删除通知
   * @param id 通知ID
   * @returns 操作结果
   */
  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  },
  
  /**
   * 获取通知统计
   * @returns 通知统计信息
   */
  getNotificationStats: async (): Promise<NotificationStats> => {
    return apiClient.get<NotificationStats>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/stats`);
  },
  
  /**
   * 获取通知偏好设置
   * @returns 通知偏好设置
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    return apiClient.get<NotificationPreferences>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`);
  },
  
  /**
   * 更新通知偏好设置
   * @param data 偏好设置更新数据
   * @returns 更新后的偏好设置
   */
  updateNotificationPreferences: async (
    data: UpdateNotificationPreferencesInput
  ): Promise<NotificationPreferences> => {
    return apiClient.patch<NotificationPreferences, UpdateNotificationPreferencesInput>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/preferences`,
      data
    );
  },
  
  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/unread-count`);
  },
}; 