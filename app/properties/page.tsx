"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, Home, Bed, Bath, Square, Heart, Filter, Loader2, Users, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Property {
  id: number
  title: string
  address: string
  price: number
  area: number
  rooms: number
  bathrooms: number
  maxTenants: number
  status: "available" | "rented"
  images: string[]
  created_at: string
}

// Mock property data
const allMockProperties: Property[] = [


]

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState("")
  const [selectedRooms, setSelectedRooms] = useState("")
  const [priceRange, setPriceRange] = useState([0, 10000])
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

      if (searchQuery) {
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      if (selectedRooms && selectedRooms !== "any") {
        const numRooms = Number.parseInt(selectedRooms)
        if (numRooms === 4) {
          filtered = filtered.filter((p) => p.rooms >= numRooms)
        } else {
          filtered = filtered.filter((p) => p.rooms === numRooms)
        }
      }

      if (selectedArea && selectedArea !== "all_areas") {
        filtered = filtered.filter((p) => p.area >= parseInt(selectedArea))
      }

      filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

      filtered.sort((a, b) => {
        let comparison = 0
        if (comparison === 0) {
          comparison = a.price - b.price
        } else {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return comparison
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
    searchQuery,
    selectedRooms,
    selectedArea,
    priceRange,
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* 筛选侧边栏 */}
          <div className="w-full md:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>筛选条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">面积（平方米）</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择面积" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">不限</SelectItem>    {/* 用1表示不限 */}
                      <SelectItem value="50">50㎡以上</SelectItem>
                      <SelectItem value="80">80㎡以上</SelectItem>
                      <SelectItem value="100">100㎡以上</SelectItem>
                      <SelectItem value="120">120㎡以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">户型</label>
                  <Select value={selectedRooms} onValueChange={setSelectedRooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择户型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="622">不限</SelectItem>     {/* 用622表示不限 */}
                      <SelectItem value="1">1室</SelectItem>
                      <SelectItem value="2">2室</SelectItem>
                      <SelectItem value="3">3室</SelectItem>
                      <SelectItem value="4">4室及以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">价格范围</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    step={500}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>¥{priceRange[0]}</span>
                    <span>¥{priceRange[1]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 房源列表 */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索房源名称或地址"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={property.status === "available" ? "default" : "secondary"}
                    >
                      {property.status === "available" ? "可租" : "已租"}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.rooms}室
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}卫
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {property.maxTenants}人
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="text-xl font-bold text-primary">
                      ¥{property.price}
                      <span className="text-sm font-normal text-gray-500">/月</span>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                      <Button variant="ghost" size="sm">
                        查看详情
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">{isLoading ? "正在加载..." : `找到 ${displayedProperties.length} 套房源`}</p>
          </div>
        </div>

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
