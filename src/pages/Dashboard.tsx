import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Radio,
  Calendar,
  Video,
  Settings,
  ArrowRight,
  Plus,
  Clock,
  Users,
  Eye,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Quick action cards data
  const primaryActions = [
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
      icon: Video,
      path: '/vod-library',
      color: 'bg-green-500',
      action: 'Upload'
    },
    {
      title: 'View Analytics',
      description: 'Track performance',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-purple-500',
      action: 'View Stats'
    }
  ];

  const recentStreams = [
    // This will be populated from API
  ];

  return (
    <div className="min-h-screen">
      {/* Minimal Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          {user?.given_name ? `Welcome back, ${user.given_name}` : 'Dashboard'}
        </h1>
      </div>

      {/* Main Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-left transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex rounded-lg p-3 ${action.color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {action.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                      {action.action}
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Streams
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/events')}
            >
              View All
            </Button>
          </div>

          {recentStreams.length > 0 ? (
            <div className="grid gap-4">
              {/* Stream cards will go here */}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Recent Streams
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start your first stream to see activity here
              </p>
              <Button
                onClick={() => navigate('/streaming/live')}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                <Radio className="mr-2 h-4 w-4" />
                Start Your First Stream
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Streams</p>
              </div>
              <Radio className="h-8 w-8 text-gray-300 dark:text-gray-700" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Views</p>
              </div>
              <Eye className="h-8 w-8 text-gray-300 dark:text-gray-700" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Viewers</p>
              </div>
              <Users className="h-8 w-8 text-gray-300 dark:text-gray-700" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0h</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Stream Time</p>
              </div>
              <Clock className="h-8 w-8 text-gray-300 dark:text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}