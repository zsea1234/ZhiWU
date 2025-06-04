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
  Users,
  Shield,
  AlertTriangle,
  BarChart,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock user data
const mockUser = {
  id: 1,
  username: "王xing",
  role: "admin",
  email: "wangwu@example.com",
}

export default function AdminDashboard() {
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
    const role = localStorage.getItem("user_role") || "admin"
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
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              管理员
            </Badge>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理员控制台</h1>
          <p className="text-gray-600">系统管理和监控</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总房源数</p>
                  <p className="text-2xl font-bold">567</p>
                </div>
                <Home className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃租约</p>
                  <p className="text-2xl font-bold">345</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待处理投诉</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="properties">房源管理</TabsTrigger>
            <TabsTrigger value="reports">报表统计</TabsTrigger>
            <TabsTrigger value="complaints">投诉管理</TabsTrigger>
            <TabsTrigger value="system">系统监控</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>系统概览</CardTitle>
                  <CardDescription>平台运营数据</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>今日新增用户</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span>今日新增房源</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>今日成交租约</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>系统运行时间</span>
                      <span className="font-medium">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>待处理事项</CardTitle>
                  <CardDescription>需要管理员处理的事项</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "投诉", content: "用户投诉房源虚假信息", urgent: true },
                      { type: "审核", content: "5个房源待审核", urgent: false },
                      { type: "系统", content: "数据库性能告警", urgent: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Badge variant={item.urgent ? "destructive" : "secondary"} className="mt-1">
                          {item.type}
                        </Badge>
                        <p className="text-sm flex-1">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
                <CardDescription>管理系统用户账号</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">管理用户账号和权限</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加用户
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>房源管理</CardTitle>
                <CardDescription>管理平台房源信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">审核和管理房源信息</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    审核房源
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>报表统计</CardTitle>
                <CardDescription>平台运营数据统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">查看平台运营数据报表</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    生成报表
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>投诉管理</CardTitle>
                <CardDescription>处理用户投诉</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">处理用户投诉和反馈</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    查看投诉
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>系统监控</CardTitle>
                <CardDescription>监控系统运行状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">监控系统性能和运行状态</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    查看监控
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 