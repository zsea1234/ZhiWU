import { API_BASE_URL } from '@/lib/constants';

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  lease_id?: number;
  tenant_id: number;
  description: string;
  preferred_contact_time?: string;
  status: string;
  assigned_worker_name?: string;
  worker_contact_info?: string;
  resolution_notes?: string;
  submitted_at: string;
  updated_at: string;
  completed_at?: string;
  tenant_info?: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  property_summary?: {
    id: number;
    title: string;
    address_line1: string;
    city: string;
    district: string;
    property_type: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  total_pages: number;
  total_items: number;
}

export interface MaintenanceRequestUpdate {
  status?: string;
  assigned_worker_name?: string;
  worker_contact_info?: string;
  resolution_notes?: string;
}

export const maintenanceService = {
  // 获取维修请求列表
  async getMaintenanceRequests(params?: {
    property_id?: number;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<MaintenanceRequest>> {
    const queryParams = new URLSearchParams();
    if (params?.property_id) queryParams.append('property_id', params.property_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const response = await fetch(`${API_BASE_URL}/maintenance-requests?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取维修请求列表失败');
    }

    return response.json();
  },

  // 获取单个维修请求详情
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest> {
    const response = await fetch(`${API_BASE_URL}/maintenance-requests/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取维修请求详情失败');
    }

    return response.json();
  },

  // 更新维修请求状态
  async updateMaintenanceRequest(id: number, data: MaintenanceRequestUpdate): Promise<MaintenanceRequest> {
    const response = await fetch(`${API_BASE_URL}/maintenance-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('更新维修请求失败');
    }

    return response.json();
  },
}; 