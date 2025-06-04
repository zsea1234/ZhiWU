import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, Users, Shield, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">智屋</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors">
              房源搜索
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              关于我们
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="outline">登录</Button>
            </Link>
            <Link href="/auth/register">
              <Button>注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">智能房屋租赁平台</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            为租客和房东提供安全、便捷、智能的租房体验。支持在线看房预约、电子签约、租金支付等全流程服务。
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input placeholder="输入城市、区域或小区名称" className="pl-10 h-12" />
                  </div>
                </div>
                <div className="flex-1">
                  <Input placeholder="户型 (如: 2室1厅)" className="h-12" />
                </div>
                <div className="flex-1">
                  <Input placeholder="租金范围 (如: 3000-5000)" className="h-12" />
                </div>
                <Button size="lg" className="h-12 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  搜索房源
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-600">优质房源</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50,000+</div>
              <div className="text-gray-600">注册用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-gray-600">满意度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-gray-600">在线服务</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">平台特色</h2>
            <p className="text-xl text-gray-600">为您提供全方位的租房服务体验</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <CardHeader>
                <CardTitle>智能搜索</CardTitle>
                <CardDescription>支持按地区、户型、价格等多维度搜索，智能推荐最适合的房源</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardHeader>
                <CardTitle>安全保障</CardTitle>
                <CardDescription>多因素身份验证、数据加密传输，确保用户信息和交易安全</CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <CardHeader>
                <CardTitle>智能客服</CardTitle>
                <CardDescription>AI智能代理24小时在线，快速响应用户咨询和问题解答</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Hot Properties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">热门房源</h2>
            <p className="text-xl text-gray-600">精选优质房源推荐</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=200&width=400&query=modern apartment interior ${i}`}
                    alt={`房源 ${i}`}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-red-500">热租</Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">精装两居室 近地铁</h3>
                  <p className="text-gray-600 mb-3">朝阳区 · 幸福小区 · 85㎡</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-red-500">
                      ¥5,000<span className="text-sm text-gray-500">/月</span>
                    </div>
                    <Link href={`/properties/${i}`}>
                      <Button variant="outline" size="sm">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties">
              <Button size="lg">查看更多房源</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">开始您的租房之旅</h2>
          <p className="text-xl mb-8 opacity-90">
            无论您是寻找理想住所的租客，还是希望出租房源的房东，我们都为您提供专业的服务
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=tenant">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                <Users className="h-5 w-5 mr-2" />
                我是租客
              </Button>
            </Link>
            <Link href="/auth/register?role=landlord">
              <Button size="lg" variant="secondary" className="min-w-[200px] hover:bg-white hover:text-blue-600">
                <Home className="h-5 w-5 mr-2" />
                我是房东
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Home className="h-6 w-6" />
                <span className="text-xl font-bold">智屋</span>
              </div>
              <p className="text-gray-400">专业的智能房屋租赁平台，为您提供安全、便捷的租房服务。</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">服务</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/properties" className="hover:text-white">
                    房源搜索
                  </Link>
                </li>
              </ul>
            </div>
            <div></div>
            <div>
              <h3 className="text-lg font-semibold mb-4">关于</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    关于我们
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 智屋. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
