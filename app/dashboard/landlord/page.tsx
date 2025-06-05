"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  MessageSquare,
  FileText,
  CreditCard,
  Settings,
  Plus,
  Users,
  TrendingUp,
  AlertCircle,
  Send,
  X,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Wrench,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Property } from '../../types/property'
import { propertyApi } from '../../services/api/properties'
import { useToast } from "@/components/ui/use-toast"
import { maintenanceApi, MaintenanceType } from "@/app/services/api/maintenance"

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  sent_at: string
  is_read_by_receiver: boolean
  sender?: {
    id: number
    username: string
  }
  receiver?: {
    id: number
    username: string
  }
}

interface Booking {
  booking_id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  requested_datetime: string
  notes_for_landlord: string | null
  landlord_notes: string | null
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED_BY_LANDLORD' | 'CANCELLED_BY_LANDLORD'
  created_at: string
  updated_at: string
  is_deleted: boolean
  landlord?: {
    id: number
    username: string
    phone: string
  }
}

interface LeaseInfo {
  id: number;
  property_id: number;
  tenant_id: number;
  landlord_id: number;
  start_date: string;
  end_date: string;
  monthly_rent_amount: string;
  deposit_amount: string;
  status: 'draft' | 'pending_tenant_signature' | 'pending_landlord_signature' | 'active' | 'expired' | 'terminated_early' | 'payment_due';
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  created_at: string;
  updated_at: string;
  additional_terms: string | null;
  contract_document_url: string | null;
  payment_due_day_of_month: number;
  termination_date: string | null;
  termination_reason: string | null;
  landlord_info: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  tenant_info: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  property_summary: {
    id: number;
    title: string;
    address_line1: string;
    city: string;
    district: string;
    property_type: string;
    area_sqm: number;
    bedrooms: number;
    bathrooms: number;
  };
}

interface ContractPreview {
  isOpen: boolean
  contractUrl: string
  tenant: string
  property: string
  contractData?: ContractData
}

interface ContractData {
  contractNumber: string
  startDate: string
  endDate: string
  monthlyRent: string
  deposit: string
  paymentMethod: string
  terms: string[]
  signatures: {
    landlord: string
    tenant: string
    date: string
  }
}

interface DeleteDialog {
  isOpen: boolean
  propertyId: number | null
  propertyTitle: string
}

interface EditLeaseDialog {
  isOpen: boolean;
  lease: LeaseInfo | null;
}

export default function LandlordDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [selectedChat, setSelectedChat] = useState<Message | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [leases, setLeases] = useState<LeaseInfo[]>([])
  const [contractPreview, setContractPreview] = useState<ContractPreview>({
    isOpen: false,
    contractUrl: "",
    tenant: "",
    property: ""
  })
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ""
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProperty, setNewProperty] = useState({
    title: '',
    address_line1: '',
    city: '',
    property_type: '',
    area_sqm: '',
    rent_price_monthly: '',
    bedrooms: '',
    description_text: '',
    amenities: [] as string[],
    rules: [] as string[],
    available_date: ''
  })
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [isLoadingLeases, setIsLoadingLeases] = useState(true)
  const [selectedLease, setSelectedLease] = useState<LeaseInfo | null>(null)
  const [editLeaseDialog, setEditLeaseDialog] = useState<EditLeaseDialog>({
    isOpen: false,
    lease: null
  });
  const [editedLease, setEditedLease] = useState({
    start_date: '',
    end_date: '',
    monthly_rent_amount: '',
    deposit_amount: '',
    additional_terms: '',
    payment_due_day_of_month: 1,
    status: 'draft' as 'draft' | 'pending_tenant_signature' | 'pending_landlord_signature' | 'active' | 'expired' | 'terminated_early' | 'payment_due'
  });
  const [requests, setRequests] = useState<MaintenanceType[]>([])
  const [maintenanceLoading, setMaintenanceLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  useEffect(() => {
    // 从localStorage获取用户信息
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo)
        console.log('User info loaded:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse user info:', error)
      }
    } else {
      console.log('No user info found in localStorage')
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchProperties();
      fetchPendingBookings();
      fetchMaintenanceRequests();
      fetchUnreadCount();
    }
  }, [user?.id])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      console.log('Current user:', user)
      const url = 'http://localhost:5001/api/v1/properties/search?landlord_id=' + user.id + '&status=vacant'
      console.log('Fetching properties from URL:', url)
      const dataResponse = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        mode: 'cors'
      })
      if (!dataResponse.ok) {
        throw new Error('Failed to fetch properties')
      }
      const data = await dataResponse.json()
      console.log('Properties fetched successfully:', data)
      setProperties(data.data.properties)
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = (bookingId: number) => {
    setBookings(bookings.map(booking =>
      booking.booking_id === bookingId
        ? { ...booking, status: 'CONFIRMED_BY_LANDLORD' }
        : booking
    ))
  }

  const handleCancelBooking = (bookingId: number) => {
    setBookings(bookings.map(booking =>
      booking.booking_id === bookingId
        ? { ...booking, status: 'CANCELLED_BY_LANDLORD' }
        : booking
    ))
  }

  const handleViewContract = (lease: LeaseInfo) => {
    if (lease.status === 'draft') {
      // 如果是草稿状态，打开编辑对话框
      setEditLeaseDialog({
        isOpen: true,
        lease: lease
      });
      setEditedLease({
        start_date: lease.start_date.split('T')[0], // 确保日期格式正确
        end_date: lease.end_date.split('T')[0], // 确保日期格式正确
        monthly_rent_amount: parseFloat(lease.monthly_rent_amount).toFixed(2),
        deposit_amount: parseFloat(lease.deposit_amount).toFixed(2),
        additional_terms: lease.additional_terms || '',
        payment_due_day_of_month: lease.payment_due_day_of_month,
        status: lease.status
      });
    } else {
      // 其他状态显示合同预览
      setContractPreview({
        isOpen: true,
        contractUrl: `/api/leases/${lease.id}/contract`,
        tenant: lease.tenant_info.username,
        property: lease.property_summary.title,
        contractData: {
          contractNumber: `LEASE-${lease.id}`,
          startDate: new Date(lease.start_date).toLocaleDateString(),
          endDate: new Date(lease.end_date).toLocaleDateString(),
          monthlyRent: `¥${parseFloat(lease.monthly_rent_amount).toLocaleString()}`,
          deposit: `¥${parseFloat(lease.deposit_amount).toLocaleString()}`,
          paymentMethod: '银行转账',
          terms: [
            '租期：' + new Date(lease.start_date).toLocaleDateString() + ' 至 ' + new Date(lease.end_date).toLocaleDateString(),
            '月租金：¥' + parseFloat(lease.monthly_rent_amount).toLocaleString(),
            '押金：¥' + parseFloat(lease.deposit_amount).toLocaleString(),
            '支付方式：银行转账',
            '房屋地址：' + lease.property_summary.address_line1,
            '房屋类型：' + lease.property_summary.property_type,
            '面积：' + lease.property_summary.area_sqm + '平方米',
            '卧室数：' + lease.property_summary.bedrooms + '间',
            '卫生间数：' + lease.property_summary.bathrooms + '间'
          ],
          signatures: {
            landlord: user?.username || lease.landlord_info.username,
            tenant: lease.tenant_info.username,
            date: lease.landlord_signed_at ? new Date(lease.landlord_signed_at).toLocaleDateString() : '未签署'
          }
        }
      });
    }
  }

  const handleClosePreview = () => {
    setContractPreview(prev => ({ ...prev, isOpen: false }))
  }

  const handleDownloadContract = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDeleteProperty = async (propertyId: number) => {
    try {
      const authToken = localStorage.getItem('auth_token')
      console.log('Auth token:', authToken)
      if (!authToken) {
        toast({
          title: "Error",
          description: "Please login again",
          variant: "destructive"
        })
        return
      }
      console.log('Deleting property with ID:', propertyId)
      console.log('Request URL:', `http://localhost:5001/api/v1/properties/${propertyId}`)
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      })
      const response = await fetch(`http://localhost:5001/api/v1/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        mode: 'cors'
      })
      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)
      if (!response.ok) {
        throw new Error('Failed to delete property')
      }
      setProperties(properties.filter(p => p.id !== propertyId))
      setDeleteDialog({
        isOpen: false,
        propertyId: null,
        propertyTitle: ""
      })
      toast({
        title: "Success",
        description: "Property deleted successfully"
      })
    } catch (error) {
      console.error('Failed to delete property:', error)
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive"
      })
    }
  }

  const handleCreateProperty = async () => {
    console.log('handleCreateProperty called')
    try {
      const propertyData = {
        ...newProperty,
        area_sqm: parseFloat(newProperty.area_sqm),
        rent_price_monthly: parseFloat(newProperty.rent_price_monthly),
        bedrooms: parseInt(newProperty.bedrooms),
        postal_code: '000000',
        country_code: 'CN',
        living_rooms: 1,
        bathrooms: 1,
        deposit_amount: parseFloat(newProperty.rent_price_monthly),
      }

      const response = await fetch('http://localhost:5001/api/v1/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(propertyData),
        mode: 'cors'
      })
      if (!response.ok) {
        throw new Error('Failed to create property')
      }
      const data = await response.json()
      console.log('Property created successfully:', data)
      setCreateDialogOpen(false)
      setNewProperty({
        title: '',
        address_line1: '',
        city: '',
        property_type: '',
        area_sqm: '',
        rent_price_monthly: '',
        bedrooms: '',
        description_text: '',
        amenities: [],
        rules: [],
        available_date: ''
      })
      fetchProperties()
      toast({
        title: "Success",
        description: "Property created successfully"
      })
    } catch (error) {
      console.error('Failed to create property:', error)
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive"
      })
    }
  }

  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    if (value === 'bookings') {
      console.log('Fetching pending bookings...');
      fetchPendingBookings();
    } else if (value === 'leases') {
      console.log('Fetching leases...');
      fetchLeases();
    } else if (value === 'maintenance') {
      console.log('Fetching maintenance requests...');
      fetchMaintenanceRequests();
    } else if (value === 'messages') {
      console.log('Fetching messages...');
      // 获取未读消息数
      fetchUnreadCount();
      // 获取所有消息
      fetchAllMessages();
    }
  }

  const fetchPendingBookings = async () => {
    console.log('Starting to fetch pending bookings...');
    setIsLoadingBookings(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/bookings/landlord/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Received bookings data:', data);
      
      if (response.ok) {
        const bookings = data.data.items || [];
        console.log('Setting pending bookings:', bookings);
        setPendingBookings(bookings);
        toast({
          title: "Success",
          description: `获取到 ${bookings.length} 条预约记录`
        });
      } else {
        console.error('Failed to fetch bookings:', data);
        toast({
          title: "Error",
          description: data.message || "获取预约列表失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast({
        title: "Error",
        description: "获取预约列表时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBookings(false);
      console.log('Finished fetching pending bookings');
    }
  }

  const handleBookingStatus = async (bookingId: number, status: 'CONFIRMED_BY_LANDLORD' | 'CANCELLED_BY_LANDLORD') => {
    console.log('handleBookingStatus called with:', { bookingId, status });
    
    if (!bookingId) {
      console.error('Invalid bookingId:', bookingId);
      toast({
        title: "Error",
        description: "无效的预约ID",
        variant: "destructive"
      });
      return;
    }

    // 将状态转换为后端期望的格式
    const statusMap = {
      'CONFIRMED_BY_LANDLORD': 'confirmed_by_landlord',
      'CANCELLED_BY_LANDLORD': 'cancelled_by_landlord'
    };

    try {
      const url = `http://localhost:5001/api/v1/bookings/${bookingId}/status`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: statusMap[status] })
      });

      console.log('Status update response:', response.status);
      const data = await response.json();
      console.log('Status update data:', data);

      if (response.ok) {
        toast({
          title: "Success",
          description: status === 'CONFIRMED_BY_LANDLORD' ? "预约已确认" : "预约已取消"
        });
        // 刷新预约列表
        fetchPendingBookings();
      } else {
        throw new Error(data.message || '更新预约状态失败');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "更新预约状态失败",
        variant: "destructive"
      });
    }
  }

  const fetchLeases = async () => {
    console.log('=== 开始获取租约列表 ===');
    setIsLoadingLeases(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/leases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('租约列表响应状态:', response.status);
      const data = await response.json();
      console.log('租约列表数据:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        const leases = data.data.items || [];
        console.log('解析后的租约列表:', JSON.stringify(leases, null, 2));
        setLeases(leases);
        toast({
          title: "Success",
          description: `获取到 ${leases.length} 条租约记录`
        });
      } else {
        console.error('获取租约列表失败:', data);
        toast({
          title: "Error",
          description: data.message || "获取租约列表失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取租约列表时发生错误:', error);
      toast({
        title: "Error",
        description: "获取租约列表时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLeases(false);
      console.log('=== 完成获取租约列表 ===');
    }
  }

  const handleSignLease = async (leaseId: number) => {
    console.log('handleSignLease called with leaseId:', leaseId);
    
    if (!leaseId) {
      console.error('Invalid leaseId:', leaseId);
      toast({
        title: "Error",
        description: "无效的租约ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = `http://localhost:5001/api/v1/leases/${leaseId}/sign`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      console.log('Sign lease response:', response.status);
      const data = await response.json();
      console.log('Sign lease data:', data);

      if (response.ok) {
        toast({
          title: "Success",
          description: "租约签署成功"
        });
        // 刷新租约列表
        fetchLeases();
      } else {
        throw new Error(data.message || '签署租约失败');
      }
    } catch (error) {
      console.error('Error signing lease:', error);
      toast({
        title: "Error",
        description: "签署租约失败",
        variant: "destructive"
      });
    }
  }

  const handleTerminateLease = async (leaseId: number) => {
    console.log('handleTerminateLease called with leaseId:', leaseId);
    
    if (!leaseId) {
      console.error('Invalid leaseId:', leaseId);
      toast({
        title: "Error",
        description: "无效的租约ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = `http://localhost:5001/api/v1/leases/${leaseId}`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status: 'terminated' })
      });

      console.log('Terminate lease response:', response.status);
      const data = await response.json();
      console.log('Terminate lease data:', data);

      if (response.ok) {
        toast({
          title: "Success",
          description: "租约已终止"
        });
        // 刷新租约列表
        fetchLeases();
      } else {
        throw new Error(data.message || '终止租约失败');
      }
    } catch (error) {
      console.error('Error terminating lease:', error);
      toast({
        title: "Error",
        description: "终止租约失败",
        variant: "destructive"
      });
    }
  }

  const handleEditLease = async () => {
    if (!editLeaseDialog.lease) return;

    try {
      console.log('=== 开始编辑租约 ===');
      console.log('租约ID:', editLeaseDialog.lease.id);
      console.log('原始租约数据:', {
        id: editLeaseDialog.lease.id,
        status: editLeaseDialog.lease.status,
        additional_terms: editLeaseDialog.lease.additional_terms,
        landlord_signed_at: editLeaseDialog.lease.landlord_signed_at,
        tenant_signed_at: editLeaseDialog.lease.tenant_signed_at
      });
      console.log('编辑后的租约数据:', {
        status: editedLease.status,
        additional_terms: editedLease.additional_terms
      });

      // 检查租约状态
      if (editLeaseDialog.lease.status !== 'draft') {
        console.error('只能编辑草稿状态的租约');
        toast({
          title: "Error",
          description: "只能编辑草稿状态的租约",
          variant: "destructive"
        });
        return;
      }

      // 直接发送状态和附加条款
      const formattedData = {
        status: 'pending_tenant_signature', // 固定为待租客签署状态
        additional_terms: editedLease.additional_terms || null
      };

      console.log('=== 发送到后端的数据 ===');
      console.log('请求URL:', `http://localhost:5001/api/v1/leases/${editLeaseDialog.lease.id}`);
      console.log('请求方法:', 'PUT');
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      });
      console.log('请求体:', JSON.stringify(formattedData, null, 2));

      const response = await fetch(`http://localhost:5001/api/v1/leases/${editLeaseDialog.lease.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formattedData)
      });

      console.log('=== 后端响应 ===');
      console.log('响应状态码:', response.status);
      console.log('响应头:', Object.fromEntries(response.headers.entries()));

      const responseData = await response.json();
      console.log('响应数据:', JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        console.log('=== 错误详情 ===');
        if (responseData.errors) {
          console.log('验证错误:', JSON.stringify(responseData.errors, null, 2));
          const validationErrors = Object.entries(responseData.errors as Record<string, string[]>)
            .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          throw new Error(`验证错误:\n${validationErrors}`);
        }
        throw new Error(responseData.message || 'Failed to update lease');
      }

      // 验证响应数据中的状态是否正确更新
      if (responseData.data?.status !== 'pending_tenant_signature') {
        console.error('状态更新失败:', {
          expected: 'pending_tenant_signature',
          actual: responseData.data?.status
        });
        throw new Error('租约状态更新失败');
      }

      console.log('=== 更新成功 ===');
      console.log('更新后的租约数据:', JSON.stringify(responseData, null, 2));

      toast({
        title: "Success",
        description: "租约更新成功"
      });

      // 刷新租约列表
      console.log('=== 刷新租约列表 ===');
      await fetchLeases();
      
      // 关闭编辑对话框
      setEditLeaseDialog({ isOpen: false, lease: null });
    } catch (error) {
      console.error('=== 错误详情 ===');
      console.error('错误名称:', error instanceof Error ? error.name : 'Unknown');
      console.error('错误信息:', error instanceof Error ? error.message : 'Unknown error');
      console.error('错误堆栈:', error instanceof Error ? error.stack : undefined);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "更新租约失败",
        variant: "destructive"
      });
    }
  };

  const fetchMaintenanceRequests = async () => {
    console.log('=== 开始获取维修请求列表 ===');
    try {
      setMaintenanceLoading(true)
      
      // 作为房东，我们只需要获取维修请求列表
      const response = await maintenanceApi.list({
        page: 1,
        page_size: 10
      })
      
      console.log('API响应:', response);
      
      // 检查响应格式
      if (!response?.data?.items) {
        console.error('API响应格式不正确:', response);
        throw new Error('获取维修请求列表失败')
      }

      // 设置维修请求列表
      setRequests(response.data.items)
      
      // 显示成功消息
      toast({
        title: "Success",
        description: `获取到 ${response.data.items.length} 条维修请求`
      })

    } catch (error) {
      console.error('获取维修请求列表失败:', error);
      setRequests([])
      toast({
        title: "Error",
        description: "获取维修请求列表失败，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setMaintenanceLoading(false)
      console.log('=== 完成获取维修请求列表 ===');
    }
  }

  const handleRequestStatusChange = async (id: number, newStatus: MaintenanceType['status']) => {
    try {
      // 根据不同的状态执行不同的操作
      const updateData = {
        status: newStatus,
        ...(newStatus === 'assigned_to_worker' && {
          assigned_worker_name: '维修工人',
          worker_contact_info: '13800138000'
        }),
        ...(newStatus === 'completed' && {
          resolution_notes: '维修已完成'
        }),
        ...(newStatus === 'closed_by_landlord' && {
          resolution_notes: '维修请求已关闭'
        })
      }

      // 发送更新请求
      const response = await maintenanceApi.update(id, updateData)
      
      // 更新本地状态
      setRequests((prevRequests: MaintenanceType[]) => 
        prevRequests.map((request: MaintenanceType) => 
          request.id === id ? {
            ...request,
            ...updateData,  // 使用更新数据更新状态
            property_summary: request.property_summary,  // 保留原有的房产信息
            tenant_info: request.tenant_info  // 保留原有的租客信息
          } : request
        )
      )
      
      // 显示成功消息
      toast({
        title: "Success",
        description: "维修请求状态更新成功"
      })

      // 重新获取维修请求列表以确保数据同步
      await fetchMaintenanceRequests()
    } catch (error) {
      console.error('更新维修请求状态失败:', error)
      toast({
        title: "Error",
        description: "更新维修请求状态失败",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_assignment: "secondary",
      assigned_to_worker: "default",
      in_progress: "default",
      completed: "secondary",
      cancelled_by_tenant: "destructive",
      closed_by_landlord: "secondary",
    } as const

    const labels = {
      pending_assignment: "待分配",
      assigned_to_worker: "已分配",
      in_progress: "处理中",
      completed: "已完成",
      cancelled_by_tenant: "已取消",
      closed_by_landlord: "已关闭",
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "secondary"}
        className="px-3 py-1 text-sm font-medium"
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  // 获取未读消息数
  const fetchUnreadCount = async () => {
    console.log('=== 开始获取未读消息数 ===');
    try {
      console.log('发送请求到:', 'http://localhost:5001/api/v1/messages/unread-count');
      const response = await fetch('http://localhost:5001/api/v1/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('响应状态:', response.status);
      if (!response.ok) {
        throw new Error('获取未读消息数失败');
      }
      
      const data = await response.json();
      console.log('获取到的未读消息数:', data);
      setUnreadCount(data.data.unread_count);
    } catch (error) {
      console.error('获取未读消息数失败:', error);
      toast({
        title: "Error",
        description: "获取未读消息数失败",
        variant: "destructive"
      });
    }
    console.log('=== 完成获取未读消息数 ===');
  };

  // 获取对话历史
  const fetchMessages = async (userId: number) => {
    console.log('=== 开始获取消息历史 ===');
    console.log('目标用户ID:', userId);
    setIsLoadingMessages(true);
    try {
      const url = `http://localhost:5001/api/v1/messages?chat_with_user_id=${userId}`;
      console.log('发送请求到:', url);
      console.log('请求头:', {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('响应状态:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('错误响应:', errorData);
        throw new Error(`获取消息历史失败: ${errorData.message || '未知错误'}`);
      }
      
      const data = await response.json();
      console.log('获取到的消息列表:', data);
      
      if (data.data) {
        setMessages(data.data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('获取消息历史失败:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "获取消息历史失败",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
    console.log('=== 完成获取消息历史 ===');
  };

  // 发送消息
  const sendMessage = async () => {
    console.log('=== 开始发送消息 ===');
    if (!messageInput.trim() || !selectedChatUserId) {
      console.log('消息为空或未选择接收者，取消发送');
      return;
    }

    console.log('发送消息到用户:', selectedChatUserId);
    console.log('消息内容:', messageInput.trim());

    try {
      const requestBody = {
        receiver_id: selectedChatUserId,
        content: messageInput.trim()
      };
      console.log('请求体:', requestBody);

      const response = await fetch('http://localhost:5001/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('响应状态:', response.status);
      if (!response.ok) {
        throw new Error('发送消息失败');
      }
      
      const data = await response.json();
      console.log('发送成功，返回数据:', data);
      setMessages(prev => [data.data, ...prev]);
      setMessageInput("");
      
      // 刷新未读消息数
      console.log('刷新未读消息数...');
      await fetchUnreadCount();
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        title: "Error",
        description: "发送消息失败",
        variant: "destructive"
      });
    }
    console.log('=== 完成发送消息 ===');
  };

  // 在组件加载时获取未读消息数
  useEffect(() => {
    console.log('=== 组件加载 ===');
    if (user?.id) {
      console.log('当前用户ID:', user.id);
      fetchUnreadCount();
    } else {
      console.log('未检测到用户信息');
    }
  }, [user?.id]);

  // 在消息列表渲染时添加调试信息
  const renderMessages = () => {
    console.log('=== 渲染消息列表 ===');
    console.log('当前消息列表:', messages);
    console.log('选中的聊天用户ID:', selectedChatUserId);
    console.log('未读消息数:', unreadCount);
    
    return messages
      .filter(message => 
        (message.sender_id === user?.id && message.receiver_id === selectedChatUserId) ||
        (message.sender_id === selectedChatUserId && message.receiver_id === user?.id)
      )
      .map((message) => {
        console.log('渲染消息:', message);
        return (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_id === user?.id
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              <p className="font-medium">{message.sender?.username || '未知用户'}</p>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.sent_at).toLocaleString()}
              </p>
            </div>
          </div>
        );
      });
  };

  // 获取所有消息
  const fetchAllMessages = async () => {
    console.log('=== 开始获取所有消息 ===');
    try {
      // 获取所有租约信息
      const leasesUrl = 'http://localhost:5001/api/v1/leases';
      console.log('获取租约列表，发送请求到:', leasesUrl);
      
      const leasesResponse = await fetch(leasesUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('租约列表响应状态:', leasesResponse.status);
      if (!leasesResponse.ok) {
        throw new Error('获取租约列表失败');
      }
      
      const leasesData = await leasesResponse.json();
      console.log('获取到的租约列表:', leasesData);
      
      if (leasesData.data && leasesData.data.length > 0) {
        // 使用第一个租约的租客作为默认对话用户
        const firstLease = leasesData.data[0];
        console.log('选择第一个租约的租客作为对话用户:', firstLease.tenant_info);
        setSelectedChatUserId(firstLease.tenant_info.id);
        
        // 获取与该租客的对话历史
        const messagesUrl = `http://localhost:5001/api/v1/messages?chat_with_user_id=${firstLease.tenant_info.id}`;
        console.log('获取消息历史，发送请求到:', messagesUrl);
        
        const messagesResponse = await fetch(messagesUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        console.log('消息历史响应状态:', messagesResponse.status);
        if (!messagesResponse.ok) {
          const errorData = await messagesResponse.json();
          console.error('错误响应:', errorData);
          throw new Error(`获取消息历史失败: ${errorData.message || '未知错误'}`);
        }
        
        const messagesData = await messagesResponse.json();
        console.log('获取到的消息列表:', messagesData);
        
        if (messagesData.data) {
          setMessages(messagesData.data);
        } else {
          setMessages([]);
        }
      } else {
        console.log('没有找到租约');
        setMessages([]);
      }
    } catch (error) {
      console.error('获取消息列表失败:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "获取消息列表失败",
        variant: "destructive"
      });
    }
    console.log('=== 完成获取所有消息 ===');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">智屋</span>
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              房东
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">欢迎，{user.username}</span>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">房东控制台</h1>
          <p className="text-gray-600">管理您的房源和租赁业务</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">房源总数</p>
                  <p className="text-2xl font-bold">{properties.length}</p>
                </div>
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已出租</p>
                  <p className="text-2xl font-bold text-green-600">{properties.filter(p => p.status === 'rented').length}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">月收入</p>
                  <p className="text-2xl font-bold text-green-600">¥{properties.reduce((total, property) => total + property.rent_price_monthly, 0)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingBookings.length + requests.filter(request => request.status !== 'completed').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="properties">房源管理</TabsTrigger>
            <TabsTrigger value="bookings">预约管理</TabsTrigger>
            <TabsTrigger value="leases">租约管理</TabsTrigger>
            <TabsTrigger value="maintenance">维修管理</TabsTrigger>
            <TabsTrigger value="messages">消息中心</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>房源概览</CardTitle>
                  <CardDescription>您的房源出租情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">加载中...</p>
                      </div>
                    ) : properties.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">暂无房源</p>
                      </div>
                    ) : (
                      properties.map((property) => (
                        <div key={property.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-sm text-gray-600">¥{property.rent_price_monthly}/月</p>
                          </div>
                          <Badge variant={property.status === "rented" ? "default" : "secondary"}>
                            {property.status === "rented" ? "已出租" : "空置"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/dashboard/landlord/properties/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      发布新房源
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>待处理事项 <span className="ml-2 text-orange-600">{pendingBookings.length + requests.filter(request => request.status !== 'completed').length}</span></CardTitle>
                  <CardDescription>需要您关注的事项</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <>
                      {[
                        ...pendingBookings.map(booking => ({
                          type: "预约",
                          content: `${booking.landlord?.username || '未知租客'} 预约看房 - ${new Date(booking.requested_datetime).toLocaleString()}`,
                          urgent: booking.status === 'PENDING_CONFIRMATION'
                        })),
                        ...requests.filter(request => request.status !== 'completed').map(request => ({
                          type: "维修",
                          content: `${request.tenant_info?.username || '未知租客'} 申请维修: ${request.description}`,
                          urgent: request.status === 'pending_assignment'
                        }))
                      ].map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <Badge variant={item.urgent ? "destructive" : "secondary"} className="mt-1">
                            {item.type}
                          </Badge>
                          <p className="text-sm flex-1">{item.content}</p>
                        </div>
                      ))}
                    </>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">房源管理</h2>
                  <p className="text-gray-600">管理您发布的所有房源</p>
                </div>
                <Link href="/dashboard/landlord/properties/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    发布新房源
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">加载中...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无房源</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={property.main_image_url || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          variant={
                            property.status === "rented"
                              ? "default"
                              : property.status === "vacant"
                                ? "secondary"
                                : "destructive"
                          }
                          className="absolute top-2 right-2"
                        >
                          {property.status === "rented" ? "已出租" : "空置"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>{property.address_line1}</p>
                          <div className="flex justify-between">
                            <span>{property.area_sqm}㎡</span>
                            <span>{property.bedrooms}室</span>
                            <span className="text-green-600 font-medium">¥{property.rent_price_monthly}/月</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(property.amenities) ? property.amenities : []).slice(0, 3).map((amenity: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {(Array.isArray(property.amenities) ? property.amenities : []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(Array.isArray(property.amenities) ? property.amenities : []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteDialog({
                                isOpen: true,
                                propertyId: property.id,
                                propertyTitle: property.title
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </Button>
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm">
                              查看详情
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>预约看房</CardTitle>
                  <CardDescription>待处理的看房预约</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">加载中...</span>
                    </div>
                  ) : pendingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待处理预约</h3>
                      <p className="text-gray-500">当有租客预约看房时，预约信息将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBookings.map((booking) => (
                        <div key={booking.booking_id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">预约时间：{new Date(booking.requested_datetime).toLocaleString()}</p>
                            <p className="text-sm text-gray-600">租客备注：{booking.notes_for_landlord || '无'}</p>
                            <p className="text-sm text-gray-500">创建时间：{new Date(booking.created_at).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                console.log('Confirm button clicked for booking:', booking);
                                handleBookingStatus(booking.booking_id, 'CONFIRMED_BY_LANDLORD');
                              }}
                            >
                              确认预约
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                console.log('Cancel button clicked for booking:', booking);
                                handleBookingStatus(booking.booking_id, 'CANCELLED_BY_LANDLORD');
                              }}
                            >
                              取消预约
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>预约统计</CardTitle>
                  <CardDescription>本周预约情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: '待确认预约', status: 'PENDING_CONFIRMATION' },
                      { label: '已确认预约', status: 'CONFIRMED_BY_LANDLORD' },
                      { label: '已取消预约', status: 'CANCELLED_BY_LANDLORD' }
                    ].map((item) => (
                      <div key={`stat-${item.status}`} className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">{item.label}</p>
                        <p className="font-medium">
                          {pendingBookings.filter(b => b.status === item.status).length}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leases">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>当前租约</CardTitle>
                  <CardDescription>待房东签署的合同</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLeases ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">加载中...</span>
                    </div>
                  ) : leases.filter(lease => lease.status === 'pending_landlord_signature').length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待签署合同</h3>
                      <p className="text-gray-500">当有新的待签署合同时，将显示在这里</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leases.filter(lease => lease.status === 'pending_landlord_signature').map((lease) => (
                        <div key={lease.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{lease.tenant_info.username}</p>
                              <p className="text-sm text-gray-600">{lease.property_summary.title}</p>
                              <p className="text-sm text-gray-500">
                                租期：{new Date(lease.start_date).toLocaleDateString()} 至 {new Date(lease.end_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                状态：待房东签署
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="font-medium text-green-600">¥{parseFloat(lease.monthly_rent_amount).toLocaleString()}/月</p>
                              <div className="flex gap-2">
                                {!lease.landlord_signed_at && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSignLease(lease.id)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    签署合同
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>即将到期</CardTitle>
                  <CardDescription>30天内到期的租约</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leases
                      .filter(lease => {
                        const endDate = new Date(lease.end_date)
                        const today = new Date()
                        const diffTime = endDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 30 && diffDays > 0
                      })
                      .map((lease) => {
                        const endDate = new Date(lease.end_date)
                        const today = new Date()
                        const diffTime = endDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        
                        return (
                          <div key={lease.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{lease.tenant_info.username}</p>
                              <p className="text-sm text-gray-600">{lease.property_summary.title}</p>
                              <p className="text-sm text-gray-500">到期日：{endDate.toLocaleDateString()}</p>
                            </div>
                            <Badge variant="destructive">剩余 {diffDays} 天</Badge>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>收入概览</CardTitle>
                  <CardDescription>本月收入情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">总租金收入</p>
                      <p className="font-medium text-green-600">¥{properties.reduce((total, property) => total + property.rent_price_monthly, 0)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">已收租金</p>
                      <p className="font-medium text-green-600">¥{properties.reduce((total, property) => total + property.rent_price_monthly, 0)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">待收租金</p>
                      <p className="font-medium text-orange-600">¥{properties.reduce((total, property) => total + property.rent_price_monthly, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>收入明细</CardTitle>
                  <CardDescription>最近收入记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tenant: "张三", property: "朝阳区幸福小区", amount: "¥5,000", date: "2024-03-01", status: "已收款" },
                      { tenant: "李四", property: "西城区金融街", amount: "¥8,000", date: "2024-03-01", status: "已收款" },
                      { tenant: "王五", property: "海淀区学院路", amount: "¥2,000", date: "2024-03-15", status: "待收款" },
                    ].map((income, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{income.tenant}</p>
                          <p className="text-sm text-gray-600">{income.property}</p>
                          <p className="text-sm text-gray-500">{income.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{income.amount}</p>
                          <Badge variant={income.status === "已收款" ? "default" : "secondary"}>
                            {income.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>维修申请</CardTitle>
                  <CardDescription>待处理的维修请求</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">加载中...</span>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <Wrench className="h-12 w-12 text-gray-400 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无维修请求</h3>
                        <p className="text-gray-500">当有租客提交维修请求时，将显示在这里</p>
                      </div>
                    ) : (
                      requests
                        .filter(request => request.status !== 'completed')
                        .map((request: MaintenanceType) => (
                          <Card key={request.id} className="mb-4">
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="text-lg font-semibold">维修请求</h3>
                                  <p className="text-sm text-gray-500">
                                    提交时间: {new Date(request.submitted_at).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    request.status === 'pending_assignment' ? 'default' :
                                    request.status === 'assigned_to_worker' ? 'secondary' :
                                    request.status === 'in_progress' ? 'secondary' :
                                    request.status === 'completed' ? 'default' :
                                    'destructive'
                                  }>
                                    {request.status === 'pending_assignment' ? '待处理' :
                                     request.status === 'assigned_to_worker' ? '已分配工人' :
                                     request.status === 'in_progress' ? '维修中' :
                                     request.status === 'completed' ? '已完成' :
                                     '已关闭'}
                                  </Badge>
                                  {request.status === 'completed' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => {
                                        setRequests(prevRequests => 
                                          prevRequests.filter(r => r.id !== request.id)
                                        )
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">房产信息</h4>
                                  <p className="text-sm text-gray-600">
                                    {request.property_summary?.title || '未知房源'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">租客信息</h4>
                                  <p className="text-sm text-gray-600">
                                    {request.tenant_info?.username || '未知租客'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">问题描述</h4>
                                  <p className="text-sm text-gray-600">{request.description}</p>
                                </div>
                                {request.assigned_worker_name && (
                                  <div>
                                    <h4 className="font-medium mb-2">维修工人</h4>
                                    <p className="text-sm text-gray-600">
                                      {request.assigned_worker_name} ({request.worker_contact_info})
                                    </p>
                                  </div>
                                )}
                                {request.resolution_notes && (
                                  <div>
                                    <h4 className="font-medium mb-2">处理结果</h4>
                                    <p className="text-sm text-gray-600">{request.resolution_notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <div className="flex gap-2">
                                {request.status === 'pending_assignment' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequestStatusChange(request.id, 'assigned_to_worker')}
                                  >
                                    分配工人
                                  </Button>
                                )}
                                {request.status === 'assigned_to_worker' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequestStatusChange(request.id, 'in_progress')}
                                  >
                                    开始维修
                                  </Button>
                                )}
                                {request.status === 'in_progress' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequestStatusChange(request.id, 'completed')}
                                  >
                                    完成维修
                                  </Button>
                                )}
                                {request.status === 'completed' && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequestStatusChange(request.id, 'closed_by_landlord')}
                                  >
                                    关闭请求
                                  </Button>
                                )}
                                {request.status === 'pending_assignment' && (
                                  <Button
                                    variant="outline"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleRequestStatusChange(request.id, 'closed_by_landlord')}
                                  >
                                    关闭请求
                                  </Button>
                                )}
                              </div>
                            </CardFooter>
                          </Card>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>维修统计</CardTitle>
                  <CardDescription>维修请求统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: '待处理', status: 'pending_assignment' },
                      { label: '处理中', status: 'in_progress' },
                      { label: '已完成', status: 'completed' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="font-medium">
                          {requests.filter(r => r.status === stat.status).length}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>未读消息 <span className="ml-2 text-red-500">{unreadCount}</span></CardTitle>
                  <CardDescription>需要您回复的消息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">暂无消息</p>
                      </div>
                    ) : (
                      messages
                        .filter(message => !message.is_read_by_receiver && message.receiver_id === user?.id)
                        .map((message) => {
                          console.log('渲染未读消息:', message);
                          return (
                            <div
                              key={message.id}
                              className={`flex justify-between items-start p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedChatUserId === message.sender_id ? "bg-gray-100" : ""
                              }`}
                              onClick={() => {
                                console.log('点击未读消息，发送者ID:', message.sender_id);
                                fetchMessages(message.sender_id);
                              }}
                            >
                              <div>
                                <p className="font-medium">{message.sender?.username || '未知用户'}</p>
                                <p className="text-sm text-gray-600">{message.content}</p>
                                <p className="text-sm text-gray-500">{new Date(message.sent_at).toLocaleString()}</p>
                              </div>
                              <Badge variant="default">未读</Badge>
                            </div>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>消息历史</CardTitle>
                  <CardDescription>最近的对话记录</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChatUserId ? (
                    <div className="flex flex-col h-[500px]">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {isLoadingMessages ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">暂无消息记录</p>
                          </div>
                        ) : (
                          renderMessages()
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => {
                            console.log('输入消息:', e.target.value);
                            setMessageInput(e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              console.log('按回车发送消息');
                              sendMessage();
                            }
                          }}
                          placeholder="输入消息..."
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          onClick={() => {
                            console.log('点击发送按钮');
                            sendMessage();
                          }}
                          disabled={!messageInput.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          发送
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      请选择一条消息开始对话
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contract Preview Modal */}
      {contractPreview.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[90%] h-[90%] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">合同预览</h3>
                <p className="text-sm text-gray-600">
                  {contractPreview.tenant} - {contractPreview.property}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadContract(contractPreview.contractUrl)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-auto">
              {contractPreview.contractData ? (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-4">房屋租赁合同</h1>
                    <p className="text-gray-600">合同编号：{contractPreview.contractData.contractNumber}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">出租方（甲方）</p>
                        <p className="text-gray-600">李兴</p>
                      </div>
                      <div>
                        <p className="font-medium">承租方（乙方）</p>
                        <p className="text-gray-600">{contractPreview.tenant}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">房屋信息</p>
                      <p className="text-gray-600">{contractPreview.property}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">租期</p>
                        <p className="text-gray-600">
                          {contractPreview.contractData.startDate} 至 {contractPreview.contractData.endDate}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">月租金</p>
                        <p className="text-gray-600">{contractPreview.contractData.monthlyRent}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">押金</p>
                        <p className="text-gray-600">{contractPreview.contractData.deposit}</p>
                      </div>
                      <div>
                        <p className="font-medium">支付方式</p>
                        <p className="text-gray-600">{contractPreview.contractData.paymentMethod}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">合同条款</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        {contractPreview.contractData.terms.map((term, index) => (
                          <li key={index}>{term}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                      <div>
                        <p className="font-medium">甲方签字</p>
                        <p className="text-gray-600">{contractPreview.contractData.signatures.landlord}</p>
                      </div>
                      <div>
                        <p className="font-medium">乙方签字</p>
                        <p className="text-gray-600">{contractPreview.contractData.signatures.tenant}</p>
                      </div>
                    </div>

                    <div className="text-center text-gray-600 mt-4">
                      签署日期：{contractPreview.contractData.signatures.date}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">加载中...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p>确定要删除这个房源吗？此操作不可撤销。</p>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({
                isOpen: false,
                propertyId: null,
                propertyTitle: ""
              })}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.propertyId && handleDeleteProperty(deleteDialog.propertyId)}
            >
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lease Dialog */}
      <Dialog open={editLeaseDialog.isOpen} onOpenChange={(open) => setEditLeaseDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑租约</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">合同状态</label>
              <div className="mt-1 p-2 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">
                  {(() => {
                    const status = editLeaseDialog.lease?.status;
                    if (!status) return '未知状态';
                    
                    const statusMap = {
                      'draft': '草稿',
                      'pending_tenant_signature': '待租客签署',
                      'pending_landlord_signature': '待房东签署',
                      'active': '生效中',
                      'expired': '已过期',
                      'terminated_early': '提前终止',
                      'payment_due': '待付款'
                    };
                    
                    return statusMap[status] || '未知状态';
                  })()}
                </p>
                {editLeaseDialog.lease?.status === 'draft' && (
                  <p className="text-sm text-blue-600 mt-1">
                    保存后将变为"待租客签署"状态
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">开始日期</label>
                <Input
                  type="date"
                  value={editedLease.start_date}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">结束日期</label>
                <Input
                  type="date"
                  value={editedLease.end_date}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">月租金</label>
                <Input
                  type="number"
                  value={editedLease.monthly_rent_amount}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">押金</label>
                <Input
                  type="number"
                  value={editedLease.deposit_amount}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">每月付款日</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={editedLease.payment_due_day_of_month}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">附加条款</label>
              <Textarea
                value={editedLease.additional_terms}
                onChange={(e) => setEditedLease(prev => ({ ...prev, additional_terms: e.target.value }))}
                placeholder="输入附加条款..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                {editLeaseDialog.lease?.status === 'draft' ? 
                  '您可以修改附加条款，保存后将变为待租客签署状态' : 
                  '您可以修改附加条款，其他信息创建后不可更改'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditLeaseDialog({ isOpen: false, lease: null })}
            >
              取消
            </Button>
            <Button 
              onClick={handleEditLease}
              disabled={editLeaseDialog.lease?.status !== 'draft'}
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 