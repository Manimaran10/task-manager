import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import type { Task } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useTaskSocket = () => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Helper function for dashboard updates
  const updateDashboardStats = (
    taskChange: 'created' | 'updated' | 'deleted', 
    task?: Task  // Make task optional for delete case
  ) => {
    // Always invalidate dashboard to get fresh data from API
    queryClient.invalidateQueries({ 
      queryKey: ['dashboard'],
      refetchType: 'active'
    });
    
    // Also do optimistic update for better UX
    if (task && (taskChange === 'created' || taskChange === 'deleted')) {
      queryClient.setQueryData(['dashboard'], (old: any) => {
        if (!old) return old;
        
        const dashboardData = old.data || old;
        const stats = dashboardData.stats || dashboardData;
        let recentTasks = dashboardData.recentTasks || [];
        
        // Simple ID extraction
        const assignedUserId = task.assignedToId && typeof task.assignedToId === 'object' 
          ? task.assignedToId._id 
          : task.assignedToId;
        
        const isAssignedToMe = assignedUserId === user?._id;
        
        let newStats = { ...stats };
        
        if (taskChange === 'created') {
          newStats.totalTasks = (stats.totalTasks || 0) + 1;
          newStats.createdTasks = (stats.createdTasks || 0) + 1;
          if (isAssignedToMe) newStats.assignedTasks = (stats.assignedTasks || 0) + 1;
          recentTasks = [task, ...recentTasks.slice(0, 4)];
        } 
        else if (taskChange === 'deleted') {
          newStats.totalTasks = Math.max(0, (stats.totalTasks || 1) - 1);
          newStats.createdTasks = Math.max(0, (stats.createdTasks || 1) - 1);
          if (isAssignedToMe) newStats.assignedTasks = Math.max(0, (stats.assignedTasks || 1) - 1);
          recentTasks = recentTasks.filter((t: Task) => t._id !== task._id);
        }
        
        // Recalculate completion rate
        const total = newStats.totalTasks || 0;
        const completed = newStats.completedTasks || 0;
        newStats.completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
          ...old,
          data: {
            ...dashboardData,
            stats: newStats,
            recentTasks
          }
        };
      });
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🔌 Setting up socket listeners...');

    // Listen for task created events
    const handleTaskCreated = (task: Task) => {
      console.log('📦 Task created via socket:', task.title);
      updateAllTasksQueries(task, 'add');
      // In useSocket.ts, at the start of each handler:
console.log('🔍 [SOCKET] Raw event data:', task);
console.log('🔍 [SOCKET] Current tasks cache:', queryClient.getQueryData(['tasks']));
console.log('🔍 [SOCKET] Cache structure:', {
  type: typeof queryClient.getQueryData(['tasks']),
  isArray: Array.isArray(queryClient.getQueryData(['tasks'])),
  keys: Object.keys(queryClient.getQueryData(['tasks']) || {})
});
      
      // Update tasks cache optimistically
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old) return { data: [task] };
          if (old.data && Array.isArray(old.data)) {
            return { ...old, data: [task, ...old.data] };
          }
          return old;
        }
      );
      
      // Update dashboard
      updateDashboardStats('created', task);
      
      toast.success(`New task created: "${task.title}"`);
    };

    // Listen for task updated events
    const handleTaskUpdated = (task: Task) => {
      console.log('🔄 Task updated via socket:', task.title);
      
      // Update specific task cache
      queryClient.setQueryData(['task', task._id], task);
      updateAllTasksQueries(task, 'update');
      
      // Update tasks list cache
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old) return old;
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.map((t: Task) => 
                t._id === task._id ? { ...t, ...task } : t
              )
            };
          }
          return old;
        }
      );
      
      // Update dashboard (invalidate to get fresh stats)
      updateDashboardStats('updated', task);
      toast.success(`Task updated: "${task.title}"`);
    };

    // Listen for task deleted events
    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      console.log('🗑️ Task deleted via socket:', taskId);
      
      // Get task from cache before deleting (for dashboard update)
      const task = queryClient.getQueryData<Task>(['task', taskId]);
      
      // Remove task from cache
      queryClient.removeQueries({ queryKey: ['task', taskId] });

      updateAllTasksQueries({} as Task, 'remove', taskId);
      
      // Update tasks list
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old) return old;
          if (old.data && Array.isArray(old.data)) {
            return {
              ...old,
              data: old.data.filter((t: Task) => t._id !== taskId)
            };
          }
          return old;
        }
      );
      
      // Update dashboard
      updateDashboardStats('deleted', task);
      toast.success('Task deleted');
    };

    // Listen for task assigned events
    const handleTaskAssigned = ({ task, assignedBy }: { task: Task; assignedBy: string }) => {
      console.log('👤 Task assigned via socket:', task.title);
      
      toast.success(`🎯 You've been assigned: "${task.title}" by ${assignedBy}`, {
        duration: 5000,
      });
      
      // Update both queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      updateDashboardStats('updated'); // Just invalidate for fresh data
    };

    // Set up listeners
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:assigned', handleTaskAssigned);

    console.log('✅ Socket listeners set up');

// In useSocket.ts, replace setQueriesData with:
const updateAllTasksQueries = (task: Task, action: 'add' | 'update' | 'remove', taskId?: string) => {
  // Get ALL query keys that start with 'tasks'
  const queryCache = queryClient.getQueryCache();
  const allTaskQueries = queryCache.findAll({ queryKey: ['tasks'] });
  
  console.log('🔍 Found task queries:', allTaskQueries.length);
  
  // Update EACH query cache
  allTaskQueries.forEach((query) => {
    queryClient.setQueryData(query.queryKey, (old: any) => {
      console.log('🔍 Updating query:', query.queryKey, 'with action:', action);
      
      if (!old) return old;
      
      // Handle array data (your current structure)
      if (Array.isArray(old)) {
        if (action === 'add') return [task, ...old];
        if (action === 'update') return old.map((t: Task) => t._id === task._id ? { ...t, ...task } : t);
        if (action === 'remove') return old.filter((t: Task) => t._id !== taskId);
      }
      
      // Handle { data: Task[] } structure
      if (old.data && Array.isArray(old.data)) {
        if (action === 'add') return { ...old, data: [task, ...old.data] };
        if (action === 'update') return {
          ...old,
          data: old.data.map((t: Task) => t._id === task._id ? { ...t, ...task } : t)
        };
        if (action === 'remove') return { 
          ...old, 
          data: old.data.filter((t: Task) => t._id !== taskId) 
        };
      }
      
      return old;
    });
  });
};

// Use this in all socket handlers instead

    return () => {
      console.log('🔌 Cleaning up socket listeners');
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:assigned', handleTaskAssigned);
    };
  }, [socket, isConnected, queryClient, user]); // Add user to dependencies
};