import { api } from './client'
import { setAuthToken, setAuthUser, removeAuthToken, removeAuthUser, getAuthToken } from './config'
import { UserData, ApiResponse } from '@/app/types/api'

export interface LoginInput {
  username_or_email: string
  password: string
}

export interface RegisterInput {
  username: string
  password: string
  email: string
  phone: string
  role: 'tenant' | 'landlord'
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: {
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
  }
  mfa_required: boolean
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    setAuthToken(response.data.access_token)
    setAuthUser(response.data.user)
    return response.data
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    setAuthToken(response.data.access_token)
    setAuthUser(response.data.user)
    return response.data
  },

  logout: async (): Promise<void> => {
    const token = getAuthToken()
    if (!token) {
      console.warn('No auth token found during logout')
      return
    }

    try {
      await api.post('/auth/logout', null)
    } finally {
      removeAuthToken()
      removeAuthUser()
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_info')
    }
  },

  getCurrentUser: async () => {
    return api.get<ApiResponse<UserData>>('/users/me')
  },

  updateProfile: async (data: {
    email?: string
    phone?: string
    current_password?: string
    new_password?: string
    enable_mfa?: boolean
  }) => {
    return api.put<ApiResponse<UserData>>('/users/me', data)
  },

  setupMFA: async () => {
    return api.post('/auth/mfa/setup')
  },

  verifyMFA: async (otpCode: string) => {
    return api.post('/auth/mfa/verify', { otp_code: otpCode })
  },
} 