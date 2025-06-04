import { api } from './client'
import { setAuthToken, setAuthUser, removeAuthToken, removeAuthUser } from './config'

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
    setAuthToken(response.access_token)
    setAuthUser(response.user)
    return response
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    setAuthToken(response.access_token)
    setAuthUser(response.user)
    return response
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      removeAuthToken()
      removeAuthUser()
    }
  },

  getCurrentUser: async () => {
    return api.get('/users/me')
  },

  updateProfile: async (data: {
    email?: string
    phone?: string
    current_password?: string
    new_password?: string
    enable_mfa?: boolean
  }) => {
    return api.put('/users/me', data)
  },

  setupMFA: async () => {
    return api.post('/auth/mfa/setup')
  },

  verifyMFA: async (otpCode: string) => {
    return api.post('/auth/mfa/verify', { otp_code: otpCode })
  },
} 