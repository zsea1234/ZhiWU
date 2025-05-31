"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Home, Bed, Bath, Square, Heart, Filter, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock property data
const allMockProperties = [
  {
    id: 1,
    title: "精装两居室 近地铁",
    address: "朝阳区 · 幸福小区 · 85㎡",
    rent: 5000,
    bedrooms: 2,
    living_rooms: 1,
    bathrooms: 1,
    area: 85,
    images: ["/placeholder.svg?height=200&width=300"],
    status: "vacant",
    tags: ["近地铁", "精装修", "拎包入住"],
    area_code: "chaoyang",
    created_at: "2025-05-20T10:00:00Z",
  },
  {
    id: 2,
    title: "温馨一居室 采光好",
    address: "海淀区 · 学院路 · 60㎡",
    rent: 3500,
    bedrooms: 1,
    living_rooms: 1,
    bathrooms: 1,
    area: 60,
    images: ["/placeholder.svg?height=200&width=300"],
    status: "vacant",
    tags: ["采光好", "安静", "学区房"],
    area_code: "haidian",
    created_at: "2025-05-22T11:00:00Z",
  },
  {
    id: 3,
    title: "豪华三居室 高层景观",
    address: "西城区 · 金融街 · 120㎡",
    rent: 8000,
    bedrooms: 3,
    living_rooms: 2,
    bathrooms: 2,
    area: 120,
    images: ["/placeholder.svg?height=200&width=300"],
    status: "vacant",
    tags: ["高层", "景观房", "豪华装修"],
    area_code: "xicheng",
    created_at: "2025-05-18T09:00:00Z",
  },
  {
    id: 4,
    title: "朝阳大悦城旁 开间",
    address: "朝阳区 · 青年路 · 45㎡",
    rent: 4200,
    bedrooms: 0, // Studio
    living_rooms: 1,
    bathrooms: 1,
    area: 45,
    images: ["/placeholder.svg?height=200&width=300"],
    status: "vacant",
    tags: ["近商圈", "独立卫浴"],
    area_code: "chaoyang",
    created_at: "2025-05-25T14:00:00Z",
  },
  {
    id: 5,
    title: "海淀学府旁 精致一居",
    address: "海淀区 · 中关村 · 55㎡",
    rent: 6000,
    bedrooms: 1,
    living_rooms: 1,
    bathrooms: 1,
    area: 55,
    images: ["/placeholder.svg?height=200&width=300"],
    status: "vacant",
    tags: ["学区", "新装修"],
    area_code: "haidian",
    created_at: "2025-05-15T16:00:00Z",
  },
]

export default function PropertiesPage() {
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    area_code: "", // Initial value for area_code, placeholder will be shown
    bedrooms: "any",
    min_rent: 0,
    max_rent: 20000,
    sort_by: "created_at",
    sort_order: "desc",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [displayedProperties, setDisplayedProperties] = useState(allMockProperties)
  const [isLoading, setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const propertiesPerPage = 6

  const filterAndSortProperties = () => {
    setIsLoading(true)
    setTimeout(() => {
      let filtered = allMockProperties

      if (searchFilters.keyword) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(searchFilters.keyword.toLowerCase()) ||
            p.address.toLowerCase().includes(searchFilters.keyword.toLowerCase()),
        )
      }

      if (searchFilters.bedrooms !== "any") {
        const numBedrooms = Number.parseInt(searchFilters.bedrooms)
        if (numBedrooms === 4) {
          filtered = filtered.filter((p) => p.bedrooms >= numBedrooms)
        } else {
          filtered = filtered.filter((p) => p.bedrooms === numBedrooms)
        }
      }

      // Updated Area code filter logic
      if (searchFilters.area_code && searchFilters.area_code !== "all_areas") {
        filtered = filtered.filter((p) => p.area_code === searchFilters.area_code)
      }

      filtered = filtered.filter((p) => p.rent >= searchFilters.min_rent && p.rent <= searchFilters.max_rent)

      filtered.sort((a, b) => {
        let comparison = 0
        if (searchFilters.sort_by === "rent_price") {
          comparison = a.rent - b.rent
        } else if (searchFilters.sort_by === "area_sqm") {
          comparison = a.area - b.area
        } else {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return searchFilters.sort_order === "asc" ? comparison : -comparison
      })

      setDisplayedProperties(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    filterAndSortProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchFilters.sort_by,
    searchFilters.sort_order,
    searchFilters.area_code,
    searchFilters.bedrooms,
    searchFilters.min_rent,
    searchFilters.max_rent,
  ])

  const handleSearchButtonClick = () => {
    filterAndSortProperties()
  }

  const handleToggleFavorite = (propertyId: number) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
  }

  const handleLoadMore = () => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage((prevPage) => prevPage + 1)
      setIsLoading(false)
    }, 500)
  }

  const paginatedProperties = useMemo(() => {
    return displayedProperties.slice(0, currentPage * propertiesPerPage)
  }, [displayedProperties, currentPage, propertiesPerPage])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">智屋</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              控制台
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600">
              关于我们
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="outline">登录</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">房源搜索</h1>
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="输入城市、区域或小区名称"
                    className="pl-10"
                    value={searchFilters.keyword}
                    onChange={(e) => setSearchFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchButtonClick()}
                  />
                </div>
              </div>
              <div className="w-full lg:w-48">
                <Select
                  value={searchFilters.bedrooms}
                  onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, bedrooms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="户型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">不限户型</SelectItem>
                    <SelectItem value="1">1室</SelectItem>
                    <SelectItem value="2">2室</SelectItem>
                    <SelectItem value="3">3室</SelectItem>
                    <SelectItem value="4">4室+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "隐藏筛选" : "高级筛选"}
                </Button>
                <Button onClick={handleSearchButtonClick} disabled={isLoading}>
                  {isLoading && !showFilters ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  搜索
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">租金范围 (¥)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[searchFilters.min_rent, searchFilters.max_rent]}
                        onValueChange={([min, max]) =>
                          setSearchFilters((prev) => ({ ...prev, min_rent: min, max_rent: max }))
                        }
                        max={20000}
                        min={0}
                        step={500}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>¥{searchFilters.min_rent}</span>
                        <span>¥{searchFilters.max_rent}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">区域</Label>
                    <Select
                      value={searchFilters.area_code} // This will be "" initially, showing placeholder
                      onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, area_code: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择区域" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_areas">不限区域</SelectItem> {/* Changed value from "" */}
                        <SelectItem value="chaoyang">朝阳区</SelectItem>
                        <SelectItem value="haidian">海淀区</SelectItem>
                        <SelectItem value="xicheng">西城区</SelectItem>
                        <SelectItem value="dongcheng">东城区</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">排序方式</Label>
                    <div className="flex gap-2">
                      <Select
                        value={searchFilters.sort_by}
                        onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, sort_by: value }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at">发布时间</SelectItem>
                          <SelectItem value="rent_price">租金价格</SelectItem>
                          <SelectItem value="area_sqm">房屋面积</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={searchFilters.sort_order}
                        onValueChange={(value) => setSearchFilters((prev) => ({ ...prev, sort_order: value }))}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">降序</SelectItem>
                          <SelectItem value="asc">升序</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  <Button onClick={handleSearchButtonClick} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    应用筛选
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">{isLoading ? "正在加载..." : `找到 ${displayedProperties.length} 套房源`}</p>
          </div>
        </div>

        {isLoading && paginatedProperties.length === 0 ? (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600">正在努力加载房源...</p>
          </div>
        ) : !isLoading && paginatedProperties.length === 0 ? (
          <div className="text-center py-10">
            <Search className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-xl text-gray-600">抱歉，未找到符合条件的房源</p>
            <p className="text-sm text-gray-500">请尝试调整筛选条件或扩大搜索范围</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                    onClick={() => handleToggleFavorite(property.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.includes(property.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                    />
                  </Button>
                  <Badge className="absolute top-3 left-3 bg-green-500">可租</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{property.address}</span>
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms === 0 ? "开间" : `${property.bedrooms}室${property.living_rooms}厅`}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms}卫
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.area}㎡
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
                    {property.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-red-500">¥{property.rent.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">/月</span>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                      <Button size="sm">查看详情</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && displayedProperties.length > paginatedProperties.length && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              加载更多房源
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
