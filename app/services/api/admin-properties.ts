import { api } from './client'
import { Property, PaginatedProperties, PropertyFilters } from '../../types/property'

export interface AdminPropertyFilters {
  landlord_id?: number
  status?: string
  address_keyword?: string
  is_verified?: boolean
}

export interface AdminPropertyUpdateData {
  is_verified_by_admin: boolean
  verification_notes?: string
}

export interface PropertyVerificationData {
  is_verified_by_admin: boolean
  admin_notes: string
}

export const adminPropertiesApi = {
  getAllProperties: async (params: PropertyFilters = {}): Promise<PaginatedProperties> => {
    try {
      console.log('开始获取房源列表，当前筛选条件:', params)
      const response = await api.get('/admin/properties', { params })
      console.log('获取到的房源数据:', response.data)
      return response.data
    } catch (error) {
      console.error('获取房源列表失败:', error)
      throw error
    }
  },

  verifyProperty: async (id: number, data: PropertyVerificationData): Promise<Property> => {
    try {
      console.log('开始验证房源:', id, '验证数据:', data)
      const response = await api.put(`/admin/properties/${id}/verify`, data)
      console.log('验证房源响应:', response.data)
      return response.data
    } catch (error) {
      console.error('验证房源失败:', error)
      throw error
    }
  }
} 