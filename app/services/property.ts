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

export const propertyService = {
  searchProperties: async (params: PropertySearchParams): Promise<PaginatedPropertyResponse> => {
    const response = await api.get<PaginatedPropertyResponse>('/properties', { params });
    return response.data;
  },

  getPropertyById: async (id: number): Promise<PropertySummary> => {
    const response = await api.get<PropertySummary>(`/properties/${id}`);
    return response.data;
  }
};