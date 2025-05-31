"use client"

import { useState } from "react"
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

// Mock property data
const mockProperty = {
  id: 1,
  title: "阳光花园 2室1厅",
  address: "北京市朝阳区阳光花园小区",
  price: 5000,
  area: 80,
  rooms: 2,
  bathrooms: 1,
  maxTenants: 3,
  status: "available" as const,
  images: ["/mock/property1.jpg", "/mock/property2.jpg", "/mock/property3.jpg"],
  description: "这是一套位于阳光花园小区的精装两居室，采光充足，交通便利。小区环境优美，配套设施完善，周边有超市、学校、医院等生活设施。",
  facilities: [
    "空调",
    "热水器",
    "洗衣机",
    "冰箱",
    "电视",
    "宽带",
    "衣柜",
    "床",
    "沙发",
    "餐桌",
  ],
  rules: [
    "禁止养宠物",
    "禁止吸烟",
    "禁止大声喧哗",
    "保持房屋整洁",
    "按时缴纳房租",
  ],
  landlord: {
    name: "张先生",
    phone: "13800138000",
    email: "landlord@example.com",
    rating: 4.8,
  },
}

export default function PropertyDetailPage() {
  const params = useParams()
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

  const amenityIcons: { [key: string]: any } = {
    空调: AirVent,
    洗衣机: WashingMachine,
    冰箱: Refrigerator,
    WIFI: Wifi,
    电视: Tv,
    停车位: Car,
  }

  const handleSubmitViewingRequest = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 实现预约看房请求提交逻辑
    console.log("提交预约看房请求:", {
      propertyId: params.id,
      date: selectedDate,
      time: selectedTime,
      ...viewingRequest,
    })
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
                  src={mockProperty.images[currentImageIndex] || "/placeholder.svg"}
                  alt={mockProperty.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {mockProperty.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
                <Badge className="absolute top-4 left-4 bg-green-500">可租</Badge>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {mockProperty.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
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
                <CardTitle className="text-2xl">{mockProperty.title}</CardTitle>
                <CardDescription className="flex items-center text-base">
                  <MapPin className="h-4 w-4 mr-2" />
                  {mockProperty.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">户型</p>
                    <p className="font-medium">
                      {mockProperty.rooms}室{mockProperty.bathrooms}卫
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">面积</p>
                    <p className="font-medium">{mockProperty.area}㎡</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 mx-auto mb-2 bg-gray-600 rounded text-white text-xs flex items-center justify-center">
                      {mockProperty.maxTenants}
                    </div>
                    <p className="text-sm text-gray-600">可入住人数</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">可入住</p>
                    <p className="font-medium">{mockProperty.status === "available" ? "随时入住" : "已租"}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">月租金</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ¥{mockProperty.price.toLocaleString()}
                        <span className="text-lg text-gray-600">/月</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房源描述</h3>
                  <p className="text-gray-700 leading-relaxed">{mockProperty.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房屋设施</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {mockProperty.facilities.map((facility, index) => {
                      const IconComponent = amenityIcons[facility] || Wifi
                      return (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                          <span className="text-sm">{facility}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">入住规则</h3>
                  <div className="space-y-2">
                    {mockProperty.rules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Surrounding Environment */}
            <Card>
              <CardHeader>
                <CardTitle>周边环境</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transportation">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="transportation">交通</TabsTrigger>
                    <TabsTrigger value="shopping">购物</TabsTrigger>
                    <TabsTrigger value="education">教育</TabsTrigger>
                    <TabsTrigger value="medical">医疗</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transportation" className="mt-4">
                    <div className="space-y-2">
                      {/* Add transportation-related content here */}
                    </div>
                  </TabsContent>
                  <TabsContent value="shopping" className="mt-4">
                    <div className="space-y-2">
                      {/* Add shopping-related content here */}
                    </div>
                  </TabsContent>
                  <TabsContent value="education" className="mt-4">
                    <div className="space-y-2">
                      {/* Add education-related content here */}
                    </div>
                  </TabsContent>
                  <TabsContent value="medical" className="mt-4">
                    <div className="space-y-2">
                      {/* Add medical-related content here */}
                    </div>
                  </TabsContent>
                </Tabs>
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
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{mockProperty.landlord.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockProperty.landlord.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {mockProperty.landlord.rating}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">联系电话</span>
                    <span className="text-sm font-medium">{mockProperty.landlord.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">电子邮箱</span>
                    <span className="text-sm font-medium">{mockProperty.landlord.email}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={`/properties/${mockProperty.id}/book`}>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      预约看房
                    </Button>
                  </Link>
                  <Link href={`/messages/chat/${mockProperty.id}`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      联系房东
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  查看地图位置
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  分享给朋友
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  添加到收藏
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>安全提示</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 看房时请携带身份证件</p>
                  <p>• 签约前仔细阅读合同条款</p>
                  <p>• 通过平台支付更安全</p>
                  <p>• 如遇问题请及时联系客服</p>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Dialog */}
            <Card>
              <CardHeader>
                <CardTitle>预约看房</CardTitle>
                <CardDescription>选择您方便的时间，我们会尽快与您联系</CardDescription>
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
                    <div className="grid grid-cols-3 gap-2">
                      {["上午", "下午", "晚上"].map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">您的姓名</Label>
                    <Input
                      id="name"
                      value={viewingRequest.name}
                      onChange={(e) => setViewingRequest((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">联系电话</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={viewingRequest.phone}
                      onChange={(e) => setViewingRequest((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">电子邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={viewingRequest.email}
                      onChange={(e) => setViewingRequest((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">留言（选填）</Label>
                    <Textarea
                      id="message"
                      value={viewingRequest.message}
                      onChange={(e) => setViewingRequest((prev) => ({ ...prev, message: e.target.value }))}
                      placeholder="有什么特殊要求或问题都可以在这里说明"
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
