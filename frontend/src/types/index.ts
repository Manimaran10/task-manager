// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Task Priority - Using union types instead of enum
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task Status - Using union types instead of enum
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

// Task
export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: User;
  assignedToId: User;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification
export type NotificationType = 'task_assigned' | 'task_updated' | 'task_overdue';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

// Authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// API Response
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Dashboard
export interface DashboardStats {
  assignedTasks: number;
  createdTasks: number;
  overdueTasks: number;
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionRate: number;
  recentTasks: Task[];
}