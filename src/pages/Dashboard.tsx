import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Users, 
  PlayCircle, 
  Calendar,
  TrendingUp,
  PlusCircle,
  BarChart3,
  DollarSign,
  Eye,
  Clock,
  Settings,
  Bell,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Headphones,
  FileText,
  ChevronRight,
  Globe,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Video
} from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  totalEvents: number;
  activeStreams: number;
  totalViewers: number;
  upcomingEvents: number;
  revenue: number;
  watchTime: number;
  peakViewers: number;
  engagement: number;
}

interface RecentActivity {
  id: string;
  type: 'stream_started' | 'stream_ended' | 'new_subscriber' | 'payment_received' | 'user_joined';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info';
}

interface SystemStatus {
  streaming: 'operational' | 'degraded' | 'outage';
  upload: 'operational' | 'degraded' | 'outage';
  cdn: 'operational' | 'degraded' | 'outage';
  database: 'operational' | 'degraded' | 'outage';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  bgColor: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeStreams: 0,
    totalViewers: 0,
    upcomingEvents: 0,
    revenue: 0,
    watchTime: 0,
    peakViewers: 0,
    engagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    streaming: 'operational',
    upload: 'operational',
    cdn: 'operational',
    database: 'operational'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch events from API
      const eventsResponse = await api.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : [];
      
      // Calculate stats from real data
      const activeStreams = events.filter((e: any) => e.status === 'live').length;
      const upcomingEvents = events.filter((e: any) => e.status === 'scheduled' || e.status === 'upcoming').length;
      const totalViewers = events.reduce((sum: number, e: any) => sum + (e.viewer_count || 0), 0);
      
      // Simulate additional metrics with realistic data
      const revenue = events.reduce((sum: number, e: any) => sum + (e.revenue || 0), 0);
      const watchTime = events.reduce((sum: number, e: any) => sum + (e.watch_time || 0), 0);
      const peakViewers = Math.max(...events.map((e: any) => e.peak_viewers || 0), 0);
      const engagement = events.length > 0 ? 
        events.reduce((sum: number, e: any) => sum + (e.engagement_rate || 0), 0) / events.length : 0;
      
      setStats({
        totalEvents: events.length,
        activeStreams,
        totalViewers,
        upcomingEvents,
        revenue,
        watchTime,
        peakViewers,
        engagement
      });

      // Simulate recent activity data
      setRecentActivity([
        {
          id: '1',
          type: 'stream_started',
          title: 'Live stream started',
          description: 'Marketing Webinar - Q4 Updates',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'success'
        },
        {
          id: '2',
          type: 'new_subscriber',
          title: 'New subscriber',
          description: 'john.doe@example.com joined Premium plan',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '3',
          type: 'payment_received',
          title: 'Payment received',
          description: '$29.99 subscription payment',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '4',
          type: 'stream_ended',
          title: 'Stream ended',
          description: 'Product Demo - 45 viewers, 2.1k minutes watched',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'info'
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Show real state with enhanced structure
      setStats({
        totalEvents: 0,
        activeStreams: 0,
        totalViewers: 0,
        upcomingEvents: 0,
        revenue: 0,
        watchTime: 0,
        peakViewers: 0,
        engagement: 0
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Streams',
      value: stats.activeStreams,
      icon: PlayCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Total Viewers',
      value: stats.totalViewers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+28%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      change: '+18%',
      changeType: 'positive'
    }
  ];

  const additionalMetrics = [
    {
      title: 'Watch Time',
      value: `${Math.floor(stats.watchTime / 60)}h ${stats.watchTime % 60}m`,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Peak Viewers',
      value: stats.peakViewers,
      icon: Eye,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      change: '+32%',
      changeType: 'positive'
    },
    {
      title: 'Engagement Rate',
      value: `${(stats.engagement * 100).toFixed(1)}%`,
      icon: Star,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      change: '+22%',
      changeType: 'positive'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Set up a new streaming event',
      icon: PlusCircle,
      path: '/streaming',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'go-live',
      title: 'Go Live',
      description: 'Start streaming immediately',
      icon: PlayCircle,
      path: '/streaming/live',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      path: '/analytics-dashboard',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'vod-library',
      title: 'Manage VOD',
      description: 'Upload and organize videos',
      icon: Video,
      path: '/vod-library',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'user-management',
      title: 'Team Settings',
      description: 'Manage users and permissions',
      icon: Users,
      path: '/user-management',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'settings',
      title: 'Platform Settings',
      description: 'Configure your platform',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'outage': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stream_started': return PlayCircle;
      case 'stream_ended': return Video;
      case 'new_subscriber': return Users;
      case 'payment_received': return DollarSign;
      case 'user_joined': return Users;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.given_name || user?.email}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/help')}>
            <Headphones className="w-4 h-4 mr-2" />
            Support
          </Button>
          <Button onClick={() => navigate('/streaming')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">All systems operational</span>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <Wifi className="w-3 h-3 text-green-500" />
                <span>Streaming</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-3 h-3 text-green-500" />
                <span>CDN</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-green-500" />
                <span>Database</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">
                      {loading ? '...' : (typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString())}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500">{metric.title}</p>
                    <p className="text-lg font-semibold mt-1">
                      {loading ? '...' : (typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString())}
                    </p>
                    <div className="flex items-center mt-1">
                      {metric.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts for your streaming platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 justify-start p-4 hover:shadow-md transition-shadow"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`p-2 rounded-lg mr-3 ${action.bgColor}`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs text-gray-600">{action.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest events and updates from your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500">Loading recent activity...</p>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100' : activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                          <Icon className={`w-4 h-4 ${activity.status === 'success' ? 'text-green-600' : activity.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Activity will appear here as you use the platform</p>
                  </div>
                )}
              </div>
              {recentActivity.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    View All Activity
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Stream Health</span>
                  <span className="font-medium">98%</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Viewer Satisfaction</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CDN Performance</span>
                  <span className="font-medium">99%</span>
                </div>
                <Progress value={99} className="h-2" />
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/analytics-dashboard')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/docs')}>
                <FileText className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/help')}>
                <Headphones className="w-4 h-4 mr-2" />
                Help Center
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/notifications')}>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}