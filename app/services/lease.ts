export interface LeaseSummary {
    id: number;
    property_id: number;
    tenant_id: number;
    start_date: string;
    end_date: string;
    monthly_rent_amount: number;
    deposit_amount: number;
    payment_due_day_of_month: number;
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
    tenant_signed_at: string | null;
    landlord_signed_at: string | null;
    contract_document_url: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface PaginatedLeaseResponse {
    data: LeaseSummary[];
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
  
  export async function getLeases(page: number = 1, pageSize: number = 10): Promise<PaginatedLeaseResponse> {
    const response = await fetch(`/api/v1/leases?page=${page}&page_size=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('获取租约列表失败');
    }
  
    return response.json();
  }