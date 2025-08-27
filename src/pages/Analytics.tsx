import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  BarChart3, 
  DollarSign,
  AlertTriangle,
  Download,
  RefreshCw,
  Database,
  Eye,
  Calendar
} from 'lucide-react';

// Import our custom analytics components
import { AnalyticsFilters } from '../components/Analytics/AnalyticsFilters';
import { LiveEventsGrid } from '../components/Analytics/LiveEventCard';
import { HistoricalEventsTable } from '../components/Analytics/HistoricalEventsTable';
import { DataSourceBadge, ConnectionStatus } from '../components/Analytics/DataSourceBadge';
import {
  ViewerTimeSeriesChart,
  EngagementChart,
  StreamQualityChart,
  GeographicChart,
  ComparisonChart,
  ResourceUsageChart,
  RevenueChart,
} from '../components/Analytics/AnalyticsCharts';

// Import hooks
import { useAnalytics, useAnalyticsAlerts, useAnalyticsExport } from '../hooks/useAnalytics';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [_viewMode, _setViewMode] = useState<'grid' | 'table'>('grid');

  // Analytics hooks
  const {
    liveEvents,
    historicalEvents,
    filteredEvents,
    dashboardOverview,
    alerts,
    filters,
    updateFilters,
    setDateRangePreset,
    isLoading,
    error,
  } = useAnalytics();

  const { isConnected } = useWebSocket();
  const { acknowledgeAlert } = useAnalyticsAlerts();
  const { generateReport, downloadUrl, isGenerating } = useAnalyticsExport();

  // Sample data for charts (in real app, this would come from API)
  const mockViewerData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: Date.now() - (23 - i) * 60 * 60 * 1000,
    value: Math.floor(Math.random() * 1000) + 100,
  }));

  const mockEngagementData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: Date.now() - (23 - i) * 60 * 60 * 1000,
    value: Math.floor(Math.random() * 40) + 40,
  }));

  const mockGeographicData = [
    { country: 'United States', viewers: 1248, percentage: 45.2 },
    { country: 'United Kingdom', viewers: 567, percentage: 20.5 },
    { country: 'Canada', viewers: 432, percentage: 15.6 },
    { country: 'Germany', viewers: 298, percentage: 10.8 },
    { country: 'Others', viewers: 218, percentage: 7.9 },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('detailed');
  };

  const handleExportReport = () => {
    generateReport({
      type: 'historical_summary',
      eventIds: filteredEvents.map(e => e.id),
      dateRange: filters.dateRange,
      format: 'pdf',
      includeCharts: true,
      sections: ['summary', 'viewers', 'engagement', 'revenue'],
    });
  };

  const liveEventCount = liveEvents.length;
  const totalViewers = liveEvents.reduce((sum, event) => 
    sum + (event.quickStats.currentViewers || 0), 0
  );
  const avgEngagement = filteredEvents.length > 0 
    ? filteredEvents.reduce((sum, event) => sum + event.quickStats.engagementScore, 0) / filteredEvents.length
    : 0;

  return (
    <DashboardLayout 
      title="Analytics Dashboard" 
      subtitle="Comprehensive analytics for live and historical events"
    >
      <div className="space-y-6">
        {/* Connection Status & Alerts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ConnectionStatus 
              status={isConnected() ? 'connected' : 'disconnected'} 
            />
            {liveEventCount > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {liveEventCount} Live Event{liveEventCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Report
            </Button>
            {downloadUrl && (
              <Button asChild size="sm">
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  Download Ready
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.filter(alert => !alert.acknowledged).slice(0, 3).map(alert => (
              <Alert key={alert.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message || 'Failed to load analytics data'}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 size={16} />
              Overview
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Activity size={16} />
              Live Events
              {liveEventCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {liveEventCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historical" className="gap-2">
              <Database size={16} />
              Historical
            </TabsTrigger>
            <TabsTrigger value="detailed" className="gap-2">
              <Eye size={16} />
              Detailed View
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Live Viewers</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(totalViewers)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {liveEventCount} active events
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(dashboardOverview?.totalEvents || filteredEvents.length)}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {filters.dateRange.preset || 'Custom range'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {avgEngagement.toFixed(1)}%
                      </p>
                      <p className={cn(
                        'text-xs mt-1',
                        avgEngagement >= 70 ? 'text-green-600 dark:text-green-400' : 
                        avgEngagement >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-red-600 dark:text-red-400'
                      )}>
                        {avgEngagement >= 70 ? 'Excellent' : avgEngagement >= 40 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${formatNumber(dashboardOverview?.totalRevenue || 0)}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        +{dashboardOverview?.trendingMetrics?.revenueChange || 0}% this period
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <AnalyticsFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onPresetSelect={setDateRangePreset}
              compactMode={true}
            />

            {/* Charts Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ViewerTimeSeriesChart 
                data={mockViewerData}
                title="Viewer Trends (24h)"
                showPeakLine={true}
              />
              <EngagementChart 
                data={mockEngagementData}
                title="Engagement Rate (24h)"
              />
              <GeographicChart data={mockGeographicData} />
              <RevenueChart data={mockViewerData.map(d => ({ ...d, value: d.value * 2.5 }))} />
            </div>
          </TabsContent>

          {/* Live Events Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Live Events Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time analytics from active event containers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DataSourceBadge source="live" showTimestamp />
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw size={16} />
                  Auto-refresh: ON
                </Button>
              </div>
            </div>

            {/* Live Events Grid */}
            <LiveEventsGrid 
              events={liveEvents}
              onEventClick={handleEventClick}
              showDetails={true}
            />

            {/* Real-time Charts for Selected Event */}
            {liveEvents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ViewerTimeSeriesChart 
                  data={mockViewerData}
                  isLive={true}
                  title="Live Viewer Count"
                />
                <StreamQualityChart 
                  bitrateData={mockViewerData}
                  frameRateData={mockViewerData}
                  latencyData={mockViewerData}
                />
                <ResourceUsageChart 
                  cpuData={mockEngagementData}
                  memoryData={mockEngagementData}
                />
                <EngagementChart 
                  data={mockEngagementData}
                  title="Real-time Engagement"
                />
              </div>
            )}
          </TabsContent>

          {/* Historical Events Tab */}
          <TabsContent value="historical" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Historical Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Platform analytics for completed events
                </p>
              </div>
              <DataSourceBadge source="historical" />
            </div>

            {/* Advanced Filters */}
            <AnalyticsFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onPresetSelect={setDateRangePreset}
            />

            {/* Historical Events Table */}
            <HistoricalEventsTable
              events={historicalEvents}
              onEventClick={handleEventClick}
              onExportEvent={(eventId) => generateReport({
                type: 'historical_summary',
                eventIds: [eventId],
                dateRange: filters.dateRange,
                format: 'pdf',
                includeCharts: true,
                sections: ['summary', 'viewers', 'engagement', 'revenue'],
              })}
            />

            {/* Historical Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonChart 
                data={historicalEvents.slice(0, 5).map(event => ({
                  eventId: event.id,
                  eventTitle: event.title,
                  metrics: {
                    viewers: event.quickStats.totalViews || 0,
                    engagement: event.quickStats.engagementScore,
                    duration: event.quickStats.duration || 0,
                  }
                }))}
                metricKey="viewers"
                metricLabel="Total Viewers"
              />
              <ComparisonChart 
                data={historicalEvents.slice(0, 5).map(event => ({
                  eventId: event.id,
                  eventTitle: event.title,
                  metrics: {
                    engagement: event.quickStats.engagementScore,
                  }
                }))}
                metricKey="engagement"
                metricLabel="Engagement Score"
              />
            </div>
          </TabsContent>

          {/* Detailed View Tab */}
          <TabsContent value="detailed" className="space-y-6">
            {selectedEventId ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Event Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Comprehensive analytics for selected event
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedEventId(null)}>
                    Back to Overview
                  </Button>
                </div>

                {/* Detailed event analytics would go here */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Analytics</CardTitle>
                    <CardDescription>
                      Detailed analytics for event: {selectedEventId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Detailed event analytics implementation would go here...</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    No Event Selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select an event from the Live or Historical tabs to view detailed analytics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading analytics data...
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}