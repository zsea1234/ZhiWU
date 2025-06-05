"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, MapPin, Calendar, MessageSquare, X, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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
  property: {
    id: number
    title: string
    address_line1: string
    city: string
    main_image_url: string
  }
  landlord: {
    id: number
    username: string
    phone: string
  }
}

export default function BookingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchBookings()
  }, [router])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/bookings/tenant', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('预约列表数据:', data)
      
      if (data.success && data.data && data.data.items) {
        const formattedBookings = data.data.items.map((booking: any) => {
          console.log('单个预约数据:', booking)
          return {
            booking_id: booking.id || booking.booking_id,
            property_id: booking.property_id,
            tenant_id: booking.tenant_id,
            landlord_id: booking.landlord_id,
            requested_datetime: booking.requested_datetime,
            notes_for_landlord: booking.notes_for_landlord,
            landlord_notes: booking.landlord_notes,
            status: booking.status,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
            property: {
              id: booking.property_id,
              title: booking.property?.title || '未知房源',
              address_line1: booking.property?.address_line1 || '未知地址',
              city: booking.property?.city || '未知城市',
              main_image_url: booking.property?.main_image_url
            },
            landlord: {
              id: booking.landlord_id,
              username: booking.landlord?.username || '未知房东',
              phone: booking.landlord?.phone || '未知电话'
            }
          }
        })
        console.log('格式化后的预约列表:', formattedBookings)
        setBookings(formattedBookings)
      } else {
        console.error('无效的数据格式:', data)
        setBookings([])
        toast({
          title: "错误",
          description: "获取预约列表失败",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('获取预约列表错误:', error)
      toast({
        title: "错误",
        description: "获取预约列表失败",
        variant: "destructive"
      })
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    console.log('获取状态标签，当前状态:', status)
    const statusMap: Record<string, { label: string; variant: string }> = {
      'PENDING_CONFIRMATION': { label: '待确认', variant: 'warning' },
      'CONFIRMED_BY_LANDLORD': { label: '已确认', variant: 'success' },
      'CANCELLED_BY_TENANT': { label: '已取消', variant: 'destructive' },
      'CANCELLED_BY_LANDLORD': { label: '房东已取消', variant: 'destructive' },
      'COMPLETED': { label: '已完成', variant: 'secondary' },
      'EXPIRED': { label: '已过期', variant: 'secondary' }
    }

    const statusInfo = statusMap[status] || { label: '未知状态', variant: 'secondary' }
    console.log('状态信息:', statusInfo)
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('取消预约，ID:', bookingId)
      
      const response = await fetch(`http://localhost:5001/api/v1/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: "租客取消预约"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '取消预约失败')
      }

      toast({
        title: "成功",
        description: "预约已取消"
      })
      fetchBookings() // 重新获取预约列表
    } catch (error) {
      console.error('取消预约错误:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "取消预约失败",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">看房预约</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">暂无预约记录</p>
          <Button onClick={() => router.push('/dashboard/tenant/properties')}>
            去预约看房
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            console.log('渲染预约卡片，数据:', booking)
            return (
              <Card key={booking.booking_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{booking.property?.title || '未知房源'}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4" />
                        {booking.property?.address_line1 || '未知地址'}, {booking.property?.city || '未知城市'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>预约时间：{new Date(booking.requested_datetime).toLocaleString()}</span>
                    </div>
                    
                    {booking.notes_for_landlord && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-1" />
                        <div>
                          <p className="text-sm font-medium">给房东的留言：</p>
                          <p className="text-sm text-gray-500">{booking.notes_for_landlord}</p>
                        </div>
                      </div>
                    )}

                    {booking.landlord_notes && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-1" />
                        <div>
                          <p className="text-sm font-medium">房东回复：</p>
                          <p className="text-sm text-gray-500">{booking.landlord_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="text-sm text-gray-500">
                        <p>房东：{booking.landlord?.username || '未知房东'}</p>
                        <p>联系电话：{booking.landlord?.phone || '未知电话'}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('点击查看详情按钮')
                            setSelectedBooking(booking)
                            setDetailDialogOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            console.log('点击取消预约按钮')
                            handleCancelBooking(booking.booking_id)
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消预约
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 预约详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>预约详情</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">房源信息</h3>
                <p>{selectedBooking.property?.title}</p>
                <p>{selectedBooking.property?.address_line1}, {selectedBooking.property?.city}</p>
              </div>
              <div>
                <h3 className="font-medium">预约时间</h3>
                <p>{new Date(selectedBooking.requested_datetime).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium">状态</h3>
                {getStatusBadge(selectedBooking.status)}
              </div>
              {selectedBooking.notes_for_landlord && (
                <div>
                  <h3 className="font-medium">给房东的留言</h3>
                  <p>{selectedBooking.notes_for_landlord}</p>
                </div>
              )}
              {selectedBooking.landlord_notes && (
                <div>
                  <h3 className="font-medium">房东回复</h3>
                  <p>{selectedBooking.landlord_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}