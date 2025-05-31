"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, MapPin, Bed, Bath, Square, Loader2, Upload } from "lucide-react"
import Link from "next/link"

export default function NewPropertyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    area_code: "",
    rent: "",
    deposit: "",
    bedrooms: "",
    living_rooms: "",
    bathrooms: "",
    area: "",
    floor: "",
    total_floors: "",
    description: "",
    facilities: [] as string[],
    images: [] as File[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setSuccess("房源发布成功！")
      setTimeout(() => {
        router.push("/dashboard/properties")
      }, 1500)
    } catch (err) {
      setError("发布失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/public" className="flex items-center space-x-2">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">发布新房源</h1>
          <p className="text-gray-600">填写房源信息，让更多租客找到您的房子</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：基本信息 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>填写房源的基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">房源标题</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="例如：精装两居室 近地铁"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">详细地址</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="address"
                        name="address"
                        placeholder="例如：朝阳区幸福小区1号楼2单元303"
                        className="pl-10"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area_code">所在区域</Label>
                      <Select
                        value={formData.area_code}
                        onValueChange={(value) => handleSelectChange("area_code", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择区域" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chaoyang">朝阳区</SelectItem>
                          <SelectItem value="haidian">海淀区</SelectItem>
                          <SelectItem value="xicheng">西城区</SelectItem>
                          <SelectItem value="dongcheng">东城区</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rent">月租金（元）</Label>
                      <Input
                        id="rent"
                        name="rent"
                        type="number"
                        placeholder="例如：5000"
                        value={formData.rent}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit">押金（元）</Label>
                      <Input
                        id="deposit"
                        name="deposit"
                        type="number"
                        placeholder="例如：5000"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">房屋面积（㎡）</Label>
                      <Input
                        id="area"
                        name="area"
                        type="number"
                        placeholder="例如：85"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>房屋配置</CardTitle>
                  <CardDescription>填写房屋的具体配置信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">卧室数量</Label>
                      <Select
                        value={formData.bedrooms}
                        onValueChange={(value) => handleSelectChange("bedrooms", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择卧室数量" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">开间</SelectItem>
                          <SelectItem value="1">1室</SelectItem>
                          <SelectItem value="2">2室</SelectItem>
                          <SelectItem value="3">3室</SelectItem>
                          <SelectItem value="4">4室</SelectItem>
                          <SelectItem value="5">5室及以上</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="living_rooms">客厅数量</Label>
                      <Select
                        value={formData.living_rooms}
                        onValueChange={(value) => handleSelectChange("living_rooms", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择客厅数量" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">无客厅</SelectItem>
                          <SelectItem value="1">1厅</SelectItem>
                          <SelectItem value="2">2厅</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">卫生间数量</Label>
                      <Select
                        value={formData.bathrooms}
                        onValueChange={(value) => handleSelectChange("bathrooms", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择卫生间数量" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1卫</SelectItem>
                          <SelectItem value="2">2卫</SelectItem>
                          <SelectItem value="3">3卫及以上</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">所在楼层</Label>
                      <Input
                        id="floor"
                        name="floor"
                        type="number"
                        placeholder="例如：3"
                        value={formData.floor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_floors">总楼层</Label>
                    <Input
                      id="total_floors"
                      name="total_floors"
                      type="number"
                      placeholder="例如：18"
                      value={formData.total_floors}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>房源描述</CardTitle>
                  <CardDescription>详细描述您的房源特色</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="description">详细描述</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="请详细描述房源的位置、装修、周边配套等信息..."
                      className="min-h-[200px]"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：图片上传和发布 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>房源图片</CardTitle>
                  <CardDescription>上传房源照片，最多9张</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">点击或拖拽图片到此处上传</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={handleImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        选择图片
                      </Button>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`预览图 ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>发布设置</CardTitle>
                  <CardDescription>确认信息无误后发布房源</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        发布中...
                      </>
                    ) : (
                      "发布房源"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 