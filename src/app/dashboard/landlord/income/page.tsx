"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data
const mockIncome = {
  totalIncome: 150000,
  monthlyIncome: 13000,
  pendingIncome: 5000,
  transactions: [
    {
      id: 1,
      property: "朝阳区幸福小区 2室1厅",
      tenant: "张三",
      amount: 5000,
      type: "rent",
      date: "2024-03-01",
      status: "paid",
    },
    {
      id: 2,
      property: "海淀区阳光花园 3室2厅",
      tenant: "李四",
      amount: 8000,
      type: "rent",
      date: "2024-03-01",
      status: "paid",
    },
  ],
}

export default function IncomePage() {
  const [income] = useState(mockIncome)
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
      paid: "default",
      pending: "secondary",
    } as const

    const labels = {
      paid: "已支付",
      pending: "待支付",
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">收入统计</h1>
        <p className="text-gray-600">查看您的收入明细</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{income.totalIncome}</div>
            <p className="text-xs text-gray-500">累计收入</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月收入</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{income.monthlyIncome}</div>
            <p className="text-xs text-gray-500">3月收入</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待收金额</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{income.pendingIncome}</div>
            <p className="text-xs text-gray-500">待处理收入</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">交易记录</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          导出记录
        </Button>
      </div>

      <div className="space-y-6">
        {income.transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{transaction.property}</CardTitle>
                  <CardDescription>
                    交易日期：{transaction.date}
                  </CardDescription>
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">租客</p>
                    <p className="text-lg font-semibold">{transaction.tenant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">金额</p>
                    <p className="text-lg font-semibold">¥{transaction.amount}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">交易类型</p>
                  <p className="text-lg font-semibold">
                    {transaction.type === "rent" ? "租金" : "押金"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 