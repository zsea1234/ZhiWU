"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Wrench, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MaintenanceRequest {
  id: number
  property_id: number
  tenant_id: number
  description: string
  preferred_contact_time: string | null
  status: 'PENDING_ASSIGNMENT' | 'ASSIGNED_TO_WORKER' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_TENANT' | 'CLOSED_BY_LANDLORD'
  created_at: string
  updated_at: string
  completed_at: string | null
  assigned_worker_name: string | null
  worker_contact_info: string | null
  resolution_notes: string | null
  property: {
    id: number
    title: string
    address_line1: string
    city: string
  }
}

export default function MaintenancePage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false)
  const [newRequest, setNewRequest] = useState({
    property_id: 0,
    description: '',
    preferred_contact_time: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/maintenance-requests')
      const data = await response.json()
      setRequests(data.data)
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      toast({
        title: "错误",
        description: "获取维修申请列表失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    try {
      const response = await fetch('/api/v1/maintenance-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequest)
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "维修申请已提交"
        })
        setNewRequestDialogOpen(false)
        fetchRequests()
      } else {
        throw new Error('提交维修申请失败')
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
      toast({
        title: "错误",
        description: "提交维修申请失败",
        variant: "destructive"
      })
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/v1/maintenance-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'CANCELLED_BY_TENANT'
        })
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "维修申请已取消"
        })
        fetchRequests()
      } else {
        throw new Error('取消维修申请失败')
      }
    } catch (error) {
      console.error('Error cancelling maintenance request:', error)
      toast({
        title: "错误",
        description: "取消维修申请失败",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: MaintenanceRequest['status']) => {
    const statusMap = {
      'PENDING_ASSIGNMENT': { label: '待指派', variant: 'default' },
      'ASSIGNED_TO_WORKER': { label: '已指派', variant: 'warning' },
      'IN_PROGRESS': { label: '处理中', variant: 'warning' },
      'COMPLETED': { label: '已完成', variant: 'success' },
      'CANCELLED_BY_TENANT': { label: '已取消', variant: 'destructive' },
      'CLOSED_BY_LANDLORD': { label: '已关闭', variant: 'secondary' }
    }
    const { label, variant } = statusMap[status]
    return <Badge variant={variant as any}>{label}</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">维修申请</h1>
        <Dialog open={newRequestDialogOpen} onOpenChange={setNewRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              提交维修申请
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提交维修申请</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">问题描述</label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({
                    ...newRequest,
                    description: e.target.value
                  })}
                  placeholder="请详细描述需要维修的问题..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">期望联系时间</label>
                <Input
                  value={newRequest.preferred_contact_time}
                  onChange={(e) => setNewRequest({
                    ...newRequest,
                    preferred_contact_time: e.target.value
                  })}
                  placeholder="例如：工作日下午"
                />
              </div>
              <Button onClick={handleSubmitRequest} className="w-full">
                提交申请
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>维修申请 #{request.id}</CardTitle>
                    <CardDescription>
                      {request.property.title}
                      <br />
                      {request.property.address_line1}, {request.property.city}
                    </CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">问题描述</p>
                    <p className="text-sm text-gray-500">{request.description}</p>
                  </div>

                  {request.preferred_contact_time && (
                    <div>
                      <p className="text-sm font-medium">期望联系时间</p>
                      <p className="text-sm text-gray-500">{request.preferred_contact_time}</p>
                    </div>
                  )}

                  {request.assigned_worker_name && (
                    <div>
                      <p className="text-sm font-medium">维修人员</p>
                      <p className="text-sm text-gray-500">
                        {request.assigned_worker_name}
                        {request.worker_contact_info && ` (${request.worker_contact_info})`}
                      </p>
                    </div>
                  )}

                  {request.resolution_notes && (
                    <div>
                      <p className="text-sm font-medium">处理结果</p>
                      <p className="text-sm text-gray-500">{request.resolution_notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      提交时间：{new Date(request.created_at).toLocaleString()}
                      {request.completed_at && (
                        <>
                          <br />
                          完成时间：{new Date(request.completed_at).toLocaleString()}
                        </>
                      )}
                    </div>
                    {request.status === 'PENDING_ASSIGNMENT' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        取消申请
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