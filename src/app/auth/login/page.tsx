"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { userService } from "@/lib/api/services/userService"
import { getFriendlyErrorMessage } from "@/lib/api/client/errorHandler"

/**
 * 登录页面组件
 * 
 * 提供用户登录功能，支持不同角色（租客/房东/管理员）登录
 * 包含表单验证、错误处理和登录状态管理
 */
export default function LoginPage() {
  // 状态管理
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
    remember_me: false,
    role: "tenant" as "tenant" | "landlord" | "admin",
  })
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const router = useRouter()

  /**
   * 表单提交处理函数
   * 
   * 发送登录请求到后端API，处理响应并执行相应操作
   * @param e - 表单提交事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 使用userService进行登录
      const authData = await userService.login(formData);
      
      // 根据用户角色重定向到相应的仪表板
      const role = authData.user.role;
      router.push(`/dashboard/${role}`);
    } catch (err) {
      // 使用统一的错误处理
      setError(getFriendlyErrorMessage(err as any));
    } finally {
      // 无论成功或失败，都关闭加载状态
      setIsLoading(false)
    }
  }

  /**
   * 输入变更处理函数
   * 
   * 更新表单数据状态
   * @param e - 输入变更事件
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和品牌展示 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">智屋</span>
          </Link>
        </div>

        {/* 登录卡片 */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录您的账户以继续使用服务</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 错误提示区域 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 角色选择区域 */}
              <div className="space-y-2">
                <Label>登录身份</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value: "tenant" | "landlord" | "admin") =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tenant" id="tenant" />
                        <Label htmlFor="tenant">租客</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landlord" id="landlord" />
                        <Label htmlFor="landlord">房东</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">管理员</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* 用户名/邮箱输入区 */}
              <div className="space-y-2">
                <Label htmlFor="username_or_email">用户名或邮箱</Label>
                <Input
                  id="username_or_email"
                  name="username_or_email"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  value={formData.username_or_email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* 密码输入区 */}
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  {/* 密码显示/隐藏按钮 */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 记住我和忘记密码区 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember_me"
                    checked={formData.remember_me}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remember_me: checked as boolean }))}
                  />
                  <Label htmlFor="remember_me" className="text-sm">
                    记住我
                  </Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                  忘记密码？
                </Link>
              </div>

              {/* 登录按钮 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>

            {/* 注册引导区 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{" "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  立即注册
                </Link>
              </p>
            </div>

            {/* 演示账户信息 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">演示账户：</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>租客: tenant@demo.com / password123</p>
                <p>房东: landlord@demo.com / password123</p>
                <p>管理员: admin@demo.com / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

