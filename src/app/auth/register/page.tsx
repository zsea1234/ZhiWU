"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import userService, { RegisterRequest, User } from "@/lib/api/services/userService"
import { getFriendlyErrorMessage } from "@/lib/api/client/errorHandler"

interface RegisterInput extends RegisterRequest {
  confirmPassword?: string;
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
    confirmPassword: "",
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
    if (formData.phone && !phoneRegex.test(formData.phone)) {
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
      // 使用userService进行注册
      const { confirmPassword, ...registerData } = formData;
      const authData = await userService.register(registerData);
      
      // 根据用户角色重定向
      const role = authData.user.role;
      router.push(`/dashboard/${role}`);
    } catch (err) {
      // 使用统一的错误处理
      setError(getFriendlyErrorMessage(err as any));
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
