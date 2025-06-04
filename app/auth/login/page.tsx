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

export default function LoginPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5001/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username_or_email: formData.username_or_email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      console.log("API Response Data:", data)
      console.log("API Response Data.data:", data.data)

      if (data.success) {
        // 存储用户信息
        if (data.data && data.data.user) {
          localStorage.setItem('user_info', JSON.stringify(data.data.user))
          console.log("Set user_info:", data.data.user)
        }
        // 存储token
        if (data.data && data.data.access_token) {
          localStorage.setItem('auth_token', data.data.access_token)
          console.log("Set auth_token:", data.data.access_token)
        }
        // 存储用户角色
        localStorage.setItem('user_role', formData.role)
        console.log("Set user_role:", formData.role)
        
        // 根据用户角色重定向到相应的仪表板
        switch (formData.role) {
          case 'tenant':
            router.push('/dashboard/tenant')
            break
          case 'landlord':
            router.push('/dashboard/landlord')
            break
          case 'admin':
            router.push('/dashboard/admin')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        setError(data.message || '登录失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">智屋</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录您的账户以继续使用服务</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{" "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  立即注册
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
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

