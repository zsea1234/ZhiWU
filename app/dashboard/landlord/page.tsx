"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Calendar, FileText, BarChart, Wrench, MessageSquare, Plus, Download, Eye, Check, X } from "lucide-react"
import Link from "next/link"

export default function LandlordDashboard() {
  const [activeTab, setActiveTab] = useState("properties")

  // 示例房源数据
  const properties = [
    {
      id: 1,
      title: "精装两居室",
      location: "朝阳区幸福小区",
      price: 5000,
      rooms: "2室1厅",
      area: 85,
      floor: "3/18层",
      status: "已出租"
    },
    {
      id: 2,
      title: "豪华三居室",
      location: "海淀区阳光花园",
      price: 8000,
      rooms: "3室2厅",
      area: 120,
      floor: "12/24层",
      status: "待租"
    }
  ]

  // 示例预约数据
  const appointments = [
    {
      id: 1,
      property: "精装两居室",
      visitor: "王五",
      phone: "138****1234",
      date: "2024-03-25",
      time: "14:00",
      status: "待确认"
    },
    {
      id: 2,
      property: "豪华三居室",
      visitor: "赵六",
      phone: "139****5678",
      date: "2024-03-26",
      time: "10:00",
      status: "已确认"
    }
  ]

  // 示例租约数据
  const contracts = [
    {
      id: 1,
      tenant: "张三",
      property: "精装两居室",
      startDate: "2024-03-01",
      endDate: "2025-03-01",
      status: "active",
      rent: 5000
    },
    {
      id: 2,
      tenant: "李四",
      property: "豪华三居室",
      startDate: "2024-02-15",
      endDate: "2025-02-15",
      status: "active",
      rent: 8000
    }
  ]

  // 示例收入数据
  const incomeData = {
    total: 13000,
    monthly: [
      { month: "1月", amount: 5000 },
      { month: "2月", amount: 8000 },
      { month: "3月", amount: 5000 }
    ],
    details: [
      { date: "2024-03-01", tenant: "张三", property: "精装两居室", amount: 5000 },
      { date: "2024-02-15", tenant: "李四", property: "豪华三居室", amount: 8000 }
    ]
  }

  // 示例维修数据
  const maintenanceRequests = [
    {
      id: 1,
      property: "精装两居室",
      tenant: "张三",
      issue: "水龙头漏水",
      status: "pending",
      date: "2024-03-15"
    },
    {
      id: 2,
      property: "豪华三居室",
      tenant: "李四",
      issue: "空调不制冷",
      status: "completed",
      date: "2024-03-10"
    }
  ]

  // 示例消息数据
  const messages = [
    {
      id: 1,
      type: "system",
      title: "系统通知",
      content: "您的账户已通过实名认证",
      date: "2024-03-20",
      read: false
    },
    {
      id: 2,
      type: "tenant",
      title: "租客消息",
      content: "张三申请续租",
      date: "2024-03-19",
      read: true
    },
    {
      id: 3,
      type: "system",
      title: "系统通知",
      content: "新租客预约看房",
      date: "2024-03-18",
      read: false
    }
  ]

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
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              返回控制台
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">房东控制台</h1>
          <p className="text-gray-600">管理您的房源和租客</p>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-4">
            <TabsTrigger value="properties" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>房源管理</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>预约管理</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>租约管理</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>收入统计</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>维修管理</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>消息中心</span>
            </TabsTrigger>
          </TabsList>

          {/* 房源管理 */}
          <TabsContent value="properties">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">房源管理</h2>
              <Link href="/dashboard/properties/new">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>发布新房源</span>
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle>{property.title}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-blue-600">¥{property.price}/月</p>
                      <p className="text-sm text-gray-500">
                        {property.rooms} | {property.area}㎡ | {property.floor}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <Button variant="outline" size="sm">编辑</Button>
                        <Button variant="outline" size="sm">
                          {property.status === "已出租" ? "下架" : "上架"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 预约管理 */}
          <TabsContent value="appointments">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">预约管理</h2>
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.property}</h3>
                          <p className="text-sm text-gray-500">访客：{appointment.visitor}</p>
                          <p className="text-sm text-gray-500">电话：{appointment.phone}</p>
                          <p className="text-sm text-gray-500">
                            时间：{appointment.date} {appointment.time}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.status === "待确认" ? (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600">
                                <Check className="h-4 w-4 mr-1" />
                                确认
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <X className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-green-600">已确认</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 租约管理 */}
          <TabsContent value="contracts">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">租约管理</h2>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>导出租约</span>
                </Button>
              </div>
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{contract.property}</h3>
                          <p className="text-sm text-gray-500">租客：{contract.tenant}</p>
                          <p className="text-sm text-gray-500">
                            租期：{contract.startDate} 至 {contract.endDate}
                          </p>
                          <p className="text-sm text-gray-500">月租金：¥{contract.rent}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            续约
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 收入统计 */}
          <TabsContent value="income">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">收入统计</h2>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>导出报表</span>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">总收入</h3>
                    <p className="text-3xl font-bold text-blue-600">¥{incomeData.total}</p>
                    <div className="mt-6 space-y-2">
                      <h4 className="font-medium">月度收入</h4>
                      {incomeData.monthly.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{item.month}</span>
                          <span className="font-semibold">¥{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">收入明细</h3>
                    <div className="space-y-4">
                      {incomeData.details.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{detail.property}</p>
                            <p className="text-sm text-gray-500">{detail.tenant}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">¥{detail.amount}</p>
                            <p className="text-sm text-gray-500">{detail.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 维修管理 */}
          <TabsContent value="maintenance">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">维修管理</h2>
              <div className="grid gap-4">
                {maintenanceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{request.property}</h3>
                          <p className="text-sm text-gray-500">租客：{request.tenant}</p>
                          <p className="text-sm text-gray-500">问题：{request.issue}</p>
                          <p className="text-sm text-gray-500">报修时间：{request.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.status === "pending" ? (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600">
                                <Check className="h-4 w-4 mr-1" />
                                处理
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <X className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-green-600">已完成</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 消息中心 */}
          <TabsContent value="messages">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">消息中心</h2>
              <div className="grid gap-4">
                {messages.map((message) => (
                  <Card key={message.id} className={message.read ? "bg-gray-50" : "bg-white"}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{message.title}</h3>
                            {!message.read && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                未读
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                          <p className="text-xs text-gray-500 mt-2">{message.date}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 