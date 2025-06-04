/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 配置环境变量
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api/v1',
  },
};

export default nextConfig;
