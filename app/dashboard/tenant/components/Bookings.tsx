import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Bookings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>我的预约</CardTitle>
        <CardDescription>看房预约记录</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">暂无预约记录</p>
      </CardContent>
    </Card>
  )
}