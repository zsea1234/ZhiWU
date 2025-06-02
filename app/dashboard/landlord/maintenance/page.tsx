"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Check, X, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { maintenanceService, MaintenanceRequest } from "@/app/services/maintenance"
import { toast } from "sonner"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchRequests()
  }, [router])

  const fetchRequests = async () => {
    try {
      const response = await maintenanceService.getMaintenanceRequests()
      setRequests(response.data)
    } catch (error) {
      toast.error('获取维修申请列表失败')
      console.error('获取维修申请列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestStatusChange = async (id: number, newStatus: string) => {
    try {
      await maintenanceService.updateMaintenanceRequest(id, {
        status: newStatus as any,
        resolution_notes: newStatus === 'completed' ? '维修已完成' : undefined
      })
      toast.success('状态更新成功')
      fetchRequests()
    } catch (error) {
      toast.error('状态更新失败')
      console.error('状态更新失败:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending_assignment: { label: '待指派', variant: 'secondary' },
      assigned_to_worker: { label: '已指派', variant: 'default' },
      in_progress: { label: '处理中', variant: 'default' },
      completed: { label: '已完成', variant: 'outline' },
      cancelled_by_tenant: { label: '已取消', variant: 'destructive' },
      closed_by_landlord: { label: '已关闭', variant: 'destructive' }
    }

    const { label, variant } = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={variant}>{label}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">维修管理</h1>
        <p className="text-gray-600">处理租客的维修请求</p>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <p className="text-center text-gray-500">暂无维修申请记录</p>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{request.property_summary.title}</CardTitle>
                    <CardDescription>
                      提交时间：{format(new Date(request.submitted_at), 'PPP', { locale: zhCN })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">租客</p>
                    <p className="text-lg font-semibold">{request.tenant_info.username}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">问题描述</p>
                    <p className="mt-1">{request.description}</p>
                  </div>
                  {request.preferred_contact_time && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">期望联系时间</p>
                      <p className="mt-1">{request.preferred_contact_time}</p>
                    </div>
                  )}
                  {request.status === "pending_assignment" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestStatusChange(request.id, "assigned_to_worker")}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        指派维修工
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestStatusChange(request.id, "in_progress")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        开始处理
                      </Button>
                    </div>
                  )}
                  {request.status === "assigned_to_worker" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestStatusChange(request.id, "in_progress")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        开始处理
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
                    </div>
                  )}
                  {request.status !== "completed" && request.status !== "cancelled_by_tenant" && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      联系租客
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 