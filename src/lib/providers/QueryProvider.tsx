'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 默认查询配置
        staleTime: 1000 * 60 * 5, // 数据5分钟内不会被标记为过期
        cacheTime: 1000 * 60 * 30, // 数据缓存30分钟
        refetchOnWindowFocus: false, // 窗口获得焦点时不自动重新获取
        retry: 1, // 失败时重试1次
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
} 