import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar, 
  Flag, 
  Settings,
  FolderPlus,
  BarChart3
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-700 hover:bg-gray-50'
        }
      `}
    >
      <div className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/' },
    { icon: <CheckSquare size={20} />, label: 'All Tasks', to: '/tasks', badge: 12 },
    { icon: <FolderPlus size={20} />, label: 'My Tasks', to: '/tasks/assigned', badge: 5 },
    { icon: <Calendar size={20} />, label: 'Created', to: '/tasks/created' },
    { icon: <Flag size={20} />, label: 'Overdue', to: '/tasks/overdue', badge: 3 },
    { icon: <Users size={20} />, label: 'Team', to: '/team' },
    { icon: <BarChart3 size={20} />, label: 'Reports', to: '/reports' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
    transform transition-transform duration-200 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:relative md:translate-x-0
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo */}
      <div className="h-16 border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 mt-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-gray-900">42</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-gray-900">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          to="/settings"
        />
      </div>
    </aside>
  );
};

export default Sidebar;