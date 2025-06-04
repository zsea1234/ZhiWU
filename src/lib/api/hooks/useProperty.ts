'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { propertyService } from '../services/propertyService';
import { PropertyCreateInput, PropertyUpdateInput } from '../models/property';
import { useState } from 'react';

/**
 * 获取房源列表的钩子
 * @param page 页码
 * @param limit 每页数量
 * @param params 查询参数
 * @returns 房源列表相关状态和数据
 */
export const useProperties = (page: number = 1, limit: number = 10, params: Record<string, any> = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['properties', { page, limit, ...params }],
    queryFn: () => propertyService.getProperties(page, limit, params),
    keepPreviousData: true // 保留上一页数据，提升分页体验
  });
  
  return {
    properties: data?.data || [],
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

/**
 * 获取单个房源详情的钩子
 * @param id 房源ID
 * @returns 房源详情相关状态和数据
 */
export const useProperty = (id: string | null) => {
  const {
    data: property,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id as string),
    enabled: !!id // 仅在有ID时获取
  });
  
  return {
    property,
    isLoading,
    error,
    refetch
  };
};

/**
 * 创建房源的钩子
 * @returns 创建房源相关状态和方法
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: createProperty,
    isPending: isCreating,
    error: createError,
    data: newProperty
  } = useMutation({
    mutationFn: (data: PropertyCreateInput) => propertyService.createProperty(data),
    onSuccess: () => {
      // 使房源列表查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsSuccess(true);
    }
  });
  
  return {
    createProperty,
    isCreating,
    createError,
    newProperty,
    isSuccess,
    resetSuccess: () => setIsSuccess(false)
  };
};

/**
 * 更新房源的钩子
 * @returns 更新房源相关状态和方法
 */
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: updateProperty,
    isPending: isUpdating,
    error: updateError,
    data: updatedProperty
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyUpdateInput }) => 
      propertyService.updateProperty(id, data),
    onSuccess: (data) => {
      // 更新缓存中的房源数据
      queryClient.setQueryData(['property', data.id], data);
      // 使房源列表查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsSuccess(true);
    }
  });
  
  return {
    updateProperty,
    isUpdating,
    updateError,
    updatedProperty,
    isSuccess,
    resetSuccess: () => setIsSuccess(false)
  };
};

/**
 * 删除房源的钩子
 * @returns 删除房源相关状态和方法
 */
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    mutate: deleteProperty,
    isPending: isDeleting,
    error: deleteError
  } = useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
    onSuccess: (_, id) => {
      // 从缓存中移除房源数据
      queryClient.removeQueries({ queryKey: ['property', id] });
      // 使房源列表查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsSuccess(true);
    }
  });
  
  return {
    deleteProperty,
    isDeleting,
    deleteError,
    isSuccess,
    resetSuccess: () => setIsSuccess(false)
  };
};

/**
 * 上传房源图片的钩子
 * @returns 上传图片相关状态和方法
 */
export const useUploadPropertyImage = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: uploadImage,
    isPending: isUploading,
    error: uploadError,
    data: imageData
  } = useMutation({
    mutationFn: ({ propertyId, file, isPrimary, caption }: { 
      propertyId: string; 
      file: File; 
      isPrimary?: boolean; 
      caption?: string 
    }) => propertyService.uploadPropertyImage(propertyId, file, isPrimary, caption),
    onSuccess: (_, { propertyId }) => {
      // 使房源详情查询失效，以便重新获取包含新图片的数据
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    }
  });
  
  return {
    uploadImage,
    isUploading,
    uploadError,
    imageData
  };
};

/**
 * 删除房源图片的钩子
 * @returns 删除图片相关状态和方法
 */
export const useDeletePropertyImage = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: deleteImage,
    isPending: isDeleting,
    error: deleteError
  } = useMutation({
    mutationFn: ({ propertyId, imageId }: { propertyId: string; imageId: string }) => 
      propertyService.deletePropertyImage(propertyId, imageId),
    onSuccess: (_, { propertyId }) => {
      // 使房源详情查询失效，以便重新获取不包含已删除图片的数据
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    }
  });
  
  return {
    deleteImage,
    isDeleting,
    deleteError
  };
};

/**
 * 更新房源状态的钩子
 * @returns 更新状态相关状态和方法
 */
export const useUpdatePropertyStatus = () => {
  const queryClient = useQueryClient();
  
  const {
    mutate: updateStatus,
    isPending: isUpdating,
    error: updateError,
    data: updatedProperty
  } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      propertyService.updatePropertyStatus(id, status),
    onSuccess: (data) => {
      // 更新缓存中的房源数据
      queryClient.setQueryData(['property', data.id], data);
      // 使房源列表查询失效，以便重新获取
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });
  
  return {
    updateStatus,
    isUpdating,
    updateError,
    updatedProperty
  };
};

/**
 * 获取房源设施列表的钩子
 * @returns 设施列表相关状态和数据
 */
export const useAmenities = () => {
  const {
    data: amenities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => propertyService.getAmenities(),
    staleTime: 1000 * 60 * 60 // 1小时内不会重新获取，因为设施列表变化不频繁
  });
  
  return {
    amenities,
    isLoading,
    error
  };
};

/**
 * 搜索房源的钩子（支持无限滚动）
 * @param params 搜索参数
 * @param limit 每页数量
 * @returns 搜索结果相关状态和数据
 */
export const useInfiniteProperties = (params: Record<string, any>, limit: number = 10) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['infiniteProperties', params, limit],
    queryFn: ({ pageParam = 1 }) => 
      propertyService.searchProperties(params, pageParam, limit),
    getNextPageParam: (lastPage) => {
      // 如果当前页小于最后一页，返回下一页的页码
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      // 否则返回undefined，表示没有更多页
      return undefined;
    }
  });
  
  // 将分页数据扁平化为单一数组
  const properties = data?.pages.flatMap(page => page.data) || [];
  
  return {
    properties,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  };
};

/**
 * 获取推荐房源的钩子
 * @param limit 数量限制
 * @returns 推荐房源相关状态和数据
 */
export const useRecommendedProperties = (limit: number = 5) => {
  const {
    data: recommendedProperties,
    isLoading,
    error
  } = useQuery({
    queryKey: ['recommendedProperties', limit],
    queryFn: () => propertyService.getRecommendedProperties(limit),
    staleTime: 1000 * 60 * 30 // 30分钟内不会重新获取
  });
  
  return {
    recommendedProperties,
    isLoading,
    error
  };
}; 