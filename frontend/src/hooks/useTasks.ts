import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';
import toast from 'react-hot-toast';

export const useTasks = (params?: {
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.getTasks(params),
    retry: 1,
    retryOnMount: false,
    select: (response) => {
      if (Array.isArray(response)) return response;
      if (response?.data?.tasks) return response.data.tasks;
      if (response?.data) return response.data;
      // if (response?.tasks) return response.tasks;
      return [];
    }
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tasksApi.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] }); 
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); 
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn:()=> tasksApi.getDashboard(),
    retry: 1,
    select: (response) => response.data
  });
};