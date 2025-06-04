"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data
const mockBookings = [
  {
    id: 1,
    property: "朝阳区幸福小区 2室1厅",
    tenant: "张三",
    date: "2024-03-20",
    time: "14:00",
    status: "pending",
    contact: "13800138000",
  },
  {
    id: 2,
    property: "海淀区阳光花园 3室2厅",
    tenant: "李四",
    date: "2024-03-18",
    time: "10:30",
    status: "confirmed",
    contact: "13900139000",
  },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleBookingStatusChange = (id: number, newStatus: string) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status: newStatus } : booking
    ))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      rejected: "destructive",
    } as const

    const labels = {
      pending: "待确认",
      confirmed: "已确认",
      rejected: "已拒绝",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">预约管理</h1>
        <p className="text-gray-600">管理租客看房预约</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{booking.property}</CardTitle>
                  <CardDescription>
                    预约时间：{booking.date} {booking.time}
                  </CardDescription>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">租客姓名</p>
                    <p className="text-lg font-semibold">{booking.tenant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">联系电话</p>
                    <p className="text-lg font-semibold">{booking.contact}</p>
                  </div>
                </div>
                {booking.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBookingStatusChange(booking.id, "confirmed")}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      确认预约
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBookingStatusChange(booking.id, "rejected")}
                    >
                      <X className="h-4 w-4 mr-2" />
                      拒绝预约
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 