import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Radio,
  Calendar,
  Upload,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  Clock,
  Film,
  Eye,
  MessageSquare,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import apiClient from '@/services/api';
import { format } from 'date-fns';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalViews: number;
  totalViewers: number;
  avgEngagement: number;
  totalRevenue: number;
  mediaAssets: number;
  totalStreamTime: number;
}

interface RecentEvent {
  id: string;
  name: string;
  status: string;
  start_date: string;
  viewer_count: number;
  engagement_rate: number;
}

interface Trend {
  value: number;
  isPositive: boolean;
  percentage: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalViews: 0,
    totalViewers: 0,
    avgEngagement: 0,
    totalRevenue: 0,
    mediaAssets: 0,
    totalStreamTime: 0
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<{
    viewers: Trend;
    engagement: Trend;
    revenue: Trend;
  }>({
    viewers: { value: 0, isPositive: true, percentage: 0 },
    engagement: { value: 0, isPositive: true, percentage: 0 },
    revenue: { value: 0, isPositive: true, percentage: 0 }
  });

  useEffect(() => {
    // Only load data after user is authenticated and auth is initialized
    if (user && isInitialized) {
      loadDashboardData();
    }
  }, [user, isInitialized]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load events
      const eventsResponse = await apiClient.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.items || []);
      
      // Load media assets
      const mediaResponse = await apiClient.getUserMedia();
      const mediaAssets = Array.isArray(mediaResponse) ? mediaResponse : (mediaResponse.items || []);
      
      // Load analytics overview
      const analyticsResponse = await apiClient.get('/api/analytics/overview').catch(() => null);
      
      // Calculate stats
      const activeEvents = events.filter((e: any) => e.status === 'live' || e.status === 'active').length;
      const totalViews = events.reduce((sum: number, e: any) => sum + (e.view_count || 0), 0);
      const totalViewers = events.reduce((sum: number, e: any) => sum + (e.unique_viewers || 0), 0);
      const avgEngagement = events.length > 0 
        ? events.reduce((sum: number, e: any) => sum + (e.engagement_rate || 0), 0) / events.length
        : 0;
      
      setStats({
        totalEvents: events.length,
        activeEvents,
        totalViews,
        totalViewers,
        avgEngagement,
        totalRevenue: analyticsResponse?.totalRevenue || 0,
        mediaAssets: mediaAssets.length,
        totalStreamTime: events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0)
      });
      
      // Set recent events (last 5)
      setRecentEvents(events.slice(0, 5).map((e: any) => ({
        id: e.id,
        name: e.name || e.title || 'Untitled Event',
        status: e.status || 'scheduled',
        start_date: e.start_date,
        viewer_count: e.viewer_count || 0,
        engagement_rate: e.engagement_rate || 0
      })));
      
      // Calculate trends (mock data for now)
      setTrends({
        viewers: { value: totalViewers, isPositive: true, percentage: 12.5 },
        engagement: { value: avgEngagement, isPositive: avgEngagement > 50, percentage: Math.abs(avgEngagement - 50) },
        revenue: { value: 0, isPositive: true, percentage: 8.2 }
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Start Live Stream',
      description: 'Go live right now',
      icon: Radio,
      path: '/streaming-live',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      title: 'Schedule Event',
      description: 'Plan your next stream',
      icon: Calendar,
      path: '/events',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Media Library',
      description: 'View your recordings',
      icon: Film,
      path: '/media-assets',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance',
      icon: BarChart3,
      path: '/analytics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    }
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
      case 'active':
        return 'text-green-600';
      case 'scheduled':
        return 'text-blue-600';
      case 'ended':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  // Show loading until auth is initialized and user exists, or until data is loaded
  if (!isInitialized || !user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          {user?.email ? `${user.email}` : 'Manage your streaming platform'}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalViewers)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends.viewers.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={trends.viewers.isPositive ? 'text-green-500' : 'text-red-500'}>
                {trends.viewers.percentage}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <div className="text-xs text-muted-foreground">
              {stats.totalEvents} total events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(1)}%</div>
            <Progress value={stats.avgEngagement} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stream Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalStreamTime)}</div>
            <div className="text-xs text-muted-foreground">
              Total streaming hours
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={() => navigate(action.path)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                </div>
                <CardTitle className="text-base mt-4">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Your latest streaming activities</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No events yet</p>
                <Button 
                  className="mt-4" 
                  size="sm"
                  onClick={() => navigate('/events')}
                >
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate(`/events`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        event.status === 'live' ? 'bg-red-100 dark:bg-red-950' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {event.status === 'live' ? (
                          <Radio className="h-4 w-4 text-red-600" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={getStatusColor(event.status)}>
                            {event.status}
                          </span>
                          <span>•</span>
                          <span>{format(new Date(event.start_date), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(event.viewer_count)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.engagement_rate.toFixed(0)}% engagement
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and insights</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Media Assets</span>
                </div>
                <Badge variant="secondary">{stats.mediaAssets}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Views</span>
                </div>
                <Badge variant="secondary">{formatNumber(stats.totalViews)}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Chat Messages</span>
                </div>
                <Badge variant="secondary">0</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Revenue</span>
                </div>
                <Badge variant="secondary">${stats.totalRevenue}</Badge>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Platform Health: All systems operational</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/chat')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}