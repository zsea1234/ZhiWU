"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Lock, Bell, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

// 定义用户数据类型
interface UserData {
  username: string
  email: string
  phone: string
  avatar: string
  notifications: {
    email: boolean
    sms: boolean
    system: boolean
  }
  company?: string
  license?: string
  role?: string
}

// 模拟用户数据
const mockUserData: Record<"tenant" | "landlord" | "admin", UserData> = {
  tenant: {
    username: "张三",
    email: "tenant@demo.com",
    phone: "13800138000",
    avatar: "/placeholder.svg",
    notifications: {
      email: true,
      sms: true,
      system: true,
    },
  },
  landlord: {
    username: "李四",
    email: "landlord@demo.com",
    phone: "13900139000",
    avatar: "/placeholder.svg",
    company: "阳光房产",
    license: "京房中介字第123456号",
    notifications: {
      email: true,
      sms: true,
      system: true,
    },
  },
  admin: {
    username: "管理员",
    email: "admin@demo.com",
    phone: "13700137000",
    avatar: "/placeholder.svg",
    role: "系统管理员",
    notifications: {
      email: true,
      sms: true,
      system: true,
    },
  },
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userRole, setUserRole] = useState<"tenant" | "landlord" | "admin">("tenant")
  const [userData, setUserData] = useState<UserData>(mockUserData.tenant)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // 从 localStorage 获取用户角色
    const role = localStorage.getItem("user_role") as "tenant" | "landlord" | "admin"
    if (role) {
      setUserRole(role)
      setUserData(mockUserData[role])
      setFormData({
        ...formData,
        username: mockUserData[role].username,
        email: mockUserData[role].email,
        phone: mockUserData[role].phone,
      })
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("个人信息更新成功")
    } catch (err) {
      setError("更新失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("两次输入的密码不一致")
      setIsLoading(false)
      return
    }

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("密码修改成功")
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setError("密码修改失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = async (type: string, value: boolean) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 模拟 API 调用
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUserData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: value,
        },
      }))
      setSuccess("通知设置更新成功")
    } catch (err) {
      setError("设置更新失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">账户设置</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              安全设置
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              通知设置
            </TabsTrigger>
            {userRole === "admin" && (
              <TabsTrigger value="admin">
                <Shield className="w-4 h-4 mr-2" />
                管理员设置
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>更新您的个人信息</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号码</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>

                  {userRole === "landlord" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="company">公司名称</Label>
                        <Input
                          id="company"
                          value={userData.company}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, company: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">营业执照号</Label>
                        <Input
                          id="license"
                          value={userData.license}
                          onChange={(e) =>
                            setUserData((prev) => ({ ...prev, license: e.target.value }))
                          }
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      "保存更改"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>安全设置</CardTitle>
                <CardDescription>修改您的密码</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      "更新密码"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>管理您的通知偏好</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">邮件通知</h3>
                        <p className="text-sm text-gray-500">接收邮件通知</p>
                      </div>
                      <Button
                        variant={userData.notifications.email ? "default" : "outline"}
                        onClick={() => handleNotificationChange("email", !userData.notifications.email)}
                        disabled={isLoading}
                      >
                        {userData.notifications.email ? "开启" : "关闭"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">短信通知</h3>
                        <p className="text-sm text-gray-500">接收短信通知</p>
                      </div>
                      <Button
                        variant={userData.notifications.sms ? "default" : "outline"}
                        onClick={() => handleNotificationChange("sms", !userData.notifications.sms)}
                        disabled={isLoading}
                      >
                        {userData.notifications.sms ? "开启" : "关闭"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">系统通知</h3>
                        <p className="text-sm text-gray-500">接收系统通知</p>
                      </div>
                      <Button
                        variant={userData.notifications.system ? "default" : "outline"}
                        onClick={() =>
                          handleNotificationChange("system", !userData.notifications.system)
                        }
                        disabled={isLoading}
                      >
                        {userData.notifications.system ? "开启" : "关闭"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === "admin" && (
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>管理员设置</CardTitle>
                  <CardDescription>系统管理设置</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">系统维护</h3>
                        <p className="text-sm text-gray-500">管理系统维护状态</p>
                      </div>
                      <Button variant="outline" disabled={isLoading}>
                        进入维护模式
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">数据备份</h3>
                        <p className="text-sm text-gray-500">管理系统数据备份</p>
                      </div>
                      <Button variant="outline" disabled={isLoading}>
                        立即备份
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">系统日志</h3>
                        <p className="text-sm text-gray-500">查看系统操作日志</p>
                      </div>
                      <Button variant="outline" disabled={isLoading}>
                        查看日志
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
} 