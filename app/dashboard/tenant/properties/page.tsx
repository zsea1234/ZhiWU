"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Search, MapPin, Home, Calendar } from "lucide-react"
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

  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      const response = await fetch(`/api/v1/properties?${queryParams}`)
      const data = await response.json()
      setProperties(data.data)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast({
        title: "错误",
        description: "获取房源列表失败",
        variant: "destructive"
      })
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
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          requested_datetime: bookingDate,
          notes_for_landlord: bookingNotes
        })
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "预约看房请求已提交"
        })
        setBookingDialogOpen(false)
      } else {
        throw new Error('预约失败')
      }
    } catch (error) {
      console.error('Error booking viewing:', error)
      toast({
        title: "错误",
        description: "预约看房失败",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">房源浏览</h1>
        
        {/* 搜索筛选区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="搜索房源..."
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>

          <Select
            value={filters.property_type}
            onValueChange={(value) => setFilters({...filters, property_type: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="房屋类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value="apartment">公寓</SelectItem>
              <SelectItem value="house">别墅</SelectItem>
              <SelectItem value="studio">开间</SelectItem>
              <SelectItem value="shared_room">合租单间</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.city}
            onValueChange={(value) => setFilters({...filters, city: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="城市" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
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

          <div>
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