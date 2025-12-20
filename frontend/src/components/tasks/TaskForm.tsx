import React,{ useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, User, Flag, FileText, Search, ChevronDown} from 'lucide-react';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import { useUsers } from '../../hooks/useUsers';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Task } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignedToId: z.string().min(1, 'Assignee is required'),
  status: z.enum(['todo', 'in_progress', 'review', 'completed']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: any;  // Temporary - use proper Task type later
  onSuccess?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess }) => {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: users = [], isLoading: isLoadingUsers } = useUsers();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ _id: string; name: string; email: string } | null>(
    task?.assignedToId ? { 
      _id: task.assignedToId._id, 
      name: task.assignedToId.name, 
      email: task.assignedToId.email 
    } : null
  );
  
  const {
    register,
    handleSubmit,
    setValue,
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
      status: 'todo',
    },
  });
    // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const handleUserSelect = (user: { _id: string; name: string; email: string }) => {
    setSelectedUser(user);
    setValue('assignedToId', user._id, { shouldValidate: true });
    setShowUserDropdown(false);
    setUserSearch('');
  };
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
          
      {/* Assign To - Updated with Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To
        </label>
        
        {/* Selected User Display */}
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer flex items-center justify-between hover:border-gray-400"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
        >
          {selectedUser ? (
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="font-medium">{selectedUser.name}</span>
              <span className="text-gray-500 ml-2">({selectedUser.email})</span>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <User className="h-4 w-4 mr-2" />
              Select a user...
            </div>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
        </div>

        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register('assignedToId')}
        />
        {errors.assignedToId && (
          <p className="mt-1 text-sm text-red-600">{errors.assignedToId.message}</p>
        )}

        {/* User Dropdown */}
        {showUserDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Search Input */}
            <div className="sticky top-0 bg-white p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Users List */}
            <div className="py-1">
              {isLoadingUsers ? (
                <div className="px-3 py-2 text-gray-500">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-gray-500">No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    {selectedUser?._id === user._id && (
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
            {/* Status Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          {...register('status')}
          defaultValue="todo"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
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