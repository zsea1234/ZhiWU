/**
 * 房源状态类型
 */
export type PropertyStatus = 'available' | 'rented' | 'pending' | 'maintenance' | 'inactive';

/**
 * 房源类型
 */
export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'commercial' | 'other';

/**
 * 房源朝向
 */
export type PropertyOrientation = 'east' | 'west' | 'south' | 'north' | 'southeast' | 'southwest' | 'northeast' | 'northwest';

/**
 * 房源租赁类型
 */
export type RentalType = 'whole' | 'shared' | 'room';

/**
 * 房源设施类型
 */
export interface PropertyAmenity {
  id: string;
  name: string;
  category: 'basic' | 'kitchen' | 'bathroom' | 'bedroom' | 'entertainment' | 'safety' | 'other';
}

/**
 * 房源模型
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  landlord_id: string;
  status: PropertyStatus;
  type: PropertyType;
  rental_type: RentalType;
  price: number;
  deposit: number;
  area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  orientation: PropertyOrientation;
  floor: number;
  total_floors: number;
  has_elevator: boolean;
  build_year?: number;
  address: string;
  city: string;
  district: string;
  province: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  amenities: string[]; // 设施ID列表
  images: PropertyImage[];
  videos?: PropertyVideo[];
  virtual_tour_url?: string;
  available_from: string;
  minimum_lease_months: number;
  maximum_lease_months?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 房源图片
 */
export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  order: number;
  created_at: string;
}

/**
 * 房源视频
 */
export interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  caption?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  created_at: string;
}

/**
 * 房源创建请求
 */
export interface PropertyCreateInput {
  title: string;
  description: string;
  type: PropertyType;
  rental_type: RentalType;
  price: number;
  deposit: number;
  area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  orientation: PropertyOrientation;
  floor: number;
  total_floors: number;
  has_elevator: boolean;
  build_year?: number;
  address: string;
  city: string;
  district: string;
  province: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  available_from: string;
  minimum_lease_months: number;
  maximum_lease_months?: number;
}

/**
 * 房源更新请求
 */
export interface PropertyUpdateInput extends Partial<PropertyCreateInput> {
  status?: PropertyStatus;
} 