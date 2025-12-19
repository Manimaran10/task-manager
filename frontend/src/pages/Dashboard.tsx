import React from 'react';
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  // Mock data for now - we'll replace with real API calls later
  const stats = [
    { label: 'Total Tasks', value: '42', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Assigned to Me', value: '12', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Created by Me', value: '8', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Overdue', value: '3', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { label: 'In Progress', value: '7', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Completion Rate', value: '75%', icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  ];

  const recentTasks = [
    { id: 1, title: 'Design System Update', priority: 'high', status: 'in_progress', dueDate: 'Today' },
    { id: 2, title: 'API Documentation', priority: 'medium', status: 'todo', dueDate: 'Tomorrow' },
    { id: 3, title: 'User Feedback Review', priority: 'low', status: 'completed', dueDate: 'Yesterday' },
    { id: 4, title: 'Database Migration', priority: 'urgent', status: 'review', dueDate: 'Today' },
  ];

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your tasks.</p>
        </div>
        <Button variant="primary">
          + New Task
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
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Users className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All Tasks
                </Button>
              </div>
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
                    <p className="font-medium text-red-800">Design Review</p>
                    <p className="text-sm text-red-600">Today, 3:00 PM</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">Team Sync</p>
                    <p className="text-sm text-blue-600">Tomorrow, 10:00 AM</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;