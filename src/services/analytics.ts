import { apiClient } from './api';
import type { 
  AnalyticsEvent, 
  LiveMetrics, 
  HistoricalMetrics, 
  AnalyticsFilters,
  TimeSeriesData,
  ComparisonData,
  ReportConfig,
  AnalyticsAlert,
  DateRange
} from '../types/analytics';

class AnalyticsService {
  // Live Container Analytics (Real-time)
  async getLiveEvents(): Promise<AnalyticsEvent[]> {
    return apiClient.get('/api/v1/analytics/live/events');
  }

  async getLiveMetrics(eventId: string): Promise<LiveMetrics> {
    return apiClient.get(`/api/v1/analytics/live/events/${eventId}/metrics`);
  }

  async getLiveEventSummary(eventId: string): Promise<AnalyticsEvent> {
    return apiClient.get(`/api/v1/analytics/live/events/${eventId}/summary`);
  }

  async getContainerHealth(eventId: string): Promise<LiveMetrics['containerHealth']> {
    return apiClient.get(`/api/v1/analytics/live/events/${eventId}/container/health`);
  }

  async getStreamQuality(eventId: string): Promise<LiveMetrics['streamQuality']> {
    return apiClient.get(`/api/v1/analytics/live/events/${eventId}/stream/quality`);
  }

  async getLiveEngagement(eventId: string): Promise<LiveMetrics['interactions']> {
    return apiClient.get(`/api/v1/analytics/live/events/${eventId}/engagement`);
  }

  // Platform Analytics (Historical)
  async getHistoricalEvents(filters?: Partial<AnalyticsFilters>): Promise<AnalyticsEvent[]> {
    const params = new URLSearchParams();
    if (filters?.dateRange) {
      params.append('start', filters.dateRange.start.toISOString());
      params.append('end', filters.dateRange.end.toISOString());
    }
    if (filters?.eventTypes?.length) {
      params.append('types', filters.eventTypes.join(','));
    }
    if (filters?.statuses?.length) {
      params.append('statuses', filters.statuses.join(','));
    }
    
    return apiClient.get(`/api/v1/analytics/events?${params.toString()}`);
  }

  async getHistoricalMetrics(eventId: string): Promise<HistoricalMetrics> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/metrics`);
  }

  async getEventSummary(eventId: string): Promise<AnalyticsEvent> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/summary`);
  }

  async getViewerMetrics(eventId: string): Promise<{
    totalViews: number;
    uniqueViewers: number;
    peakConcurrent: number;
    averageWatchTime: number;
  }> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/viewers`);
  }

  async getEngagementMetrics(eventId: string): Promise<{
    totalEngagements: number;
    chatMessages: number;
    reactions: number;
    polls: number;
    questions: number;
  }> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/engagement`);
  }

  async getRetentionCurve(eventId: string): Promise<Array<{
    timestamp: number;
    retention: number;
  }>> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/retention`);
  }

  async getRevenuMetrics(eventId: string): Promise<HistoricalMetrics['revenue']> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/revenue`);
  }

  async getCostAnalysis(eventId: string): Promise<HistoricalMetrics['costs']> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/costs`);
  }

  // Time Series Data for Charts
  async getViewerTimeSeries(eventId: string, granularity: 'minute' | 'hour' | 'day' = 'minute'): Promise<TimeSeriesData[]> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/timeseries/viewers?granularity=${granularity}`);
  }

  async getEngagementTimeSeries(eventId: string, granularity: 'minute' | 'hour' | 'day' = 'minute'): Promise<TimeSeriesData[]> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/timeseries/engagement?granularity=${granularity}`);
  }

  async getQualityTimeSeries(eventId: string): Promise<{
    bitrate: TimeSeriesData[];
    frameRate: TimeSeriesData[];
    latency: TimeSeriesData[];
  }> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/timeseries/quality`);
  }

  // Dashboard Overview Data
  async getDashboardOverview(dateRange?: DateRange): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalViews: number;
    totalRevenue: number;
    topEvents: AnalyticsEvent[];
    trendingMetrics: {
      viewsChange: number;
      engagementChange: number;
      revenueChange: number;
    };
  }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start.toISOString());
      params.append('end', dateRange.end.toISOString());
    }
    
    return apiClient.get(`/api/v1/analytics/dashboard/overview?${params.toString()}`);
  }

  // Comparative Analysis
  async getComparativeAnalysis(eventIds: string[]): Promise<{
    events: ComparisonData[];
    metrics: string[];
    charts: {
      viewerComparison: TimeSeriesData[][];
      engagementComparison: ComparisonData[];
      revenueComparison: ComparisonData[];
    };
  }> {
    return apiClient.post('/api/v1/analytics/comparative', { eventIds });
  }

  // Geographic Distribution
  async getGeographicDistribution(eventId: string, live: boolean = false): Promise<{
    [country: string]: number;
  }> {
    const endpoint = live 
      ? `/api/v1/analytics/live/events/${eventId}/geographic`
      : `/api/v1/analytics/events/${eventId}/geographic`;
    return apiClient.get(endpoint);
  }

  // Alerts Management
  async getAnalyticsAlerts(): Promise<AnalyticsAlert[]> {
    return apiClient.get('/api/v1/analytics/alerts');
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    return apiClient.post(`/api/v1/analytics/alerts/${alertId}/acknowledge`);
  }

  async createAlert(alert: Partial<AnalyticsAlert>): Promise<AnalyticsAlert> {
    return apiClient.post('/api/v1/analytics/alerts', alert);
  }

  // Export & Reporting
  async generateReport(config: ReportConfig): Promise<{
    reportId: string;
    downloadUrl: string;
    expiresAt: string;
  }> {
    return apiClient.post('/api/v1/analytics/reports/generate', config);
  }

  async getReportStatus(reportId: string): Promise<{
    status: 'generating' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
  }> {
    return apiClient.get(`/api/v1/analytics/reports/${reportId}/status`);
  }

  // Predictive Analytics
  async getPredictiveAnalytics(eventId: string): Promise<{
    viewerGrowthPrediction: TimeSeriesData[];
    engagementPrediction: TimeSeriesData[];
    optimalTiming: {
      bestDayOfWeek: string;
      bestTimeOfDay: string;
      confidence: number;
    };
  }> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/predictions`);
  }

  // A/B Testing Analysis
  async getABTestResults(testId: string): Promise<{
    variants: string[];
    metrics: {
      [variant: string]: {
        viewers: number;
        engagement: number;
        conversion: number;
        confidence: number;
      };
    };
    winner?: string;
  }> {
    return apiClient.get(`/api/v1/analytics/ab-tests/${testId}/results`);
  }

  // Real-time Search and Filtering
  async searchEvents(query: string, live: boolean = false): Promise<AnalyticsEvent[]> {
    const endpoint = live ? '/api/v1/analytics/live/search' : '/api/v1/analytics/search';
    return apiClient.get(`${endpoint}?q=${encodeURIComponent(query)}`);
  }

  async getFilterOptions(): Promise<{
    eventTypes: string[];
    statuses: string[];
    dateRangePresets: Array<{
      label: string;
      value: string;
      start: string;
      end: string;
    }>;
  }> {
    return apiClient.get('/api/v1/analytics/filter-options');
  }

  // Data Migration Status
  async getDataMigrationStatus(eventId: string): Promise<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    estimatedCompletion?: string;
    lastUpdated: string;
  }> {
    return apiClient.get(`/api/v1/analytics/events/${eventId}/migration-status`);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;