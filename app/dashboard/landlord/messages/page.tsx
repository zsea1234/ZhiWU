"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock data
const mockMessages = [
  {
    id: 1,
    sender: "张三",
    property: "朝阳区幸福小区 2室1厅",
    content: "您好，我想咨询一下房子的具体位置和周边设施情况。",
    timestamp: "2024-03-15 14:30",
    read: false,
  },
  {
    id: 2,
    sender: "李四",
    property: "海淀区阳光花园 3室2厅",
    content: "请问房子还在出租吗？我想预约看房。",
    timestamp: "2024-03-14 10:15",
    read: true,
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [selectedTenant, setSelectedTenant] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTenant) return

    const newMsg = {
      id: messages.length + 1,
      sender: "房东",
      property: selectedTenant,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      read: true,
    }

    setMessages([newMsg, ...messages])
    setNewMessage("")
    setSelectedTenant("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">消息中心</h1>
        <p className="text-gray-600">与租客进行沟通</p>
      </div>

      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              发送消息
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>发送新消息</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700">选择租客</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                >
                  <option value="">请选择租客</option>
                  <option value="张三 - 朝阳区幸福小区 2室1厅">张三 - 朝阳区幸福小区 2室1厅</option>
                  <option value="李四 - 海淀区阳光花园 3室2厅">李四 - 海淀区阳光花园 3室2厅</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">消息内容</label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="请输入消息内容..."
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full">
                发送
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {message.sender}
                  </CardTitle>
                  <CardDescription>
                    {message.property} - {message.timestamp}
                  </CardDescription>
                </div>
                {!message.read && (
                  <Badge variant="secondary">未读</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 