"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  MessageSquare,
  FileText,
  Calendar,
  Wrench,
  AlertCircle,
  Send,
  X,
  Download,
  Loader2,
  Plus,
  Bell,
  CheckCircle,
  Clock,
  Settings,
  MapPin,
  Eye,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

// 接口定义
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
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED_BY_LANDLORD' | 'CANCELLED_BY_TENANT' | 'CANCELLED_BY_LANDLORD' | 'COMPLETED' | 'EXPIRED'
  created_at: string
  updated_at: string
  property?: {
    id: number
    title: string
    address_line1: string
    city: string
  }
  landlord?: {
    username: string
    phone: string
  }
}

interface LeaseInfo {
  id: number
  property_id: number
  tenant_id: number
  landlord_id: number
  start_date: string
  end_date: string
  monthly_rent_amount: string
  deposit_amount: string
  status: 'draft' | 'pending_tenant_signature' | 'pending_landlord_signature' | 'active' | 'expired' | 'terminated_early' | 'payment_due'
  landlord_signed_at: string | null
  tenant_signed_at: string | null
  created_at: string
  updated_at: string
  additional_terms: string | null
  contract_document_url: string | null
  payment_due_day_of_month: number
  termination_date: string | null
  termination_reason: string | null
  landlord_info: {
    id: number
    username: string
    email: string
    phone: string
  }
  property_summary: {
    id: number
    title: string
    address_line1: string
    city: string
    district: string
    property_type: string
    area_sqm: number
    bedrooms: number
    bathrooms: number
  }
}

interface MaintenanceRequest {
  id: number
  property_id: number
  tenant_id: number
  description: string
  status: 'PENDING_ASSIGNMENT' | 'ASSIGNED_TO_WORKER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_TENANT' | 'CLOSED_BY_LANDLORD'
  created_at: string
  updated_at: string
  completed_at: string | null
  assigned_worker_name: string | null
  worker_contact_info: string | null
  resolution_notes: string | null
  property_summary: {
    id: number
    title: string
    address_line1: string
    city: string
    district: string
    property_type: string
  }
}

interface ContractPreview {
  isOpen: boolean
  contractUrl: string
  landlord: string
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

export default function TenantDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [selectedChat, setSelectedChat] = useState<Message | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [leases, setLeases] = useState<LeaseInfo[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [contractPreview, setContractPreview] = useState<ContractPreview>({
    isOpen: false,
    contractUrl: "",
    landlord: "",
    property: ""
  })
  const [loading, setLoading] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [isLoadingLeases, setIsLoadingLeases] = useState(true)
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true)
  const [selectedLease, setSelectedLease] = useState<LeaseInfo | null>(null)
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    property_id: 0,
    description: '',
    preferred_contact_time: ''
  })
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState<MaintenanceRequest | null>(null)
  const [maintenanceDetailDialogOpen, setMaintenanceDetailDialogOpen] = useState(false)
  const [userProperties, setUserProperties] = useState<Array<{id: number, title: string}>>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedChatUser, setSelectedChatUser] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatUsers, setChatUsers] = useState<{id: number, username: string}[]>([])
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<{id: number, username: string} | null>(null)
  const [isLoadingChatUsers, setIsLoadingChatUsers] = useState(false)
  const [createLeaseDialogOpen, setCreateLeaseDialogOpen] = useState(false)
  const [selectedBookingForLease, setSelectedBookingForLease] = useState<Booking | null>(null)
  const [newLeaseData, setNewLeaseData] = useState({
    start_date: '',
    end_date: '',
    monthly_rent_amount: '',
    deposit_amount: '',
    additional_terms: '',
    payment_due_day_of_month: 1
  })

  // 统计数据
  const stats = {
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    activeLeases: Array.isArray(leases) ? leases.filter(l => l.status === 'active').length : 0,
    pendingMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter(m => m.status === 'PENDING_ASSIGNMENT').length : 0,
    unreadMessages: unreadCount
  }

  useEffect(() => {
    // 检查认证
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // 获取用户信息
    const userInfo = localStorage.getItem("user_info")
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }

    // 获取数据
    fetchBookings()
    fetchLeases()
    fetchMaintenanceRequests()
    fetchUserProperties()

    // 在组件加载时获取当前用户信息
    const userInfoStr = localStorage.getItem('user_info')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      setCurrentUser({
        id: userInfo.id,
        username: userInfo.username
      })
    }
  }, [router])

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      console.log('Fetching bookings with token:', token)
      
      const response = await fetch('http://localhost:5001/api/v1/bookings/tenant', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Bookings response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Error response:', errorData)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Bookings response data:', data)
      
      if (data.success && data.data && data.data.items) {
        const formattedBookings = data.data.items.map((booking: any) => ({
          ...booking,
          status: booking.status.toUpperCase()
        }))
        console.log('Formatted bookings:', formattedBookings)
        setBookings(formattedBookings)
      } else {
        console.error('Invalid data format:', data)
        setBookings([])
        toast({
          title: "错误",
          description: "预约数据格式错误",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取预约列表失败",
        variant: "destructive"
      })
      setBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const fetchLeases = async () => {
    try {
      setIsLoadingLeases(true)
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/auth/login')
        return
      }
  
      const response = await fetch('http://localhost:5001/api/v1/leases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        localStorage.removeItem('user_role')
        router.push('/auth/login')
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setLeases(Array.isArray(data.data.items) ? data.data.items : [])
    } catch (error) {
      console.error('Error fetching leases:', error)
      toast({
        title: "错误",
        description: "获取租赁合同列表失败",
        variant: "destructive"
      })
      setLeases([])
    } finally {
      setIsLoadingLeases(false)
    }
  }

  const fetchMaintenanceRequests = async () => {
    try {
      setIsLoadingMaintenance(true)
      const token = localStorage.getItem('auth_token')
      console.log('开始获取维修申请列表，token:', token)
      
      const response = await fetch('http://localhost:5001/api/v1/maintenance-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('API响应状态:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API返回数据:', data)
      
      if (data.success && data.data && data.data.items) {
        setMaintenanceRequests(data.data.items)
      } else {
        console.error('无效的数据格式:', data)
        setMaintenanceRequests([])
        toast({
          title: "错误",
          description: "获取维修申请列表失败",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('获取维修申请列表错误:', error)
      toast({
        title: "错误",
        description: "获取维修申请列表失败",
        variant: "destructive"
      })
      setMaintenanceRequests([])
    } finally {
      setIsLoadingMaintenance(false)
    }
  }

  const fetchUserProperties = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast({
          title: "提示",
          description: "请先登录后再提交维修申请",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('http://localhost:5001/api/v1/leases?status=active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          // 没有活跃租约的情况
          toast({
            title: "提示",
            description: "您当前没有租住的房源，请先租房后再提交维修申请",
            variant: "default"
          })
          return
        }
        throw new Error('获取房源列表失败')
      }

      const data = await response.json()
      if (data.success && data.data && data.data.items) {
        const properties = data.data.items.map((lease: any) => ({
          id: lease.property_summary.id,
          title: lease.property_summary.title
        }))
        setUserProperties(properties)
        
        if (properties.length === 0) {
          toast({
            title: "提示",
            description: "您当前没有租住的房源，请先租房后再提交维修申请",
            variant: "default"
          })
        }
      }
    } catch (error) {
      console.error('获取房源列表错误:', error)
      // 检查是否是网络连接错误
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast({
          title: "连接错误",
          description: "无法连接到服务器，请检查网络连接或稍后重试",
          variant: "destructive"
        })
      } else {
        toast({
          title: "错误",
          description: "获取房源列表失败，请稍后重试",
          variant: "destructive"
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      'PENDING_CONFIRMATION': { label: '待确认', variant: 'warning' },
      'CONFIRMED_BY_LANDLORD': { label: '已确认', variant: 'success' },
      'CANCELLED_BY_TENANT': { label: '已取消', variant: 'destructive' },
      'CANCELLED_BY_LANDLORD': { label: '房东已取消', variant: 'destructive' },
      'COMPLETED': { label: '已完成', variant: 'secondary' },
      'EXPIRED': { label: '已过期', variant: 'secondary' }
    }

    // 如果状态不在预定义列表中，返回默认值
    const statusInfo = statusMap[status] || { label: '未知状态', variant: 'secondary' }
    
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleViewDetails = (booking: Booking) => {
    // 跳转到房源详情页
    router.push(`/dashboard/tenant/properties/${booking.property_id}`)
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: "租客取消预约"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '取消预约失败')
      }

      toast({
        title: "成功",
        description: "预约已取消"
      })
      fetchBookings() // 重新获取预约列表
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "取消预约失败",
        variant: "destructive"
      })
    }
  }

  const handleViewContract = (lease: LeaseInfo) => {
    setSelectedLease(lease)
    setContractPreview({
      isOpen: true,
      contractUrl: lease.contract_document_url || '',
      landlord: lease.landlord_info.username,
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
          landlord: lease.landlord_info.username,
          tenant: user?.username || '',
          date: lease.tenant_signed_at ? new Date(lease.tenant_signed_at).toLocaleDateString() : '未签署'
        }
      }
    })
  }

  const handleClosePreview = () => {
    setContractPreview({
      isOpen: false,
      contractUrl: "",
      landlord: "",
      property: ""
    })
  }

  const handleDownloadContract = (url: string) => {
    window.open(url, '_blank')
  }

  const handleSignLease = async (leaseId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/leases/${leaseId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signature_data: 'UserConfirmedAgreement_Timestamp'
        })
      })

      if (!response.ok) {
        throw new Error('签署合同失败')
      }

      toast({
        title: "成功",
        description: "合同已签署"
      })
      fetchLeases()
    } catch (error) {
      console.error('Error signing lease:', error)
      toast({
        title: "错误",
        description: "签署合同失败",
        variant: "destructive"
      })
    }
  }

  const handleSubmitMaintenanceRequest = async () => {
    try {
      if (!newMaintenanceRequest.property_id) {
        toast({
          title: "错误",
          description: "请选择需要维修的房源",
          variant: "destructive"
        })
        return
      }

      if (!newMaintenanceRequest.description.trim()) {
        toast({
          title: "错误",
          description: "请填写问题描述",
          variant: "destructive"
        })
        return
      }

      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/maintenance-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: newMaintenanceRequest.property_id,
          description: newMaintenanceRequest.description,
          preferred_contact_time: newMaintenanceRequest.preferred_contact_time || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || '提交维修申请失败')
      }

      toast({
        title: "成功",
        description: "维修申请已提交"
      })
      setNewMaintenanceRequest({
        property_id: 0,
        description: '',
        preferred_contact_time: ''
      })
      fetchMaintenanceRequests()
    } catch (error) {
      console.error('提交维修申请错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "提交维修申请失败",
        variant: "destructive"
      })
    }
  }

  const handleCancelMaintenanceRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/maintenance-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED_BY_TENANT'
        })
      })

      if (!response.ok) {
        throw new Error('取消维修申请失败')
      }

      toast({
        title: "成功",
        description: "维修申请已取消"
      })
      fetchMaintenanceRequests()
    } catch (error) {
      console.error('Error cancelling maintenance request:', error)
      toast({
        title: "错误",
        description: "取消维修申请失败",
        variant: "destructive"
      })
    }
  }

  // 创建租赁合同
  const handleCreateLease = async () => {
    if (!selectedBookingForLease) {
      toast({
        title: "错误",
        description: "请选择预约记录",
        variant: "destructive"
      })
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast({
          title: "错误",
          description: "请先登录",
          variant: "destructive"
        })
        return
      }

      // 验证必填字段
      if (!newLeaseData.start_date || !newLeaseData.end_date || !newLeaseData.monthly_rent_amount) {
        toast({
          title: "错误",
          description: "请填写完整的合同信息",
          variant: "destructive"
        })
        return
      }

      const leaseData = {
        property_id: selectedBookingForLease.property_id,
        tenant_id: currentUser?.id,
        start_date: newLeaseData.start_date,
        end_date: newLeaseData.end_date,
        monthly_rent_amount: parseFloat(newLeaseData.monthly_rent_amount),
        deposit_amount: parseFloat(newLeaseData.deposit_amount) || parseFloat(newLeaseData.monthly_rent_amount),
        additional_terms: newLeaseData.additional_terms || null,
        payment_due_day_of_month: newLeaseData.payment_due_day_of_month,
        status: 'pending_landlord_signature' // 明确设置为待房东签署状态
      }

      console.log('创建租赁合同数据:', leaseData)

      const response = await fetch('http://localhost:5001/api/v1/leases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaseData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '创建租赁合同失败')
      }

      const data = await response.json()
      console.log('租赁合同创建成功:', data)

      toast({
        title: "成功",
        description: "租赁合同创建成功，等待房东签署"
      })

      // 关闭对话框并重置数据
      setCreateLeaseDialogOpen(false)
      setSelectedBookingForLease(null)
      setNewLeaseData({
        start_date: '',
        end_date: '',
        monthly_rent_amount: '',
        deposit_amount: '',
        additional_terms: '',
        payment_due_day_of_month: 1
      })

      // 刷新租赁合同列表
      fetchLeases()
    } catch (error) {
      console.error('创建租赁合同错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "创建租赁合同失败",
        variant: "destructive"
      })
    }
  }

  const getMaintenanceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      'PENDING_ASSIGNMENT': { label: '待分配', variant: 'warning' },
      'ASSIGNED_TO_WORKER': { label: '已分配', variant: 'info' },
      'IN_PROGRESS': { label: '处理中', variant: 'info' },
      'COMPLETED': { label: '已完成', variant: 'success' },
      'CANCELLED_BY_TENANT': { label: '已取消', variant: 'destructive' },
      'CLOSED_BY_LANDLORD': { label: '已关闭', variant: 'secondary' }
    }

    const statusInfo = statusMap[status] || { label: '未知状态', variant: 'secondary' }
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  // 批量获取用户信息
  const fetchUsersInfo = async (userIds: number[], token: string): Promise<Array<{id: number, username: string}>> => {
    const usersInfo: Array<{id: number, username: string}> = []
    
    // 使用Promise.all并发获取用户信息，提高性能
    const userPromises = userIds.map(async (userId) => {
      try {
        const userResponse = await fetch(`http://localhost:5001/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.success && userData.data) {
            return {
              id: userData.data.id,
              username: userData.data.username
            }
          }
        }
        // 如果获取失败，返回默认信息
        return {
          id: userId,
          username: `用户${userId}`
        }
      } catch (error) {
        console.error(`获取用户${userId}信息错误:`, error)
        // 如果出错，返回默认信息
        return {
          id: userId,
          username: `用户${userId}`
        }
      }
    })
    
    const results = await Promise.all(userPromises)
    return results
  }

  // 获取聊天对象列表
  const fetchChatUsers = async () => {
    try {
      setIsLoadingChatUsers(true)
      const token = localStorage.getItem('auth_token')
      if (!token || !currentUser) {
        toast({
          title: "错误",
          description: "请先登录",
          variant: "destructive"
        })
        return
      }

      console.log('开始获取聊天用户列表...')
      console.log('当前用户:', currentUser)

      // 首先获取聊天用户ID列表
      const chatUserIdsResponse = await fetch('http://localhost:5001/api/v1/messages/chat-user-ids', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!chatUserIdsResponse.ok) {
        throw new Error('获取聊天用户ID列表失败')
      }

      const chatUserIdsData = await chatUserIdsResponse.json()
      console.log('获取到的聊天用户ID列表:', chatUserIdsData)

      if (!chatUserIdsData.success || !chatUserIdsData.data || !chatUserIdsData.data.user_ids) {
        console.log('没有聊天用户ID列表')
        setChatUsers([])
        return
      }

      const userIds = chatUserIdsData.data.user_ids
      
      // 使用批量获取用户信息函数
      const chatUsersWithDetails = await fetchUsersInfo(userIds, token)
      
      console.log('最终的聊天用户列表:', chatUsersWithDetails)
      setChatUsers(chatUsersWithDetails)

      // 如果有聊天用户，默认选择第一个
      if (chatUsersWithDetails.length > 0 && !selectedChatUser) {
        setSelectedChatUser(chatUsersWithDetails[0].id)
        fetchMessages(chatUsersWithDetails[0].id)
      }
    } catch (error) {
      console.error('获取聊天对象列表错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取聊天对象列表失败",
        variant: "destructive"
      })
      setChatUsers([])
    } finally {
      setIsLoadingChatUsers(false)
    }
  }

  // 获取消息列表
  const fetchMessages = async (userId: number) => {
    try {
      console.log('开始获取与用户', userId, '的对话消息')
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('未登录')
      }

      const url = `http://localhost:5001/api/v1/messages?chat_with_user_id=${userId}`
      console.log('请求URL:', url)
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('消息API响应状态:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('获取消息列表失败:', errorData)
        throw new Error(errorData.message || '获取消息列表失败')
      }
      
      const data = await response.json()
      console.log('获取到的对话消息数据:', data)
      
      if (data.success && data.data) {
        // 确保data.data是数组，并按时间正序排列（最新的在底部）
        const messagesList = Array.isArray(data.data) ? data.data : []
        // 后端返回的是倒序（最新的在前），我们需要反转成正序（最新的在后）
        const sortedMessages = messagesList.reverse()
        console.log('处理后的消息列表（正序）:', sortedMessages)
        setMessages(sortedMessages)
        // 更新未读消息数
        fetchUnreadCount()
      } else {
        console.error('消息数据格式错误:', data)
        setMessages([])
      }
    } catch (error) {
      console.error('获取消息列表错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取消息列表失败",
        variant: "destructive"
      })
      setMessages([])
    }
  }

  // 获取未读消息数
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('获取未读消息数失败')
      }
      
      const data = await response.json()
      console.log('未读消息数数据:', data)
      
      if (data.success && data.data && typeof data.data.unread_count === 'number') {
        setUnreadCount(data.data.unread_count)
      } else {
        console.error('未读消息数数据格式错误:', data)
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('获取未读消息数错误:', error)
      setUnreadCount(0)
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!selectedChatUser || !newMessage.trim()) {
      console.log('发送消息失败：缺少必要参数', { selectedChatUser, newMessage })
      return
    }

    try {
      console.log('开始发送消息:', {
        receiver_id: selectedChatUser,
        content: newMessage.trim()
      })

      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: selectedChatUser,
          content: newMessage.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('发送消息失败:', errorData)
        throw new Error(errorData.message || '发送消息失败')
      }

      const data = await response.json()
      console.log('发送消息成功:', data)

      if (data.success && data.data) {
        // 将新消息添加到消息列表的末尾
        setMessages(prev => [...prev, data.data])
        setNewMessage('')
        
        // 立即滚动到底部
        setTimeout(() => {
          const messagesContainer = document.getElementById('messages-container')
          if (messagesContainer) {
            messagesContainer.scrollTo({
              top: messagesContainer.scrollHeight,
              behavior: 'smooth'
            })
          }
        }, 50)
        
        // 发送成功后刷新聊天对象列表和未读消息数
        fetchChatUsers()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('发送消息错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "发送消息失败",
        variant: "destructive"
      })
    }
  }

  // 在组件加载时获取聊天对象列表和未读消息数
  useEffect(() => {
    if (currentUser) {
      console.log('组件加载，开始获取聊天对象列表')
      fetchChatUsers()
      fetchUnreadCount()
      
      // 设置定时器，每30秒刷新一次未读消息数
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
      
      // 清理定时器
      return () => clearInterval(interval)
    }
  }, [currentUser])

  // 当选择聊天对象时获取消息
  useEffect(() => {
    if (selectedChatUser) {
      console.log('选择新的聊天对象:', selectedChatUser)
      fetchMessages(selectedChatUser)
    }
  }, [selectedChatUser])

  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      const messagesContainer = document.getElementById('messages-container')
      if (messagesContainer) {
        // 使用setTimeout确保DOM更新完成后再滚动
        setTimeout(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [messages])

  // 渲染消息列表
  const renderMessages = () => {
    return messages.map((message) => {
      const isOwnMessage = message.sender_id === currentUser?.id
      const senderName = isOwnMessage ? '我' : (message.sender?.username || '未知用户')
      
      return (
        <div
          key={message.id}
          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              isOwnMessage ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <p className="font-medium text-sm text-gray-600">{senderName}</p>
            <p className="text-sm mt-1">{message.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(message.sent_at).toLocaleString()}
              {!isOwnMessage && !message.is_read_by_receiver && (
                <span className="ml-2 text-blue-500">未读</span>
              )}
            </p>
          </div>
        </div>
      )
    })
  }

  const handleLogout = () => {
    // 清除本地存储的认证信息
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_info")
    localStorage.removeItem("user_role")
    
    // 显示退出成功提示
    toast({
      title: "退出成功",
      description: "您已安全退出登录"
    })
    
    // 跳转到登录页
    router.push("/auth/login")
  }

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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              租客
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">租客中心</h1>
          <p className="text-gray-600">管理您的租房事务</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">看房预约</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已签约</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeLeases}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待处理维修</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingMaintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">未读消息</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unreadMessages}</p>
                </div>
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList>
            <TabsTrigger value="properties">
              <Home className="w-4 h-4 mr-2" />
              房源浏览
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              看房预约
            </TabsTrigger>
            <TabsTrigger value="leases">
              <FileText className="w-4 h-4 mr-2" />
              租赁合同
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="w-4 h-4 mr-2" />
              维修申请
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              消息中心
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <div className="flex justify-center items-center min-h-[400px]">
              <Button onClick={() => router.push('/dashboard/tenant/properties')}>
                <Home className="w-4 h-4 mr-2" />
                浏览房源
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">暂无预约记录</p>
                <Button onClick={() => router.push('/dashboard/tenant/properties')}>
                  去预约看房
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.booking_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{booking.property?.title || '未知房源'}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-2">
                            <MapPin className="w-4 h-4" />
                            {booking.property?.address_line1}, {booking.property?.city}
                          </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>预约时间：{new Date(booking.requested_datetime).toLocaleString()}</span>
                        </div>
                        
                        {booking.notes_for_landlord && (
                          <div>
                            <p className="text-sm font-medium">给房东的留言：</p>
                            <p className="text-sm text-gray-500">{booking.notes_for_landlord}</p>
                          </div>
                        )}

                        {booking.landlord_notes && (
                          <div>
                            <p className="text-sm font-medium">房东回复：</p>
                            <p className="text-sm text-gray-500">{booking.landlord_notes}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <p>房东：{booking.landlord?.username || '未知房东'}</p>
                            <p>联系电话：{booking.landlord?.phone || '未知电话'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              查看房源
                            </Button>
                            {booking.status === 'CONFIRMED_BY_LANDLORD' && (
                              <Button
                                variant="default"
                                onClick={() => {
                                  setSelectedBookingForLease(booking)
                                  setCreateLeaseDialogOpen(true)
                                }}
                                disabled={leases.some(lease => 
                                  lease.property_id === booking.property_id && 
                                  lease.status === 'pending_landlord_signature'
                                )}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {leases.some(lease => 
                                  lease.property_id === booking.property_id && 
                                  lease.status === 'pending_landlord_signature'
                                ) ? '已发起合同' : '发起合同'}
                              </Button>
                            )}
                            {(booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED_BY_LANDLORD') && (
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking.booking_id)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                取消预约
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leases" className="space-y-4">
            {isLoadingLeases ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : leases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">暂无租赁合同记录</p>
                <p className="text-gray-400 text-sm">您还没有签署任何租赁合同</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {leases.map((lease) => (
                  <Card key={lease.id}>
                    <CardHeader>
                      <CardTitle>{lease.property_summary.title}</CardTitle>
                      <CardDescription>
                        {lease.property_summary.address_line1}, {lease.property_summary.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>租期：{lease.start_date} 至 {lease.end_date}</p>
                          <p>月租金：¥{lease.monthly_rent_amount}</p>
                          <p>状态：{lease.status}</p>
                        </div>
                        <div className="space-x-2">
                          {lease.contract_document_url && (
                            <Button
                              variant="outline"
                              onClick={() => handleViewContract(lease)}
                            >
                              查看合同
                            </Button>
                          )}
                          {lease.status === 'pending_landlord_signature' && (
                            <Badge variant="secondary">
                              等待房东签署
                            </Badge>
                          )}
                          {lease.status === 'active' && (
                            <Badge variant="default">
                              合同生效
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">维修申请</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    添加新的维修申请
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>提交维修申请</DialogTitle>
                    <DialogDescription>
                      请填写维修申请信息，带 * 的字段为必填项。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">选择房源 *</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newMaintenanceRequest.property_id}
                        onChange={(e) => setNewMaintenanceRequest({
                          ...newMaintenanceRequest,
                          property_id: Number(e.target.value)
                        })}
                        aria-label="选择需要维修的房源"
                      >
                        <option value={0}>请选择房源</option>
                        {userProperties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">问题描述 *</label>
                      <Textarea
                        value={newMaintenanceRequest.description}
                        onChange={(e) => setNewMaintenanceRequest({
                          ...newMaintenanceRequest,
                          description: e.target.value
                        })}
                        placeholder="请详细描述需要维修的问题..."
                        aria-label="维修问题描述"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">期望联系时间</label>
                      <Input
                        value={newMaintenanceRequest.preferred_contact_time}
                        onChange={(e) => setNewMaintenanceRequest({
                          ...newMaintenanceRequest,
                          preferred_contact_time: e.target.value
                        })}
                        placeholder="例如：工作日下午"
                        aria-label="期望的联系时间"
                      />
                    </div>
                    <Button onClick={handleSubmitMaintenanceRequest}>
                      提交申请
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingMaintenance ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : maintenanceRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">暂无维修申请记录</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {maintenanceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{request.property_summary.title}</CardTitle>
                          <CardDescription>
                            {request.property_summary.address_line1}, {request.property_summary.city}
                          </CardDescription>
                        </div>
                        {getMaintenanceStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">问题描述</p>
                          <p className="text-sm text-gray-500">{request.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">提交时间</p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>
                        {request.assigned_worker_name && (
                          <div>
                            <p className="text-sm font-medium">维修人员</p>
                            <p className="text-sm text-gray-500">{request.assigned_worker_name}</p>
                            {request.worker_contact_info && (
                              <p className="text-sm text-gray-500">联系方式：{request.worker_contact_info}</p>
                            )}
                          </div>
                        )}
                        {request.resolution_notes && (
                          <div>
                            <p className="text-sm font-medium">处理结果</p>
                            <p className="text-sm text-gray-500">{request.resolution_notes}</p>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedMaintenanceRequest(request)
                              setMaintenanceDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>
                          {request.status === 'PENDING_ASSIGNMENT' && (
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelMaintenanceRequest(request.id)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              取消申请
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 维修申请详情对话框 */}
            <Dialog open={maintenanceDetailDialogOpen} onOpenChange={setMaintenanceDetailDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>维修申请详情</DialogTitle>
                </DialogHeader>
                {selectedMaintenanceRequest && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">房源信息</h3>
                      <p className="text-sm text-gray-500">{selectedMaintenanceRequest.property_summary.title}</p>
                      <p className="text-sm text-gray-500">
                        {selectedMaintenanceRequest.property_summary.address_line1}, {selectedMaintenanceRequest.property_summary.city}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">问题描述</h3>
                      <p className="text-sm text-gray-500">{selectedMaintenanceRequest.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">申请状态</h3>
                      <p className="text-sm text-gray-500">{getMaintenanceStatusBadge(selectedMaintenanceRequest.status)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">提交时间</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedMaintenanceRequest.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedMaintenanceRequest.assigned_worker_name && (
                      <div>
                        <h3 className="font-medium">维修人员信息</h3>
                        <p className="text-sm text-gray-500">姓名：{selectedMaintenanceRequest.assigned_worker_name}</p>
                        {selectedMaintenanceRequest.worker_contact_info && (
                          <p className="text-sm text-gray-500">联系方式：{selectedMaintenanceRequest.worker_contact_info}</p>
                        )}
                      </div>
                    )}
                    {selectedMaintenanceRequest.resolution_notes && (
                      <div>
                        <h3 className="font-medium">处理结果</h3>
                        <p className="text-sm text-gray-500">{selectedMaintenanceRequest.resolution_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">消息中心</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  未读消息 {unreadCount}
                </Badge>
                <Button onClick={() => setShowNewMessageDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  发送新消息
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>聊天列表</CardTitle>
                  <CardDescription>您的聊天对象</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingChatUsers ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : chatUsers.length > 0 ? (
                    <div className="space-y-2">
                      {chatUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedChatUser === user.id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => {
                            setSelectedChatUser(user.id)
                            fetchMessages(user.id)
                          }}
                        >
                          <div className="font-medium">{user.username}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      暂无聊天记录
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>消息历史</CardTitle>
                  <CardDescription>最近的对话记录</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChatUser ? (
                    <div className="flex flex-col h-[500px]">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2" id="messages-container">
                        {messages.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">暂无消息记录</p>
                          </div>
                        ) : (
                          renderMessages()
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="输入消息..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                        />
                        <Button onClick={sendMessage}>
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

            {/* 发送新消息对话框 */}
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>发送新消息</DialogTitle>
                  <DialogDescription>
                    选择要发送消息的房东
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">选择房东</label>
                    <select
                      className="w-full p-2 border rounded-md mt-1"
                      value={selectedReceiver || ''}
                      onChange={(e) => setSelectedReceiver(Number(e.target.value))}
                    >
                      <option value="">请选择房东</option>
                      {chatUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">消息内容</label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="请输入消息内容..."
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!selectedReceiver || !newMessage.trim()) {
                        toast({
                          title: "错误",
                          description: "请选择房东并输入消息内容",
                          variant: "destructive"
                        })
                        return
                      }
                      
                      try {
                        const token = localStorage.getItem('auth_token')
                        const response = await fetch('http://localhost:5001/api/v1/messages', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            receiver_id: selectedReceiver,
                            content: newMessage.trim()
                          })
                        })

                        if (!response.ok) {
                          const errorData = await response.json()
                          throw new Error(errorData.message || '发送消息失败')
                        }

                        const data = await response.json()
                        if (data.success) {
                          toast({
                            title: "成功",
                            description: "消息发送成功"
                          })
                          setSelectedChatUser(selectedReceiver)
                          // 发送成功后获取最新的消息列表
                          await fetchMessages(selectedReceiver)
                          setShowNewMessageDialog(false)
                          setSelectedReceiver(null)
                          setNewMessage('')
                          fetchChatUsers()
                          fetchUnreadCount()
                        }
                      } catch (error) {
                        console.error('发送消息错误:', error)
                        toast({
                          title: "错误",
                          description: error instanceof Error ? error.message : "发送消息失败",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    发送
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contract Preview Modal */}
      <Dialog open={contractPreview.isOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>租赁合同预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p>房东：{contractPreview.landlord}</p>
                <p>房源：{contractPreview.property}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDownloadContract(contractPreview.contractUrl)}
              >
                <Download className="w-4 h-4 mr-2" />
                下载合同
              </Button>
            </div>
            <iframe
              src={contractPreview.contractUrl}
              className="w-full h-[600px] border"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 预约详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>预约详情</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">房源信息</h3>
                <p className="text-sm text-gray-500">{selectedBooking.property?.title}</p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.property?.address_line1}, {selectedBooking.property?.city}
                </p>
              </div>
              <div>
                <h3 className="font-medium">预约时间</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedBooking.requested_datetime).toLocaleString()}
                </p>
              </div>
              {selectedBooking.notes_for_landlord && (
                <div>
                  <h3 className="font-medium">给房东的留言</h3>
                  <p className="text-sm text-gray-500">{selectedBooking.notes_for_landlord}</p>
                </div>
              )}
              {selectedBooking.landlord_notes && (
                <div>
                  <h3 className="font-medium">房东回复</h3>
                  <p className="text-sm text-gray-500">{selectedBooking.landlord_notes}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium">房东信息</h3>
                <p className="text-sm text-gray-500">姓名：{selectedBooking.landlord?.username || '未知房东'}</p>
                <p className="text-sm text-gray-500">电话：{selectedBooking.landlord?.phone || '未知电话'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 创建租赁合同对话框 */}
      <Dialog open={createLeaseDialogOpen} onOpenChange={setCreateLeaseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>创建租赁合同</DialogTitle>
            <DialogDescription>
              为已确认的预约创建租赁合同，填写合同详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedBookingForLease && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">房源信息</h3>
                <p className="text-sm text-gray-600">{selectedBookingForLease.property?.title}</p>
                <p className="text-sm text-gray-600">
                  {selectedBookingForLease.property?.address_line1}, {selectedBookingForLease.property?.city}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">租期开始日期 *</label>
                  <Input
                    type="date"
                    value={newLeaseData.start_date}
                    onChange={(e) => setNewLeaseData({
                      ...newLeaseData,
                      start_date: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">租期结束日期 *</label>
                  <Input
                    type="date"
                    value={newLeaseData.end_date}
                    onChange={(e) => setNewLeaseData({
                      ...newLeaseData,
                      end_date: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">月租金 (元) *</label>
                  <Input
                    type="number"
                    value={newLeaseData.monthly_rent_amount}
                    onChange={(e) => setNewLeaseData({
                      ...newLeaseData,
                      monthly_rent_amount: e.target.value
                    })}
                    placeholder="请输入月租金"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">押金 (元)</label>
                  <Input
                    type="number"
                    value={newLeaseData.deposit_amount}
                    onChange={(e) => setNewLeaseData({
                      ...newLeaseData,
                      deposit_amount: e.target.value
                    })}
                    placeholder="默认等于月租金"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">每月付款日</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={newLeaseData.payment_due_day_of_month}
                  onChange={(e) => setNewLeaseData({
                    ...newLeaseData,
                    payment_due_day_of_month: parseInt(e.target.value) || 1
                  })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">每月几号支付租金，默认为1号</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">附加条款</label>
                <Textarea
                  value={newLeaseData.additional_terms}
                  onChange={(e) => setNewLeaseData({
                    ...newLeaseData,
                    additional_terms: e.target.value
                  })}
                  placeholder="请输入额外的合同条款..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateLeaseDialogOpen(false)
                    setSelectedBookingForLease(null)
                    setNewLeaseData({
                      start_date: '',
                      end_date: '',
                      monthly_rent_amount: '',
                      deposit_amount: '',
                      additional_terms: '',
                      payment_due_day_of_month: 1
                    })
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleCreateLease}>
                  创建合同
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}