// API模块入口文件

// 导出API客户端
export * from './client/apiClient';
export * from './client/types';
export * from './client/errorHandler';

// 导出API常量
export * from './constants';

// 导出模型和服务
// 使用命名导出避免冲突
export { authService } from './services/authService';
export { userService } from './services/userService';
export { propertyService } from './services/propertyService';
export { bookingService } from './services/bookingService';
export { leaseService } from './services/leaseService';
export { paymentService } from './services/paymentService';
export { maintenanceService } from './services/maintenanceService';
export { messageService } from './services/messageService';
export { notificationService } from './services/notificationService';

// 默认导出API客户端实例
import { apiClient } from './client/apiClient';
export default apiClient; 