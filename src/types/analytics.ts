// Analytics types for BigFootLive dual-source architecture

export type DataSource = 'live' | 'historical' | 'migrating';
export type EventStatus = 'active' | 'ended' | 'failed' | 'scheduled';
export type EventType = 'live_stream' | 'sim_live' | 'rebroadcast' | 'webinar' | 'conference';
export type EngagementLevel = 'high' | 'medium' | 'low';

// Live Container Metrics (Real-time from event containers)
export interface LiveMetrics {
  eventId: string;
  timestamp: number;
  currentViewers: number;
  peakViewers: number;
  chatRate: number; // messages per minute
  engagementScore: number; // 0-100
  containerHealth: {
    cpu: number; // percentage
    memory: number; // percentage
    networkIn: number; // bytes/second
    networkOut: number; // bytes/second
  };
  streamQuality: {
    bitrate: number; // kbps
    frameRate: number; // fps
    droppedFrames: number;
    latency: number; // milliseconds
  };
  geographic: {
    [country: string]: number; // viewer count by country
  };
  interactions: {
    reactions: number;
    polls: number;
    questions: number;
  };
}

// Historical Platform Analytics
export interface HistoricalMetrics {
  eventId: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number; // seconds
  peakConcurrentViewers: number;
  totalEngagements: number;
  retentionCurve: Array<{
    timestamp: number;
    retention: number; // percentage
  }>;
  demographics: {
    ageGroups: { [range: string]: number };
    locations: { [country: string]: number };
    devices: { [device: string]: number };
  };
  revenue: {
    totalRevenue: number;
    conversionRate: number;
    revenuePerViewer: number;
  };
  costs: {
    containerCost: number;
    cdnCost: number;
    totalCost: number;
  };
}

// Event Summary for Analytics
export interface AnalyticsEvent {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  startTime: string;
  endTime?: string;
  dataSource: DataSource;
  lastUpdated: number;
  isLive: boolean;
  thumbnailUrl?: string;
  
  // Quick metrics for display
  quickStats: {
    currentViewers?: number; // for live events
    totalViews?: number; // for historical events
    peakViewers: number;
    engagementScore: number;
    duration?: number; // seconds
  };
}

// Filter interfaces
export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'week' | 'month' | 'quarter' | 'custom';
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  eventIds: string[];
  eventTypes: EventType[];
  statuses: EventStatus[];
  viewerRange: {
    min: number;
    max: number;
  };
  engagementLevel: EngagementLevel[];
  dataSource: DataSource[];
}

// Chart data interfaces
export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ComparisonData {
  eventId: string;
  eventTitle: string;
  metrics: {
    [key: string]: number;
  };
}

// Real-time WebSocket events
export interface LiveAnalyticsEvent {
  type: 'metrics_update' | 'viewer_join' | 'viewer_leave' | 'engagement' | 'quality_change';
  eventId: string;
  timestamp: number;
  data: any;
}

// Alert interfaces
export interface AnalyticsAlert {
  id: string;
  eventId: string;
  type: 'performance' | 'engagement' | 'quality' | 'cost';
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

// Export/Report interfaces
export interface ReportConfig {
  type: 'real_time_snapshot' | 'historical_summary' | 'comparative_analysis';
  eventIds: string[];
  dateRange: DateRange;
  format: 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  sections: string[];
}

// Dashboard state interface
export interface AnalyticsDashboardState {
  filters: AnalyticsFilters;
  selectedEvents: string[];
  viewMode: 'overview' | 'detailed' | 'comparative';
  liveEvents: AnalyticsEvent[];
  historicalEvents: AnalyticsEvent[];
  alerts: AnalyticsAlert[];
  isLoading: boolean;
  error?: string;
}