"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"
import api from "@/app/services/tenant/api"
import { User } from "@/app/services/tenant/userService"

interface RegisterResponse {
  access_token: string;
  user: User;
}

interface RegisterInput {
  username: string;
  password: string;
  email: string;
  phone: string;
  role: 'tenant' | 'landlord';
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "tenant",
  })
  const router = useRouter()
  const { login } = useAuth()

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

<<<<<<< HEAD
    try {
      const response = await api.post<RegisterResponse>('/auth/register', formData)
      const { access_token, user } = response.data

      await login(access_token)

      // 根据用户角色跳转到不同的页面
      switch (user.role) {
=======
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
>>>>>>> e04423dfd1b311b34c13caa3d5fd2b5fd4463339
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
<<<<<<< HEAD
    } catch (err: any) {
      setError(err.response?.data?.message || "注册失败，请稍后重试")
=======
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请稍后重试")
>>>>>>> e04423dfd1b311b34c13caa3d5fd2b5fd4463339
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
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="请输入手机号"
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              注册
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
