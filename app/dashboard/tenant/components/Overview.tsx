import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, CreditCard } from "lucide-react"
import Link from "next/link"

export default function Overview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Lease */}
      <Card>
        <CardHeader>
          <CardTitle>当前租约</CardTitle>
          <CardDescription>您的租赁合同信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">朝阳区幸福小区 2室1厅</h4>
              <p className="text-sm text-gray-600">租期：2024-01-01 至 2024-12-31</p>
              <p className="text-sm text-gray-600">月租金：¥5,000</p>
            </div>
            <div className="flex space-x-2">
            <Link href="/dashboard/leases/1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          查看合同
                        </Button>
                      </Link>
                      <Link href="/dashboard/payments/1">
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          支付租金
                        </Button>
                      </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle>最近消息</CardTitle>
          <CardDescription>与房东的沟通记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { from: "李房东", message: "下月租金请按时支付", time: "2小时前" },
              { from: "李房东", message: "维修工明天上午会过去", time: "1天前" },
              { from: "系统通知", message: "租金支付提醒", time: "3天前" },
            ].map((msg, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{msg.from}</p>
                  <p className="text-sm text-gray-600">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/messages">
                    <Button variant="outline" className="w-full mt-4">
                      查看所有消息
                    </Button>
                  </Link>
        </CardContent>
      </Card>
    </div>
  )
}