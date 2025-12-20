import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTasks, useDeleteTask } from '../../hooks/useTasks';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { Task } from '../../types';

const SimpleTaskList: React.FC = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(true);
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    priority: undefined as string | undefined,
    sortBy: 'dueDate' as string | undefined,
    sortOrder: 'asc' as 'asc' | 'desc' | undefined,
  });
  
  const { data: tasksData, isLoading, error, refetch } = useTasks(filters);
  const deleteMutation = useDeleteTask();

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  };
  //Handle loading and undefined data
  if (isLoading || tasksData === undefined) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load tasks
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  //Handle array data directly
  const tasks = Array.isArray(tasksData) ? tasksData : [];

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = async () => {
    if (deletingTask) {
      await deleteMutation.mutateAsync(deletingTask._id);
      setDeletingTask(null);
    }
  };

  const getFilterInfo = () => {
    const parts = [];
    if (filters.status) parts.push(`Status: ${filters.status}`);
    if (filters.priority) parts.push(`Priority: ${filters.priority}`);
    if (filters.sortBy !== 'dueDate') parts.push(`Sorted by: ${filters.sortBy}`);
    if (filters.sortOrder !== 'asc') parts.push(`Order: ${filters.sortOrder}`);
    
    return parts.length > 0 ? ` (${parts.join(', ')})` : '';
  };

  return (
    <>
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      {/* ALL TASKS SECTION */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Tasks ({tasks.length})</h2>
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showAllTasks ? 'Hide' : 'Show'} Tasks
            {showAllTasks ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>

        {showAllTasks && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600">Create your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div
                    key={task._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Edit task"
                            >
                              <Pencil className="h-4 w-4 text-gray-600" />
                            </button>
                            
                            <button
                              onClick={() => handleDelete(task)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {task.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        {/* Task Details */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : task.status === 'review'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status?.replace('_', ' ') || 'todo'}
                          </span>
                          
                          <span className="text-gray-500">
                            📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          
                          {task.assignedToId?.name && (
                            <span className="text-gray-500">
                              👤 {task.assignedToId.name}
                            </span>
                          )}
                          
                          {task.creatorId?.name && task.creatorId.name !== task.assignedToId?.name && (
                            <span className="text-gray-500">
                              👨‍💼 Created by: {task.creatorId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSuccess={() => setEditingTask(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>"{deletingTask?.title}"</strong>?
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeletingTask(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SimpleTaskList;