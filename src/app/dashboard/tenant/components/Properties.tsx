import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Plus } from "lucide-react"
import Link from "next/link"

export default function Properties() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>房源搜索</CardTitle>
        <CardDescription>寻找您理想的住所</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">开始搜索适合您的房源</p>
          <Link href="/properties">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              搜索房源
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}