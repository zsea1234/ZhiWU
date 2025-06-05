"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Payment {
  id: number
  lease_id: number
  tenant_id: number
  amount: number
  payment_method: 'wechat_pay' | 'alipay' | 'credit_card' | 'bank_transfer'
  status: 'pending' | 'successful' | 'failed' | 'refunded' | 'processing'
  description: string
  transaction_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  lease: {
    id: number
    property_summary: {
      title: string
      address_line1: string
      city: string
    }
  }
}

export default function PaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLease, setSelectedLease] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('wechat_pay')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
    // 检查认证
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchPayments()
  }, [router])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPayments(data.data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "错误",
        description: "获取支付记录失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedLease) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/payments/leases/${selectedLease}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentMethod
        })
      })

      if (!response.ok) {
        throw new Error('支付失败')
      }

      const data = await response.json()
      // 处理支付结果
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
      setPaymentDialogOpen(false)
      fetchPayments()
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "错误",
        description: "支付失败",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: Payment['status']) => {
    const statusMap = {
      'pending': { label: '待支付', variant: 'warning' },
      'successful': { label: '支付成功', variant: 'success' },
      'failed': { label: '支付失败', variant: 'destructive' },
      'refunded': { label: '已退款', variant: 'secondary' },
      'processing': { label: '处理中', variant: 'default' }
    }
    const { label, variant } = statusMap[status]
    return <Badge variant={variant as any}>{label}</Badge>
  }

  const getPaymentMethodLabel = (method: Payment['payment_method']) => {
    const methodMap = {
      'wechat_pay': '微信支付',
      'alipay': '支付宝',
      'credit_card': '信用卡',
      'bank_transfer': '银行转账'
    }
    return methodMap[method]
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">租金支付</h1>
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              支付租金
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>支付租金</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">选择租赁合同</label>
                <Select
                  value={selectedLease?.toString()}
                  onValueChange={(value) => setSelectedLease(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择租赁合同" />
                  </SelectTrigger>
                  <SelectContent>
                    {payments
                      .filter(payment => payment.status === 'pending')
                      .map(payment => (
                        <SelectItem
                          key={payment.lease_id}
                          value={payment.lease_id.toString()}
                        >
                          {payment.lease.property_summary.title} - ¥{payment.amount}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">支付方式</label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as Payment['payment_method'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择支付方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wechat_pay">微信支付</SelectItem>
                    <SelectItem value="alipay">支付宝</SelectItem>
                    <SelectItem value="credit_card">信用卡</SelectItem>
                    <SelectItem value="bank_transfer">银行转账</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handlePayment}
                className="w-full"
                disabled={!selectedLease}
              >
                确认支付
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
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>租金支付 #{payment.id}</CardTitle>
                    <CardDescription>
                      {payment.lease.property_summary.title}
                      <br />
                      {payment.lease.property_summary.address_line1}, {payment.lease.property_summary.city}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">支付金额</p>
                      <p className="text-2xl font-bold">¥{payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">支付方式</p>
                      <p className="text-sm text-gray-500">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </p>
                    </div>
                  </div>

                  {payment.description && (
                    <div>
                      <p className="text-sm font-medium">支付说明</p>
                      <p className="text-sm text-gray-500">{payment.description}</p>
                    </div>
                  )}

                  {payment.transaction_id && (
                    <div>
                      <p className="text-sm font-medium">交易号</p>
                      <p className="text-sm text-gray-500">{payment.transaction_id}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      创建时间：{new Date(payment.created_at).toLocaleString()}
                      {payment.paid_at && (
                        <>
                          <br />
                          支付时间：{new Date(payment.paid_at).toLocaleString()}
                        </>
                      )}
                    </div>
                    {payment.status === 'failed' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedLease(payment.lease_id)
                          setPaymentMethod(payment.payment_method)
                          setPaymentDialogOpen(true)
                        }}
                      >
                        重新支付
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