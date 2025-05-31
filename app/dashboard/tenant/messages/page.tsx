"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Plus, Send } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock messages
const mockMessages = [
  {
    id: 1,
    sender: "房东",
    content: "您好，关于您提出的维修请求，我们已经安排维修人员明天上午10点上门检查。",
    timestamp: "2024-03-15 14:30",
    isRead: false,
  },
  {
    id: 2,
    sender: "系统",
    content: "您的租金支付已确认，感谢您的配合。",
    timestamp: "2024-03-10 09:15",
    isRead: true,
  },
  {
    id: 3,
    sender: "房东",
    content: "您好，请问您对房屋还满意吗？如果有任何问题随时可以联系我。",
    timestamp: "2024-03-05 16:45",
    isRead: true,
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    content: "",
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const message = {
      id: messages.length + 1,
      sender: "我",
      content: newMessage.content,
      timestamp: new Date().toLocaleString(),
      isRead: true,
    }
    setMessages([message, ...messages])
    setNewMessage({ content: "" })
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">消息中心</h1>
          <p className="text-gray-600">查看和发送消息</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              发送消息
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>发送消息</DialogTitle>
              <DialogDescription>
                选择收件人并输入消息内容
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    消息内容
                  </label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                    placeholder="请输入消息内容..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  发送
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{message.sender}</CardTitle>
                  <CardDescription>
                    {message.timestamp}
                  </CardDescription>
                </div>
                {!message.isRead && (
                  <Badge variant="secondary">未读</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{message.content}</p>
            </CardContent>
          </Card>
        ))}

        {messages.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">暂无消息</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                发送消息
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 