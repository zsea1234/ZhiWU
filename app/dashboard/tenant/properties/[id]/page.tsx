"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, Home, Calendar, Phone, Mail } from "lucide-react"

interface PropertyDetail {
  id: number
  title: string
  description: string
  address_line1: string
  address_line2: string
  city: string
  district: string
  property_type: string
  area_sqm: number
  rent_price_monthly: number
  bedrooms: number
  bathrooms: number
  main_image_url: string
  status: string
  amenities: string[]
  landlord_info: {
    id: number
    username: string
    phone: string
    email: string
  }
  media: {
    id: number
    file_url: string
    media_type: string
    description: string
  }[]
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchPropertyDetail()
  }, [params.id])

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/properties/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('获取房源详情失败')
      }

      const data = await response.json()
      console.log('Property detail response:', data)
      
      if (data.success && data.data) {
        const propertyData = {
          ...data.data,
          landlord_info: data.data.landlord_info || {
            username: '未知',
            phone: '未知',
            email: '未知'
          },
          amenities: data.data.amenities || [],
          description: data.data.description || '暂无描述'
        }
        setProperty(propertyData)
      } else {
        throw new Error('房源数据格式错误')
      }
    } catch (error) {
      console.error('Error fetching property detail:', error)
      toast({
        title: "错误",
        description: "获取房源详情失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookViewing = async () => {
    if (!property || !bookingDate) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          property_id: property.id,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600">房源不存在或已被删除</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：房源图片和基本信息 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="relative h-[400px]">
              <img
                src={property?.main_image_url || '/placeholder-image.jpg'}
                alt={property?.title || '房源图片'}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{property?.title || '未知房源'}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {property?.address_line1 || '未知地址'}, {property?.district || '未知区域'}, {property?.city || '未知城市'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">月租金</p>
                  <p className="text-xl font-bold">¥{property?.rent_price_monthly || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">房型</p>
                  <p className="text-xl font-bold">{property?.bedrooms || 0}室{property?.bathrooms || 0}卫</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">面积</p>
                  <p className="text-xl font-bold">{property?.area_sqm || 0}㎡</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">类型</p>
                  <p className="text-xl font-bold">{property?.property_type || '未知'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">房源描述</h3>
                <p className="text-gray-600">{property?.description || '暂无描述'}</p>

                <h3 className="text-lg font-semibold">配套设施</h3>
                <div className="flex flex-wrap gap-2">
                  {(property?.amenities || []).map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：房东信息和预约看房 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>房东信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                <span>{property?.landlord_info?.username || '未知'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{property?.landlord_info?.phone || '未知'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{property?.landlord_info?.email || '未知'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>预约看房</CardTitle>
              <CardDescription>选择您方便的时间预约看房</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => setBookingDialogOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                预约看房
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 预约看房对话框 */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>预约看房</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">预约时间</label>
              <Input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">备注信息</label>
              <Textarea
                placeholder="请输入您的特殊要求或备注信息"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleBookViewing}>
              提交预约
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 