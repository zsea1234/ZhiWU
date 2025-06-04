'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginInput, RegisterInput, MfaVerifyInput, PasswordResetRequestInput, PasswordResetConfirmInput } from '../models/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * 登录钩子
 * @returns 登录相关状态和方法
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
    data: loginData
  } = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      // 登录成功后，使当前用户查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // 如果需要MFA验证，不进行重定向
      if (!data.mfa_required) {
        // 根据用户角色重定向到不同页面
        if (data.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'landlord') {
          router.push('/dashboard/landlord');
        } else {
          router.push('/dashboard/tenant');
        }
      }
    }
  });
  
  return {
    login,
    isLoggingIn,
    loginError,
    loginData
  };
};

/**
 * 注册钩子
 * @returns 注册相关状态和方法
 */
export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
    data: registerData
  } = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (data) => {
      // 注册成功后，使当前用户查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // 如果需要MFA设置，重定向到MFA设置页面
      if (data.mfa_required) {
        router.push('/auth/mfa-setup');
      } else {
        // 根据用户角色重定向到不同页面
        if (data.user.role === 'landlord') {
          router.push('/dashboard/landlord');
        } else {
          router.push('/dashboard/tenant');
        }
      }
    }
  });
  
  return {
    register,
    isRegistering,
    registerError,
    registerData
  };
};

/**
 * 登出钩子
 * @returns 登出相关状态和方法
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const {
    mutate: logout,
    isPending: isLoggingOut,
    error: logoutError
  } = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // 清除所有查询缓存
      queryClient.clear();
      // 重定向到首页
      router.push('/');
    }
  });
  
  return {
    logout,
    isLoggingOut,
    logoutError
  };
};

/**
 * MFA验证钩子
 * @returns MFA验证相关状态和方法
 */
export const useMfaVerify = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const {
    mutate: verifyMfa,
    isPending: isVerifying,
    error: verifyError,
    data: verifyData
  } = useMutation({
    mutationFn: (data: MfaVerifyInput) => authService.verifyMfa(data),
    onSuccess: (data) => {
      // MFA验证成功后，使当前用户查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // 根据用户角色重定向到不同页面
      if (data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user.role === 'landlord') {
        router.push('/dashboard/landlord');
      } else {
        router.push('/dashboard/tenant');
      }
    }
  });
  
  return {
    verifyMfa,
    isVerifying,
    verifyError,
    verifyData
  };
};

/**
 * 密码重置请求钩子
 * @returns 密码重置请求相关状态和方法
 */
export const usePasswordResetRequest = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: requestPasswordReset,
    isPending: isRequesting,
    error: requestError
  } = useMutation({
    mutationFn: (data: PasswordResetRequestInput) => authService.requestPasswordReset(data),
    onSuccess: () => {
      setIsSuccess(true);
    }
  });
  
  return {
    requestPasswordReset,
    isRequesting,
    requestError,
    isSuccess
  };
};

/**
 * 密码重置确认钩子
 * @returns 密码重置确认相关状态和方法
 */
export const usePasswordResetConfirm = () => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: confirmPasswordReset,
    isPending: isConfirming,
    error: confirmError
  } = useMutation({
    mutationFn: (data: PasswordResetConfirmInput) => authService.confirmPasswordReset(data),
    onSuccess: () => {
      setIsSuccess(true);
      // 3秒后重定向到登录页面
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  });
  
  return {
    confirmPasswordReset,
    isConfirming,
    confirmError,
    isSuccess
  };
}; 