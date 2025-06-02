"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { getLeasePayments, PaymentRecord, PaymentStatus, PaymentMethod } from "../../../services/payment"

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        // 这里需要从当前租约ID获取支付记录
        // 实际使用时需要从路由参数或状态管理中获取当前租约ID
        const leaseId = 1 // 示例ID，实际使用时需要替换
        const response = await getLeasePayments(leaseId)
        setPayments(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取支付记录失败")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [router])

  // 获取支付方式的中文显示
  const getPaymentMethodText = (method: PaymentMethod): string => {
    const methodMap: Record<PaymentMethod, string> = {
      wechat_pay: "微信支付",
      alipay: "支付宝",
      credit_card: "信用卡",
      bank_transfer: "银行转账"
    }
    return methodMap[method]
  }

  // 获取支付状态的中文显示和样式
  const getPaymentStatus = (status: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, { text: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { text: "待支付", variant: "secondary" },
      successful: { text: "支付成功", variant: "default" },
      failed: { text: "支付失败", variant: "destructive" },
      refunded: { text: "已退款", variant: "secondary" },
      processing: { text: "处理中", variant: "secondary" }
    }
    return statusMap[status]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
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
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{payment.description || "租金支付"}</CardTitle>
                <CardDescription>
                  支付日期：{payment.paid_at ? format(new Date(payment.paid_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN }) : '未支付'}
                </CardDescription>
              </div>
              <Badge variant={getPaymentStatus(payment.status).variant}>
                {getPaymentStatus(payment.status).text}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">支付金额</p>
                  <p className="text-lg font-semibold">¥{payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">支付方式</p>
                  <p className="text-lg font-semibold">{getPaymentMethodText(payment.payment_method)}</p>
                </div>
              </div>
              {payment.status === "successful" && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/api/payments/${payment.id}/receipt`, '_blank')}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    查看收据
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `/api/payments/${payment.id}/receipt`
                      link.download = `支付收据_${format(new Date(payment.paid_at!), 'yyyyMMdd')}.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载收据
                  </Button>
                </div>
              )}
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