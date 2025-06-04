'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, User } from '@/lib/api/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 检查是否已认证
        if (userService.isAuthenticated()) {
          // 尝试从本地存储获取用户信息
          const storedUser = userService.getStoredUser();
          
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // 如果本地没有用户信息但有令牌，尝试从API获取
            try {
              const userData = await userService.getCurrentUser();
              setUser(userData);
              setIsAuthenticated(true);
            } catch (error) {
              console.error('获取用户信息失败：', error);
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('初始化认证失败：', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('登出失败：', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 