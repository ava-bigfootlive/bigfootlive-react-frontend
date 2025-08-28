import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Gauge,
  Heart,
  Zap,
  Clock,
  Globe,
  Shield,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Bell,
  BellOff,
  Filter,
  Info,
  Pause,
  Play,
  RotateCw,
  Plus
} from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { cn } from '@/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: { time: string; value: number }[];
}

interface StreamEndpoint {
  id: string;
  name: string;
  type: 'origin' | 'edge' | 'transcoder';
  location: string;
  status: 'online' | 'degraded' | 'offline';
  cpu: number;
  memory: number;
  bandwidth: number;
  connections: number;
  uptime: number;
}

interface HealthEvent {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  resolved: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notifications: string[];
}

export default function StreamHealthMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  const [overallHealth, setOverallHealth] = useState(92);
  const [streamStatus, setStreamStatus] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      name: 'Bitrate',
      value: 4850,
      unit: 'kbps',
      status: 'healthy',
      threshold: { warning: 4000, critical: 3000 },
      trend: 'stable',
      history: []
    },
    {
      name: 'Frame Rate',
      value: 29.97,
      unit: 'fps',
      status: 'healthy',
      threshold: { warning: 25, critical: 20 },
      trend: 'stable',
      history: []
    },
    {
      name: 'Latency',
      value: 850,
      unit: 'ms',
      status: 'healthy',
      threshold: { warning: 2000, critical: 5000 },
      trend: 'down',
      history: []
    },
    {
      name: 'Packet Loss',
      value: 0.02,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 1, critical: 5 },
      trend: 'stable',
      history: []
    },
    {
      name: 'Buffer Health',
      value: 98,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 80, critical: 50 },
      trend: 'up',
      history: []
    },
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      threshold: { warning: 70, critical: 90 },
      trend: 'stable',
      history: []
    },
    {
      name: 'Memory Usage',
      value: 62,
      unit: '%',
      status: 'warning',
      threshold: { warning: 60, critical: 80 },
      trend: 'up',
      history: []
    },
    {
      name: 'Disk I/O',
      value: 120,
      unit: 'MB/s',
      status: 'healthy',
      threshold: { warning: 200, critical: 300 },
      trend: 'stable',
      history: []
    },
    {
      name: 'Network Throughput',
      value: 8.5,
      unit: 'Gbps',
      status: 'healthy',
      threshold: { warning: 10, critical: 12 },
      trend: 'up',
      history: []
    },
    {
      name: 'Concurrent Viewers',
      value: 1247,
      unit: '',
      status: 'healthy',
      threshold: { warning: 5000, critical: 10000 },
      trend: 'up',
      history: []
    }
  ]);

  const [endpoints, setEndpoints] = useState<StreamEndpoint[]>([
    {
      id: '1',
      name: 'Origin Server 1',
      type: 'origin',
      location: 'US East',
      status: 'online',
      cpu: 35,
      memory: 48,
      bandwidth: 850,
      connections: 342,
      uptime: 99.99
    },
    {
      id: '2',
      name: 'Edge Server 1',
      type: 'edge',
      location: 'US West',
      status: 'online',
      cpu: 42,
      memory: 55,
      bandwidth: 920,
      connections: 456,
      uptime: 99.95
    },
    {
      id: '3',
      name: 'Transcoder 1',
      type: 'transcoder',
      location: 'EU Central',
      status: 'degraded',
      cpu: 78,
      memory: 82,
      bandwidth: 650,
      connections: 189,
      uptime: 98.5
    },
    {
      id: '4',
      name: 'Edge Server 2',
      type: 'edge',
      location: 'Asia Pacific',
      status: 'online',
      cpu: 28,
      memory: 41,
      bandwidth: 720,
      connections: 298,
      uptime: 99.97
    }
  ]);

  const [events, setEvents] = useState<HealthEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'warning',
      component: 'Transcoder 1',
      message: 'High CPU usage detected (78%)',
      resolved: false
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'info',
      component: 'Edge Server 1',
      message: 'Cache purge completed successfully',
      resolved: true
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'error',
      component: 'Origin Server 1',
      message: 'Failed to connect to backup storage',
      resolved: true
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      severity: 'critical',
      component: 'Network',
      message: 'Packet loss exceeded threshold (5.2%)',
      resolved: true
    }
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High CPU Alert',
      metric: 'cpu',
      condition: 'greater_than',
      threshold: 80,
      enabled: true,
      notifications: ['email', 'slack']
    },
    {
      id: '2',
      name: 'Low Bitrate Alert',
      metric: 'bitrate',
      condition: 'less_than',
      threshold: 3000,
      enabled: true,
      notifications: ['email', 'pagerduty']
    },
    {
      id: '3',
      name: 'High Packet Loss',
      metric: 'packet_loss',
      condition: 'greater_than',
      threshold: 2,
      enabled: true,
      notifications: ['slack', 'webhook']
    }
  ]);

  // Generate time series data for charts
  const generateTimeSeriesData = () => {
    const data = [];
    const now = Date.now();
    for (let i = 59; i >= 0; i--) {
      const time = new Date(now - i * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        bitrate: 4500 + Math.random() * 500,
        viewers: Math.floor(1000 + Math.random() * 500),
        cpu: 40 + Math.random() * 20,
        latency: 800 + Math.random() * 400
      });
    }
    return data;
  };

  const [timeSeriesData] = useState(generateTimeSeriesData());

  // Update metrics in real-time
  useEffect(() => {
    if (!isMonitoring || !autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let newValue = metric.value;
        const variance = metric.value * 0.05;
        
        switch (metric.trend) {
          case 'up':
            newValue = metric.value + Math.random() * variance;
            break;
          case 'down':
            newValue = Math.max(0, metric.value - Math.random() * variance);
            break;
          default:
            newValue = metric.value + (Math.random() - 0.5) * variance;
        }

        // Determine status based on thresholds
        let status: HealthMetric['status'] = 'healthy';
        if (metric.name === 'Packet Loss' || metric.name === 'CPU Usage' || metric.name === 'Memory Usage') {
          if (newValue >= metric.threshold.critical) status = 'critical';
          else if (newValue >= metric.threshold.warning) status = 'warning';
        } else if (metric.name === 'Buffer Health' || metric.name === 'Frame Rate' || metric.name === 'Bitrate') {
          if (newValue <= metric.threshold.critical) status = 'critical';
          else if (newValue <= metric.threshold.warning) status = 'warning';
        }

        return {
          ...metric,
          value: newValue,
          status,
          history: [...metric.history.slice(-59), {
            time: new Date().toISOString(),
            value: newValue
          }]
        };
      }));

      // Update overall health
      setOverallHealth(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));

      // Update endpoints
      setEndpoints(prev => prev.map(endpoint => ({
        ...endpoint,
        cpu: Math.max(0, Math.min(100, endpoint.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, endpoint.memory + (Math.random() - 0.5) * 5)),
        bandwidth: Math.max(0, endpoint.bandwidth + (Math.random() - 0.5) * 50),
        connections: Math.max(0, endpoint.connections + Math.floor((Math.random() - 0.5) * 20))
      })));

      // Determine overall stream status
      const criticalMetrics = metrics.filter(m => m.status === 'critical');
      const warningMetrics = metrics.filter(m => m.status === 'warning');
      
      if (criticalMetrics.length > 0) {
        setStreamStatus('critical');
      } else if (warningMetrics.length > 2) {
        setStreamStatus('degraded');
      } else {
        setStreamStatus('healthy');
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, autoRefresh, refreshInterval, metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-500';
      case 'warning':
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
      case 'error':
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Healthy</Badge>;
      case 'warning':
      case 'degraded':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Degraded</Badge>;
      case 'critical':
      case 'offline':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSeverityIcon = (severity: HealthEvent['severity']) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast.info(isMonitoring ? 'Monitoring paused' : 'Monitoring resumed');
  };

  const refreshData = () => {
    toast.info('Refreshing health data...');
    // Trigger manual refresh
  };

  return (
    <DashboardLayout title="Stream Health Monitor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stream Health Monitor</h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring and diagnostics for streaming infrastructure
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMonitoring}
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RotateCw className={cn("h-4 w-4 mr-2", autoRefresh && "animate-spin")} />
              Auto Refresh
            </Button>
          </div>
        </div>

        {/* Overall Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Overall Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-3xl font-bold", 
                    overallHealth >= 90 ? 'text-green-500' :
                    overallHealth >= 70 ? 'text-yellow-500' :
                    'text-red-500'
                  )}>
                    {overallHealth.toFixed(0)}%
                  </p>
                  {getStatusBadge(streamStatus)}
                </div>
                <div className="relative w-16 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[{ value: overallHealth, fill: overallHealth >= 90 ? '#10b981' : overallHealth >= 70 ? '#eab308' : '#ef4444' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        fill="#10b981"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <Heart className={cn("absolute inset-0 m-auto h-6 w-6",
                    overallHealth >= 90 ? 'text-green-500' :
                    overallHealth >= 70 ? 'text-yellow-500' :
                    'text-red-500'
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Critical Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {metrics.slice(0, 5).map((metric) => (
                  <div key={metric.name}>
                    <p className="text-xs text-muted-foreground">{metric.name}</p>
                    <div className="flex items-center gap-1">
                      <p className={cn("text-lg font-bold", getStatusColor(metric.status))}>
                        {metric.value.toFixed(metric.unit === '%' || metric.unit === 'fps' ? 2 : 0)}
                      </p>
                      <span className="text-xs text-muted-foreground">{metric.unit}</span>
                      {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    </div>
                    <Progress 
                      value={
                        metric.name === 'Buffer Health' ? metric.value :
                        metric.name === 'Packet Loss' ? 100 - (metric.value * 20) :
                        100 - (metric.value / metric.threshold.critical * 100)
                      }
                      className="h-1 mt-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Real-time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Stream Performance</CardTitle>
                  <CardDescription>Real-time metrics over the last hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="bitrate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="Bitrate (kbps)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="viewers"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Viewers"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>System resource consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time"
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'currentColor' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                        name="CPU %"
                      />
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stackId="2"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                        name="Latency (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Health Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Network Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Bandwidth', 'Latency', 'Packet Loss', 'Jitter'].map(metric => {
                      const m = metrics.find(m => m.name.includes(metric) || metric.includes(m.name));
                      if (!m) return null;
                      return (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{metric}</span>
                          <span className={cn("text-sm font-medium", getStatusColor(m.status))}>
                            {m.value.toFixed(2)} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['CPU Usage', 'Memory Usage', 'Disk I/O'].map(metric => {
                      const m = metrics.find(m => m.name === metric);
                      if (!m) return null;
                      return (
                        <div key={metric}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{metric}</span>
                            <span className="text-xs font-medium">{m.value.toFixed(0)}{m.unit}</span>
                          </div>
                          <Progress value={m.value} className="h-1" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Stream Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Bitrate', 'Frame Rate', 'Buffer Health'].map(metric => {
                      const m = metrics.find(m => m.name === metric);
                      if (!m) return null;
                      return (
                        <div key={metric} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{metric}</span>
                          <span className={cn("text-sm font-medium", getStatusColor(m.status))}>
                            {m.value.toFixed(metric === 'Frame Rate' ? 2 : 0)} {m.unit}
                          </span>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Viewers</span>
                        <span className="text-sm font-medium">
                          {metrics.find(m => m.name === 'Concurrent Viewers')?.value.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
                <CardDescription>All monitored metrics with current values and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{metric.name}</h4>
                          {getStatusBadge(metric.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-2xl font-bold", getStatusColor(metric.status))}>
                            {metric.value.toFixed(metric.unit === '%' || metric.unit === 'fps' ? 2 : 0)}
                          </span>
                          <span className="text-sm text-muted-foreground">{metric.unit}</span>
                          {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Warning Threshold:</span>
                          <span className="ml-2 font-medium">{metric.threshold.warning} {metric.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Critical Threshold:</span>
                          <span className="ml-2 font-medium">{metric.threshold.critical} {metric.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trend:</span>
                          <span className="ml-2 font-medium capitalize">{metric.trend}</span>
                        </div>
                      </div>
                      {metric.history.length > 0 && (
                        <div className="mt-3">
                          <ResponsiveContainer width="100%" height={60}>
                            <RechartsLineChart data={metric.history.slice(-30)}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={
                                  metric.status === 'healthy' ? '#10b981' :
                                  metric.status === 'warning' ? '#eab308' :
                                  '#ef4444'
                                }
                                strokeWidth={2}
                                dot={false}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className={cn(
                  "relative",
                  endpoint.status === 'offline' && "opacity-75"
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        {endpoint.name}
                      </CardTitle>
                      {getStatusBadge(endpoint.status)}
                    </div>
                    <CardDescription>
                      {endpoint.type} · {endpoint.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">CPU</span>
                          <span className="text-sm font-medium">{endpoint.cpu.toFixed(0)}%</span>
                        </div>
                        <Progress value={endpoint.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Memory</span>
                          <span className="text-sm font-medium">{endpoint.memory.toFixed(0)}%</span>
                        </div>
                        <Progress value={endpoint.memory} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Bandwidth</p>
                          <p className="text-sm font-medium">{endpoint.bandwidth} Mbps</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Connections</p>
                          <p className="text-sm font-medium">{endpoint.connections}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                          <p className="text-sm font-medium">{endpoint.uptime}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <Badge variant="outline" className="text-xs">
                            {endpoint.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Health Events</CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border",
                          event.resolved && "opacity-60"
                        )}
                      >
                        {getSeverityIcon(event.severity)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{event.component}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.message}
                          </p>
                          {event.resolved && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Alert Rules</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Switch checked={rule.enabled} />
                        <div>
                          <p className="font-medium text-sm">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {rule.metric} {rule.condition} {rule.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rule.notifications.map(notif => (
                          <Badge key={notif} variant="outline" className="text-xs">
                            {notif}
                          </Badge>
                        ))}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Bell className="h-4 w-4" />
              <AlertTitle>Alert Configuration</AlertTitle>
              <AlertDescription>
                Configure alert thresholds and notification channels to receive real-time updates about stream health issues.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}