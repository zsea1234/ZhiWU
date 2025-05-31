"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Check, X, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data
const mockRequests = [
  {
    id: 1,
    property: "朝阳区幸福小区 2室1厅",
    tenant: "张三",
    title: "厨房水龙头漏水",
    description: "厨房水龙头一直在滴水，需要维修",
    status: "pending",
    createdAt: "2024-03-15",
  },
  {
    id: 2,
    property: "海淀区阳光花园 3室2厅",
    tenant: "李四",
    title: "空调不制冷",
    description: "客厅的空调开启后不制冷，可能需要加氟",
    status: "in_progress",
    createdAt: "2024-03-10",
  },
]

export default function MaintenancePage() {
  const [requests, setRequests] = useState(mockRequests)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleRequestStatusChange = (id: number, newStatus: string) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: newStatus } : request
    ))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
    } as const

    const labels = {
      pending: "待处理",
      in_progress: "处理中",
      completed: "已完成",
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">维修管理</h1>
        <p className="text-gray-600">处理租客的维修请求</p>
      </div>

      <div className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.property}</CardTitle>
                  <CardDescription>
                    提交时间：{request.createdAt}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">租客</p>
                  <p className="text-lg font-semibold">{request.tenant}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">问题标题</p>
                  <p className="text-lg font-semibold">{request.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">问题描述</p>
                  <p className="mt-1">{request.description}</p>
                </div>
                {request.status === "pending" && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestStatusChange(request.id, "in_progress")}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      开始处理
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestStatusChange(request.id, "completed")}
                    >
                      <X className="h-4 w-4 mr-2" />
                      标记完成
                    </Button>
                  </div>
                )}
                {request.status === "in_progress" && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestStatusChange(request.id, "completed")}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      标记完成
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      联系租客
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