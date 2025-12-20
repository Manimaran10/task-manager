import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';
import { useDashboard } from '../hooks/useTasks'; // Add this import
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
// import TaskList from '../components/tasks/TaskList';
import SimpleTaskList from '../components/tasks/SimpleTaskList';
import TaskForm from '../components/tasks/TaskForm'; // Add this import
import Modal from '../components/ui/Modal'; // Add this import

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Add state for modal

  
  
  // Use the real API hook - it will return data, isLoading, error
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useDashboard()
  
  console.log('Type of dashboardData:', typeof dashboardData);
  console.log('dashboardData value:', dashboardData);
  console.log('dasboarderror:', dashboardError);
  
  console.log('dashboardData keys:', dashboardData ? Object.keys(dashboardData) : 'No data');
  const stats = [
    { 
      label: 'Total Tasks', 
      value: dashboardData?.totalTasks?.toString() || '0', 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50' 
    },
    { 
      label: 'Assigned to Me', 
      value: dashboardData?.assignedTasks?.toString() || '0', 
      icon: Users, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Created by Me', 
      value: dashboardData?.createdTasks?.toString() || '0', 
      icon: Calendar, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50' 
    },
    { 
      label: 'Overdue', 
      value: dashboardData?.overdueTasks?.toString() || '0', 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50' 
    },
    { 
      label: 'In Progress', 
      value: dashboardData?.inProgressTasks?.toString() || '0',
      icon: Clock, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50' 
    },
    { 
      label: 'Completion Rate', 
      value: `${dashboardData?.completionRate || 0}%`,
      icon: TrendingUp, 
      color: 'text-teal-600', 
      bgColor: 'bg-teal-50' 
    },
  ];

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
  };
  // Loading state
  if (isLoadingDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="sm">
              <CardContent className="flex items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="ml-4">
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
        </div>
        <Button 
        variant="primary"
        onClick={() => setIsCreateModalOpen(true)}
        >
        <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            
            <Card key={stat.label} padding="sm">
              <CardContent className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <SimpleTaskList />
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            </CardHeader>
            {/* <CardContent>
              <SimpleTaskList /> 
            </CardContent> */}
            <CardContent>
  {dashboardData?.recentTasks && dashboardData.recentTasks.length > 0 ? (
    <div className="space-y-3">
      {dashboardData.recentTasks.map((task) => (
        <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">No recent tasks</p>
  )}
</CardContent>
          </Card>
        </div>

        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" fullWidth>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" fullWidth>
                <Users className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
              <Button variant="outline" fullWidth>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button 
        variant="primary"
        onClick={() => setIsCreateModalOpen(true)}
        >
        <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">No urgent deadlines</p>
                    <p className="text-sm text-red-600">All tasks are on track</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;