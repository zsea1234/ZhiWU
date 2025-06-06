"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, Home, Calendar, Phone, Mail, MessageSquare } from "lucide-react"
import { use } from "react"

interface PropertyDetail {
  id: number
  title: string
  description: string
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

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const router = useRouter()
  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<{id: number, username: string} | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchPropertyDetail()
  }, [resolvedParams.id, router])

  useEffect(() => {
    const userInfoStr = localStorage.getItem('user_info')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      setCurrentUser({
        id: userInfo.id,
        username: userInfo.username
      })
    }
  }, [])

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/properties/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.data) {
        setProperty({
          ...data.data,
          landlord_info: data.data.landlord_info || {
            id: 0,
            username: '未知'
          }
        })
      } else {
        throw new Error('房源数据格式错误')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      toast({
        title: "错误",
        description: "获取房源信息失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookViewing = async () => {
    if (!property || !bookingDate) {
      toast({
        title: "错误",
        description: "请选择预约时间",
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
      setShowBookingDialog(false)
      setBookingDate('')
      setBookingNotes('')
    } catch (error) {
      console.error('预约看房错误:', error)
      toast({
        title: "错误",
        description: "预约看房失败",
        variant: "destructive"
      })
    }
  }

  const sendMessage = async () => {
    if (!property || !currentUser) {
      toast({
        title: "错误",
        description: "请先登录",
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

      const response = await fetch('http://localhost:5001/api/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: property.landlord_info.id,
          content: newMessage
        })
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      toast({
        title: "成功",
        description: "消息已发送"
      })
      setNewMessage('')
      setShowNewMessageDialog(false)
    } catch (error) {
      console.error('发送消息错误:', error)
      toast({
        title: "错误",
        description: "发送消息失败",
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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">未找到房源信息</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address_line1}, {property.city}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">月租金</p>
                    <p className="text-lg font-semibold">¥{property.rent_price_monthly}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">面积</p>
                    <p className="text-lg font-semibold">{property.area_sqm}㎡</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">户型</p>
                    <p className="text-lg font-semibold">{property.bedrooms}室{property.bathrooms}卫</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">类型</p>
                    <p className="text-lg font-semibold">{property.property_type}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">房源描述</h3>
                  <p className="text-gray-600">{property.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>房东信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">姓名</p>
                  <p className="text-sm text-gray-500">{property.landlord_info.username}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewMessageDialog(true)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    联系房东
                  </Button>
                  <Button
                    onClick={() => setShowBookingDialog(true)}
                    className="w-full"
                  >
                    预约看房
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 预约看房对话框 */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
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

      {/* 发送新消息对话框 */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>发送消息</DialogTitle>
            <DialogDescription>
              请输入您想发送给房东的消息内容
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
                if (!newMessage.trim()) {
                  toast({
                    title: "错误",
                    description: "请输入消息内容",
                    variant: "destructive"
                  })
                  return
                }
                await sendMessage()
              }}
            >
              发送
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 