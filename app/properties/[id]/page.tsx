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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock property data
const mockProperty = {
  id: 1,
  title: "精装两居室 近地铁 拎包入住",
  address: "北京市朝阳区幸福路123号 幸福小区 1号楼 2单元 301室",
  rent: 5000,
  deposit: 10000,
  bedrooms: 2,
  living_rooms: 1,
  bathrooms: 1,
  area: 85,
  floor: 3,
  total_floors: 6,
  year_built: 2010,
  available_date: "2025-06-01",
  description:
    "本房源位于朝阳区核心地段，交通便利，距离地铁站仅500米。房屋精装修，家具家电齐全，可拎包入住。小区环境优美，配套设施完善，适合年轻白领居住。",
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
  amenities: ["空调", "洗衣机", "冰箱", "WIFI", "电视", "停车位"],
  rules: ["禁止吸烟", "可协商养小型宠物", "保持安静"],
  landlord: {
    id: 12,
    username: "李房东",
    avatar: "/placeholder.svg?height=40&width=40",
    phone: "138****8888",
    response_rate: "98%",
    response_time: "1小时内",
  },
  surrounding: {
    transportation: ["地铁10号线 500米", "公交站 200米"],
    shopping: ["华联超市 300米", "万达广场 1公里"],
    education: ["幸福小学 800米", "朝阳中学 1.2公里"],
    medical: ["社区医院 600米", "朝阳医院 2公里"],
  },
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  // In a real app, you would fetch property data based on params.id
  const property = mockProperty

  const amenityIcons: { [key: string]: any } = {
    空调: AirVent,
    洗衣机: WashingMachine,
    冰箱: Refrigerator,
    WIFI: Wifi,
    电视: Tv,
    停车位: Car,
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
                  src={property.images[currentImageIndex] || "/placeholder.svg"}
                  alt={property.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {property.images.map((_, index) => (
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
                  {property.images.map((image, index) => (
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
                <CardTitle className="text-2xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center text-base">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">户型</p>
                    <p className="font-medium">
                      {property.bedrooms}室{property.living_rooms}厅{property.bathrooms}卫
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">面积</p>
                    <p className="font-medium">{property.area}㎡</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 mx-auto mb-2 bg-gray-600 rounded text-white text-xs flex items-center justify-center">
                      {property.floor}
                    </div>
                    <p className="text-sm text-gray-600">楼层</p>
                    <p className="font-medium">
                      {property.floor}/{property.total_floors}层
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600">可入住</p>
                    <p className="font-medium">{property.available_date}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">月租金</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ¥{property.rent.toLocaleString()}
                        <span className="text-lg text-gray-600">/月</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">押金</p>
                      <p className="text-xl font-medium">¥{property.deposit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房源描述</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">房屋设施</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => {
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
                <div>
                  <h3 className="text-lg font-semibold mb-3">租赁规则</h3>
                  <div className="space-y-2">
                    {property.rules.map((rule, index) => (
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
                      {property.surrounding.transportation.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="shopping" className="mt-4">
                    <div className="space-y-2">
                      {property.surrounding.shopping.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="education" className="mt-4">
                    <div className="space-y-2">
                      {property.surrounding.education.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="medical" className="mt-4">
                    <div className="space-y-2">
                      {property.surrounding.medical.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
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
                    <AvatarImage src={property.landlord.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{property.landlord.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{property.landlord.username}</p>
                    <p className="text-sm text-gray-600">认证房东</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">回复率</span>
                    <span className="text-sm font-medium">{property.landlord.response_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">回复时间</span>
                    <span className="text-sm font-medium">{property.landlord.response_time}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={`/properties/${property.id}/book`}>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      预约看房
                    </Button>
                  </Link>
                  <Link href={`/messages/chat/${property.landlord.id}`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      联系房东
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    {property.landlord.phone}
                  </Button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
