"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Home,
  Settings,
  Plus,
  Users,
  LogOut,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authApi } from "@/app/services/api/auth"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { adminPropertiesApi } from '@/app/services/api/admin-properties'
import { Property, PropertyFilters } from "@/app/types/property"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface UserData {
  id: number
  username: string
  email: string
  phone: string
  role: 'tenant' | 'landlord' | 'admin'
  is_active: boolean
  mfa_enabled: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

interface UserListResponse {
  items: UserData[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export default function AdminDashboard() {
  console.log("AdminDashboard 组件开始渲染")

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [allUsers, setAllUsers] = useState<UserData[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [filters, setFilters] = useState<PropertyFilters>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [activeTab, setActiveTab] = useState("users")

  // 新增用户表单数据
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "tenant" as "tenant" | "landlord",
  })

  // 将 fetchUsers 函数定义移到 useEffect 外部
  const fetchUsers = async () => {
    console.log("Entering fetchUsers function...")
    console.log("Fetching all users for frontend search...")
    try {
      setUsersLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.log("No token found during user fetch, redirecting to login")
        router.push("/auth/login")
        return
      }

      const response = await fetch(
        `http://localhost:5001/api/v1/admin/users?role=${selectedRole === "all" ? "" : selectedRole}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json() as ApiResponse<UserListResponse>
      console.log("Users data received (for frontend search):", data)
      console.log("Users data structure:", {
        success: data.success,
        message: data.message,
        data: data.data,
        users: data.data?.items,
        total: data.data?.total,
        rawData: JSON.stringify(data, null, 2)
      })
      
      if (data.success) {
        console.log("Backend Response (all users):", {
          success: data.success,
          message: data.message,
          timestamp: data.timestamp,
          rawData: data.data
        });

        const fetchedUsers = data.data.items || [];
        setAllUsers(fetchedUsers);
      } else {
        console.error("Failed to fetch all users:", data.message)
        setError(data.message || "获取用户列表失败")
        setAllUsers([])
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
      setError("获取用户列表失败")
      setAllUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  // 处理组件挂载
  useEffect(() => {
    console.log("AdminDashboard 组件挂载")
    setMounted(true)
    return () => {
      console.log("AdminDashboard 组件卸载")
    }
  }, [])

  // 处理用户认证
  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        console.log("检查认证状态...")
        const token = localStorage.getItem('auth_token')
        if (!token) {
          console.log("未找到认证token")
          router.push('/auth/login')
          return
        }

        console.log("获取当前用户信息...")
        const response = await authApi.getCurrentUser()
        console.log("用户信息:", response)
        setUser(response.data.data)
        setLoading(false)
      } catch (error) {
        console.error("认证错误:", error)
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [mounted])

  // 处理用户列表获取 (修改以仅在初始加载时调用 fetchUsers)
  useEffect(() => {
    console.log("Users effect running (initial fetch), mounted:", mounted, "loading:", loading, "user:", !!user)
    if (!mounted || loading || !user) return

    // 在 useEffect 中调用 fetchUsers
    fetchUsers()
  }, [mounted, loading, user, router])

  // 新增 useEffect 监听搜索和筛选变化，进行前端过滤
  useEffect(() => {
    console.log("Filtering users...");
    let filtered = allUsers;

    // 应用搜索过滤
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        user.phone.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // 应用角色筛选 (如果后端 fetchUsers 已经根据角色过滤，这里可能不需要再次过滤)
    // 如果后端 fetchUsers 获取的是所有角色，则这里主要处理搜索
    // 如果需要前端进行角色过滤，请 uncomment 下面的代码块
    /*
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    */

    setUsers(filtered); // 更新显示的用户列表
    setTotalUsers(filtered.length); // 更新总数
    setCurrentPage(1); // 过滤后重置到第一页

  }, [allUsers, searchQuery, selectedRole]); // 监听 allUsers, searchQuery, selectedRole 的变化

  // 新增 useEffect 监听 success 状态并刷新用户列表 (修改为只在 success 变化时重新获取所有用户)
  useEffect(() => {
    console.log("Success state effect running:", success);
    if (success) {
      console.log("Success state is true, refetching all users...");
      const timer = setTimeout(() => setSuccess(""), 3000); // Example: clear message after 3 seconds
      fetchUsers(); // 重新获取所有用户数据
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      console.log("Success state is false/empty.");
    }
  }, [success]); // 监听 success 的变化

  useEffect(() => {
    console.log("用户状态变化:", { user: !!user })
  }, [user])

  const handleLogout = async () => {
    console.log("Logout initiated")
    if (!mounted) return
    try {
      await authApi.logout()
      console.log("Logout successful")
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    if (!mounted || !selectedUser) return
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      const response = await fetch(`http://localhost:5001/api/v1/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          is_active: selectedUser.is_active,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess("用户信息更新成功")
        setIsEditUserDialogOpen(false)
        // 重新获取用户列表
        fetchUsers()
      } else {
        setError(data.message || "更新用户信息失败")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      setError("更新用户信息失败")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!mounted) return;
    if (!confirm("确定要删除这个用户吗？此操作不可恢复。")) return;

    try {
      console.log("Attempting to delete user:", userId);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      console.log("Sending delete request for user:", userId);
      const response = await fetch(`http://localhost:5001/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);

      if (response.status === 204 || response.ok) {
        console.log("Before setting success state.");
        setSuccess("用户删除成功");
        console.log("After setting success state.");
        setError("");
        // 重新获取用户列表将在 success 状态变化后由 useEffect 触发
      } else {
        const data = await response.json();
        console.error("Failed to delete user:", data.message);
        setError(data.message || "删除用户失败");
        setSuccess(""); // Clear success message on error
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("删除用户失败");
      setSuccess(""); // Clear success message on catch
    }
  };

  // 获取房源列表
  const fetchProperties = async () => {
    console.log('🚀 fetchProperties 函数被调用!')
    try {
      setLoading(true)
      console.log('开始获取房源列表，当前筛选条件:', filters, '页码:', page)
      const response = await adminPropertiesApi.getAllProperties({
        ...filters,
        page,
        page_size: 10
      })
      console.log('完整房源 response:', response)
      console.log('response类型:', typeof response)
      console.log('response是否为数组:', Array.isArray(response))
      console.log('response的所有键:', Object.keys(response))
      
      // API层已经处理了数据结构，response应该直接是PaginatedProperties格式
      const items = response.items || [];
      const totalPages = response.pages || 1;
      const totalItems = response.total || 0;
      
      console.log('房源列表items:', items)
      console.log('totalPages:', totalPages, 'totalItems:', totalItems)
      
      // 检查每个房源对象是否包含id字段
      items.forEach((property: any, index: number) => {
        console.log(`房源 ${index}:`, property)
        console.log(`房源 ${index} 的所有键:`, Object.keys(property))
        
        // 直接使用后端返回的数据，不修改
        console.log(`房源 ${index} 保持原始数据`)
      })
      
      setProperties(items)
      setTotalPages(totalPages)
      setTotalItems(totalItems)
    } catch (error) {
      console.error('获取房源列表失败:', error)
      toast({
        title: "获取房源列表失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理房源验证
  const handleVerifyProperty = async (isVerified: boolean) => {
    console.log('handleVerifyProperty called, selectedProperty:', selectedProperty)
    if (!selectedProperty || selectedProperty.id == null) {
      console.log('审核失败，selectedProperty 或 id 无效:', selectedProperty)
      toast({ title: "审核失败", description: "房源ID无效", variant: "destructive" });
      return;
    }
    
    // 检查是否使用临时标识符
    if ((selectedProperty as any).temp_identifier) {
      console.log('房源使用临时标识符，无法进行真实审核')
      toast({ 
        title: "无法审核", 
        description: "房源使用临时标识符，无法进行真实审核。请修复后端API，确保返回正确的房源ID字段。",
        variant: "destructive" 
      })
      return;
    }
    
    try {
      console.log('开始审核房源:', selectedProperty.id, '审核结果:', isVerified, '备注:', verificationNotes)
      await adminPropertiesApi.verifyProperty(selectedProperty.id, {
        is_verified_by_admin: isVerified,
        admin_notes: verificationNotes
      })
      console.log('审核请求已发送，等待刷新房源列表...')
      // 更新房源列表
      await fetchProperties()
      console.log('房源列表已刷新')
      // 关闭对话框
      setVerifyDialogOpen(false)
      setSelectedProperty(null)
      setVerificationNotes('')
      toast({
        title: "审核成功",
        description: `房源已${isVerified ? '通过' : '拒绝'}审核`,
      })
    } catch (error) {
      console.error('审核房源失败:', error, 'selectedProperty:', selectedProperty)
      toast({
        title: "审核失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    console.log('useEffect触发，当前筛选条件:', filters, '当前页码:', page)
    console.log('组件挂载状态:', mounted)
    console.log('用户状态:', user)
    if (mounted && user) {
      console.log('开始获取房源列表...')
      console.log('fetchProperties函数存在:', typeof fetchProperties)
      fetchProperties()
    } else {
      console.log('跳过获取房源列表:', { mounted, user: !!user })
    }
  }, [filters, page, mounted, user])

  // 在组件渲染时输出当前状态
  console.log('当前组件状态:', {
    properties,
    loading,
    filters,
    page,
    totalPages,
    selectedProperty,
    verificationNotes,
    verifyDialogOpen,
    mounted,
    user: !!user
  })

  console.log("Render state:", {
    mounted,
    loading,
    user: !!user,
    usersCount: users.length,
    usersLoading,
    error,
    success
  })

  if (!mounted) {
    console.log("组件未挂载，返回null")
    return null
  }

  if (loading) {
    console.log("加载中，显示加载状态")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    console.log("未找到用户数据，返回null")
    return null
  }

  console.log("Rendering main component")
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">智屋</span>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              管理员
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">欢迎，{user.username}</span>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理员控制台</h1>
          <p className="text-gray-600">系统管理和监控</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总房源数</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <Home className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} className="space-y-6" onValueChange={(value) => {
          setActiveTab(value);
          console.log('标签页切换:', value)
          if (value === 'properties') {
            console.log('切换到房源管理标签页')
            console.log('当前状态:', {
              mounted,
              user: !!user,
              loading,
              filters,
              page
            })
            // 确保组件已挂载且用户已登录时获取数据
            if (mounted && user) {
              console.log('开始获取房源列表...')
              fetchProperties()
            } else {
              console.log('跳过获取房源列表:', { mounted, user: !!user })
            }
          }
        }}>
          <TabsList>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="properties">房源管理</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>管理系统用户账号</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索用户..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部角色</SelectItem>
                      <SelectItem value="tenant">租客</SelectItem>
                      <SelectItem value="landlord">房东</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>手机号</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              <span className="ml-2 text-gray-500">加载中...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            暂无用户数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : user.role === "landlord"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {user.role === "admin"
                                  ? "管理员"
                                  : user.role === "landlord"
                                  ? "房东"
                                  : "租客"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? "default" : "destructive"}>
                                {user.is_active ? "活跃" : "禁用"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>操作</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setIsEditUserDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    共 {totalUsers} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="text-sm">
                      第 {currentPage} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage * pageSize >= totalUsers}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>编辑用户</DialogTitle>
                  <DialogDescription>修改用户信息</DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <form onSubmit={handleEditUser}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-username">用户名</Label>
                        <Input
                          id="edit-username"
                          value={selectedUser.username}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">邮箱</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={selectedUser.email}
                          onChange={(e) =>
                            setSelectedUser((prev) =>
                              prev ? { ...prev, email: e.target.value } : null
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">手机号</Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={selectedUser.phone}
                          onChange={(e) =>
                            setSelectedUser((prev) =>
                              prev ? { ...prev, phone: e.target.value } : null
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">角色</Label>
                        <Select
                          value={selectedUser.role}
                          onValueChange={(value: "tenant" | "landlord" | "admin") =>
                            setSelectedUser((prev) =>
                              prev ? { ...prev, role: value } : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tenant">租客</SelectItem>
                            <SelectItem value="landlord">房东</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">状态</Label>
                        <Select
                          value={selectedUser.is_active ? "active" : "inactive"}
                          onValueChange={(value) =>
                            setSelectedUser((prev) =>
                              prev
                                ? { ...prev, is_active: value === "active" }
                                : null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">活跃</SelectItem>
                            <SelectItem value="inactive">禁用</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit">保存更改</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>房源管理</CardTitle>
                <CardDescription>审核和管理平台房源信息</CardDescription>
                <Button 
                  onClick={() => {
                    console.log('手动刷新房源列表')
                    fetchProperties()
                  }}
                  size="sm"
                  variant="outline"
                >
                  刷新列表
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 筛选器 */}
                  <div className="flex flex-wrap gap-4">
                    <Input
                      placeholder="搜索地址"
                      value={filters.address_keyword || ''}
                      onChange={(e) => setFilters((prev: PropertyFilters) => ({ ...prev, address_keyword: e.target.value }))}
                      className="max-w-xs"
                    />
                    <Select
                      value={filters.status || 'all'}
                      onValueChange={(value) => setFilters((prev: PropertyFilters) => ({ ...prev, status: value === 'all' ? undefined : value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="房源状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="vacant">空置</SelectItem>
                        <SelectItem value="rented">已出租</SelectItem>
                        <SelectItem value="under_maintenance">维护中</SelectItem>
                        <SelectItem value="pending_approval">待审核</SelectItem>
                        <SelectItem value="delisted">已下架</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.verification_status || 'all'}
                      onValueChange={(value) => setFilters((prev: PropertyFilters) => ({ ...prev, verification_status: value === 'all' ? undefined : value }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="审核状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="verified">已审核</SelectItem>
                        <SelectItem value="unverified">未审核</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 房源列表 */}
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>标题</TableHead>
                            <TableHead>地址</TableHead>
                            <TableHead>城市</TableHead>
                            <TableHead>月租金</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>房东</TableHead>
                            <TableHead>审核状态</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {properties.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                暂无房源数据
                              </TableCell>
                            </TableRow>
                          ) : (
                            properties.map((property, idx) => (
                              <TableRow key={property.id || idx}>
                                <TableCell>{property.title}</TableCell>
                                <TableCell>{property.address_line1}</TableCell>
                                <TableCell>{property.city}</TableCell>
                                <TableCell>¥{property.rent_price_monthly}</TableCell>
                                <TableCell>{property.status}</TableCell>
                                <TableCell>{property.landlord_info?.username || '-'}</TableCell>
                                <TableCell>{property.is_verified_by_admin ? '已审核' : '未审核'}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      console.log('点击审核按钮，property:', property)
                                      console.log('property完整对象:', JSON.stringify(property, null, 2))
                                      
                                      // 检查是否有id字段
                                      if (property.id) {
                                        console.log('设置 selectedProperty:', property)
                                        setSelectedProperty(property)
                                        setTimeout(() => {
                                          console.log('selectedProperty after set:', property)
                                        }, 0)
                                        setVerifyDialogOpen(true)
                                      } else {
                                        // 临时解决方案：使用title和address_line1的组合作为标识符
                                        console.log('房源缺少id字段，使用临时标识符')
                                        const tempProperty = {
                                          ...property,
                                          id: `${property.title}_${property.address_line1}`.replace(/\s+/g, '_'),
                                          temp_identifier: true
                                        } as any
                                        console.log('临时标识符:', tempProperty.id)
                                        setSelectedProperty(tempProperty)
                                        setTimeout(() => {
                                          console.log('selectedProperty after set:', tempProperty)
                                        }, 0)
                                        setVerifyDialogOpen(true)
                                        
                                        toast({ 
                                          title: "使用临时标识符", 
                                          description: "房源缺少ID字段，使用临时标识符进行审核",
                                          variant: "default" 
                                        })
                                      }
                                    }}
                                  >
                                    审核
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage((prev: number) => Math.max(1, prev - 1))}
                              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage((prev: number) => Math.min(totalPages, prev + 1))}
                              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 审核对话框 */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>审核房源</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedProperty?.title}</h3>
                    <p className="text-sm text-gray-600">{selectedProperty?.address_line1}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">审核备注</label>
                    <Textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="请输入审核备注..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleVerifyProperty(false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      拒绝
                    </Button>
                    <Button
                      onClick={() => handleVerifyProperty(true)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      通过
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 