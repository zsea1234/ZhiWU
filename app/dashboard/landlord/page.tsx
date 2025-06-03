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

interface Message {
  id: number
  sender: string
  content: string
  time: string
  unread?: boolean
  isTenant?: boolean
}

interface Booking {
  id: number
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
}

interface Lease {
  id: number
  tenant: string
  property: string
  startDate: string
  endDate: string
  rent: string
  contractUrl?: string
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

export default function LandlordDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [selectedChat, setSelectedChat] = useState<Message | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [leases, setLeases] = useState<Lease[]>([])
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
      console.log('User ID available, fetching properties for user:', user.id)
      fetchProperties()
    } else {
      console.log('User ID not available, skipping fetchProperties')
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
      booking.id === bookingId
        ? { ...booking, status: 'CONFIRMED_BY_LANDLORD' }
        : booking
    ))
  }

  const handleCancelBooking = (bookingId: number) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'CANCELLED_BY_LANDLORD' }
        : booking
    ))
  }

  const handleViewContract = (lease: Lease) => {
    setContractPreview({
      isOpen: true,
      contractUrl: lease.contractUrl || "",
      tenant: lease.tenant,
      property: lease.property,
      contractData: undefined // 真实环境下应从API获取合同数据
    })
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

    try {
      const url = `http://localhost:5001/api/v1/bookings/${bookingId}/status`;
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ status })
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
                  <p className="text-2xl font-bold text-orange-600">{properties.filter(p => p.status === 'vacant').length}</p>
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
            <TabsTrigger value="income">收入统计</TabsTrigger>
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
                  <CardTitle>待处理事项</CardTitle>
                  <CardDescription>需要您关注的事项</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "预约", content: "张三预约看房 - 明天下午2点", urgent: true },
                      { type: "维修", content: "李四申请维修卫生间水龙头", urgent: false },
                      { type: "合同", content: "王五的租约即将到期", urgent: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Badge variant={item.urgent ? "destructive" : "secondary"} className="mt-1">
                          {item.type}
                        </Badge>
                        <p className="text-sm flex-1">{item.content}</p>
                      </div>
                    ))}
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
                            {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {property.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{property.amenities.length - 3}
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
                        <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
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
                                handleBookingStatus(booking.id, 'CONFIRMED_BY_LANDLORD');
                              }}
                            >
                              确认预约
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                console.log('Cancel button clicked for booking:', booking);
                                handleBookingStatus(booking.id, 'CANCELLED_BY_LANDLORD');
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
                  <CardDescription>正在进行的租约</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leases.map((lease) => (
                      <div key={lease.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{lease.tenant}</p>
                            <p className="text-sm text-gray-600">{lease.property}</p>
                            <p className="text-sm text-gray-500">租期：{lease.startDate} 至 {lease.endDate}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="font-medium text-green-600">{lease.rent}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContract(lease)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              查看合同
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>即将到期</CardTitle>
                  <CardDescription>30天内到期的租约</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tenant: "王五", property: "海淀区学院路 1室1厅", endDate: "2024-04-15", daysLeft: 15 },
                    ].map((lease, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{lease.tenant}</p>
                          <p className="text-sm text-gray-600">{lease.property}</p>
                          <p className="text-sm text-gray-500">到期日：{lease.endDate}</p>
                        </div>
                        <Badge variant="destructive">剩余 {lease.daysLeft} 天</Badge>
                      </div>
                    ))}
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
                    {[
                      { tenant: "张三", property: "朝阳区幸福小区", issue: "卫生间水龙头漏水", date: "2024-03-10", status: "待处理" },
                      { tenant: "李四", property: "西城区金融街", issue: "空调不制冷", date: "2024-03-09", status: "处理中" },
                    ].map((maintenance, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{maintenance.tenant}</p>
                          <p className="text-sm text-gray-600">{maintenance.property}</p>
                          <p className="text-sm text-gray-500">{maintenance.issue}</p>
                          <p className="text-sm text-gray-500">申请时间：{maintenance.date}</p>
                        </div>
                        <Badge variant={maintenance.status === "待处理" ? "destructive" : "secondary"}>
                          {maintenance.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>维修历史</CardTitle>
                  <CardDescription>已完成的维修记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tenant: "王五", property: "海淀区学院路", issue: "门锁更换", date: "2024-03-01", cost: "¥200" },
                      { tenant: "张三", property: "朝阳区幸福小区", issue: "厨房下水道疏通", date: "2024-02-28", cost: "¥150" },
                    ].map((record, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.tenant}</p>
                          <p className="text-sm text-gray-600">{record.property}</p>
                          <p className="text-sm text-gray-500">{record.issue}</p>
                          <p className="text-sm text-gray-500">完成时间：{record.date}</p>
                        </div>
                        <p className="font-medium text-gray-600">{record.cost}</p>
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
                  <CardTitle>未读消息</CardTitle>
                  <CardDescription>需要您回复的消息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 1, sender: "张三", content: "请问什么时候可以看房？", time: "10分钟前", unread: true },
                      { id: 2, sender: "李四", content: "维修师傅什么时候能来？", time: "30分钟前", unread: true },
                    ].map((message) => (
                      <div
                        key={message.id}
                        className={`flex justify-between items-start p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === message.id ? "bg-gray-100" : ""
                          }`}
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
                          { id: 1, sender: selectedChat.sender, content: selectedChat.content, time: selectedChat.time, isTenant: true },
                          { id: 2, sender: "我", content: "您好，请问有什么可以帮您？", time: "刚刚", isTenant: false },
                        ].map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isTenant ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${message.isTenant
                                  ? "bg-gray-100"
                                  : "bg-blue-100"
                                }`}
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
    </div>
  )
} 