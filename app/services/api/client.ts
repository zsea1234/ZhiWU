import axios from 'axios'

const baseURL = 'http://localhost:5001/api/v1'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server returned an error response
      console.error('API response error:', error.response.status, error.response.data)
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Request failed
      console.error('API request error:', error.request)
      return Promise.reject(new Error('Network error'))
    } else {
      // Other errors
      console.error('API error:', error.message)
      return Promise.reject(error)
    }
  }
) 