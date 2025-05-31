"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

// Mock data - in a real app, fetch this based on params.id
const mockLeaseDetails = {
  leaseId: "L12345",
  propertyAddress: "北京市朝阳区幸福路123号 幸福小区 1号楼 2单元 301室",
  tenantName: "张三",
  landlordName: "李房东",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  rentAmount: 5000,
  depositAmount: 10000,
  paymentFrequency: "月付",
  terms: [
    "租客应按时支付租金，逾期将产生滞纳金。",
    "租客应妥善保管房屋内设施，如有损坏需照价赔偿。",
    "租赁期内，未经房东书面同意，租客不得转租或改变房屋用途。",
    "退租时，房屋需保持清洁，并结清所有费用。",
  ],
  contractUrl: "/placeholder-contract.pdf", // Placeholder for actual contract URL
}

export default function LeaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leaseId = params.id

  // In a real app, you'd fetch lease details using leaseId
  const lease = mockLeaseDetails

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回控制台
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-600" />
                  租赁合同详情
                </CardTitle>
                <CardDescription>合同编号：{lease.leaseId}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">房产地址</h3>
                <p>{lease.propertyAddress}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">租客姓名</h3>
                <p>{lease.tenantName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">房东姓名</h3>
                <p>{lease.landlordName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">租赁期限</h3>
                <p>
                  {lease.startDate} 至 {lease.endDate}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">月租金</h3>
                <p>¥{lease.rentAmount.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">押金</h3>
                <p>¥{lease.depositAmount.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">支付频率</h3>
                <p>{lease.paymentFrequency}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">合同条款</h3>
              <ul className="space-y-2 list-disc list-inside text-gray-700 bg-gray-50 p-4 rounded-md">
                {lease.terms.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                如有任何疑问，请联系{" "}
                <Link href="/contact" className="underline hover:text-blue-600">
                  客服支持
                </Link>
                。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
