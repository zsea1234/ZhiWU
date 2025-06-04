import { apiClient } from '../client/apiClient';
import { API_ENDPOINTS } from '../constants';
import {
  Message,
  Conversation,
  MessageCreateInput,
  ConversationCreateInput,
  MessageStatusUpdateInput,
  MessageQueryParams,
} from '../models/message';
import { ApiPaginatedResponse, ApiRequestConfig } from '../client/types';

/**
 * 消息服务
 * 处理消息和会话相关的API请求
 */
export const messageService = {
  /**
   * 获取用户的会话列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页会话列表
   */
  getConversations: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiPaginatedResponse<Conversation>> => {
    return apiClient.get<ApiPaginatedResponse<Conversation>>(
      API_ENDPOINTS.MESSAGES.CONVERSATIONS, 
      { 
        params: {
          page,
          limit,
        }
      } as ApiRequestConfig
    );
  },
  
  /**
   * 获取指定会话
   * @param id 会话ID
   * @returns 会话详情
   */
  getConversationById: async (id: string): Promise<Conversation> => {
    return apiClient.get<Conversation>(API_ENDPOINTS.MESSAGES.CONVERSATION_BY_ID(id));
  },
  
  /**
   * 创建会话
   * @param data 会话创建数据
   * @returns 创建的会话
   */
  createConversation: async (data: ConversationCreateInput): Promise<Conversation> => {
    return apiClient.post<Conversation, ConversationCreateInput>(
      API_ENDPOINTS.MESSAGES.CONVERSATIONS,
      data
    );
  },
  
  /**
   * 获取会话的消息列表
   * @param conversationId 会话ID
   * @param params 消息查询参数
   * @returns 分页消息列表
   */
  getMessages: async (
    conversationId: string,
    params: MessageQueryParams
  ): Promise<ApiPaginatedResponse<Message>> => {
    return apiClient.get<ApiPaginatedResponse<Message>>(
      API_ENDPOINTS.MESSAGES.MESSAGES(conversationId),
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          before_id: params.before_id,
          after_id: params.after_id,
        }
      } as ApiRequestConfig
    );
  },
  
  /**
   * 发送消息
   * @param data 消息创建数据
   * @returns 创建的消息
   */
  sendMessage: async (data: MessageCreateInput): Promise<Message> => {
    return apiClient.post<Message, MessageCreateInput>(
      API_ENDPOINTS.MESSAGES.MESSAGES(data.conversation_id),
      data
    );
  },
  
  /**
   * 上传消息附件
   * @param conversationId 会话ID
   * @param file 文件
   * @returns 上传结果
   */
  uploadMessageAttachment: async (
    conversationId: string,
    file: File
  ): Promise<{ file_url: string; file_name: string; file_size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<
      { file_url: string; file_name: string; file_size: number },
      FormData
    >(
      `${API_ENDPOINTS.MESSAGES.MESSAGES(conversationId)}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } as ApiRequestConfig
    );
  },
  
  /**
   * 更新消息状态（已读）
   * @param messageId 消息ID
   * @param data 状态更新数据
   * @returns 更新后的消息
   */
  updateMessageStatus: async (
    messageId: string,
    data: MessageStatusUpdateInput
  ): Promise<Message> => {
    return apiClient.patch<Message, MessageStatusUpdateInput>(
      API_ENDPOINTS.MESSAGES.READ_STATUS(messageId),
      data
    );
  },
  
  /**
   * 获取未读消息数量
   * @returns 未读消息数量
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>(API_ENDPOINTS.MESSAGES.UNREAD_COUNT);
  },
  
  /**
   * 标记会话所有消息为已读
   * @param conversationId 会话ID
   * @returns 操作结果
   */
  markConversationAsRead: async (conversationId: string): Promise<{ success: boolean; count: number }> => {
    return apiClient.post<{ success: boolean; count: number }>(
      `${API_ENDPOINTS.MESSAGES.CONVERSATION_BY_ID(conversationId)}/read`
    );
  },
  
  /**
   * 获取与特定用户的会话
   * @param userId 用户ID
   * @returns 会话，如果不存在则创建新会话
   */
  getOrCreateConversationWithUser: async (userId: string): Promise<Conversation> => {
    return apiClient.post<Conversation, { user_id: string }>(
      `${API_ENDPOINTS.MESSAGES.CONVERSATIONS}/with-user`,
      { user_id: userId }
    );
  },
}; 