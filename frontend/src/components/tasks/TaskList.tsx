import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Flag, 
  MoreVertical, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTasks, useDeleteTask } from '../../hooks/useTasks';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { Task } from '../../types';

const TaskList: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const { data, isLoading, error } = useTasks();
  const deleteMutation = useDeleteTask();

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    todo: <AlertCircle className="h-4 w-4 text-gray-500" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500" />,
    review: <Flag className="h-4 w-4 text-purple-500" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load tasks
        </h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Card>
    );
  }

  const tasks = data?.data?.tasks || [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Tasks
        </Button>
        <Button
          variant={filter === 'todo' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('todo')}
        >
          To Do
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('in_progress')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first task to get started
          </p>
          <Button variant="primary">Create Task</Button>
        </Card>
      ) : (
        tasks.map((task: Task) => (
          <Card key={task._id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcons[task.status]}
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.isOverdue && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Assigned to: {task.assignedToId.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Created by: {task.creatorId.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Edit action */}}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate(task._id)}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default TaskList;