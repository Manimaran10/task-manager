import { api } from './client';
import type { ApiResponse, Task, DashboardStats } from '../types';

export const tasksApi = {
  // Task CRUD
  getTasks: async (params?: {
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; total: number }>>('/tasks', { params });
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    assignedToId: string;
  }) => {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedToId: string;
  }>) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/tasks/${id}`);
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>('/tasks/dashboard');
    return response.data;
  },

  getAssignedTasks: async () => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; total: number }>>('/tasks/assigned');
    return response.data;
  },

  getCreatedTasks: async () => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; total: number }>>('/tasks/created');
    return response.data;
  },

  getOverdueTasks: async () => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; total: number }>>('/tasks/overdue');
    return response.data;
  },
};

export default tasksApi;