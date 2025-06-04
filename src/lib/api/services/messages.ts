import { api } from './client'

export interface MessageType {
  id: number
  conversation_id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender: {
    id: number
    name: string
    email: string
    avatar_url?: string
  }
  receiver: {
    id: number
    name: string
    email: string
    avatar_url?: string
  }
  attachments: {
    id: number
    url: string
    thumbnail_url?: string
    media_type: 'image' | 'video' | 'document'
    filename: string
    size: number
    uploaded_at: string
  }[]
}

export interface ConversationType {
  id: number
  property_id?: number
  participants: {
    id: number
    name: string
    email: string
    avatar_url?: string
  }[]
  last_message?: MessageType
  unread_count: number
  created_at: string
  updated_at: string
}

export interface MessageCreateInput {
  conversation_id: number
  content: string
  attachments?: File[]
}

export interface MessageListParams {
  conversation_id: number
  before?: string
  after?: string
  limit?: number
}

export interface ConversationListParams {
  property_id?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  data: T[]
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

export const messagesApi = {
  listConversations: async (params?: ConversationListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/conversations?${queryString}` : '/conversations'
    return api.get<PaginatedResponse<ConversationType>>(endpoint)
  },

  getConversation: async (id: number) => {
    return api.get<ConversationType>(`/conversations/${id}`)
  },

  createConversation: async (data: { property_id?: number; participant_ids: number[] }) => {
    return api.post<ConversationType>('/conversations', data)
  },

  deleteConversation: async (id: number) => {
    return api.delete(`/conversations/${id}`)
  },

  listMessages: async (params: MessageListParams) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })
    const queryString = queryParams.toString()
    const endpoint = `/conversations/${params.conversation_id}/messages?${queryString}`
    return api.get<MessageType[]>(endpoint)
  },

  sendMessage: async (data: MessageCreateInput) => {
    const formData = new FormData()
    formData.append('content', data.content)

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file)
      })
    }

    return api.post<MessageType>(`/conversations/${data.conversation_id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteMessage: async (conversationId: number, messageId: number) => {
    return api.delete(`/conversations/${conversationId}/messages/${messageId}`)
  },

  markAsRead: async (conversationId: number) => {
    return api.put(`/conversations/${conversationId}/read`)
  },

  markMessageAsRead: async (conversationId: number, messageId: number) => {
    return api.put(`/conversations/${conversationId}/messages/${messageId}/read`)
  },

  getUnreadCount: async () => {
    return api.get<{ total: number; by_conversation: Record<number, number> }>('/messages/unread-count')
  },
} 