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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

// 接口定义
interface Message {
  id: number
  sender: string
  content: string
  time: string
  unread?: boolean
  isLandlord?: boolean
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

  // 统计数据
  const stats = {
    totalBookings: Array.isArray(bookings) ? bookings.length : 0,
    activeLeases: Array.isArray(leases) ? leases.filter(l => l.status === 'active').length : 0,
    pendingMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter(m => m.status === 'PENDING_ASSIGNMENT').length : 0,
    unreadMessages: 0
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
  }, [router])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/auth/login')
        return
      }
      const response = await fetch('http://localhost:5001/api/v1/bookings/tenant', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 405) {
          // 如果服务器不支持GET方法，尝试使用POST方法
          const postResponse = await fetch('http://localhost:5001/api/v1/bookings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (!postResponse.ok) {
            throw new Error(`HTTP error! status: ${postResponse.status}`)
          }
          
          const data = await postResponse.json()
          setBookings(data.data || [])
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        const data = await response.json()
        setBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "错误",
        description: "获取预约列表失败",
        variant: "destructive"
      })
      setBookings([]) // 设置空数组作为默认值
    }
  }

  const fetchLeases = async () => {
    try {
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
      // 确保使用正确的数据结构
      setLeases(Array.isArray(data.data.items) ? data.data.items : [])
    } catch (error) {
      console.error('Error fetching leases:', error)
      toast({
        title: "错误",
        description: "获取租赁合同列表失败",
        variant: "destructive"
      })
      setLeases([])
    }
  }

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        router.push('/auth/login')
        return
      }
  
      // 获取用户角色
      const userRole = localStorage.getItem('user_role')
      if (!userRole || userRole.toLowerCase() !== 'tenant') {
        console.error('Invalid user role:', userRole)
        toast({
          title: "错误",
          description: "用户角色无效",
          variant: "destructive"
        })
        return
      }
  
      console.log('Fetching maintenance requests with token:', token)
      console.log('User role:', userRole)
  
      const response = await fetch('http://localhost:5001/api/v1/maintenance-requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // 打印响应状态和头信息
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        localStorage.removeItem('user_role')
        router.push('/auth/login')
        return
      }
      
      if (!response.ok) {
        // 尝试读取错误信息
        const errorData = await response.json().catch(() => null)
        console.error('Error response:', errorData)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      // 更安全的数据结构处理
      if (data.data) {
        if (Array.isArray(data.data)) {
          // 如果直接是数组
          setMaintenanceRequests(data.data)
        } else if (data.data.items && Array.isArray(data.data.items)) {
          // 如果是分页数据结构
          setMaintenanceRequests(data.data.items)
        } else {
          console.error('Unexpected data structure:', data)
          setMaintenanceRequests([])
        }
      } else {
        console.error('No data in response:', data)
        setMaintenanceRequests([])
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "获取维修请求列表失败",
        variant: "destructive"
      })
      setMaintenanceRequests([])
    } finally {
      setIsLoadingMaintenance(false)
    }
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
          status: 'CANCELLED_BY_TENANT'
        })
      })

      if (!response.ok) {
        throw new Error('取消预约失败')
      }

      toast({
        title: "成功",
        description: "预约已取消"
      })
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "错误",
        description: "取消预约失败",
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
      property: lease.property_summary.title
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
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/maintenance-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMaintenanceRequest)
      })

      if (!response.ok) {
        throw new Error('提交维修申请失败')
      }

      toast({
        title: "成功",
        description: "维修申请已提交"
      })
      fetchMaintenanceRequests()
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
      toast({
        title: "错误",
        description: "提交维修申请失败",
        variant: "destructive"
      })
    }
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
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.booking_id}>
                    <CardHeader>
                      <CardTitle>{booking.property?.title}</CardTitle>
                      <CardDescription>
                        {booking.property?.address_line1}, {booking.property?.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>预约时间：{new Date(booking.requested_datetime).toLocaleString()}</p>
                          <p>状态：{booking.status}</p>
                        </div>
                        {booking.status === 'PENDING_CONFIRMATION' && (
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelBooking(booking.booking_id)}
                          >
                            取消预约
                          </Button>
                        )}
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
                          {lease.status === 'pending_tenant_signature' && (
                            <Button
                              onClick={() => handleSignLease(lease.id)}
                            >
                              签署合同
                            </Button>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  提交维修申请
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>提交维修申请</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">问题描述</label>
                    <Textarea
                      value={newMaintenanceRequest.description}
                      onChange={(e) => setNewMaintenanceRequest({
                        ...newMaintenanceRequest,
                        description: e.target.value
                      })}
                      placeholder="请详细描述需要维修的问题..."
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
                    />
                  </div>
                  <Button onClick={handleSubmitMaintenanceRequest}>
                    提交申请
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {isLoadingMaintenance ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {maintenanceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <CardTitle>维修申请 #{request.id}</CardTitle>
                      <CardDescription>
                        提交时间：{new Date(request.created_at).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>{request.description}</p>
                        <p>状态：{request.status}</p>
                        {request.assigned_worker_name && (
                          <p>维修人员：{request.assigned_worker_name}</p>
                        )}
                        {request.resolution_notes && (
                          <p>处理结果：{request.resolution_notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>未读消息</CardTitle>
                  <CardDescription>需要您回复的消息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 1, sender: "房东", content: "请问什么时候可以看房？", time: "10分钟前", unread: true },
                      { id: 2, sender: "维修人员", content: "维修师傅什么时候能来？", time: "30分钟前", unread: true },
                    ].map((message) => (
                      <div
                        key={message.id}
                        className={`flex justify-between items-start p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === message.id ? "bg-gray-100" : ""}`}
                        onClick={() => setSelectedChat(message)}
                      >
                        <div>
                          <p className="font-medium">{message.sender}</p>
                          <p className="text-sm text-gray-600">{message.content}</p>
                          <p className="text-sm text-gray-500">{message.time}</p>
                        </div>
                        {message.unread && (
                          <Badge variant="default">未读</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>消息历史</CardTitle>
                  <CardDescription>最近的对话记录</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedChat ? (
                    <div className="flex flex-col h-[500px]">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {[
                          { id: 1, sender: selectedChat.sender, content: selectedChat.content, time: selectedChat.time, isLandlord: true },
                          { id: 2, sender: "我", content: "您好，请问有什么可以帮您？", time: "刚刚", isLandlord: false },
                        ].map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isLandlord ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${message.isLandlord ? "bg-gray-100" : "bg-blue-100"}`}
                            >
                              <p className="font-medium">{message.sender}</p>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="输入消息..."
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          onClick={() => {
                            if (messageInput.trim()) {
                              // 这里添加发送消息的逻辑
                              setMessageInput("")
                            }
                          }}
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
    </div>
  )
}