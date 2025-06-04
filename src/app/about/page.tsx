import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Home, Users, Lightbulb, ShieldCheck, MapPin, Phone, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">智屋</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition-colors">
              房源搜索
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
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">关于智屋</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            我们致力于通过技术创新，打造一个安全、高效、智能的房屋租赁服务平台，连接房东与租客，简化租赁流程，提升用户体验。
          </p>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的使命</h2>
              <p className="text-lg text-gray-700 mb-4">
                让租房更简单、更透明、更安心。我们相信每个人都应该拥有一个舒适的家，智屋的目标就是帮助用户轻松实现这一愿望。
              </p>
              <p className="text-lg text-gray-700">
                通过提供全面的房源信息、便捷的在线工具和可靠的客户服务，我们努力消除租房过程中的痛点。
              </p>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
              <Image src="/placeholder.svg?height=400&width=600" alt="Our Mission" fill className="object-cover" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl md:order-last">
              <Image src="/placeholder.svg?height=400&width=600" alt="Our Vision" fill className="object-cover" />
            </div>
            <div className="md:order-first">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的愿景</h2>
              <p className="text-lg text-gray-700 mb-4">
                成为全球领先的智能房屋租赁平台，引领行业发展，构建和谐的租赁生态。
              </p>
              <p className="text-lg text-gray-700">
                我们展望未来，租赁将不再是繁琐的事务，而是通过智能化、个性化的服务，为用户创造更多价值和可能。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">核心价值观</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">用户至上</h3>
              <p className="text-gray-600">始终以用户需求为核心，提供超越期望的服务和体验。</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">创新驱动</h3>
              <p className="text-gray-600">拥抱变化，持续创新，用技术赋能房屋租赁行业。</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <ShieldCheck className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">诚信可靠</h3>
              <p className="text-gray-600">坚守商业道德，保障信息真实，建立值得信赖的平台。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">联系我们</h2>
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
            <p className="text-lg text-gray-700 mb-6 text-center">
              如果您有任何疑问、建议或合作意向，欢迎通过以下方式与我们联系。
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">公司地址</h4>
                  <p className="text-gray-600">北京市朝阳区建国路88号SOHO现代城A座1801室</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">客服热线</h4>
                  <p className="text-gray-600">400-123-4567 (工作日 9:00-18:00)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">电子邮箱</h4>
                  <p className="text-gray-600">
                    客户服务: support@zhizubao.com <br />
                    商务合作: business@zhizubao.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Simplified for brevity, ideally a shared component) */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 智屋. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  )
}
