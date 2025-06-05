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
  console.log('API响应状态:', response.status)
  const data = await response.json()
  console.log('API响应数据:', data)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'Something went wrong',
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
  console.log('API请求端点:', endpoint)
  console.log('认证token:', token ? '存在' : '不存在')

  const headers = {
    ...API_CONFIG.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  }
  console.log('请求头:', headers)

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers,
    mode: 'cors',
  }

  if (body) {
    config.body = JSON.stringify(body)
    console.log('请求体:', body)
  }

  try {
    const url = `${API_CONFIG.baseURL}${endpoint}`
    console.log('完整请求URL:', url)
    console.log('请求配置:', config)

    const response = await fetch(url, config)
    return handleResponse(response)
  } catch (error) {
    console.error('API请求错误:', error)
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