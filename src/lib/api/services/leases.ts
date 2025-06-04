import { api } from './client'
import { API_CONFIG, getAuthToken } from './config'

export interface LeaseType {
  id: number
  booking_id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'terminated'
  rent_amount: number
  deposit_amount: number
  payment_frequency: 'monthly' | 'quarterly' | 'yearly'
  payment_due_day: number
  created_at: string
  updated_at: string
  contract_url: string
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

export interface LeaseCreateInput {
  booking_id: number
  start_date: string
  end_date: string
  rent_amount: number
  deposit_amount: number
  payment_frequency: LeaseType['payment_frequency']
  payment_due_day: number
}

export interface LeaseUpdateInput {
  status?: LeaseType['status']
  start_date?: string
  end_date?: string
  rent_amount?: number
  deposit_amount?: number
  payment_frequency?: LeaseType['payment_frequency']
  payment_due_day?: number
}

export interface LeaseListParams {
  property_id?: number
  tenant_id?: number
  landlord_id?: number
  status?: LeaseType['status']
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

export const leasesApi = {
  list: async (params?: LeaseListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/leases?${queryString}` : '/leases'
    return api.get<PaginatedResponse<LeaseType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<LeaseType>(`/leases/${id}`)
  },

  create: async (data: LeaseCreateInput) => {
    return api.post<LeaseType>('/leases', data)
  },

  update: async (id: number, data: LeaseUpdateInput) => {
    return api.put<LeaseType>(`/leases/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/leases/${id}`)
  },

  terminate: async (id: number, reason: string) => {
    return api.put<LeaseType>(`/leases/${id}/terminate`, { reason })
  },

  renew: async (id: number, end_date: string) => {
    return api.put<LeaseType>(`/leases/${id}/renew`, { end_date })
  },

  generateContract: async (id: number) => {
    return api.post<{ contract_url: string }>(`/leases/${id}/generate-contract`)
  },

  downloadContract: async (id: number) => {
    const response = await fetch(`${API_CONFIG.baseURL}/leases/${id}/download-contract`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to download contract')
    }
    return response.blob()
  },
} 