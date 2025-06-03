export interface Property {
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
  status: 'vacant' | 'rented' | 'under_maintenance' | 'pending_approval' | 'delisted'
  landlord_id: number
  created_at: string
  updated_at: string
  is_deleted: boolean
  view_count: number
  main_image_url?: string
  media?: PropertyMedia[]
  landlord?: {
    id: number
    username: string
    phone: string
    is_verified: boolean
  }
}

export interface PropertyMedia {
  id: number
  property_id: number
  file_url: string
  thumbnail_url?: string
  media_type: string
  description?: string
  sort_order: number
  created_at: string
  updated_at: string
} 