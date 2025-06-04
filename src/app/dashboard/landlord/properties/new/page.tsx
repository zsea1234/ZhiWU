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
    address_line1: "",
    city: "",
    district: "",
    postal_code: "",
    country_code: "CN",
    property_type: "APARTMENT",
    area_sqm: "",
    rent_price_monthly: "",
    deposit_amount: "",
    bedrooms: "",
    living_rooms: "",
    bathrooms: "",
    floor_level: "",
    total_floors: "",
    description_text: "",
    amenities: [] as string[],
    rules: [] as string[],
    available_date: new Date().toISOString().split('T')[0],
  })

  // 添加图片上传状态
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [propertyId, setPropertyId] = useState<number | null>(null)

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 9) {
      setError("最多只能上传9张图片")
      return
    }

    // 验证文件类型和大小
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError("只能上传图片文件")
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("图片大小不能超过5MB")
        return false
      }
      return true
    })

    // 更新图片状态
    setImages(prev => [...prev, ...validFiles])

    // 生成预览URL
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  // 上传图片到服务器
  const uploadImages = async (propertyId: number) => {
    if (images.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      images.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`http://localhost:5001/api/v1/properties/${propertyId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload images')
      }

      const data = await response.json()
      console.log('Images uploaded successfully:', data)
    } catch (err) {
      console.error('Failed to upload images:', err)
      setError("图片上传失败，请稍后重试")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // 表单验证
      if (!formData.city || !formData.district) {
        setError("城市和区域不能为空")
        setIsLoading(false)
        return
      }

      // 验证面积
      const areaSqm = parseFloat(formData.area_sqm)
      if (isNaN(areaSqm) || areaSqm < 1) {
        setError("面积必须大于等于1平方米")
        setIsLoading(false)
        return
      }

      // 验证租金
      const rentPrice = parseFloat(formData.rent_price_monthly)
      if (isNaN(rentPrice) || rentPrice < 0) {
        setError("月租金不能为负数")
        setIsLoading(false)
        return
      }

      // 验证押金
      const depositAmount = parseFloat(formData.deposit_amount)
      if (isNaN(depositAmount) || depositAmount < 0) {
        setError("押金不能为负数")
        setIsLoading(false)
        return
      }

      // 准备提交数据
      const propertyData = {
        ...formData,
        area_sqm: areaSqm,
        rent_price_monthly: rentPrice,
        deposit_amount: depositAmount,
        bedrooms: parseInt(formData.bedrooms) || 0,
        living_rooms: parseInt(formData.living_rooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        floor_level: formData.floor_level ? parseInt(formData.floor_level) : undefined,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : undefined,
        postal_code: formData.postal_code || "000000",
        country_code: formData.country_code || "CN",
        property_type: formData.property_type || "APARTMENT",
        amenities: formData.amenities || [],
        rules: formData.rules || [],
        available_date: formData.available_date || new Date().toISOString().split('T')[0]
      }

      // 创建房源
      const response = await fetch('http://localhost:5001/api/v1/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(propertyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create property')
      }

      const data = await response.json()
      const newPropertyId = data.data.id

      // 上传图片
      if (images.length > 0) {
        await uploadImages(newPropertyId)
      }

      setSuccess("房源发布成功！")
      setTimeout(() => {
        router.push("/dashboard/landlord")
      }, 1500)
    } catch (err) {
      console.error('Error creating property:', err)
      setError(err instanceof Error ? err.message : "发布失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Selected ${name}:`, value)
    setFormData((prev) => ({ ...prev, [name]: value }))
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
            <Link href="/dashboard/landlord" className="text-gray-600 hover:text-blue-600">
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
                    <Label htmlFor="address_line1">详细地址</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="address_line1"
                        name="address_line1"
                        placeholder="例如：朝阳区幸福小区1号楼2单元303"
                        className="pl-10"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">所在城市</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="例如：北京"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">所在区域</Label>
                      <Input
                        id="district"
                        name="district"
                        placeholder="例如：朝阳区"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rent_price_monthly">月租金（元）</Label>
                      <Input
                        id="rent_price_monthly"
                        name="rent_price_monthly"
                        type="number"
                        placeholder="例如：5000"
                        value={formData.rent_price_monthly}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit_amount">押金（元）</Label>
                      <Input
                        id="deposit_amount"
                        name="deposit_amount"
                        type="number"
                        placeholder="例如：5000"
                        value={formData.deposit_amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area_sqm">面积（平方米）</Label>
                      <Input
                        id="area_sqm"
                        name="area_sqm"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="例如：85.5"
                        value={formData.area_sqm}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_type">房屋类型</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) => handleSelectChange("property_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择房屋类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APARTMENT">公寓</SelectItem>
                          <SelectItem value="HOUSE">别墅/独立屋</SelectItem>
                          <SelectItem value="STUDIO">开间</SelectItem>
                          <SelectItem value="SHARED_ROOM">合租单间</SelectItem>
                          <SelectItem value="OTHER">其他</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="floor_level">所在楼层</Label>
                      <Input
                        id="floor_level"
                        name="floor_level"
                        type="number"
                        placeholder="例如：3"
                        value={formData.floor_level}
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
                    <Label htmlFor="description_text">详细描述</Label>
                    <Textarea
                      id="description_text"
                      name="description_text"
                      placeholder="请详细描述房源的位置、装修、周边配套等信息..."
                      className="min-h-[200px]"
                      value={formData.description_text}
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
                    {/* 图片预览区域 */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`预览图片 ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 上传区域 */}
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
                        disabled={images.length >= 9}
                      >
                        选择图片
                      </Button>
                      {images.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          已选择 {images.length} 张图片
                        </p>
                      )}
                    </div>
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