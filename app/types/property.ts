// 房源相关类型定义
export interface Property {
  id: number
  landlord_id: number
  title: string
  address_line1: string
  address_line2?: string
  city: string
  district: string
  postal_code: string
  country_code: string
  latitude: number
  longitude: number
  property_type: string
  area_sqm: number
  rent_price_monthly: number
  deposit_amount: number
  bedrooms: number
  living_rooms: number
  bathrooms: number
  floor_level: number
  total_floors: number
  year_built: number
  description_text: string
  furnishing_status: string
  amenities: string[]
  rules: string[]
  available_date: string
  status: string
  is_verified_by_admin: boolean
  view_count: number
  admin_notes?: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  deleted_at?: string
  landlord_info?: {
    id: number
    username: string
    email: string
    phone?: string
  }
}

export interface PaginatedProperties {
  items: Property[]
  total: number
  page: number
  pages: number
  per_page: number
}

export interface PropertyFilters {
  status?: string
  verification_status?: string
  address_keyword?: string
  page?: number
  page_size?: number
}

export interface PropertyMedia {
  id: number
  url: string
  thumbnail_url?: string
  media_type: 'image' | 'video'
  description?: string
  uploaded_at: string
} 