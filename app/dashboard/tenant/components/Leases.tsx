"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock lease data
const mockLeases = [
  {
    id: 1,
    property: "朝阳区幸福小区 2室1厅",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    monthlyRent: 5000,
    status: "active",
    landlord: "李四",
  },
]

export default function Leases() {
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

  return (
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
              <Badge variant={lease.status === "active" ? "default" : "secondary"}>
                {lease.status === "active" ? "生效中" : "已结束"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">月租金</p>
                  <p className="text-lg font-semibold">¥{lease.monthlyRent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">房东</p>
                  <p className="text-lg font-semibold">{lease.landlord}</p>
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