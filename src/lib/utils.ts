import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并类名工具函数
 * 结合clsx和tailwind-merge，用于合并多个类名并处理Tailwind CSS类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 