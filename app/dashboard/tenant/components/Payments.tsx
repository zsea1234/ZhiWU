"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock payment data
const mockPayments = [
  {
    id: 1,
    date: "2024-03-01",
    amount: 5000,
    status: "paid",
    type: "rent",
    property: "朝阳区幸福小区 2室1厅",
  },
  {
    id: 2,
    date: "2024-02-01",
    amount: 5000,
    status: "paid",
    type: "rent",
    property: "朝阳区幸福小区 2室1厅",
  },
  {
    id: 3,
    date: "2024-01-01",
    amount: 5000,
    status: "paid",
    type: "rent",
    property: "朝阳区幸福小区 2室1厅",
  },
]

export default function Payments() {
  const [payments, setPayments] = useState(mockPayments)
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
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{payment.property}</CardTitle>
                <CardDescription>
                  支付日期：{payment.date}
                </CardDescription>
              </div>
              <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                {payment.status === "paid" ? "已支付" : "待支付"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">支付金额</p>
                  <p className="text-lg font-semibold">¥{payment.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">支付类型</p>
                  <p className="text-lg font-semibold">
                    {payment.type === "rent" ? "租金" : "押金"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  查看收据
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  下载收据
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {payments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">暂无支付记录</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}