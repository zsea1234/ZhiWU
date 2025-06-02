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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock user data
const mockUser = {
  id: 1,
  username: "李兴",
  role: "landlord",
  email: "lisi@example.com",
}

interface Message {
  id: number
  sender: string
  content: string
  time: string
  unread?: boolean
  isTenant?: boolean
}

interface Property {
  id: number
  title: string
  address: string
  type: string
  area: number
  rooms: number
  price: number
  status: "已出租" | "空置" | "待维修"
  images: string[]
  facilities: string[]
  description: string
  createdAt: string
  tenant?: {
    name: string
    phone: string
    startDate: string
    endDate: string
  }
}

interface Booking {
  id: number
  name: string
  property: string
  time: string
  status: "待确认" | "已确认" | "已完成"
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
  const [user, setUser] = useState(mockUser)
  const [selectedChat, setSelectedChat] = useState<Message | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, name: "张三", property: "朝阳区幸福小区 2室1厅", time: "明天 14:00", status: "待确认" },
    { id: 2, name: "李四", property: "海淀区学院路 1室1厅", time: "后天 10:30", status: "已确认" },
    { id: 3, name: "王五", property: "西城区金融街 3室2厅", time: "周六 15:00", status: "待确认" },
  ])
  const [leases, setLeases] = useState<Lease[]>([
    { 
      id: 1, 
      tenant: "张三", 
      property: "朝阳区幸福小区 2室1厅", 
      startDate: "2024-01-01", 
      endDate: "2024-12-31", 
      rent: "¥5,000/月",
      contractUrl: "/contracts/lease-1.pdf"
    },
    { 
      id: 2, 
      tenant: "李四", 
      property: "西城区金融街 3室2厅", 
      startDate: "2024-02-01", 
      endDate: "2025-01-31", 
      rent: "¥8,000/月",
      contractUrl: "/contracts/lease-2.pdf"
    },
  ])
  const [contractPreview, setContractPreview] = useState<ContractPreview>({
    isOpen: false,
    contractUrl: "",
    tenant: "",
    property: ""
  })
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 1,
      title: "朝阳区幸福小区 2室1厅",
      address: "北京市朝阳区幸福小区3号楼2单元501",
      type: "住宅",
      area: 85,
      rooms: 2,
      price: 5000,
      status: "已出租",
      images: [
        "/properties/property-1-1.jpg",
        "/properties/property-1-2.jpg",
        "/properties/property-1-3.jpg"
      ],
      facilities: ["空调", "热水器", "洗衣机", "冰箱", "电视", "宽带"],
      description: "精装修两居室，采光好，交通便利，近地铁站。",
      createdAt: "2024-01-01",
      tenant: {
        name: "张三",
        phone: "13800138000",
        startDate: "2024-01-01",
        endDate: "2024-12-31"
      }
    },
    {
      id: 2,
      title: "海淀区学院路 1室1厅",
      address: "北京市海淀区学院路8号院2号楼1单元303",
      type: "住宅",
      area: 45,
      rooms: 1,
      price: 3500,
      status: "空置",
      images: [
        "/properties/property-2-1.jpg",
        "/properties/property-2-2.jpg"
      ],
      facilities: ["空调", "热水器", "洗衣机", "冰箱", "宽带"],
      description: "温馨一居室，适合单身或情侣居住，近大学城。",
      createdAt: "2024-02-01"
    },
    {
      id: 3,
      title: "西城区金融街 3室2厅",
      address: "北京市西城区金融街15号院1号楼2单元801",
      type: "住宅",
      area: 120,
      rooms: 3,
      price: 8000,
      status: "已出租",
      images: [
        "/properties/property-3-1.jpg",
        "/properties/property-3-2.jpg",
        "/properties/property-3-3.jpg"
      ],
      facilities: ["空调", "热水器", "洗衣机", "冰箱", "电视", "宽带", "烤箱"],
      description: "豪华三居室，精装修，家具家电齐全，近金融街。",
      createdAt: "2024-01-15",
      tenant: {
        name: "李四",
        phone: "13900139000",
        startDate: "2024-02-01",
        endDate: "2025-01-31"
      }
    }
  ])
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    isOpen: false,
    propertyId: null,
    propertyTitle: ""
  })
  const router = useRouter()

  const mockContractData: Record<string, ContractData> = {
    "lease-1": {
      contractNumber: "HT2024001",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyRent: "¥5,000",
      deposit: "¥5,000",
      paymentMethod: "银行转账",
      terms: [
        "租期一年，到期可续签",
        "每月1号前支付当月租金",
        "水电费由租客承担",
        "不得擅自转租或分租",
        "保持房屋整洁，爱护设施",
        "退租时需提前30天通知"
      ],
      signatures: {
        landlord: "李兴",
        tenant: "张三",
        date: "2023-12-25"
      }
    },
    "lease-2": {
      contractNumber: "HT2024002",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      monthlyRent: "¥8,000",
      deposit: "¥8,000",
      paymentMethod: "银行转账",
      terms: [
        "租期一年，到期可续签",
        "每月1号前支付当月租金",
        "水电费由租客承担",
        "不得擅自转租或分租",
        "保持房屋整洁，爱护设施",
        "退租时需提前30天通知"
      ],
      signatures: {
        landlord: "李兴",
        tenant: "李四",
        date: "2024-01-20"
      }
    }
  }

  const handleConfirmBooking = (bookingId: number) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "已确认" }
        : booking
    ))
  }

  const handleViewContract = (lease: Lease) => {
    const contractId = lease.contractUrl?.split('/').pop()?.replace('.pdf', '') || ''
    setContractPreview({
      isOpen: true,
      contractUrl: lease.contractUrl || "",
      tenant: lease.tenant,
      property: lease.property,
      contractData: mockContractData[contractId]
    })
  }

  const handleClosePreview = () => {
    setContractPreview(prev => ({ ...prev, isOpen: false }))
  }

  const handleDownloadContract = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDeleteProperty = (propertyId: number, propertyTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      propertyId,
      propertyTitle
    })
  }

  const confirmDelete = () => {
    if (deleteDialog.propertyId) {
      setProperties(properties.filter(p => p.id !== deleteDialog.propertyId))
      setDeleteDialog({
        isOpen: false,
        propertyId: null,
        propertyTitle: ""
      })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      propertyId: null,
      propertyTitle: ""
    })
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Get user role from localStorage or API
    const role = localStorage.getItem("user_role") || "landlord"
    setUser((prev) => ({ ...prev, role }))
  }, [router])

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
                  <p className="text-2xl font-bold">5</p>
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
                  <p className="text-2xl font-bold text-green-600">3</p>
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
                  <p className="text-2xl font-bold text-green-600">¥15,000</p>
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
                  <p className="text-2xl font-bold text-orange-600">2</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
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
                    {[
                      { name: "朝阳区幸福小区 2室1厅", status: "已出租", rent: "¥5,000/月" },
                      { name: "海淀区学院路 1室1厅", status: "空置", rent: "¥3,500/月" },
                      { name: "西城区金融街 3室2厅", status: "已出租", rent: "¥8,000/月" },
                    ].map((property, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{property.name}</p>
                          <p className="text-sm text-gray-600">{property.rent}</p>
                        </div>
                        <Badge variant={property.status === "已出租" ? "default" : "secondary"}>
                          {property.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/landlord/properties/new">
                    <Button variant="outline" className="w-full mt-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        variant={
                          property.status === "已出租"
                            ? "default"
                            : property.status === "空置"
                            ? "secondary"
                            : "destructive"
                        }
                        className="absolute top-2 right-2"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{property.address}</p>
                        <div className="flex justify-between">
                          <span>{property.area}㎡</span>
                          <span>{property.rooms}室</span>
                          <span className="text-green-600 font-medium">¥{property.price}/月</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {property.facilities.slice(0, 3).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {property.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.facilities.length - 3}
                            </Badge>
                          )}
                        </div>
                        {property.tenant && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm">
                              租客：{property.tenant.name}
                              <span className="ml-2 text-gray-500">
                                {property.tenant.startDate} 至 {property.tenant.endDate}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id, property.title)}
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
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-gray-600">{booking.property}</p>
                          <p className="text-sm text-gray-500">{booking.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === "待确认" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              确认预约
                            </Button>
                          )}
                          <Badge 
                            variant={
                              booking.status === "已确认" 
                                ? "default" 
                                : booking.status === "已完成"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>预约统计</CardTitle>
                  <CardDescription>本周预约情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">待确认预约</p>
                      <p className="font-medium">{bookings.filter(b => b.status === "待确认").length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">已确认预约</p>
                      <p className="font-medium">{bookings.filter(b => b.status === "已确认").length}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">已完成预约</p>
                      <p className="font-medium">{bookings.filter(b => b.status === "已完成").length}</p>
                    </div>
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
                      <p className="font-medium text-green-600">¥15,000</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">已收租金</p>
                      <p className="font-medium text-green-600">¥13,000</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">待收租金</p>
                      <p className="font-medium text-orange-600">¥2,000</p>
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
                        className={`flex justify-between items-start p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?.id === message.id ? "bg-gray-100" : ""
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
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.isTenant
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
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">确认删除</h3>
            </div>
            <p className="text-gray-600 mb-6">
              您确定要删除房源 "{deleteDialog.propertyTitle}" 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 