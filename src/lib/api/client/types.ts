import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页响应数据
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * API服务基础接口
 * 所有领域特定的API服务都应该实现这个接口
 */
export interface BaseApiService {
  /**
   * 获取服务的基础URL路径
   */
  getBasePath(): string;
  
  /**
   * 设置请求配置
   * @param config 请求配置
   */
  setRequestConfig(config: AxiosRequestConfig): void;
}

/**
 * API请求选项
 */
export interface ApiRequestOptions extends AxiosRequestConfig {
  /**
   * 是否静默处理错误（不显示通知）
   */
  silentError?: boolean;
  
  /**
   * 自定义错误处理函数
   */
  errorHandler?: (error: any) => void;
  
  /**
   * 成功回调函数
   */
  onSuccess?: (response: AxiosResponse) => void;
}

/**
 * 过滤条件操作符
 */
export type FilterOperator = 
  | 'eq' // 等于
  | 'ne' // 不等于
  | 'gt' // 大于
  | 'gte' // 大于等于
  | 'lt' // 小于
  | 'lte' // 小于等于
  | 'in' // 在数组中
  | 'nin' // 不在数组中
  | 'contains' // 包含
  | 'starts_with' // 以...开始
  | 'ends_with'; // 以...结束

/**
 * 过滤条件
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * 高级查询参数
 */
export interface QueryParams extends PaginationParams {
  filters?: FilterCondition[];
  search?: string;
  search_fields?: string[];
}

/**
 * API错误响应结构
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
  timestamp?: string;
}

/**
 * API成功响应结构
 */
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

/**
 * API分页响应结构
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * API请求配置扩展
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
  skipErrorHandler?: boolean;
}

/**
 * API客户端接口
 */
export interface ApiClient {
  instance: AxiosInstance;
  
  get<T = any>(url: string, config?: ApiRequestConfig): Promise<T>;
  
  post<T = any, D = any>(
    url: string, 
    data?: D, 
    config?: ApiRequestConfig
  ): Promise<T>;
  
  put<T = any, D = any>(
    url: string, 
    data?: D, 
    config?: ApiRequestConfig
  ): Promise<T>;
  
  patch<T = any, D = any>(
    url: string, 
    data?: D, 
    config?: ApiRequestConfig
  ): Promise<T>;
  
  delete<T = any>(url: string, config?: ApiRequestConfig): Promise<T>;
}

/**
 * 请求拦截器
 */
export type RequestInterceptor = (
  config: ApiRequestConfig
) => ApiRequestConfig | Promise<ApiRequestConfig>;

/**
 * 响应拦截器
 */
export type ResponseInterceptor = (
  response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

/**
 * 错误拦截器
 */
export type ErrorInterceptor = (
  error: AxiosError<ApiErrorResponse>
) => Promise<never>;

/**
 * API错误处理器选项
 */
export interface ErrorHandlerOptions {
  showNotification?: boolean;
  redirectToLogin?: boolean;
  logError?: boolean;
} 