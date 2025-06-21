"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  sent_at: string
  is_read_by_receiver: boolean
  is_agent_reply: boolean
  sender_info: {
    id: number
    username: string
    role: string
  }
}

interface Chat {
  user_id: number
  username: string
  role: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function MessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    // 检查认证
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    fetchChats()
  }, [router])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.user_id)
    }
  }, [selectedChat])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/messages/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setChats(data.data || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast({
        title: "错误",
        description: "获取聊天列表失败",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: number) => {
    try {
      setLoadingMessages(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5001/api/v1/messages?chat_with_user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "错误",
        description: "获取消息历史失败",
        variant: "destructive"
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChat || !messageInput.trim()) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:5001/api/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: selectedChat.user_id,
          content: messageInput
        })
      })

      if (!response.ok) {
        throw new Error('发送消息失败')
      }

      setMessageInput("")
      fetchMessages(selectedChat.user_id)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "错误",
        description: "发送消息失败",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">消息中心</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 聊天列表 */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.user_id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      selectedChat?.user_id === chat.user_id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{chat.username}</p>
                        <p className="text-sm text-gray-500">{chat.last_message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(chat.last_message_time).toLocaleString()}
                        </p>
                        {chat.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 消息内容 */}
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            {selectedChat ? (
              <>
                <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === selectedChat.user_id ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === selectedChat.user_id
                              ? 'bg-gray-100'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.sent_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="输入消息..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-gray-500">
                请选择一个聊天
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}