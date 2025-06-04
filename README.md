# 智屋 - 智能房屋租赁平台

智屋是一个基于Next.js和Flask的智能房屋租赁平台，提供房源发布、预约看房、在线签约、租金支付和维修投诉等功能。

## 项目结构

项目采用了企业级前端架构，主要目录结构如下：

```
src/
├── app/                    # Next.js App Router目录
│   ├── auth/               # 认证相关页面
│   ├── dashboard/          # 用户仪表板
│   ├── properties/         # 房源相关页面
│   └── about/              # 关于页面
├── components/             # 共享UI组件
│   └── ui/                 # 基础UI组件（基于shadcn/ui）
├── lib/                    # 通用库
│   ├── api/                # API服务层
│   │   ├── client/         # API客户端基础设施
│   │   │   ├── apiClient.ts    # API客户端工厂
│   │   │   ├── errorHandler.ts # 错误处理
│   │   │   ├── interceptors.ts # 请求/响应拦截器
│   │   │   └── types.ts        # API类型定义
│   │   └── services/       # 领域模型API服务
│   ├── contexts/           # React上下文
│   ├── hooks/              # 自定义钩子
│   ├── utils/              # 工具函数
│   └── constants/          # 常量定义
├── styles/                 # 全局样式
└── types/                  # 全局类型定义
```

## 技术栈

- **前端框架**: Next.js 15.x（App Router）
- **UI库**: Tailwind CSS, shadcn/ui
- **状态管理**: React Context API, React Query
- **HTTP客户端**: Axios
- **表单处理**: React Hook Form, Zod
- **后端**: Flask, SQLAlchemy

## 项目运行逻辑

### 入口文件

1. **src/app/layout.tsx**
   - 应用程序的根布局组件
   - 包含全局样式和主要的上下文提供者（如AuthProvider）
   - 所有页面都会被包裹在这个布局中

2. **src/app/page.tsx**
   - 首页组件，展示房源搜索、热门房源和平台特色等内容
   - 作为访问者进入网站的第一个页面

### 配置文件

1. **next.config.mjs**
   - Next.js的配置文件，设置环境变量和构建选项
   - 配置API基础URL等全局变量

2. **.env.local**
   - 环境变量配置文件
   - 包含API基础URL等环境特定配置

### API服务层

1. **src/lib/api/client/apiClient.ts**
   - API客户端工厂，创建和配置Axios实例
   - 处理基本的请求配置和响应转换

2. **src/lib/api/client/interceptors.ts**
   - 请求和响应拦截器
   - 处理认证令牌添加、刷新令牌逻辑等

3. **src/lib/api/client/errorHandler.ts**
   - 统一错误处理机制
   - 处理网络错误、API错误等异常情况

4. **src/lib/api/services/**
   - 按领域模型分离的API服务
   - 每个服务负责特定领域的API请求，如：
     - authService.ts: 处理用户认证相关请求
     - userService.ts: 处理用户信息相关请求
     - propertyService.ts: 处理房源相关请求
     - bookingService.ts: 处理预约看房相关请求
     - leaseService.ts: 处理租约相关请求

### 状态管理

1. **src/lib/contexts/AuthContext.tsx**
   - 认证上下文提供者
   - 管理用户登录状态、用户信息
   - 提供登录、登出等认证相关功能

2. **src/lib/hooks/**
   - 自定义React钩子
   - 封装特定功能的可复用逻辑

### 页面组织

1. **src/app/(auth)/login/page.tsx 和 register/page.tsx**
   - 用户登录和注册页面
   - 使用authService处理认证请求

2. **src/app/properties/page.tsx**
   - 房源列表页面
   - 使用propertyService获取和过滤房源数据

3. **src/app/properties/[id]/page.tsx**
   - 房源详情页面
   - 展示特定房源的详细信息和预约功能

4. **src/app/dashboard/page.tsx**
   - 用户仪表板
   - 根据用户角色（租客/房东/管理员）显示不同内容

### 数据流向

1. **用户认证流程**
   - 用户在登录页面输入凭据
   - authService.login()发送请求到后端API
   - 成功后，AuthContext存储用户信息和令牌
   - 用户被重定向到仪表板或首页

2. **房源查询流程**
   - 用户在搜索页面设置过滤条件
   - propertyService.searchProperties()发送请求
   - 结果显示在房源列表页面

## 改造过程

本项目经历了以下改造过程：

1. **项目结构重组**
   - 创建src目录，规范化目录结构
   - 按功能模块组织代码

2. **API层改进**
   - 创建统一的API客户端工厂
   - 实现请求/响应拦截器
   - 统一错误处理机制
   - 按领域模型分离API服务

3. **状态管理优化**
   - 使用React Context API管理全局状态
   - 集成React Query进行服务器状态管理

4. **环境配置**
   - 添加.env.local文件管理环境变量
   - 更新next.config.mjs配置

## 如何运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **创建环境变量文件**
   创建`.env.local`文件，添加以下内容：
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   npm start
   ```

## 后端服务

后端服务基于Flask框架，运行在：
- 本地开发环境：http://localhost:5000

## 用户角色

系统支持三种用户角色：
- **租客**: 浏览房源、预约看房、签约租赁
- **房东**: 发布房源、管理预约、处理维修请求
- **管理员**: 系统管理、用户管理、内容审核 