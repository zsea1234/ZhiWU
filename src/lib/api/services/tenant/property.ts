import api from './api';

export interface PropertySearchParams {
  keyword?: string;
  area_code?: string;
  property_type?: string;
  bedrooms?: number;
  living_rooms?: number;
  min_rent?: number;
  max_rent?: number;
  min_area?: number;
  max_area?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface PropertySummary {
  id: number;
  title: string;
  address_summary: string;
  property_type: string;
  area_sqm: number;
  rent_price_monthly: number;
  bedrooms: number;
  living_rooms: number;
  main_image_url: string | null;
  status: string;
}

export interface PropertyDetail extends PropertySummary {
  address_line1: string;
  address_line2?: string;
  city: string;
  district?: string;
  postal_code: string;
  country_code: string;
  latitude?: number;
  longitude?: number;
  bathrooms: number;
  floor_level?: number;
  total_floors?: number;
  year_built?: number;
  description_text: string;
  furnishing_status?: string;
  amenities?: string[];
  rules?: string[];
  available_date: string;
  deposit_amount: number;
  landlord_id: number;
  landlord_info: {
    id: number;
    username: string;
    role: string;
  };
  is_verified_by_admin: boolean;
  view_count: number;
  media_files: {
    id: number;
    url: string;
    thumbnail_url?: string;
    media_type: 'image' | 'video';
    description?: string;
    uploaded_at: string;
  }[];
  surrounding_environment_info?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPropertyResponse {
  data: PropertySummary[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ViewingRequestInput {
  requested_datetime: string;
  notes_for_landlord?: string;
}

export interface ViewingRequestResponse {
  id: number;
  property_id: number;
  requested_datetime: string;
  notes_for_landlord?: string;
  status: string;
  tenant_info: {
    id: number;
    username: string;
    role: string;
  };
  landlord_info: {
    id: number;
    username: string;
    role: string;
  };
  property_summary: PropertySummary;
  created_at: string;
  updated_at: string;
}

export const propertyService = {
  searchProperties: async (params: PropertySearchParams): Promise<PaginatedPropertyResponse> => {
    const response = await api.get<PaginatedPropertyResponse>('/properties', { params });
    return response.data;
  },

  getPropertyById: async (id: number): Promise<PropertyDetail> => {
    const response = await api.get<PropertyDetail>(`/properties/${id}`);
    return response.data;
  },

  createViewingRequest: async (propertyId: number, data: ViewingRequestInput): Promise<ViewingRequestResponse> => {
    const response = await api.post<ViewingRequestResponse>(`/bookings`, {
      property_id: propertyId,
      ...data
    });
    return response.data;
  }
};