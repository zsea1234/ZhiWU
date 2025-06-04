"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Download } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data
const mockLeases = [
  {
    id: 1,
    property: "朝阳区幸福小区 2室1厅",
    tenant: "张三",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    monthlyRent: 5000,
    status: "active",
    deposit: 5000,
  },
  {
    id: 2,
    property: "海淀区阳光花园 3室2厅",
    tenant: "李四",
    startDate: "2023-12-01",
    endDate: "2024-11-30",
    monthlyRent: 8000,
    status: "active",
    deposit: 8000,
  },
]

export default function LeasesPage() {
  const [leases, setLeases] = useState(mockLeases)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      expired: "secondary",
    } as const

    const labels = {
      active: "生效中",
      expired: "已到期",
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">租约管理</h1>
        <p className="text-gray-600">管理您的租约合同</p>
      </div>

      <div className="space-y-6">
        {leases.map((lease) => (
          <Card key={lease.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{lease.property}</CardTitle>
                  <CardDescription>
                    租期：{lease.startDate} 至 {lease.endDate}
                  </CardDescription>
                </div>
                {getStatusBadge(lease.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">租客</p>
                    <p className="text-lg font-semibold">{lease.tenant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">月租金</p>
                    <p className="text-lg font-semibold">¥{lease.monthlyRent}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">押金</p>
                    <p className="text-lg font-semibold">¥{lease.deposit}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    查看合同
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    下载合同
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 