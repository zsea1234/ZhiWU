import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { QueryProvider } from '@/lib/providers/QueryProvider'

export const metadata: Metadata = {
  title: '智屋 - 智能房屋租赁平台',
  description: '智屋是一个基于Next.js和Flask的智能房屋租赁平台',
  generator: 'ZhiWu',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh">
      <body className="font-sans">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
