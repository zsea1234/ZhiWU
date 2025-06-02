"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type UserRole = "tenant" | "landlord" | "admin"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant" as UserRole,
    phone: "",
  })
  const router = useRouter()

  // 添加验证函数
  const validateForm = () => {
    // 用户名验证：3-50位，仅限字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/
    if (!usernameRegex.test(formData.username)) {
      setError("用户名必须是3-50位的字母、数字或下划线")
      return false
    }

    // 密码验证：至少8位，必须包含大小写字母、数字和特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
    if (!passwordRegex.test(formData.password)) {
      setError("密码必须至少8位，且包含大小写字母、数字和特殊字符")
      return false
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("请输入有效的邮箱地址")
      return false
    }

    // 手机号验证：符合E.164标准
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(formData.phone)) {
      setError("请输入有效的手机号码")
      return false
    }

    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 表单验证
    if (!validateForm()) {
      setIsLoading(false)
      return
    }


    try {
      const response = await fetch("http://localhost:5001/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // 处理服务器返回的验证错误
        if (data.error_code === "VALIDATION_ERROR" && data.errors) {
          const errorMessages = Object.values(data.errors).flat()
          throw new Error(typeof errorMessages[0] === 'string' ? errorMessages[0] : "数据验证失败")
        } else if (response.status === 400) {
          throw new Error(data.message || "请求参数错误")
        } else if (response.status === 409) {
          throw new Error(data.message || "用户名或邮箱已被注册")
        } else {
          throw new Error(data.message || "注册失败，请稍后重试")
        }
      }

      // 检查是否需要设置MFA
      if (data.mfa_required) {
        localStorage.setItem("temp_auth_token", data.access_token)
        localStorage.setItem("temp_user_info", JSON.stringify(data.user))
        router.push("/auth/mfa-setup")
        return
      }

      // 存储认证数据
      localStorage.setItem("auth_token", data.access_token)
      localStorage.setItem("user_role", formData.role)
      localStorage.setItem("user_info", JSON.stringify({
        username: formData.username,
        email: formData.email,
        role: formData.role,
        phone: formData.phone
      }))

      // 根据用户角色重定向
      switch (formData.role) {
        case "admin":
          router.push("/dashboard/admin")
          break
        case "landlord":
          router.push("/dashboard/landlord")
          break
        case "tenant":
          router.push("/dashboard/tenant")
          break
        default:
          router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 清除错误信息
    if (error) {
      setError("")
    }
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
            <CardTitle className="text-2xl">创建账户</CardTitle>
            <CardDescription>注册您的账户以开始使用服务</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号码</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="请输入手机号码"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>注册身份</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData((prev) => ({ ...prev, role: value }))}
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
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  "注册"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账户？{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
