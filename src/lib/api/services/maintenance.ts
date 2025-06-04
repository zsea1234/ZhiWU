import { api } from './client'

export interface MaintenanceType {
  id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  title: string
  description: string
  type: 'repair' | 'replacement' | 'inspection' | 'cleaning' | 'other'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date?: string
  completed_date?: string
  cost?: number
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
  property: {
    id: number
    title: string
    address_line1: string
    city: string
  }
  tenant: {
    id: number
    name: string
    email: string
  }
  media_files: {
    id: number
    url: string
    thumbnail_url?: string
    media_type: 'image' | 'video'
    description?: string
    uploaded_at: string
  }[]
}

export interface MaintenanceCreateInput {
  property_id: number
  title: string
  description: string
  type: MaintenanceType['type']
  priority: MaintenanceType['priority']
  scheduled_date?: string
  assigned_to?: string
  notes?: string
  images?: File[]
  videos?: File[]
}

export interface MaintenanceUpdateInput {
  title?: string
  description?: string
  type?: MaintenanceType['type']
  priority?: MaintenanceType['priority']
  status?: MaintenanceType['status']
  scheduled_date?: string
  completed_date?: string
  cost?: number
  assigned_to?: string
  notes?: string
  images?: File[]
  videos?: File[]
}

export interface MaintenanceListParams {
  property_id?: number
  tenant_id?: number
  landlord_id?: number
  type?: MaintenanceType['type']
  priority?: MaintenanceType['priority']
  status?: MaintenanceType['status']
  start_date?: string
  end_date?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface MaintenanceSummary {
  total_requests: number
  by_status: {
    pending: number
    in_progress: number
    completed: number
    cancelled: number
  }
  by_priority: {
    low: number
    medium: number
    high: number
    emergency: number
  }
  by_type: {
    repair: number
    replacement: number
    inspection: number
    cleaning: number
    other: number
  }
  average_completion_time: number
  total_cost: number
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

export const maintenanceApi = {
  list: async (params?: MaintenanceListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/maintenance?${queryString}` : '/maintenance'
    return api.get<PaginatedResponse<MaintenanceType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<MaintenanceType>(`/maintenance/${id}`)
  },

  create: async (data: MaintenanceCreateInput) => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })

    // Add files
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    if (data.videos) {
      data.videos.forEach((file) => {
        formData.append('videos', file)
      })
    }

    return api.post<MaintenanceType>('/maintenance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  update: async (id: number, data: MaintenanceUpdateInput) => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })

    // Add files
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    if (data.videos) {
      data.videos.forEach((file) => {
        formData.append('videos', file)
      })
    }

    return api.put<MaintenanceType>(`/maintenance/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  delete: async (id: number) => {
    return api.delete(`/maintenance/${id}`)
  },

  startWork: async (id: number, assigned_to: string) => {
    return api.put<MaintenanceType>(`/maintenance/${id}/start`, { assigned_to })
  },

  complete: async (id: number, data: { completed_date: string; cost: number; notes?: string }) => {
    return api.put<MaintenanceType>(`/maintenance/${id}/complete`, data)
  },

  cancel: async (id: number, reason: string) => {
    return api.put<MaintenanceType>(`/maintenance/${id}/cancel`, { reason })
  },

  uploadMedia: async (id: number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    return api.post(`/maintenance/${id}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteMedia: async (id: number, mediaId: number) => {
    return api.delete(`/maintenance/${id}/media/${mediaId}`)
  },

  getSummary: async (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/maintenance/summary?${queryString}` : '/maintenance/summary'
    return api.get<MaintenanceSummary>(endpoint)
  },
} 