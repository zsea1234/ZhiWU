/**
 * 维修请求状态类型
 */
export type MaintenanceStatus = 'pending' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

/**
 * 维修请求优先级
 */
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';

/**
 * 维修请求类型
 */
export type MaintenanceType = 
  | 'plumbing' 
  | 'electrical' 
  | 'hvac' 
  | 'appliance' 
  | 'structural' 
  | 'pest_control' 
  | 'cleaning' 
  | 'other';

/**
 * 维修请求模型
 */
export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  title: string;
  description: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images?: string[]; // 图片URL数组
  scheduled_date?: string;
  completed_date?: string;
  tenant_rating?: number; // 1-5
  tenant_feedback?: string;
  cost?: number;
  created_at: string;
  updated_at: string;
}

/**
 * 维修请求创建输入
 */
export interface MaintenanceRequestCreateInput {
  property_id: string;
  title: string;
  description: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  images?: string[];
}

/**
 * 维修请求更新输入
 */
export interface MaintenanceRequestUpdateInput {
  title?: string;
  description?: string;
  type?: MaintenanceType;
  priority?: MaintenancePriority;
  images?: string[];
}

/**
 * 维修请求状态更新输入
 */
export interface MaintenanceStatusUpdateInput {
  status: MaintenanceStatus;
  scheduled_date?: string;
  completed_date?: string;
  cost?: number;
  notes?: string;
}

/**
 * 维修反馈输入
 */
export interface MaintenanceFeedbackInput {
  rating: number; // 1-5
  feedback: string;
} 