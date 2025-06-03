export interface BookingSummary {
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
    property_summary: {
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
    };
    created_at: string;
    updated_at: string;
  }
  
  export interface PaginatedBookingResponse {
    data: BookingSummary[];
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
  
  export async function getBookings(page: number = 1, pageSize: number = 10): Promise<PaginatedBookingResponse> {
    const response = await fetch(`/api/v1/bookings?page=${page}&page_size=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('获取预约列表失败');
    }
  
    return response.json();
  }