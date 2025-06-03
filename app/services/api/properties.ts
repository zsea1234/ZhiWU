import { api } from './client'
import { Property } from "@/types/property"

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

export interface PropertySearchParams {
  keyword?: string
  min_price?: number
  max_price?: number
  property_type?: string
  city?: string
  district?: string
  min_area?: number
  max_area?: number
  amenities?: string[]
  status?: string
  landlord_id?: number
  page?: number
  per_page?: number
}

export interface PropertyCreateData {
  title: string
  address_line1: string
  address_line2?: string
  city: string
  district?: string
  postal_code: string
  country_code: string
  latitude?: number
  longitude?: number
  property_type: string
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
  amenities: string[]
  rules: string[]
  available_date: string
  images?: File[]
  videos?: File[]
}

export interface PropertyUpdateData extends Partial<PropertyCreateData> {
  status?: 'vacant' | 'rented' | 'under_maintenance' | 'pending_approval' | 'delisted'
}

export interface PropertySearchResponse {
  properties: Property[]
  total: number
  pages: number
  current_page: number
  per_page: number
}

export const propertyApi = {
  // 搜索房源
  search: async (params: PropertySearchParams): Promise<PropertySearchResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.min_price) queryParams.append('min_price', params.min_price.toString())
    if (params.max_price) queryParams.append('max_price', params.max_price.toString())
    if (params.property_type) queryParams.append('property_type', params.property_type)
    if (params.city) queryParams.append('city', params.city)
    if (params.district) queryParams.append('district', params.district)
    if (params.min_area) queryParams.append('min_area', params.min_area.toString())
    if (params.max_area) queryParams.append('max_area', params.max_area.toString())
    if (params.amenities) params.amenities.forEach(a => queryParams.append('amenities', a))
    if (params.status) queryParams.append('status', params.status)
    if (params.landlord_id) queryParams.append('landlord_id', params.landlord_id.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())

    const response = await fetch(`/api/properties/search?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch properties')
    }
    const data = await response.json()
    return data.data
  },

  // 获取房源详情
  getDetail: async (propertyId: number): Promise<Property> => {
    const response = await fetch(`/api/properties/${propertyId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch property detail')
    }
    const data = await response.json()
    return data.data
  },

  // 创建房源
  createProperty: async (propertyData: PropertyCreateData): Promise<Property> => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(propertyData).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })

    // Add files
    if (propertyData.images) {
      propertyData.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    if (propertyData.videos) {
      propertyData.videos.forEach((file) => {
        formData.append('videos', file)
      })
    }

    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to create property')
    }
    const data = await response.json()
    return data.data
  },

  // 更新房源
  updateProperty: async (propertyId: number, propertyData: PropertyUpdateData): Promise<Property> => {
    const formData = new FormData()
    
    // Add all text fields
    Object.entries(propertyData).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'videos') {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })

    // Add files
    if (propertyData.images) {
      propertyData.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    if (propertyData.videos) {
      propertyData.videos.forEach((file) => {
        formData.append('videos', file)
      })
    }

    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to update property')
    }
    const data = await response.json()
    return data.data
  },

  // 删除房源
  deleteProperty: async (propertyId: number): Promise<void> => {
    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to delete property')
    }
  },

  // 上传房源媒体文件
  uploadMedia: async (propertyId: number, files: File[], descriptions?: string[]): Promise<any> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append('files', file)
      if (descriptions && descriptions[index]) {
        formData.append('descriptions', descriptions[index])
      }
    })

    const response = await fetch(`/api/properties/${propertyId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })
    if (!response.ok) {
      throw new Error('Failed to upload media')
    }
    const data = await response.json()
    return data.data
  }
} 