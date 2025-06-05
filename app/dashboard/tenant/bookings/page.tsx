"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, X } from "lucide-react"
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

  useEffect(() => {
    // 检查认证
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
      setBookings(data.data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        title: "错误",
        description: "获取预约列表失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED_BY_TENANT'
        })
      })

      if (!response.ok) {
        throw new Error('取消预约失败')
      }

      toast({
        title: "成功",
        description: "预约已取消"
      })
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "错误",
        description: "取消预约失败",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    const statusMap = {
      'PENDING_CONFIRMATION': { label: '待确认', variant: 'default' },
      'CONFIRMED_BY_LANDLORD': { label: '已确认', variant: 'success' },
      'CANCELLED_BY_TENANT': { label: '已取消', variant: 'destructive' },
      'CANCELLED_BY_LANDLORD': { label: '房东已取消', variant: 'destructive' },
      'COMPLETED': { label: '已完成', variant: 'success' },
      'EXPIRED': { label: '已过期', variant: 'secondary' }
    }
    const { label, variant } = statusMap[status]
    return <Badge variant={variant as any}>{label}</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">看房预约</h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.booking_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{booking.property.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {booking.property.address_line1}, {booking.property.city}
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
                    <div>
                      <p className="text-sm font-medium">给房东的留言：</p>
                      <p className="text-sm text-gray-500">{booking.notes_for_landlord}</p>
                    </div>
                  )}

                  {booking.landlord_notes && (
                    <div>
                      <p className="text-sm font-medium">房东回复：</p>
                      <p className="text-sm text-gray-500">{booking.landlord_notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      房东：{booking.landlord.username}
                      <br />
                      联系电话：{booking.landlord.phone}
                    </div>
                    {booking.status === 'PENDING_CONFIRMATION' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.booking_id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消预约
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}