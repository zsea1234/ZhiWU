import { api } from './client'

export interface MaintenanceType {
  id: number
  property_id: number
  lease_id?: number
  tenant_id: number
  description: string
  preferred_contact_time?: string
  status: 'pending_assignment' | 'assigned_to_worker' | 'in_progress' | 'completed' | 'cancelled_by_tenant' | 'closed_by_landlord'
  assigned_worker_name?: string
  worker_contact_info?: string
  resolution_notes?: string
  submitted_at: string
  updated_at: string
  completed_at?: string
  tenant_info?: {
    id: number
    username: string
    email: string
    phone: string
  }
  property_summary?: {
    id: number
    title: string
    address_line1: string
    city: string
    district: string
    property_type: string
  }
}

export interface MaintenanceCreateInput {
  property_id: number
  lease_id?: number
  description: string
  preferred_contact_time?: string
}

export interface MaintenanceUpdateInput {
  status?: MaintenanceType['status']
  assigned_worker_name?: string
  worker_contact_info?: string
  resolution_notes?: string
}

export interface MaintenanceListParams {
  property_id?: number
  tenant_id?: number
  landlord_id?: number
  status?: MaintenanceType['status']
  start_date?: string
  end_date?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface MaintenanceSummary {
  total_requests: number
  by_status: {
    pending: number
    in_progress: number
    completed: number
    cancelled: number
  }
  by_priority: {
    low: number
    medium: number
    high: number
    emergency: number
  }
  by_type: {
    repair: number
    replacement: number
    inspection: number
    cleaning: number
    other: number
  }
  average_completion_time: number
  total_cost: number
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    page: number;
    total_pages: number;
    total_items: number;
    links?: {
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
    meta?: {
      current_page: number;
      from: number | null;
      last_page: number;
      path: string;
      per_page: number;
      to: number | null;
      total: number;
    };
  };
  message: string;
  success: boolean;
}

export const maintenanceApi = {
  list: async (params?: MaintenanceListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/maintenance-requests?${queryString}` : '/maintenance-requests'
    return api.get<PaginatedResponse<MaintenanceType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<MaintenanceType>(`/maintenance-requests/${id}`)
  },

  create: async (data: MaintenanceCreateInput) => {
    return api.post<MaintenanceType>('/maintenance-requests', data)
  },

  update: async (id: number, data: MaintenanceUpdateInput) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/maintenance-requests/${id}`)
  },

  assignWorker: async (id: number, workerName: string, contactInfo: string) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}/assign-worker`, {
      assigned_worker_name: workerName,
      worker_contact_info: contactInfo
    })
  },

  startWork: async (id: number) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}/start-work`)
  },

  complete: async (id: number, resolutionNotes?: string) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}/complete`, {
      resolution_notes: resolutionNotes
    })
  },

  cancel: async (id: number) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}/cancel`)
  },

  close: async (id: number, resolutionNotes?: string) => {
    return api.put<MaintenanceType>(`/maintenance-requests/${id}/close`, {
      resolution_notes: resolutionNotes
    })
  },

  getSummary: async (params?: { start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/maintenance/summary?${queryString}` : '/maintenance/summary'
    return api.get<MaintenanceSummary>(endpoint)
  },
} 