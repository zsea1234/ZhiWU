"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { messageService } from "@/app/services/tenant/messageService"
import { formatDate } from "@/lib/utils"

interface Lease {
  id: number
  property_name: string
  start_date: string
  end_date: string
  monthly_rent: number
}

interface Payment {
  id: number
  amount: number
  status: string
  due_date: string
  property_name: string
}

interface MaintenanceRequest {
  id: number
  title: string
  status: string
  created_at: string
  property_name: string
}

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export default function Overview({ setActiveTab }: OverviewProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [latestLease, setLatestLease] = useState<Lease | null>(null)
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null)
  const [latestMaintenance, setLatestMaintenance] = useState<MaintenanceRequest | null>(null)

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
    }
  }

  // 获取最新租约
  const fetchLatestLease = async () => {
    try {
      const response = await fetch('/api/v1/leases?status=active&limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        setLatestLease(data.data[0])
      }
    } catch (error) {
      console.error('获取最新租约失败:', error)
    }
  }

  // 获取最新支付记录
  const fetchLatestPayment = async () => {
    try {
      const response = await fetch('/api/v1/payments?limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        setLatestPayment(data.data[0])
      }
    } catch (error) {
      console.error('获取最新支付记录失败:', error)
    }
  }

  // 获取最新维修申请
  const fetchLatestMaintenance = async () => {
    try {
      const response = await fetch('/api/v1/maintenance-requests?limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        setLatestMaintenance(data.data[0])
      }
    } catch (error) {
      console.error('获取最新维修申请失败:', error)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    fetchLatestLease()
    fetchLatestPayment()
    fetchLatestMaintenance()

    const interval = setInterval(fetchUnreadCount, 30000) // 每30秒检查一次
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 消息中心卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">最新消息</h3>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('messages')}
            >
              查看全部
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              您有 {unreadCount} 条未读消息
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 租约卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">当前租约</h3>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('leases')}
            >
              查看全部
            </Button>
          </div>
          <div className="mt-4">
            {latestLease ? (
              <div className="space-y-2">
                <p className="font-medium">{latestLease.property_name}</p>
                <p className="text-sm text-gray-600">
                  租期：{formatDate(latestLease.start_date)} 至 {formatDate(latestLease.end_date)}
                </p>
                <p className="text-sm text-gray-600">
                  月租：¥{latestLease.monthly_rent.toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">暂无租约信息</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 支付记录卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">最近支付</h3>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('payments')}
            >
              查看全部
            </Button>
          </div>
          <div className="mt-4">
            {latestPayment ? (
              <div className="space-y-2">
                <p className="font-medium">{latestPayment.property_name}</p>
                <p className="text-sm text-gray-600">
                  金额：¥{latestPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  状态：{latestPayment.status === 'pending' ? '待支付' : '已支付'}
                </p>
                <p className="text-sm text-gray-600">
                  到期日：{formatDate(latestPayment.due_date)}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">暂无支付记录</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 维修申请卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">维修申请</h3>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('maintenance')}
            >
              查看全部
            </Button>
          </div>
          <div className="mt-4">
            {latestMaintenance ? (
              <div className="space-y-2">
                <p className="font-medium">{latestMaintenance.title}</p>
                <p className="text-sm text-gray-600">
                  物业：{latestMaintenance.property_name}
                </p>
                <p className="text-sm text-gray-600">
                  状态：{
                    latestMaintenance.status === 'pending_assignment' ? '待分配' :
                    latestMaintenance.status === 'in_progress' ? '处理中' :
                    latestMaintenance.status === 'completed' ? '已完成' : '未知'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  申请时间：{formatDate(latestMaintenance.created_at)}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">暂无维修申请</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}