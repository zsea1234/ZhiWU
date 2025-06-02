import  api  from './api';

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  lease_id?: number;
  description: string;
  preferred_contact_time?: string;
  status: 'pending_assignment' | 'assigned_to_worker' | 'in_progress' | 'completed' | 'cancelled_by_tenant' | 'closed_by_landlord';
  tenant_id: number;
  tenant_info: {
    id: number;
    username: string;
    role: string;
  };
  landlord_id: number;
  property_summary: {
    id: number;
    title: string;
    address_summary: string;
    property_type: string;
    area_sqm: number;
    rent_price_monthly: number;
    bedrooms: number;
    living_rooms: number;
    main_image_url?: string;
    status: string;
  };
  submitted_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MaintenanceRequestCreateInput {
  property_id: number;
  lease_id?: number;
  description: string;
  preferred_contact_time?: string;
}

export interface MaintenanceRequestUpdateInput {
  status: 'pending_assignment' | 'assigned_to_worker' | 'in_progress' | 'completed' | 'cancelled_by_tenant' | 'closed_by_landlord';
  assigned_worker_name?: string;
  worker_contact_info?: string;
  resolution_notes?: string;
}

export interface PaginatedMaintenanceRequestResponse {
  data: MaintenanceRequest[];
  links: {
    first: string | null;
    last: string | null;
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

export const maintenanceService = {
  // 获取维修申请列表
  getMaintenanceRequests: async (params?: {
    property_id?: number;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedMaintenanceRequestResponse> => {
    const response = await api.get('/maintenance-requests', { params });
    return response.data as PaginatedMaintenanceRequestResponse;
  },

  // 获取单个维修申请详情
  getMaintenanceRequest: async (requestId: number): Promise<MaintenanceRequest> => {
    const response = await api.get(`/maintenance-requests/${requestId}`);
    return response.data as MaintenanceRequest;
  },

  // 提交维修申请
  createMaintenanceRequest: async (data: MaintenanceRequestCreateInput): Promise<MaintenanceRequest> => {
    const response = await api.post('/maintenance-requests', data);
    return response.data as MaintenanceRequest;
  },

  // 更新维修申请状态
  updateMaintenanceRequest: async (
    requestId: number,
    data: MaintenanceRequestUpdateInput
  ): Promise<MaintenanceRequest> => {
    const response = await api.put(`/maintenance-requests/${requestId}`, data);
    return response.data as MaintenanceRequest;
  }
}; 