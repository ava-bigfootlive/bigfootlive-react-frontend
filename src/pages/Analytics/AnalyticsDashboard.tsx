import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  Filter,
  Calendar,
  MapPin,
  Wifi,
  WifiOff,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { format, subDays } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface RealtimeMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface ViewerSession {
  id: string;
  userId: string;
  location: string;
  device: string;
  duration: number;
  quality: string;
  status: 'active' | 'idle' | 'buffering';
  bandwidth: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('viewers');
  const [isLive, setIsLive] = useState(true);
  const [currentViewers, setCurrentViewers] = useState(1234);
  
  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setCurrentViewers(prev => {
        const change = Math.floor(Math.random() * 20) - 10;
        return Math.max(0, prev + change);
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLive]);

  // Real-time metrics
  const realtimeMetrics: RealtimeMetric[] = [
    {
      id: 'viewers',
      label: 'Current Viewers',
      value: currentViewers,
      change: 12.5,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: 68.3,
      unit: '%',
      change: 5.2,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      id: 'watchtime',
      label: 'Avg. Watch Time',
      value: 24,
      unit: 'min',
      change: -2.1,
      icon: Clock,
      color: 'text-purple-500'
    },
    {
      id: 'bandwidth',
      label: 'Bandwidth Usage',
      value: 847,
      unit: 'Mbps',
      change: 8.7,
      icon: Wifi,
      color: 'text-orange-500'
    }
  ];

  // Sample data for charts
  const viewerData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    viewers: Math.floor(Math.random() * 2000) + 500,
    engagement: Math.floor(Math.random() * 100),
    bandwidth: Math.floor(Math.random() * 1000) + 200
  }));

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#8b5cf6' },
    { name: 'Mobile', value: 35, color: '#3b82f6' },
    { name: 'Tablet', value: 15, color: '#10b981' },
    { name: 'Smart TV', value: 5, color: '#f59e0b' }
  ];

  const geographicData = [
    { country: 'United States', viewers: 4500, percentage: 35 },
    { country: 'United Kingdom', viewers: 2100, percentage: 16 },
    { country: 'Canada', viewers: 1800, percentage: 14 },
    { country: 'Australia', viewers: 1200, percentage: 9 },
    { country: 'Germany', viewers: 950, percentage: 7 },
    { country: 'France', viewers: 800, percentage: 6 },
    { country: 'Others', viewers: 1650, percentage: 13 }
  ];

  const qualityDistribution = [
    { quality: '1080p', viewers: 3500, percentage: 45 },
    { quality: '720p', viewers: 2700, percentage: 35 },
    { quality: '480p', viewers: 1100, percentage: 14 },
    { quality: '360p', viewers: 470, percentage: 6 }
  ];

  const contentPerformance = [
    { name: 'Championship Finals', views: 125000, engagement: 85, retention: 72 },
    { name: 'Weekly Q&A Session', views: 45000, engagement: 92, retention: 68 },
    { name: 'Product Launch', views: 89000, engagement: 78, retention: 81 },
    { name: 'Tutorial Series', views: 34000, engagement: 88, retention: 85 },
    { name: 'Concert Stream', views: 98000, engagement: 75, retention: 70 }
  ];

  const engagementData = [
    { subject: 'Chat', A: 85, fullMark: 100 },
    { subject: 'Reactions', A: 72, fullMark: 100 },
    { subject: 'Shares', A: 68, fullMark: 100 },
    { subject: 'Comments', A: 90, fullMark: 100 },
    { subject: 'Polls', A: 55, fullMark: 100 },
    { subject: 'Q&A', A: 78, fullMark: 100 }
  ];

  const activeSessions: ViewerSession[] = [
    {
      id: '1',
      userId: 'user_123',
      location: 'New York, US',
      device: 'Chrome on Windows',
      duration: 1523,
      quality: '1080p',
      status: 'active',
      bandwidth: 8.5
    },
    {
      id: '2',
      userId: 'user_456',
      location: 'London, UK',
      device: 'Safari on iPhone',
      duration: 892,
      quality: '720p',
      status: 'buffering',
      bandwidth: 4.2
    },
    {
      id: '3',
      userId: 'user_789',
      location: 'Toronto, CA',
      device: 'Firefox on Mac',
      duration: 2341,
      quality: '1080p',
      status: 'active',
      bandwidth: 9.1
    }
  ];

  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value', 'Change'],
      ...realtimeMetrics.map(metric => [
        metric.label,
        `${metric.value}${metric.unit || ''}`,
        `${metric.change}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({
      title: "Analytics Exported",
      description: "Your analytics data has been exported successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time streaming analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant={isLive ? 'destructive' : 'outline'} onClick={() => setIsLive(!isLive)}>
            {isLive ? (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                Paused
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {realtimeMetrics.map((metric) => (
          <Card key={metric.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {metric.value.toLocaleString()}
                </span>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                )}
                {isLive && metric.id === 'viewers' && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
              </div>
              <p className={`text-xs flex items-center gap-1 mt-1 ${
                metric.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(metric.change)}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Viewer Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Viewer Trend</CardTitle>
              <CardDescription>Concurrent viewers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={viewerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="viewers"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Viewers by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {deviceData.map((device) => (
                    <div key={device.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-sm">{device.name}</span>
                      <span className="text-sm font-medium ml-auto">{device.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Geographic distribution of viewers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.slice(0, 5).map((location) => (
                    <div key={location.country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{location.country}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {location.viewers.toLocaleString()} ({location.percentage}%)
                        </span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Peak Concurrent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2,847</p>
                <p className="text-xs text-muted-foreground">At 2:45 PM</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Unique Viewers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">15,234</p>
                <p className="text-xs text-muted-foreground">This session</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">New vs Returning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">68/32%</p>
                <p className="text-xs text-muted-foreground">New/Returning ratio</p>
              </CardContent>
            </Card>
          </div>

          {/* Audience Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Detailed viewer analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={geographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="viewers" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Viewer Sessions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Currently watching viewers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Watch Time</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bandwidth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.userId}</TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>{session.device}</TableCell>
                      <TableCell>{Math.floor(session.duration / 60)}m</TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.quality}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          session.status === 'active' ? 'default' :
                          session.status === 'buffering' ? 'destructive' :
                          'secondary'
                        }>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.bandwidth} Mbps</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          {/* Engagement Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Chat Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3,421</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% from average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">8,947</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +45% from average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">521</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -12% from average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Poll Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">1,234</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% from average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Interactive feature usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={engagementData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Engagement"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Timeline</CardTitle>
              <CardDescription>User interactions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={viewerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          {/* Quality Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg Bitrate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">4.2 Mbps</p>
                <p className="text-xs text-muted-foreground">Across all streams</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Buffer Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0.8%</p>
                <p className="text-xs text-green-600">Excellent quality</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Startup Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2.1s</p>
                <p className="text-xs text-muted-foreground">Average load time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0.02%</p>
                <p className="text-xs text-green-600">Very low</p>
              </CardContent>
            </Card>
          </div>

          {/* Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Stream Quality Distribution</CardTitle>
              <CardDescription>Viewers by quality level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityDistribution.map((quality) => (
                  <div key={quality.quality} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{quality.quality}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {quality.viewers.toLocaleString()} viewers ({quality.percentage}%)
                      </span>
                    </div>
                    <Progress value={quality.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bandwidth Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Bandwidth Usage</CardTitle>
              <CardDescription>Network consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={viewerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="bandwidth"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {/* Content Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Analytics for recent streams</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Total Views</TableHead>
                    <TableHead>Engagement Rate</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentPerformance.map((content) => (
                    <TableRow key={content.name}>
                      <TableCell className="font-medium">{content.name}</TableCell>
                      <TableCell>{content.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={content.engagement} className="w-[60px]" />
                          <span className="text-sm">{content.engagement}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={content.retention} className="w-[60px]" />
                          <span className="text-sm">{content.retention}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {content.engagement > 80 ? (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Stable</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Content Insights */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Best Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Championship Finals</strong> exceeded expectations with 125K views
                      and 85% engagement rate
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Weekly Q&A Sessions</strong> show consistent 90%+ engagement
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Schedule more Q&A sessions - they have the highest engagement rate
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Consider shorter content formats - retention drops after 30 minutes
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          {/* Real-time Status */}
          <Alert className="border-green-200 bg-green-50">
            <Activity className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>System Status:</strong> All services operational. Stream health: Excellent
            </AlertDescription>
          </Alert>

          {/* Live Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Live Viewer Flow
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Joining</span>
                    <div className="flex items-center gap-2">
                      <ChevronUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">+47/min</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Leaving</span>
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-red-500" />
                      <span className="font-medium">-23/min</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Change</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-bold text-green-600">+24/min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stream Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CDN Performance</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Server Load</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className="font-medium text-green-600">0.02%</span>
                    </div>
                    <Progress value={0.02} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Latency</span>
                      <span className="font-medium">120ms</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time viewer actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap">
                        {format(subDays(new Date(), 0), 'HH:mm:ss')}
                      </span>
                      <div className="flex-1">
                        {i % 3 === 0 ? (
                          <span>
                            <Badge variant="outline" className="mr-2">New Viewer</Badge>
                            User from New York joined the stream
                          </span>
                        ) : i % 3 === 1 ? (
                          <span>
                            <Badge variant="outline" className="mr-2">Chat</Badge>
                            15 new messages in chat
                          </span>
                        ) : (
                          <span>
                            <Badge variant="outline" className="mr-2">Quality</Badge>
                            23 viewers switched to 1080p
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;