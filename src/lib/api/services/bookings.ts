import { api } from './client'

export interface BookingType {
  id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  rent_amount: number
  deposit_amount: number
  payment_status: 'pending' | 'partial' | 'paid'
  created_at: string
  updated_at: string
  property: {
    id: number
    title: string
    address_line1: string
    city: string
    property_type: string
    media_files: {
      id: number
      url: string
      thumbnail_url?: string
      media_type: 'image' | 'video'
    }[]
  }
  tenant: {
    id: number
    name: string
    email: string
    phone: string
    avatar_url?: string
  }
  landlord: {
    id: number
    name: string
    email: string
    phone: string
    avatar_url?: string
  }
}

export interface BookingCreateInput {
  property_id: number
  start_date: string
  end_date: string
  rent_amount: number
  deposit_amount: number
}

export interface BookingUpdateInput {
  status?: BookingType['status']
  payment_status?: BookingType['payment_status']
  start_date?: string
  end_date?: string
  rent_amount?: number
  deposit_amount?: number
}

export interface BookingListParams {
  property_id?: number
  tenant_id?: number
  landlord_id?: number
  status?: BookingType['status']
  payment_status?: BookingType['payment_status']
  start_date?: string
  end_date?: string
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

export const bookingsApi = {
  list: async (params?: BookingListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings'
    return api.get<PaginatedResponse<BookingType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<BookingType>(`/bookings/${id}`)
  },

  create: async (data: BookingCreateInput) => {
    return api.post<BookingType>('/bookings', data)
  },

  update: async (id: number, data: BookingUpdateInput) => {
    return api.put<BookingType>(`/bookings/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/bookings/${id}`)
  },

  approve: async (id: number) => {
    return api.put<BookingType>(`/bookings/${id}/approve`)
  },

  reject: async (id: number, reason: string) => {
    return api.put<BookingType>(`/bookings/${id}/reject`, { reason })
  },

  cancel: async (id: number, reason: string) => {
    return api.put<BookingType>(`/bookings/${id}/cancel`, { reason })
  },

  complete: async (id: number) => {
    return api.put<BookingType>(`/bookings/${id}/complete`)
  },

  updatePaymentStatus: async (id: number, payment_status: BookingType['payment_status']) => {
    return api.put<BookingType>(`/bookings/${id}/payment-status`, { payment_status })
  },
} 