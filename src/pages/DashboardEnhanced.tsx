import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AreaChartGradient } from '../components/Charts/AreaChartGradient';
import { 
  Activity, 
  Users, 
  PlayCircle, 
  Calendar,
  TrendingUp,
  PlusCircle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Zap,
  DollarSign,
  Globe,
  Wifi,
  Sparkles,
  Star,
  Award,
  Radio,
  Target,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { cn } from '@/lib/utils';

// Generate mock chart data
const generateChartData = () => {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    viewers: Math.floor(Math.random() * 5000) + 1000,
    engagement: Math.floor(Math.random() * 100),
    revenue: Math.floor(Math.random() * 10000) + 2000
  }));
};

interface DashboardStats {
  totalEvents: number;
  activeStreams: number;
  totalViewers: number;
  upcomingEvents: number;
  revenue: number;
  engagement: number;
}

export default function DashboardEnhanced() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeStreams: 0,
    totalViewers: 0,
    upcomingEvents: 0,
    revenue: 0,
    engagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData] = useState(generateChartData());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const eventsResponse = await api.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : [];
      
      const activeStreams = events.filter((e: any) => e.status === 'live').length;
      const upcomingEvents = events.filter((e: any) => e.status === 'scheduled' || e.status === 'upcoming').length;
      const totalViewers = events.reduce((sum: number, e: any) => sum + (e.viewer_count || 0), 0);
      
      setStats({
        totalEvents: events.length,
        activeStreams,
        totalViewers,
        upcomingEvents,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        engagement: Math.floor(Math.random() * 100)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Show zeros when no data available
      setStats({
        totalEvents: 0,
        activeStreams: 0,
        totalViewers: 0,
        upcomingEvents: 0,
        revenue: 0,
        engagement: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Viewers',
      value: stats.totalViewers.toLocaleString(),
      icon: Eye,
      trend: '+12.5%',
      trendUp: true,
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      title: 'Active Streams',
      value: stats.activeStreams,
      icon: Wifi,
      trend: '+5 from last hour',
      trendUp: true,
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+8.2%',
      trendUp: true,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      title: 'Engagement',
      value: `${stats.engagement}%`,
      icon: Zap,
      trend: '-2.4%',
      trendUp: false,
      gradient: 'from-pink-600 to-red-600'
    }
  ];

  return (
    <DashboardLayout title="Enhanced Dashboard">
      <div className="space-y-8 animate-fade-in bg-gradient-to-br from-slate-50/50 via-white/50 to-purple-50/30 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-purple-950/20 min-h-screen -m-6 p-6 rounded-xl">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/10 rounded-full blur-2xl" />
          
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between p-8 glass rounded-2xl border border-white/20 dark:border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gradient">
                    Welcome back, {user?.firstName || user?.given_name || 'Streamer'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Your streaming empire awaits • {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="hover-lift glass px-6 py-3 font-semibold"
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics Hub
              </Button>
              <Button 
                className="btn-gradient hover-lift px-6 py-3 font-semibold shadow-lg"
                onClick={() => navigate('/events')}
              >
                <Radio className="mr-2 h-4 w-4" />
                Go Live Now
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card 
                key={index} 
                className="card-glow hover:scale-105 transition-all duration-500 border-0 shadow-xl overflow-hidden group cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative p-6">
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500",
                    stat.gradient
                  )} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                        stat.gradient
                      )}>
                        <StatIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                        stat.trendUp 
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" 
                          : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      )}>
                        {stat.trendUp ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {stat.trend}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="glass border border-white/20 dark:border-white/10 p-1 h-14 rounded-2xl">
              <TabsTrigger 
                value="overview" 
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg"
              >
                <Target className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Audience
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Viewer Analytics Chart */}
              <Card className="card-glow border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 border-b border-purple-200/20 dark:border-purple-800/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Viewer Analytics
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Real-time engagement over the last 24 hours
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <AreaChartGradient 
                    data={chartData}
                    height={320}
                    dataKey="viewers"
                    xDataKey="time"
                    color="hsl(var(--chart-1))"
                    gradientId="viewerGradient"
                  />
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="card-glow border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 p-6 border-b border-green-200/20 dark:border-green-800/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Revenue Trends
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Monetization performance and growth
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <AreaChartGradient 
                    data={chartData}
                    height={320}
                    dataKey="revenue"
                    xDataKey="time"
                    color="hsl(var(--chart-3))"
                    gradientId="revenueGradient"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Real-time updates from your streaming ecosystem
                    </CardDescription>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { 
                      title: 'Tech Conference 2024', 
                      status: 'live', 
                      viewers: 1234,
                      time: 'Started 2 hours ago',
                      category: 'Conference',
                      growth: '+23%'
                    },
                    { 
                      title: 'Product Launch Event', 
                      status: 'scheduled', 
                      viewers: 0,
                      time: 'Starts in 3 hours',
                      category: 'Launch',
                      growth: null
                    },
                    { 
                      title: 'Q4 Earnings Call', 
                      status: 'completed', 
                      viewers: 5678,
                      time: 'Ended yesterday',
                      category: 'Corporate',
                      growth: '+45%'
                    }
                  ].map((activity, index) => (
                    <div key={index} className="group p-6 rounded-2xl bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black/70 border border-white/20 dark:border-white/10 hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="status-dot">
                              {activity.status === 'live' && (
                                <>
                                  <span className="status-dot-pulse bg-red-500"></span>
                                  <span className="status-dot-core bg-red-500"></span>
                                </>
                              )}
                              {activity.status === 'scheduled' && (
                                <span className="status-dot-core bg-amber-500"></span>
                              )}
                              {activity.status === 'completed' && (
                                <span className="status-dot-core bg-green-500"></span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {activity.title}
                              </h4>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                                {activity.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {activity.viewers > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                              <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {activity.viewers.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {activity.growth && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                {activity.growth}
                              </span>
                            </div>
                          )}
                          <Badge 
                            className={cn(
                              "font-semibold",
                              activity.status === 'live' && 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
                              activity.status === 'scheduled' && 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                              activity.status === 'completed' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                            )}
                          >
                            {activity.status === 'live' && '🔴 LIVE'}
                            {activity.status === 'scheduled' && '⏰ Scheduled'}
                            {activity.status === 'completed' && '✅ Completed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Deep dive into your streaming performance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <Button onClick={() => navigate('/analytics')} className="btn-gradient">
                  View Full Analytics Dashboard
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Create and manage your streaming events
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <Button onClick={() => navigate('/events')} className="btn-gradient">
                  Manage Events
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>
                  Understanding your viewer demographics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">United States</span>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">United Kingdom</span>
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Canada</span>
                      <span className="text-sm text-muted-foreground">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Other</span>
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { 
              title: 'Go Live', 
              description: 'Start streaming instantly',
              icon: Radio, 
              gradient: 'from-red-500 to-pink-500',
              bgGradient: 'from-red-500/10 to-pink-500/10',
              action: () => navigate('/streaming/live')
            },
            { 
              title: 'Schedule Event', 
              description: 'Plan your next broadcast',
              icon: Calendar, 
              gradient: 'from-blue-500 to-cyan-500',
              bgGradient: 'from-blue-500/10 to-cyan-500/10',
              action: () => navigate('/events')
            },
            { 
              title: 'Content Hub', 
              description: 'Manage your video library',
              icon: Layers, 
              gradient: 'from-purple-500 to-indigo-500',
              bgGradient: 'from-purple-500/10 to-indigo-500/10',
              action: () => navigate('/vod-upload')
            }
          ].map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-500 border-0 shadow-xl group overflow-hidden"
                onClick={action.action}
              >
                <div className="relative p-8">
                  {/* Background gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-100 group-hover:opacity-100 transition-opacity duration-500",
                    action.bgGradient
                  )} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                        action.gradient
                      )}>
                        <ActionIcon className="h-8 w-8 text-white" />
                      </div>
                      <Star className="h-5 w-5 text-yellow-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}