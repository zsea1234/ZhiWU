"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, Home, FileText } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  // You could pass details like amount or leaseId via query params if needed
  // const amount = searchParams.get("amount")
  // const leaseId = searchParams.get("leaseId")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">支付成功！</CardTitle>
          <CardDescription>您的租金已成功支付。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 
          // Optional: Display payment details if passed
          {amount && leaseId && (
            <div className="p-4 bg-gray-100 rounded-lg text-sm">
              <p><strong>合同ID:</strong> {leaseId}</p>
              <p><strong>支付金额:</strong> ¥{parseFloat(amount).toLocaleString()}</p>
              <p><strong>交易时间:</strong> {new Date().toLocaleString()}</p>
            </div>
          )}
          */}
          <p className="text-sm text-gray-700 text-center">
            感谢您的及时支付。您可以在控制台查看您的最新租约状态和支付历史。
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/dashboard">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                返回控制台
              </Button>
            </Link>
            <Link href="/dashboard/payments/history">
              {" "}
              {/* Assuming a payment history page might exist */}
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                查看支付历史
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500 text-center">如果遇到任何问题，请联系我们的客服。</p>
        </CardContent>
      </Card>
    </div>
  )
}
