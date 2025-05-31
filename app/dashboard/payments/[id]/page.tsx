"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, fetch this based on params.id
const mockPaymentDetails = {
  leaseId: "L12345",
  propertyAddress: "朝阳区幸福小区 2室1厅",
  rentAmount: 5000,
  dueDate: "2025-07-01",
  tenantName: "张三",
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id // This would be the lease ID or a specific payment record ID

  // In a real app, you'd fetch payment/lease details using paymentId
  const paymentDetails = mockPaymentDetails

  const handlePayment = () => {
    // Directly redirect to the payment success page
    router.push("/dashboard/payments/success")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回控制台
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">支付租金</CardTitle>
            <CardDescription>
              为您的租约 <span className="font-semibold">{paymentDetails.leaseId}</span> 支付租金。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">租约信息</h3>
              <p>
                <strong>房产：</strong> {paymentDetails.propertyAddress}
              </p>
              <p>
                <strong>租客：</strong> {paymentDetails.tenantName}
              </p>
              <p>
                <strong>应付金额：</strong>{" "}
                <span className="text-red-600 font-bold text-xl">¥{paymentDetails.rentAmount.toLocaleString()}</span>
              </p>
              <p>
                <strong>支付截止日期：</strong> {paymentDetails.dueDate}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="text-base font-medium">
                选择支付方式
              </Label>
              <Select defaultValue="alipay">
                <SelectTrigger id="paymentMethod" className="mt-1">
                  <SelectValue placeholder="选择支付方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="wechatpay">微信支付</SelectItem>
                  <SelectItem value="card">银行卡支付</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Placeholder for payment form fields if needed, e.g., card details */}
            {/* For simplicity, we'll assume integrated payment gateways */}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>您的支付信息将得到安全处理。</span>
            </div>

            <Button size="lg" className="w-full" onClick={handlePayment}>
              <CreditCard className="h-5 w-5 mr-2" />
              确认支付 ¥{paymentDetails.rentAmount.toLocaleString()}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              点击确认支付即表示您同意我们的{" "}
              <Link href="/terms" className="underline hover:text-blue-600">
                支付条款
              </Link>
              。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
