import api from './api';

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
  is_read_by_receiver: boolean;
  is_agent_reply: boolean;
}

export interface MessageCreateInput {
  receiver_id: number;
  content: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export const messageService = {
  // 发送消息
  sendMessage: async (data: MessageCreateInput): Promise<Message> => {
    try {
      const response = await api.post<Message>('/messages', data);
      return response.data;
    } catch (error) {
      console.error('发送消息失败：', error);
      throw error;
    }
  },

  // 获取与指定用户的消息历史
  getMessages: async (chatWithUserId: number, beforeMessageId?: number, limit: number = 20): Promise<Message[]> => {
    const params = {
      chat_with_user_id: chatWithUserId,
      before_message_id: beforeMessageId,
      limit
    };
    const response = await api.get<Message[]>('/messages', { params });
    return response.data;
  },

  // 获取未读消息数量
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<UnreadCountResponse>('/messages/unread-count');
      return response.data.unread_count;
    } catch (error) {
      console.error('获取未读消息数量失败：', error);
      return 0; // 发生错误时返回0
    }
  }
}; 