"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MapPin,
  Bed,
  Square,
  Calendar,
  Phone,
  MessageSquare,
  Heart,
  Share2,
  Car,
  Wifi,
  AirVent,
  Tv,
  Refrigerator,
  WashingMachine,
  Users,
  Star,
  Mail,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { propertyService, PropertyDetail } from "@/app/services/property"
import { toast } from "sonner"

export default function PropertyDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [viewingRequest, setViewingRequest] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  })

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      try {
        const propertyId = Number(params.id)
        const data = await propertyService.getPropertyById(propertyId)
        setProperty(data)
      } catch (error) {
        console.error('获取房源详情失败:', error)
        toast.error('获取房源详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchPropertyDetail()
  }, [params.id])

  const amenityIcons: { [key: string]: any } = {
    空调: AirVent,
    洗衣机: WashingMachine,
    冰箱: Refrigerator,
    WIFI: Wifi,
    电视: Tv,
    停车位: Car,
  }

  const handleSubmitViewingRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    try {
      const requested_datetime = new Date(selectedDate!)
      requested_datetime.setHours(parseInt(selectedTime.split(':')[0]))
      requested_datetime.setMinutes(parseInt(selectedTime.split(':')[1]))

      await propertyService.createViewingRequest(property.id, {
        requested_datetime: requested_datetime.toISOString(),
        notes_for_landlord: viewingRequest.message
      })

      toast.success('预约看房请求已提交')
      // 重置表单
      setSelectedDate(new Date())
      setSelectedTime("")
      setViewingRequest({
        name: "",
        phone: "",
        email: "",
        message: "",
      })
    } catch (error) {
      console.error('提交预约看房请求失败:', error)
      toast.error('提交预约看房请求失败')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">房源不存在</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/properties" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="h-5 w-5" />
              <span>返回搜索</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
              <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
              收藏
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <Image
                  src={property.media_files[currentImageIndex]?.url || "/placeholder.svg"}
                  alt={property.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {property.media_files.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
                <Badge className="absolute top-4 left-4 bg-green-500">
                  {property.status === 'vacant' ? '可租' : '已租'}
                </Badge>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {property.media_files.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={media.thumbnail_url || media.url || "/placeholder.svg"}
                        alt={`房源图片 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center text-base">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.address_line1}
                  {property.address_line2 && `, ${property.address_line2}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">户型</p>
                    <p className="font-medium">
                      {property.bedrooms}室{property.bathrooms}卫
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">面积</p>
                    <p className="font-medium">{property.area_sqm}㎡</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 mx-auto mb-2 bg-gray-600 rounded text-white text-xs flex items-center justify-center">
                      {property.living_rooms}
                    </div>
                    <p className="text-sm text-gray-600">客厅</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">可入住</p>
                    <p className="font-medium">{new Date(property.available_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">月租金</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ¥{property.rent_price_monthly.toLocaleString()}
                        <span className="text-lg text-gray-600">/月</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">押金</p>
                      <p className="text-xl font-bold text-gray-700">
                        ¥{property.deposit_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房源描述</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description_text}</p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房屋设施</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities?.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Wifi
                      return (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Rules */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">租赁规则</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.rules?.length ? (
                      property.rules.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-gray-500 text-sm">暂无租赁规则</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Info */}
            <Card>
              <CardHeader>
                <CardTitle>房东信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarFallback>{property.landlord_info.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{property.landlord_info.username}</p>
                    <p className="text-sm text-gray-500">房东</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    联系房东
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    发送消息
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Book Viewing */}
            <Card>
              <CardHeader>
                <CardTitle>预约看房</CardTitle>
                <CardDescription>选择您方便的时间预约看房</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitViewingRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label>选择日期</Label>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>选择时间</Label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>您的姓名</Label>
                    <Input
                      value={viewingRequest.name}
                      onChange={(e) => setViewingRequest({ ...viewingRequest, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>联系电话</Label>
                    <Input
                      type="tel"
                      value={viewingRequest.phone}
                      onChange={(e) => setViewingRequest({ ...viewingRequest, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>电子邮箱</Label>
                    <Input
                      type="email"
                      value={viewingRequest.email}
                      onChange={(e) => setViewingRequest({ ...viewingRequest, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>留言（选填）</Label>
                    <Textarea
                      value={viewingRequest.message}
                      onChange={(e) => setViewingRequest({ ...viewingRequest, message: e.target.value })}
                      placeholder="有什么特别的要求或问题吗？"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    提交预约
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}