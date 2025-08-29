import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Radio,
  Calendar,
  BarChart3,
  Upload,
  Users,
  Settings,
  PlayCircle,
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  action: string;
}

export default function DashboardMinimal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const primaryActions: QuickAction[] = [
    {
      title: 'Start Live Stream',
      description: 'Go live right now',
      icon: Radio,
      path: '/streaming/live',
      color: 'bg-red-500',
      action: 'Stream Now'
    },
    {
      title: 'Schedule Event',
      description: 'Plan your next stream',
      icon: Calendar,
      path: '/events',
      color: 'bg-blue-500',
      action: 'Create Event'
    },
    {
      title: 'Upload Video',
      description: 'Add to your library',
      icon: Upload,
      path: '/media-assets',
      color: 'bg-green-500',
      action: 'Upload'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-purple-500',
      action: 'View Stats'
    }
  ];

  const stats = [
    { label: 'Total Streams', value: '0', icon: PlayCircle, trend: null },
    { label: 'Total Views', value: '0', icon: Users, trend: null },
    { label: 'Avg Duration', value: '0m', icon: Clock, trend: null },
    { label: 'This Month', value: '0', icon: TrendingUp, trend: null }
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your streams today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                  {stat.trend && (
                    <span className={`text-xs ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {loading ? '—' : stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="group p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all text-left bg-white dark:bg-gray-950"
                >
                  <div className={`inline-flex p-3 rounded-lg ${action.color} bg-opacity-10 mb-4`}>
                    <Icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {action.description}
                  </p>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                    {action.action} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center bg-white dark:bg-gray-950">
            <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Start streaming to see your activity here
            </p>
            <Button
              onClick={() => navigate('/streaming/live')}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              <Plus className="mr-2 h-4 w-4" />
              Start Your First Stream
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}