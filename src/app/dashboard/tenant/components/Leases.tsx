"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { leaseService, Lease } from "../../../services/tenant/lease"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function Leases() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (token === null) {
          router.push("/auth/login")
          return
        }

        const response = await leaseService.getLeases()
        setLeases(response)
        setError(null)
      } catch (err) {
        setError('获取租约列表失败')
        console.error('获取租约列表失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeases()
  }, [router])

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      pending_tenant_signature: '待租客签署',
      pending_landlord_signature: '待房东签署',
      active: '生效中',
      expired: '已到期',
      terminated_early: '提前终止',
      payment_due: '租金逾期'
    }
    return statusMap[status] || status
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'expired':
      case 'terminated_early':
      case 'payment_due':
        return 'destructive'
      case 'pending_tenant_signature':
      case 'pending_landlord_signature':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">加载中...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {leases.map((lease) => (
        <Card key={lease.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{lease.property.title}</CardTitle>
                <CardDescription>
                  租期：{format(new Date(lease.start_date), 'yyyy年MM月dd日', { locale: zhCN })} 至{' '}
                  {format(new Date(lease.end_date), 'yyyy年MM月dd日', { locale: zhCN })}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(lease.status)}>
                {getStatusText(lease.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">月租金</p>
                  <p className="text-lg font-semibold">¥{lease.monthly_rent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">房东</p>
                  <p className="text-lg font-semibold">{lease.property.address_summary}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {lease.property.id && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/leases/${lease.id}/documents`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      查看合同
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`/leases/${lease.id}/documents/download`, '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      下载合同
                    </Button>
                  </>
                )}
                {lease.status === 'pending_tenant_signature' && (
                  <Button variant="default" size="sm">
                    签署合同
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {leases.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">暂无租约记录</p>
            <Link href="/properties">
              <Button>
                浏览房源
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}