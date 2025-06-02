import { api } from './client'

export interface PropertyType {
  id: number
  title: string
  address_line1: string
  address_line2?: string
  city: string
  district?: string
  postal_code: string
  country_code: string
  latitude?: number
  longitude?: number
  property_type: 'apartment' | 'house' | 'studio' | 'shared_room' | 'other'
  area_sqm: number
  rent_price_monthly: number
  deposit_amount: number
  bedrooms: number
  living_rooms: number
  bathrooms: number
  floor_level?: number
  total_floors?: number
  year_built?: number
  description_text: string
  furnishing_status?: string
  amenities?: string[]
  rules?: string[]
  available_date: string
  status: 'vacant' | 'rented' | 'under_maintenance' | 'pending_approval' | 'delisted'
  is_verified_by_admin: boolean
  view_count: number
  created_at: string
  updated_at: string
  media_files: {
    id: number
    url: string
    thumbnail_url?: string
    media_type: 'image' | 'video'
    description?: string
    uploaded_at: string
  }[]
  surrounding_environment_info?: string
}

export interface PropertyCreateInput {
  title: string
  address_line1: string
  address_line2?: string
  city: string
  district?: string
  postal_code: string
  country_code: string
  latitude?: number
  longitude?: number
  property_type: 'apartment' | 'house' | 'studio' | 'shared_room' | 'other'
  area_sqm: number
  rent_price_monthly: number
  deposit_amount: number
  bedrooms: number
  living_rooms: number
  bathrooms: number
  floor_level?: number
  total_floors?: number
  year_built?: number
  description_text: string
  furnishing_status?: string
  amenities?: string[]
  rules?: string[]
  available_date: string
  images?: File[]
  videos?: File[]
}

export interface PropertyUpdateInput extends Partial<PropertyCreateInput> {
  status?: 'vacant' | 'rented' | 'under_maintenance' | 'pending_approval' | 'delisted'
}

export interface PropertyListParams {
  keyword?: string
  area_code?: string
  property_type?: string
  bedrooms?: number
  living_rooms?: number
  min_rent?: number
  max_rent?: number
  min_area?: number
  max_area?: number
  status?: string
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

export const propertiesApi = {
  list: async (params?: PropertyListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/properties?${queryString}` : '/properties'
    return api.get<PaginatedResponse<PropertyType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<PropertyType>(`/properties/${id}`)
  },

  create: async (data: PropertyCreateInput) => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
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

    return api.post<PropertyType>('/properties', formData, {
      headers: {
        // Let the browser set the Content-Type with boundary
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  update: async (id: number, data: PropertyUpdateInput) => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
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

    return api.put<PropertyType>(`/properties/${id}`, formData, {
      headers: {
        // Let the browser set the Content-Type with boundary
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  delete: async (id: number) => {
    return api.delete(`/properties/${id}`)
  },

  updateStatus: async (id: number, status: PropertyType['status'], reason?: string) => {
    return api.put<PropertyType>(`/properties/${id}/status`, {
      status,
      reason,
    })
  },

  uploadMedia: async (propertyId: number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    return api.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteMedia: async (propertyId: number, imageId: number) => {
    return api.delete(`/properties/${propertyId}/images/${imageId}`)
  },
} 