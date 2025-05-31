"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  MessageSquare,
  FileText,
  CreditCard,
  Settings,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// 导入各个组件
import Overview from "./components/Overview"
import Properties from "./components/Properties"
import Bookings from "./components/Bookings"
import Leases from "./components/Leases"
import Payments from "./components/Payments"
import Maintenance from "./components/Maintenance"
import Messages from "./components/Messages"

// Mock user data
const mockUser = {
  id: 1,
  username: "张三",
  role: "tenant",
  email: "zhangsan@example.com",
}

export default function TenantDashboard() {
  const [user, setUser] = useState(mockUser)
  const [activeTab, setActiveTab] = useState("overview")
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

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />
      case "properties":
        return <Properties />
      case "bookings":
        return <Bookings />
      case "leases":
        return <Leases />
      case "payments":
        return <Payments />
      case "maintenance":
        return <Maintenance />
      case "messages":
        return <Messages />
      default:
        return <Overview />
    }
  }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="properties">房源搜索</TabsTrigger>
            <TabsTrigger value="bookings">我的预约</TabsTrigger>
            <TabsTrigger value="leases">租约管理</TabsTrigger>
            <TabsTrigger value="payments">支付记录</TabsTrigger>
            <TabsTrigger value="maintenance">维修申请</TabsTrigger>
            <TabsTrigger value="messages">消息中心</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {renderContent()}
          </div>
        </Tabs>
      </div>
    </div>
  )
}