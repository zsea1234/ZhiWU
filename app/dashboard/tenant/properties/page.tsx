"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Search, MapPin, Home, Calendar, SlidersHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea" 

interface Property {
  id: number
  title: string
  address_line1: string
  city: string
  district: string
  property_type: string
  area_sqm: number
  rent_price_monthly: number
  bedrooms: number
  bathrooms: number
  main_image_url: string
  status: string
  landlord_info: {
    id: number
    username: string
  }
}

interface SearchFilters {
  keyword: string
  property_type: string
  min_rent: number
  max_rent: number
  min_area: number
  max_area: number
  bedrooms: number
  city: string
}

export default function PropertiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    property_type: '',
    min_rent: 0,
    max_rent: 10000,
    min_area: 0,
    max_area: 200,
    bedrooms: 0,
    city: ''
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // 检查认证
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    console.log('Component mounted, fetching properties...')
    fetchProperties()
  }, [router])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      console.log('Fetching properties with params:', queryParams.toString())

      const response = await fetch(`http://localhost:5001/api/v1/properties/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('API Error:', errorData)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success && data.data && data.data.properties) {
        console.log('Setting properties from response:', data.data.properties)
        setProperties(data.data.properties)
      } else {
        console.error('Unexpected data structure:', data)
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast({
        title: "错误",
        description: "获取房源列表失败",
        variant: "destructive"
      })
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProperties()
  }

  const handleBookViewing = async () => {
    if (!selectedProperty || !bookingDate) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          requested_datetime: bookingDate,
          notes_for_landlord: bookingNotes
        })
      })

      if (!response.ok) {
        throw new Error('预约失败')
      }

      toast({
        title: "成功",
        description: "预约看房请求已提交"
      })
      setBookingDialogOpen(false)
      setBookingDate('')
      setBookingNotes('')
    } catch (error) {
      console.error('Error booking viewing:', error)
      toast({
        title: "错误",
        description: "预约看房失败",
        variant: "destructive"
      })
    }
  }

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      property_type: '',
      min_rent: 0,
      max_rent: 10000,
      min_area: 0,
      max_area: 200,
      bedrooms: 0,
      city: ''
    })
    setShowFilters(false)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">房源浏览</h1>
        
        {/* 搜索和筛选区域 */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="搜索房源..."
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">房屋类型</label>
                <Select
                  value={filters.property_type}
                  onValueChange={(value) => setFilters({...filters, property_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择房屋类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="APARTMENT">公寓</SelectItem>
                    <SelectItem value="HOUSE">别墅</SelectItem>
                    <SelectItem value="STUDIO">开间</SelectItem>
                    <SelectItem value="SHARED_ROOM">合租单间</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">城市</label>
                <Select
                  value={filters.city}
                  onValueChange={(value) => setFilters({...filters, city: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择城市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="北京">北京</SelectItem>
                    <SelectItem value="上海">上海</SelectItem>
                    <SelectItem value="广州">广州</SelectItem>
                    <SelectItem value="深圳">深圳</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">卧室数量</label>
                <Select
                  value={filters.bedrooms.toString()}
                  onValueChange={(value) => setFilters({...filters, bedrooms: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择卧室数量" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">不限</SelectItem>
                    <SelectItem value="1">1室</SelectItem>
                    <SelectItem value="2">2室</SelectItem>
                    <SelectItem value="3">3室</SelectItem>
                    <SelectItem value="4">4室及以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">租金范围 (¥/月)</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={filters.min_rent}
                    onChange={(e) => setFilters({...filters, min_rent: Number(e.target.value)})}
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    value={filters.max_rent}
                    onChange={(e) => setFilters({...filters, max_rent: Number(e.target.value)})}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">面积范围 (㎡)</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={filters.min_area}
                    onChange={(e) => setFilters({...filters, min_area: Number(e.target.value)})}
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    value={filters.max_area}
                    onChange={(e) => setFilters({...filters, max_area: Number(e.target.value)})}
                    className="w-24"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleResetFilters} variant="outline" className="w-full">
                  重置筛选
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 房源列表 */}
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={property.main_image_url}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {property.address_line1}, {property.city}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">¥{property.rent_price_monthly}/月</span>
                    <span className="text-sm text-gray-500">{property.area_sqm}㎡</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.bedrooms}室
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.bathrooms}卫
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedProperty(property)
                      setBookingDialogOpen(true)
                    }}
                  >
                    预约看房
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 预约看房对话框 */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>预约看房</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">期望看房时间</label>
              <Input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">给房东的留言</label>
              <Textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="请输入您的留言..."
              />
            </div>
            <Button onClick={handleBookViewing} className="w-full">
              提交预约
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}