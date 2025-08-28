import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity,
  Users,
  PlayCircle,
  Calendar,
  TrendingUp,
  Settings,
  Shield,
  Database,
  Globe,
  Zap,
  Server,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Video,
  Wifi,
  HardDrive,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Types
interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  bandwidth_usage: number;
  active_streams: number;
  total_viewers: number;
  storage_used: number;
  storage_total: number;
}

interface StreamingMetrics {
  total_events: number;
  live_events: number;
  scheduled_events: number;
  completed_events: number;
  total_hours_streamed: number;
  average_duration: number;
  peak_concurrent_viewers: number;
  total_unique_viewers: number;
}

interface RevenueMetrics {
  total_revenue: number;
  monthly_recurring: number;
  churn_rate: number;
  average_revenue_per_user: number;
  revenue_growth: number;
}

// Sample data for charts
const viewerTrendData = [
  { time: '00:00', viewers: 450, bandwidth: 120 },
  { time: '04:00', viewers: 380, bandwidth: 95 },
  { time: '08:00', viewers: 720, bandwidth: 180 },
  { time: '12:00', viewers: 1250, bandwidth: 310 },
  { time: '16:00', viewers: 980, bandwidth: 245 },
  { time: '20:00', viewers: 1450, bandwidth: 360 },
  { time: '23:59', viewers: 680, bandwidth: 170 }
];

const eventDistribution = [
  { name: 'Live Events', value: 35, color: '#10b981' },
  { name: 'VOD', value: 45, color: '#3b82f6' },
  { name: 'Scheduled', value: 20, color: '#f59e0b' }
];

const regionDistribution = [
  { region: 'North America', viewers: 4500, revenue: 12500 },
  { region: 'Europe', viewers: 3200, revenue: 8900 },
  { region: 'Asia Pacific', viewers: 2800, revenue: 7200 },
  { region: 'Latin America', viewers: 1200, revenue: 3100 },
  { region: 'Africa', viewers: 800, revenue: 1800 }
];

const platformMetrics = [
  { platform: 'Web', users: 65, color: '#3b82f6' },
  { platform: 'Mobile', users: 25, color: '#10b981' },
  { platform: 'Smart TV', users: 10, color: '#f59e0b' }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 45,
    memory_usage: 62,
    disk_usage: 38,
    bandwidth_usage: 72,
    active_streams: 12,
    total_viewers: 3456,
    storage_used: 1.2,
    storage_total: 5.0
  });

  const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics>({
    total_events: 156,
    live_events: 8,
    scheduled_events: 24,
    completed_events: 124,
    total_hours_streamed: 892,
    average_duration: 2.4,
    peak_concurrent_viewers: 5678,
    total_unique_viewers: 45000
  });

  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    total_revenue: 125000,
    monthly_recurring: 45000,
    churn_rate: 2.3,
    average_revenue_per_user: 89,
    revenue_growth: 18.5
  });

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(() => {
      loadMetrics(false);
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadMetrics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Simulate API call with slight variations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add some variation to make it look real-time
      setSystemMetrics(prev => ({
        ...prev,
        cpu_usage: Math.min(100, Math.max(0, prev.cpu_usage + (Math.random() - 0.5) * 10)),
        memory_usage: Math.min(100, Math.max(0, prev.memory_usage + (Math.random() - 0.5) * 5)),
        bandwidth_usage: Math.min(100, Math.max(0, prev.bandwidth_usage + (Math.random() - 0.5) * 15)),
        total_viewers: Math.floor(prev.total_viewers + (Math.random() - 0.5) * 200)
      }));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics(false);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit = '', 
    change = 0, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    unit?: string;
    change?: number;
    icon: any;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'text-blue-500 bg-blue-500/10',
      green: 'text-green-500 bg-green-500/10',
      yellow: 'text-yellow-500 bg-yellow-500/10',
      purple: 'text-purple-500 bg-purple-500/10',
      red: 'text-red-500 bg-red-500/10'
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {value}{unit}
          </div>
          {change !== 0 && (
            <div className="flex items-center text-xs mt-1">
              {change > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}% from last period
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Platform overview and management"
      actions={
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Streams"
              value={systemMetrics.active_streams}
              change={12}
              icon={PlayCircle}
              color="green"
            />
            <MetricCard
              title="Total Viewers"
              value={systemMetrics.total_viewers.toLocaleString()}
              change={8}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Bandwidth Usage"
              value={systemMetrics.bandwidth_usage}
              unit="%"
              change={-5}
              icon={Wifi}
              color="yellow"
            />
            <MetricCard
              title="Storage Used"
              value={`${systemMetrics.storage_used}TB`}
              unit={` / ${systemMetrics.storage_total}TB`}
              change={15}
              icon={HardDrive}
              color="purple"
            />
          </div>

          {/* Real-time Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Viewer Trends</CardTitle>
                <CardDescription>Real-time viewer count and bandwidth usage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={viewerTrendData}>
                    <defs>
                      <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="bandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="viewers"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#viewerGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="bandwidth"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#bandwidthGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>Breakdown of event types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={eventDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time infrastructure monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">{systemMetrics.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.cpu_usage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span className="font-medium">{systemMetrics.memory_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.memory_usage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk I/O</span>
                    <span className="font-medium">{systemMetrics.disk_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.disk_usage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network</span>
                    <span className="font-medium">{systemMetrics.bandwidth_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemMetrics.bandwidth_usage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6 mt-6">
          {/* Streaming Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Live Events"
              value={streamingMetrics.live_events}
              icon={Video}
              color="green"
            />
            <MetricCard
              title="Scheduled"
              value={streamingMetrics.scheduled_events}
              icon={Calendar}
              color="blue"
            />
            <MetricCard
              title="Hours Streamed"
              value={streamingMetrics.total_hours_streamed.toLocaleString()}
              icon={Clock}
              color="purple"
            />
            <MetricCard
              title="Peak Viewers"
              value={streamingMetrics.peak_concurrent_viewers.toLocaleString()}
              icon={TrendingUp}
              color="yellow"
            />
          </div>

          {/* Active Streams Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Streams</CardTitle>
                  <CardDescription>Currently broadcasting events</CardDescription>
                </div>
                <Badge variant="default" className="bg-green-500">
                  {systemMetrics.active_streams} Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-10 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <Badge className="absolute -top-1 -right-1 bg-green-500 text-xs">
                          LIVE
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">Event Stream {i}</p>
                        <p className="text-sm text-muted-foreground">Started 2h ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Viewers</p>
                        <p className="font-medium">{(Math.random() * 1000).toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Bitrate</p>
                        <p className="font-medium">5.2 Mbps</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Quality</p>
                        <Badge variant="outline">1080p</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
              <CardDescription>Viewer distribution by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="region" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="viewers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6 mt-6">
          {/* Container Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Event Container Status</CardTitle>
                <CardDescription>Active streaming containers</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Container {i + 1}</span>
                            <Badge variant={i < 3 ? 'default' : 'secondary'}>
                              {i < 3 ? 'Active' : 'Idle'}
                            </Badge>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">CPU:</span>
                            <span className="ml-1 font-medium">{(Math.random() * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">RAM:</span>
                            <span className="ml-1 font-medium">{(Math.random() * 8).toFixed(1)}GB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Network:</span>
                            <span className="ml-1 font-medium">{(Math.random() * 100).toFixed(1)}Mbps</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="ml-1 font-medium">{(Math.random() * 24).toFixed(1)}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Health</CardTitle>
                <CardDescription>Platform service status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'API Gateway', status: 'operational', icon: Globe },
                    { name: 'Streaming Engine', status: 'operational', icon: Video },
                    { name: 'Database', status: 'operational', icon: Database },
                    { name: 'CDN', status: 'operational', icon: Zap },
                    { name: 'Auth Service', status: 'degraded', icon: Shield },
                    { name: 'Analytics', status: 'operational', icon: BarChart3 }
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <service.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.status === 'operational' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-500">Operational</span>
                          </>
                        ) : service.status === 'degraded' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs text-yellow-500">Degraded</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-500">Down</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization Trends</CardTitle>
              <CardDescription>Infrastructure resource usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={viewerTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="viewers" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="bandwidth" stroke="#10b981" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Platform Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>User distribution by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={platformMetrics}>
                    <RadialBar dataKey="users" fill="#8884d8">
                      {platformMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RadialBar>
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Key engagement indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Watch Time</p>
                      <p className="text-2xl font-bold">42 min</p>
                    </div>
                    <Badge variant="outline" className="text-green-500">+12%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement Rate</p>
                      <p className="text-2xl font-bold">68%</p>
                    </div>
                    <Badge variant="outline" className="text-green-500">+5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Return Rate</p>
                      <p className="text-2xl font-bold">45%</p>
                    </div>
                    <Badge variant="outline" className="text-red-500">-3%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl font-bold">72%</p>
                    </div>
                    <Badge variant="outline" className="text-green-500">+8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>Most watched events this period</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Product Launch 2024', 'Q4 All Hands', 'Training Series Ep. 12', 'Customer Summit', 'Tech Talk: AI'].map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-muted-foreground">#{i + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium">{event}</p>
                        <p className="text-sm text-muted-foreground">
                          {(Math.random() * 10000).toFixed(0)} views • {(Math.random() * 100).toFixed(0)}% completion
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`$${(revenueMetrics.total_revenue / 1000).toFixed(0)}k`}
              change={revenueMetrics.revenue_growth}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="MRR"
              value={`$${(revenueMetrics.monthly_recurring / 1000).toFixed(0)}k`}
              change={12}
              icon={TrendingUp}
              color="blue"
            />
            <MetricCard
              title="ARPU"
              value={`$${revenueMetrics.average_revenue_per_user}`}
              change={8}
              icon={Users}
              color="purple"
            />
            <MetricCard
              title="Churn Rate"
              value={`${revenueMetrics.churn_rate}%`}
              change={-15}
              icon={AlertCircle}
              color="yellow"
            />
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { month: 'Jan', revenue: 85000, growth: 5 },
                  { month: 'Feb', revenue: 92000, growth: 8 },
                  { month: 'Mar', revenue: 98000, growth: 6 },
                  { month: 'Apr', revenue: 105000, growth: 7 },
                  { month: 'May', revenue: 115000, growth: 10 },
                  { month: 'Jun', revenue: 125000, growth: 9 }
                ]}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subscription Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers</CardTitle>
                <CardDescription>Customer distribution by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tier: 'Enterprise', customers: 45, revenue: 67500, color: 'purple' },
                    { tier: 'Professional', customers: 128, revenue: 38400, color: 'blue' },
                    { tier: 'Business', customers: 256, revenue: 15360, color: 'green' },
                    { tier: 'Starter', customers: 412, revenue: 4120, color: 'yellow' }
                  ].map((plan) => (
                    <div key={plan.tier} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${plan.color}-500`} />
                          <span>{plan.tier}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{plan.customers} customers</span>
                          <span className="font-medium">${(plan.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                      <Progress value={(plan.revenue / 125000) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Credit Card', value: 65, color: '#3b82f6' },
                        { name: 'Bank Transfer', value: 25, color: '#10b981' },
                        { name: 'PayPal', value: 8, color: '#f59e0b' },
                        { name: 'Other', value: 2, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Credit Card', value: 65, color: '#3b82f6' },
                        { name: 'Bank Transfer', value: 25, color: '#10b981' },
                        { name: 'PayPal', value: 8, color: '#f59e0b' },
                        { name: 'Other', value: 2, color: '#6b7280' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}