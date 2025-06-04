'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { UserUpdateInput, PasswordUpdateInput, UserNotificationSettings } from '../models/user';
import { useState } from 'react';

/**
 * 获取当前用户信息的钩子
 * @returns 当前用户信息相关状态和数据
 */
export const useCurrentUser = () => {
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5分钟内不会重新获取
    retry: 1,
    enabled: userService.isAuthenticated() // 仅在用户已认证时获取
  });
  
  return {
    user,
    isLoading,
    error,
    refetch
  };
};

/**
 * 获取用户个人资料的钩子
 * @returns 用户个人资料相关状态和数据
 */
export const useUserProfile = () => {
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getUserProfile(),
    staleTime: 1000 * 60 * 5, // 5分钟内不会重新获取
    retry: 1,
    enabled: userService.isAuthenticated() // 仅在用户已认证时获取
  });
  
  return {
    profile,
    isLoading,
    error,
    refetch
  };
};

/**
 * 更新用户信息的钩子
 * @returns 更新用户信息相关状态和方法
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: updateUser,
    isPending: isUpdating,
    error: updateError,
    data: updatedUser
  } = useMutation({
    mutationFn: (data: UserUpdateInput) => userService.updateUser(data),
    onSuccess: (data) => {
      // 更新缓存中的用户数据
      queryClient.setQueryData(['currentUser'], data);
      // 使用户资料查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
  
  return {
    updateUser,
    isUpdating,
    updateError,
    updatedUser
  };
};

/**
 * 更新用户密码的钩子
 * @returns 更新密码相关状态和方法
 */
export const useUpdatePassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: updatePassword,
    isPending: isUpdating,
    error: updateError
  } = useMutation({
    mutationFn: (data: PasswordUpdateInput) => userService.updatePassword(data),
    onSuccess: () => {
      setIsSuccess(true);
    }
  });
  
  return {
    updatePassword,
    isUpdating,
    updateError,
    isSuccess,
    resetSuccess: () => setIsSuccess(false)
  };
};

/**
 * 上传用户头像的钩子
 * @returns 上传头像相关状态和方法
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: uploadAvatar,
    isPending: isUploading,
    error: uploadError,
    data: avatarData
  } = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      // 使用户数据查询失效，以便重新获取新的头像URL
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
  
  return {
    uploadAvatar,
    isUploading,
    uploadError,
    avatarData
  };
};

/**
 * 获取用户通知设置的钩子
 * @returns 用户通知设置相关状态和数据
 */
export const useNotificationSettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: () => userService.getNotificationSettings(),
    staleTime: 1000 * 60 * 5, // 5分钟内不会重新获取
    retry: 1,
    enabled: userService.isAuthenticated() // 仅在用户已认证时获取
  });
  
  return {
    settings,
    isLoading,
    error,
    refetch
  };
};

/**
 * 更新用户通知设置的钩子
 * @returns 更新通知设置相关状态和方法
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    data: updatedSettings
  } = useMutation({
    mutationFn: (settings: Partial<UserNotificationSettings>) => 
      userService.updateNotificationSettings(settings),
    onSuccess: (data) => {
      // 更新缓存中的通知设置
      queryClient.setQueryData(['notificationSettings'], data);
    }
  });
  
  return {
    updateSettings,
    isUpdating,
    updateError,
    updatedSettings
  };
};

/**
 * 获取用户列表的钩子
 * @param page 页码
 * @param limit 每页数量
 * @param role 用户角色过滤
 * @returns 用户列表相关状态和数据
 */
export const useUsers = (page: number = 1, limit: number = 10, role?: string) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', { page, limit, role }],
    queryFn: () => userService.getUsers(page, limit, role),
    keepPreviousData: true // 保留上一页数据，提升分页体验
  });
  
  return {
    users: data?.data || [],
    pagination: data ? {
      total: data.meta.total,
      currentPage: data.meta.current_page,
      lastPage: data.meta.last_page,
      perPage: data.meta.per_page
    } : null,
    isLoading,
    error,
    refetch
  };
}; 