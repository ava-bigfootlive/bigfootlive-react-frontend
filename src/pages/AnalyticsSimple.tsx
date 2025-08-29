import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AreaChartGradient } from '../components/Charts/AreaChartGradient';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  BarChart3,
  Activity,
  Eye,
  Clock,
  DollarSign,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/use-toast';

interface AnalyticsData {
  viewer_count: number;
  peak_viewers: number;
  average_watch_time: number;
  engagement_rate: number;
  chat_messages: number;
  reactions: number;
  revenue?: number;
  bandwidth_used?: number;
  stream_quality?: number;
  geographic_distribution?: { [key: string]: number };
  time_series?: Array<{
    timestamp: string;
    viewers: number;
    engagement: number;
    bandwidth?: number;
    revenue?: number;
  }>;
}

interface ViewerMetrics {
  current_viewers: number;
  viewer_history: Array<{
    timestamp: string;
    count: number;
  }>;
  geographic_breakdown?: { [key: string]: number };
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [viewerMetrics, setViewerMetrics] = useState<ViewerMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch analytics when event is selected
  useEffect(() => {
    if (selectedEventId) {
      fetchAnalytics(selectedEventId);
      
      // Set up auto-refresh every 10 seconds
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        fetchAnalytics(selectedEventId, true);
      }, 10000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear analytics when no event selected
      setAnalytics(null);
      setViewerMetrics(null);
      setChartData([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getEvents();
      // Handle both array and object with items property
      const eventList = Array.isArray(response) ? response : (response?.items || []);
      setEvents(eventList);
      
      // Auto-select first event if available
      if (eventList.length > 0 && !selectedEventId) {
        setSelectedEventId(eventList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events. Please try again.',
        variant: 'destructive'
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (eventId: string, silent = false) => {
    if (!silent) {
      setAnalyticsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Fetch both analytics and viewer metrics in parallel
      const [analyticsResponse, viewerResponse] = await Promise.all([
        api.getAnalytics(eventId).catch(() => null),
        api.getViewerMetrics(eventId).catch(() => null)
      ]);

      if (analyticsResponse) {
        setAnalytics(analyticsResponse);
        
        // Process time series data for charts
        if (analyticsResponse.time_series && Array.isArray(analyticsResponse.time_series)) {
          const formattedData = analyticsResponse.time_series.map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            }),
            viewers: item.viewers || 0,
            engagement: item.engagement || 0,
            revenue: item.revenue || 0,
            bandwidth: item.bandwidth || 0
          }));
          setChartData(formattedData);
        } else {
          // Generate empty data structure if no time series
          const emptyData = Array.from({ length: 12 }, (_, i) => ({
            time: `${i * 2}:00`,
            viewers: 0,
            engagement: 0,
            revenue: 0,
            bandwidth: 0
          }));
          setChartData(emptyData);
        }
      } else {
        // Set empty analytics if API returns null
        setAnalytics({
          viewer_count: 0,
          peak_viewers: 0,
          average_watch_time: 0,
          engagement_rate: 0,
          chat_messages: 0,
          reactions: 0,
          revenue: 0,
          bandwidth_used: 0,
          stream_quality: 0
        });
        setChartData([]);
      }

      if (viewerResponse) {
        setViewerMetrics(viewerResponse);
      } else {
        setViewerMetrics({
          current_viewers: 0,
          viewer_history: []
        });
      }

      if (!silent && !analyticsResponse && !viewerResponse) {
        toast({
          title: 'No Analytics Data',
          description: 'Analytics data is not available for this event yet.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive'
        });
      }
      
      // Set empty states on error
      setAnalytics({
        viewer_count: 0,
        peak_viewers: 0,
        average_watch_time: 0,
        engagement_rate: 0,
        chat_messages: 0,
        reactions: 0,
        revenue: 0,
        bandwidth_used: 0,
        stream_quality: 0
      });
      setViewerMetrics({
        current_viewers: 0,
        viewer_history: []
      });
      setChartData([]);
    } finally {
      setAnalyticsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate metrics from analytics data
  const totalViewers = analytics?.viewer_count || 0;
  const peakViewers = analytics?.peak_viewers || 0;
  const avgEngagement = Math.round(analytics?.engagement_rate || 0);
  const totalRevenue = analytics?.revenue || 0;
  const totalBandwidth = analytics?.bandwidth_used || 0;
  const avgWatchTime = analytics?.average_watch_time || 0;
  const chatMessages = analytics?.chat_messages || 0;
  const reactions = analytics?.reactions || 0;

  const metrics = [
    {
      title: 'Total Viewers',
      value: totalViewers.toLocaleString(),
      subtitle: `Peak: ${peakViewers.toLocaleString()}`,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Engagement',
      value: `${avgEngagement}%`,
      subtitle: `${chatMessages} chats, ${reactions} reactions`,
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : 'N/A',
      subtitle: 'Total earned',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Watch Time',
      value: avgWatchTime > 0 ? `${Math.round(avgWatchTime / 60)}m` : '0m',
      subtitle: `${totalBandwidth.toFixed(1)} GB bandwidth`,
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <DashboardLayout title="Analytics Dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Monitor your streaming performance and viewer engagement
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isRefreshing && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Refreshing...</span>
              </div>
            )}
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.length === 0 ? (
                  <SelectItem value="_" disabled>
                    No events available
                  </SelectItem>
                ) : (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title || 'Untitled Event'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Cards */}
        {!selectedEventId ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Event Selected</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please select an event from the dropdown above to view analytics
              </p>
            </CardContent>
          </Card>
        ) : analyticsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="card-glow">
                <CardHeader className="pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="card-glow hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {!selectedEventId ? (
              <Card className="glass">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select an event to view analytics
                </CardContent>
              </Card>
            ) : chartData.length === 0 ? (
              <Card className="glass">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                  No chart data available for this event
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Viewership Chart */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Viewership Over Time</CardTitle>
                    <CardDescription>
                      {viewerMetrics?.current_viewers || 0} current viewers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AreaChartGradient 
                      data={chartData}
                      dataKey="viewers"
                      xDataKey="time"
                      color="hsl(var(--chart-1))"
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* Engagement Chart */}
                <Card className="glass">
                  <CardHeader>
                    <CardTitle>Engagement Rate</CardTitle>
                    <CardDescription>Viewer interaction percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AreaChartGradient 
                      data={chartData}
                      dataKey="engagement"
                      xDataKey="time"
                      color="hsl(var(--chart-2))"
                      height={300}
                      gradientId="engagementGradient"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Events Performance Table */}
            <Card className="glass">
              <CardHeader>
                <CardTitle>All Events</CardTitle>
                <CardDescription>Events ranked by viewer count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events
                    .sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))
                    .slice(0, 5)
                    .map((event, index) => (
                      <div 
                        key={event.id} 
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                          event.id === selectedEventId 
                            ? 'bg-accent' 
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{event.title || 'Untitled Event'}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.start_time 
                                ? new Date(event.start_time).toLocaleDateString() 
                                : 'Date not set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {(event.viewer_count || 0).toLocaleString()} viewers
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {event.duration || 'Duration N/A'}
                            </p>
                          </div>
                          <Badge variant={event.status === 'live' ? 'default' : 'secondary'}>
                            {event.status || 'scheduled'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {events.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No events available. Create an event to start tracking analytics.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Engagement Analytics</CardTitle>
                <CardDescription>Detailed viewer interaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedEventId || chartData.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                    {!selectedEventId 
                      ? 'Select an event to view engagement analytics'
                      : 'No engagement data available for this event'}
                  </div>
                ) : (
                  <AreaChartGradient 
                    data={chartData}
                    dataKey="engagement"
                    xDataKey="time"
                    color="hsl(var(--chart-2))"
                    height={400}
                    gradientId="engagementMain"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Revenue generation and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedEventId || chartData.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                    {!selectedEventId 
                      ? 'Select an event to view revenue analytics'
                      : totalRevenue === 0
                        ? 'No revenue data available for this event'
                        : 'No revenue chart data available'}
                  </div>
                ) : (
                  <AreaChartGradient 
                    data={chartData}
                    dataKey="revenue"
                    xDataKey="time"
                    color="hsl(var(--chart-3))"
                    height={400}
                    gradientId="revenueMain"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System and streaming performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!selectedEventId ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Select an event to view performance metrics
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Stream Quality</span>
                        <span className="text-sm text-muted-foreground">
                          {analytics?.stream_quality ? `${Math.round(analytics.stream_quality)}%` : 'N/A'}
                        </span>
                      </div>
                      <Progress value={analytics?.stream_quality || 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Engagement Rate</span>
                        <span className="text-sm text-muted-foreground">{avgEngagement}%</span>
                      </div>
                      <Progress value={avgEngagement} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Chat Activity</span>
                        <span className="text-sm text-muted-foreground">
                          {chatMessages} messages
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((chatMessages / 100) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Viewer Retention</span>
                        <span className="text-sm text-muted-foreground">
                          {avgWatchTime > 0 
                            ? `${Math.round(avgWatchTime / 60)} min avg` 
                            : 'N/A'}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((avgWatchTime / 3600) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Geographic Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Viewer locations worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedEventId ? (
              <div className="py-12 text-center text-muted-foreground">
                Select an event to view geographic distribution
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const geoData = analytics?.geographic_distribution || 
                    viewerMetrics?.geographic_breakdown || {};
                  
                  const locations = Object.keys(geoData).length > 0
                    ? Object.entries(geoData)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([country, count]) => {
                          const viewers = count as number;
                          const percentage = totalViewers > 0 
                            ? Math.round((viewers / totalViewers) * 100) 
                            : 0;
                          return { country, viewers, percentage };
                        })
                    : [];
                  
                  if (locations.length === 0) {
                    return (
                      <p className="text-center text-muted-foreground py-8">
                        No geographic data available for this event
                      </p>
                    );
                  }
                  
                  return locations.map((location, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{location.country}</span>
                        <span className="text-sm text-muted-foreground">
                          {location.viewers.toLocaleString()} viewers
                        </span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}