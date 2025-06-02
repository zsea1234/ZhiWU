import { api } from './client'

export interface IncomeType {
  id: number
  lease_id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  amount: number
  type: 'rent' | 'deposit' | 'fee' | 'other'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  payment_method?: string
  transaction_id?: string
  description?: string
  created_at: string
  updated_at: string
  property: {
    id: number
    title: string
    address_line1: string
    city: string
  }
  tenant: {
    id: number
    name: string
    email: string
  }
}

export interface IncomeCreateInput {
  lease_id: number
  amount: number
  type: IncomeType['type']
  due_date: string
  description?: string
}

export interface IncomeUpdateInput {
  status?: IncomeType['status']
  amount?: number
  due_date?: string
  paid_date?: string
  payment_method?: string
  transaction_id?: string
  description?: string
}

export interface IncomeListParams {
  property_id?: number
  tenant_id?: number
  landlord_id?: number
  type?: IncomeType['type']
  status?: IncomeType['status']
  start_date?: string
  end_date?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface IncomeSummary {
  total_income: number
  total_pending: number
  total_overdue: number
  by_type: {
    rent: number
    deposit: number
    fee: number
    other: number
  }
  by_status: {
    pending: number
    paid: number
    overdue: number
    cancelled: number
  }
  by_month: {
    month: string
    amount: number
  }[]
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export const incomeApi = {
  list: async (params?: IncomeListParams) => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const queryString = queryParams.toString()
    const endpoint = queryString ? `/income?${queryString}` : '/income'
    return api.get<PaginatedResponse<IncomeType>>(endpoint)
  },

  get: async (id: number) => {
    return api.get<IncomeType>(`/income/${id}`)
  },

  create: async (data: IncomeCreateInput) => {
    return api.post<IncomeType>('/income', data)
  },

  update: async (id: number, data: IncomeUpdateInput) => {
    return api.put<IncomeType>(`/income/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/income/${id}`)
  },

  markAsPaid: async (id: number, data: { paid_date: string; payment_method: string; transaction_id?: string }) => {
    return api.put<IncomeType>(`/income/${id}/mark-paid`, data)
  },

  markAsOverdue: async (id: number) => {
    return api.put<IncomeType>(`/income/${id}/mark-overdue`)
  },

  cancel: async (id: number, reason: string) => {
    return api.put<IncomeType>(`/income/${id}/cancel`, { reason })
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
    const endpoint = queryString ? `/income/summary?${queryString}` : '/income/summary'
    return api.get<IncomeSummary>(endpoint)
  },
} 