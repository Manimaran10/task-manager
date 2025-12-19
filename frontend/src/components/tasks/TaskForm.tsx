import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, User, Flag, FileText } from 'lucide-react';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Task } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedToId: z.string().min(1, 'Assignee is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: any;  // Temporary - use proper Task type later
  onSuccess?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess }) => {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      assignedToId: task.assignedToId._id,
    } : {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) {
        await updateMutation.mutateAsync({ id: task._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="Task Title"
          placeholder="Enter task title"
          icon={<FileText className="h-4 w-4" />}
          error={errors.title?.message}
          {...register('title')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          rows={4}
          placeholder="Describe the task..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Due Date"
            type="date"
            icon={<Calendar className="h-4 w-4" />}
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            {...register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      <div>
        <Input
          label="Assign To (User ID)"
          placeholder="Enter user ID"
          icon={<User className="h-4 w-4" />}
          error={errors.assignedToId?.message}
          {...register('assignedToId')}
        />
        <p className="mt-1 text-xs text-gray-500">
          For now, enter a user ID. We'll add user search later.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;