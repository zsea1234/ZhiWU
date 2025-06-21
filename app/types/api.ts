export interface UserData {
  id: number
  username: string
  email: string
  phone: string
  role: 'tenant' | 'landlord' | 'admin'
  is_active: boolean
  mfa_enabled: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  leases_as_tenant_count?: number
  leases_as_landlord_count?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
} 