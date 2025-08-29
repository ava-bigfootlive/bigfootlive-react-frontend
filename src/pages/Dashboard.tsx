import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Radio,
  Users, 
  PlayCircle, 
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Clock,
  Video,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';
import api from '../services/api';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStreams, setActiveStreams] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Simulated data loading
    setTimeout(() => {
      setActiveStreams(3);
      setViewerCount(1847);
      setLoading(false);
    }, 500);
  }, []);

  const quickStats: QuickStat[] = [
    { label: 'Live Now', value: activeStreams, trend: 'up' },
    { label: 'Viewers', value: viewerCount.toLocaleString(), change: '+12%', trend: 'up' },
    { label: 'Today', value: '7 events' },
    { label: 'Revenue', value: '$2,847', change: '+8%', trend: 'up' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Minimal Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome back{user?.given_name ? `, ${user.given_name}` : ''}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your streams today
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Hero Card - Go Live */}
        <Card className="md:col-span-2 lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              onClick={() => navigate('/streaming/live')}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center">
                    <Radio className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Live</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Start Streaming
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Go live instantly with professional streaming tools
                </p>
                <div className="inline-flex items-center text-sm font-medium text-gray-900 dark:text-white group-hover:gap-2 transition-all">
                  Go Live Now
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {quickStats.slice(0, 2).map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '—' : stat.value}
              </p>
              {stat.change && (
                <p className={cn(
                  "text-xs mt-2",
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {stat.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Analytics Preview */}
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate('/analytics')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Analytics</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Watch Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">64h 23m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Peak Viewers</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">562</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Engagement</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">74%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Upcoming</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                      onClick={() => navigate('/events')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 group cursor-pointer"
                 onClick={() => navigate('/events')}>
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Product Launch
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Today, 2:00 PM • 247 registered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer"
                 onClick={() => navigate('/events')}>
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Team Meeting
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Today, 4:00 PM • Internal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <Card className="md:col-span-2 lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => navigate('/events/new')}>
                <Calendar className="h-5 w-5 mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium">Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => navigate('/vod-library')}>
                <Video className="h-5 w-5 mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium">Library</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => navigate('/analytics')}>
                <BarChart3 className="h-5 w-5 mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium">Analytics</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                      onClick={() => navigate('/settings')}>
                <Zap className="h-5 w-5 mb-2 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Performance</CardTitle>
              <span className="text-xs text-gray-500">Last 7 days</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Stream Health</span>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Excellent</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-green-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Viewer Retention</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">74%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full w-[74%] bg-blue-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">68%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-indigo-500 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Minimal */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Stream started: Marketing Webinar
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">30 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    New subscriber joined Premium
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Event scheduled for tomorrow
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}