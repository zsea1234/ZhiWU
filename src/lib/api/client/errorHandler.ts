import axios, { AxiosError } from 'axios';
import { ApiErrorResponse, ErrorHandlerOptions } from './types';

/**
 * API错误类型定义
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

/**
 * 默认错误消息
 */
const DEFAULT_ERROR_MESSAGE = '发生未知错误，请稍后再试';

/**
 * HTTP状态码对应的默认错误消息
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  409: '请求冲突，资源可能已存在',
  422: '提交的数据验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用，请稍后再试',
  504: '网关超时',
};

/**
 * 默认错误处理选项
 */
const defaultOptions: ErrorHandlerOptions = {
  showNotification: true,
  redirectToLogin: true,
  logError: true,
};

/**
 * API错误处理器
 * 处理API请求中的错误，包括显示通知、重定向和日志记录
 */
export const handleApiError = (
  error: AxiosError<ApiErrorResponse>,
  options: ErrorHandlerOptions = {}
): Promise<never> => {
  const opts = { ...defaultOptions, ...options };
  const { response, request, message, config } = error;
  
  // 获取错误信息
  let errorMessage = '未知错误';
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = 500;
  
  if (response) {
    // 服务器返回错误响应
    statusCode = response.status;
    const errorData = response.data;
    
    errorMessage = errorData?.message || `请求失败 (${statusCode})`;
    errorCode = errorData?.code || `ERROR_${statusCode}`;
    
    // 处理特定状态码
    switch (statusCode) {
      case 401:
        if (!config?.url?.includes('auth') && opts.redirectToLogin) {
          // 未认证，重定向到登录页面
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        break;
      case 403:
        errorMessage = '没有权限执行此操作';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 422:
        errorMessage = '提交的数据无效';
        break;
      case 429:
        errorMessage = '请求过于频繁，请稍后再试';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = '服务器错误，请稍后再试';
        break;
    }
  } else if (request) {
    // 请求已发送但未收到响应
    errorMessage = '无法连接到服务器，请检查网络连接';
    errorCode = 'NETWORK_ERROR';
  } else {
    // 请求设置时出错
    errorMessage = message || '请求配置错误';
    errorCode = 'REQUEST_SETUP_ERROR';
  }
  
  // 显示通知
  if (opts.showNotification) {
    // 在这里实现通知显示逻辑
    // 例如使用toast组件或自定义通知系统
    console.error(`[API错误] ${errorMessage}`);
  }
  
  // 记录错误日志
  if (opts.logError) {
    console.error('[API错误]', {
      code: errorCode,
      message: errorMessage,
      status: statusCode,
      url: config?.url,
      method: config?.method?.toUpperCase(),
      details: response?.data?.details,
    });
  }
  
  // 返回带有附加信息的拒绝承诺
  return Promise.reject({
    ...error,
    code: errorCode,
    message: errorMessage,
    status: statusCode,
  });
};

/**
 * 获取用户友好的错误消息
 * @param error API错误对象或Axios错误
 * @returns 用户友好的错误消息
 */
export function getFriendlyErrorMessage(error: ApiError | AxiosError): string {
  if ((error as AxiosError).isAxiosError) {
    const apiError = handleApiError(error as AxiosError);
    return apiError.message;
  }
  
  return (error as ApiError).message || DEFAULT_ERROR_MESSAGE;
}

/**
 * 记录API错误
 * @param error 要记录的错误
 * @param context 错误上下文信息
 */
export function logApiError(error: AxiosError | ApiError, context?: string): void {
  let errorToLog: ApiError;
  
  if ((error as AxiosError).isAxiosError) {
    errorToLog = handleApiError(error as AxiosError);
  } else {
    errorToLog = error as ApiError;
  }
  
  console.error(
    `API Error${context ? ` [${context}]` : ''}:`,
    errorToLog
  );
} 