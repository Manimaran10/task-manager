import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import type { Task } from '../types';

export const useTaskSocket = () => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('Setting up socket listeners...');

    // Listen for task created events
    const handleTaskCreated = (task: Task) => {
      console.log('📦 Task created via socket:', task.title);
      
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast.success(`New task created: "${task.title}"`);
    };

    // Listen for task updated events
    const handleTaskUpdated = (task: Task) => {
      console.log('🔄 Task updated via socket:', task.title);
      
      // Update specific task cache
      queryClient.setQueryData(['task', task._id], task);
      
      // Update tasks list cache optimistically
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((t: Task) => 
              t._id === task._id ? { ...t, ...task } : t
            ),
          };
        }
      );
      
      // Update dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast.success(`Task updated: "${task.title}"`);
    };

    // Listen for task deleted events
    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      console.log('🗑️ Task deleted via socket:', taskId);
      
      // Remove task from cache
      queryClient.removeQueries({ queryKey: ['task', taskId] });
      
      // Update tasks list
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((t: Task) => t._id !== taskId),
          };
        }
      );
      
      // Update dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast.success('Task deleted');
    };

    // Listen for task assigned events (personal notification)
    const handleTaskAssigned = ({ task, assignedBy }: { task: Task; assignedBy: string }) => {
      console.log('👤 Task assigned via socket:', task.title);
      
      toast.success(`🎯 You've been assigned: "${task.title}" by ${assignedBy}`, {
        duration: 5000,
      });
      
      // Update queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    // Set up listeners
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:assigned', handleTaskAssigned);

    console.log('✅ Socket listeners set up');

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:assigned', handleTaskAssigned);
    };
  }, [socket, isConnected, queryClient]);
};