"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Check, X, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { maintenanceApi, MaintenanceType } from "@/app/services/api/maintenance"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    console.log('检查认证状态，token:', token ? '存在' : '不存在')
    
    if (!token) {
      console.log('未找到认证令牌，重定向到登录页面')
      router.push("/auth/login")
      return
    }

    console.log('开始加载维修请求列表')
    // 获取维修请求列表
    fetchMaintenanceRequests()
  }, [router, currentPage, selectedStatus])

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      console.log('开始获取维修请求列表，认证token:', token ? '存在' : '不存在')
      
      const params = {
        status: selectedStatus as MaintenanceType['status'] || undefined,
        page: currentPage,
        page_size: 10
      }
      console.log('请求参数:', params)

      const response = await maintenanceApi.list(params)
      console.log('API响应:', response)

      if (!response || !response.data) {
        console.error('API响应格式错误:', response)
        toast.error('获取维修请求列表失败：响应格式错误')
        return
      }

      console.log('维修请求数量：', response.data.length)
      console.log('总页数：', response.meta.last_page)
      console.log('当前页：', response.meta.current_page)
      console.log('响应数据示例：', response.data[0])

      setRequests(response.data)
      setTotalPages(response.meta.last_page)
    } catch (error) {
      console.error('获取维修请求列表失败:', error)
      toast.error('获取维修请求列表失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const handleRequestStatusChange = async (id: number, newStatus: MaintenanceType['status']) => {
    try {
      console.log('开始更新维修请求状态：', { id, newStatus })
      
      let updatedRequest: MaintenanceType
      
      switch (newStatus) {
        case 'assigned_to_worker':
          updatedRequest = await maintenanceApi.assignWorker(id, '维修工人', '13800138000')
          break
        case 'in_progress':
          updatedRequest = await maintenanceApi.startWork(id)
          break
        case 'completed':
          updatedRequest = await maintenanceApi.complete(id)
          break
        case 'closed_by_landlord':
          updatedRequest = await maintenanceApi.close(id)
          break
        default:
          updatedRequest = await maintenanceApi.update(id, { status: newStatus })
      }
      
      console.log('维修请求状态更新成功：', updatedRequest)
      
    setRequests(requests.map(request => 
        request.id === id ? updatedRequest : request
    ))
      
      toast.success('维修请求状态更新成功')
    } catch (error) {
      console.error('更新维修请求状态失败:', error)
      toast.error('更新维修请求状态失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_assignment: "secondary",
      assigned_to_worker: "default",
      in_progress: "default",
      completed: "secondary",
      cancelled_by_tenant: "destructive",
      closed_by_landlord: "secondary",
    } as const

    const labels = {
      pending_assignment: "待分配",
      assigned_to_worker: "已分配",
      in_progress: "处理中",
      completed: "已完成",
      cancelled_by_tenant: "已取消",
      closed_by_landlord: "已关闭",
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "secondary"}
        className="px-3 py-1 text-sm font-medium"
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const handlePageChange = (newPage: number) => {
    console.log('切换页码：', newPage)
    setCurrentPage(newPage)
  }

  const handleStatusChange = (value: string) => {
    console.log('切换状态筛选：', value)
    setSelectedStatus(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 调试输出当前状态
  console.log('当前页面状态：', {
    loading,
    currentPage,
    totalPages,
    selectedStatus,
    requestsCount: requests.length,
    requests: requests
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">正在加载维修请求列表...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">维修管理</h1>
        <p className="text-gray-600">处理租客的维修请求</p>
      </div>

      {/* 调试信息 */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">调试信息：</h3>
        <p>当前页码：{currentPage}</p>
        <p>总页数：{totalPages}</p>
        <p>当前筛选状态：{selectedStatus || '全部'}</p>
        <p>维修请求数量：{requests.length}</p>
      </div>

      {/* 筛选器 */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-48">
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending_assignment">待分配</SelectItem>
                <SelectItem value="assigned_to_worker">已分配</SelectItem>
                <SelectItem value="in_progress">处理中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled_by_tenant">已取消</SelectItem>
                <SelectItem value="closed_by_landlord">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                暂无维修请求
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{request.property_summary?.title || '未知房产'}</CardTitle>
                  <CardDescription>
                      提交时间：{new Date(request.submitted_at).toLocaleString()}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">租客</p>
                    <p className="text-lg font-semibold">{request.tenant_info?.username || '未知租客'}</p>
                    {request.tenant_info?.phone && (
                      <p className="text-sm text-gray-500">电话：{request.tenant_info.phone}</p>
                    )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">问题描述</p>
                  <p className="mt-1">{request.description}</p>
                </div>
                  {request.preferred_contact_time && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">首选联系时间</p>
                      <p className="mt-1">{request.preferred_contact_time}</p>
                    </div>
                  )}
                  {request.assigned_worker_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">维修工人</p>
                      <p className="mt-1">{request.assigned_worker_name}</p>
                      {request.worker_contact_info && (
                        <p className="text-sm text-gray-500">联系方式：{request.worker_contact_info}</p>
                      )}
                    </div>
                  )}
                  {request.resolution_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">解决方案备注</p>
                      <p className="mt-1">{request.resolution_notes}</p>
                    </div>
                  )}
                  {request.status === "pending_assignment" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestStatusChange(request.id, "assigned_to_worker")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        分配工人
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestStatusChange(request.id, "closed_by_landlord")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        关闭请求
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
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        联系租客
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
          ))
        )}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 
} 