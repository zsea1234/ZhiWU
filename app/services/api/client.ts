import { API_CONFIG, getAuthToken } from './config'

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse(response: Response) {
  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'An error occurred',
      data
    )
  }

  return data
}

export async function apiClient<T>(
  endpoint: string,
  { body, ...customConfig }: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers = {
    ...API_CONFIG.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  }

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, config)
    return handleResponse(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error')
  }
}

export const api = {
  get: <T>(endpoint: string, config?: RequestInit) =>
    apiClient<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, config?: RequestInit) =>
    apiClient<T>(endpoint, { ...config, method: 'POST', body: data }),

  put: <T>(endpoint: string, data?: any, config?: RequestInit) =>
    apiClient<T>(endpoint, { ...config, method: 'PUT', body: data }),

  delete: <T>(endpoint: string, config?: RequestInit) =>
    apiClient<T>(endpoint, { ...config, method: 'DELETE' }),
} 