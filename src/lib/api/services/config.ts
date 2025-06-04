export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const AUTH_TOKEN_KEY = 'auth_token'
export const AUTH_USER_KEY = 'auth_user'

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }
  return null
}

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export const getAuthUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(AUTH_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

export const setAuthUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

export const removeAuthUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USER_KEY)
  }
} 