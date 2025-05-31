"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  MessageSquare,
  FileText,
  CreditCard,
  Settings,
  Plus,
  Eye,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock user data
const mockUser = {
  id: 1,
  username: "张三",
  role: "tenant",
  email: "zhangsan@example.com",
}

export default function TenantDashboard() {
  const [user, setUser] = useState(mockUser)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Get user role from localStorage or API
    const role = localStorage.getItem("user_role") || "tenant"
    setUser((prev) => ({ ...prev, role }))
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">智屋</span>
            </Link>
            <Badge variant="secondary">租客</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">欢迎，{user.username}</span>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">租客控制台</h1>
          <p className="text-gray-600">管理您的租房信息和服务</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">当前租约</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待支付租金</p>
                  <p className="text-2xl font-bold text-red-600">¥5,000</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">未读消息</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">维修申请</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="properties">房源搜索</TabsTrigger>
            <TabsTrigger value="bookings">我的预约</TabsTrigger>
            <TabsTrigger value="leases">租约管理</TabsTrigger>
            <TabsTrigger value="payments">支付记录</TabsTrigger>
            <TabsTrigger value="maintenance">维修申请</TabsTrigger>
            <TabsTrigger value="messages">消息中心</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
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
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>房源搜索</CardTitle>
                <CardDescription>寻找您理想的住所</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">开始搜索适合您的房源</p>
                  <Link href="/properties">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      搜索房源
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>我的预约</CardTitle>
                <CardDescription>看房预约记录</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">暂无预约记录</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
