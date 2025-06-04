/**
 * 消息状态类型
 */
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * 消息类型
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * 消息模型
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 会话模型
 */
export interface Conversation {
  id: string;
  participants: string[]; // 用户ID数组
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * 消息创建输入
 */
export interface MessageCreateInput {
  conversation_id: string;
  receiver_id: string;
  content: string;
  type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

/**
 * 会话创建输入
 */
export interface ConversationCreateInput {
  participants: string[];
  initial_message?: MessageCreateInput;
}

/**
 * 消息状态更新输入
 */
export interface MessageStatusUpdateInput {
  status: MessageStatus;
}

/**
 * 消息查询参数
 */
export interface MessageQueryParams {
  conversation_id: string;
  page?: number;
  limit?: number;
  before_id?: string;
  after_id?: string;
} 