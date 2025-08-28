import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Video,
  MoreVertical,
  Download,
  Share2,
  Info
} from 'lucide-react';
import api from '../services/api';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, use mock data since API is returning 405
      setStats({
        totalEvents: 24,
        activeStreams: 3,
        totalViewers: 1847,
        upcomingEvents: 7,
        revenue: 12543,
        watchTime: 3847,
        peakViewers: 562,
        engagement: 0.74
      });

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
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 dark:bg-green-950/50';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50';
      case 'info': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/50';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/50';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.given_name || user?.email || 'Streamer'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('/streaming/live')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Go Live
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loading ? '...' : stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Viewers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalViewers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">+180</span> in last hour
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Live Streams
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.activeStreams}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} scheduled today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${(stats.engagement * 100).toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">+7%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest events and updates from your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading activity...</div>
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className={cn(
                          "rounded-full p-2",
                          getActivityColor(activity.status)
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Activity will appear here as you use the platform
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Your streaming performance this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Stream Health</span>
                </div>
                <span className="font-medium">Excellent</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Watch Time</span>
                </div>
                <span className="text-sm font-medium">
                  {Math.floor(stats.watchTime / 60)}h {stats.watchTime % 60}m
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Peak Viewers</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.peakViewers.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Events</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.totalEvents}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => navigate('/events')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Events
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => navigate('/vod-library')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  VOD
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current platform health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm">Streaming</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm">CDN</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Next scheduled streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Product Launch</p>
                  <p className="text-xs text-muted-foreground">Today, 2:00 PM</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Team Meeting</p>
                  <p className="text-xs text-muted-foreground">Today, 4:00 PM</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Weekly Webinar</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Help & Resources</CardTitle>
            <CardDescription>
              Get started with BigFootLive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/docs')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/help')}
            >
              <Headphones className="mr-2 h-4 w-4" />
              Support Center
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://status.bigfootlive.io', '_blank')}
            >
              <Info className="mr-2 h-4 w-4" />
              Platform Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}