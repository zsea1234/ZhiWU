"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wrench, Plus, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock maintenance requests
const mockRequests = [
  {
    id: 1,
    title: "厨房水龙头漏水",
    description: "厨房水龙头一直在滴水，需要维修",
    status: "pending",
    createdAt: "2024-03-15",
    property: "朝阳区幸福小区 2室1厅",
  },
  {
    id: 2,
    title: "空调不制冷",
    description: "客厅的空调开启后不制冷，可能需要加氟",
    status: "in_progress",
    createdAt: "2024-03-10",
    property: "朝阳区幸福小区 2室1厅",
  },
  {
    id: 3,
    title: "门锁故障",
    description: "大门门锁有时无法正常打开",
    status: "completed",
    createdAt: "2024-03-01",
    property: "朝阳区幸福小区 2室1厅",
  },
]

export default function MaintenancePage() {
  const [requests, setRequests] = useState(mockRequests)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const request = {
      id: requests.length + 1,
      ...newRequest,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      property: "朝阳区幸福小区 2室1厅",
    }
    setRequests([request, ...requests])
    setNewRequest({ title: "", description: "" })
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary" as const,
      in_progress: "default" as const,
      completed: "default" as const,
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">维修请求</h1>
          <p className="text-gray-600">提交和管理您的维修请求</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建请求
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建维修请求</DialogTitle>
              <DialogDescription>
                请详细描述您遇到的问题，以便我们更好地为您服务
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    问题标题
                  </label>
                  <Input
                    id="title"
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, title: e.target.value })
                    }
                    placeholder="例如：水龙头漏水"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    问题描述
                  </label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, description: e.target.value })
                    }
                    placeholder="请详细描述问题..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">提交请求</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{request.title}</CardTitle>
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
                  <p className="text-sm font-medium text-gray-600">问题描述</p>
                  <p className="mt-1">{request.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">房屋信息</p>
                  <p className="mt-1">{request.property}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    联系房东
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">暂无维修请求</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新建请求
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 