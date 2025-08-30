import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { analyticsService } from '../services/analytics';
import type {
  LiveMetrics,
  AnalyticsFilters,
  LiveAnalyticsEvent,
  AnalyticsAlert,
  DataSource,
  DateRange,
} from '../types/analytics';

// Main Analytics Hook
export function useAnalytics(initialFilters?: Partial<AnalyticsFilters>) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
      preset: 'month',
    },
    eventIds: [],
    eventTypes: [],
    statuses: [],
    viewerRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
    engagementLevel: [],
    dataSource: ['live', 'historical'],
    ...initialFilters,
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparative'>('overview');

  // Live Events Query
  const {
    data: liveEvents = [],
    isLoading: liveEventsLoading,
    error: liveEventsError,
  } = useQuery({
    queryKey: ['analytics', 'live-events'],
    queryFn: () => analyticsService.getLiveEvents(),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: filters.dataSource.includes('live'),
  });

  // Historical Events Query
  const {
    data: historicalEvents = [],
    isLoading: historicalEventsLoading,
    error: historicalEventsError,
  } = useQuery({
    queryKey: ['analytics', 'historical-events', filters],
    queryFn: () => analyticsService.getHistoricalEvents(filters),
    enabled: filters.dataSource.includes('historical'),
  });

  // Dashboard Overview Query
  const {
    data: dashboardOverview,
    isLoading: dashboardLoading,
  } = useQuery({
    queryKey: ['analytics', 'dashboard-overview', filters.dateRange],
    queryFn: () => analyticsService.getDashboardOverview(filters.dateRange),
  });

  // Alerts Query
  const {
    data: alerts = [],
    isLoading: alertsLoading,
  } = useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: () => analyticsService.getAnalyticsAlerts(),
    refetchInterval: 60000, // Refetch every minute
  });

  // Combined events list with proper filtering
  const filteredEvents = useMemo(() => {
    const allEvents = [
      ...liveEvents.map(e => ({ ...e, dataSource: 'live' as DataSource })),
      ...historicalEvents.map(e => ({ ...e, dataSource: 'historical' as DataSource })),
    ];

    return allEvents.filter(event => {
      // Filter by event IDs if specified
      if (filters.eventIds.length > 0 && !filters.eventIds.includes(event.id)) {
        return false;
      }

      // Filter by event types
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.type)) {
        return false;
      }

      // Filter by status
      if (filters.statuses.length > 0 && !filters.statuses.includes(event.status)) {
        return false;
      }

      // Filter by viewer range
      const viewers = event.quickStats.currentViewers ?? event.quickStats.totalViews ?? 0;
      if (viewers < filters.viewerRange.min || viewers > filters.viewerRange.max) {
        return false;
      }

      // Filter by engagement level
      if (filters.engagementLevel.length > 0) {
        const engagement = event.quickStats.engagementScore;
        const level = engagement >= 70 ? 'high' : engagement >= 40 ? 'medium' : 'low';
        if (!filters.engagementLevel.includes(level)) {
          return false;
        }
      }

      return true;
    });
  }, [liveEvents, historicalEvents, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Date range presets
  const setDateRangePreset = useCallback((preset: DateRange['preset']) => {
    if (!preset) return;

    const now = new Date();
    let start: Date;

    switch (preset) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    updateFilters({
      dateRange: { start, end: now, preset },
    });
  }, [updateFilters]);

  const isLoading = liveEventsLoading || historicalEventsLoading || dashboardLoading;
  const error = liveEventsError || historicalEventsError;

  return {
    // Data
    liveEvents,
    historicalEvents,
    filteredEvents,
    dashboardOverview,
    alerts,
    
    // State
    filters,
    selectedEvents,
    viewMode,
    
    // Actions
    updateFilters,
    setDateRangePreset,
    setSelectedEvents,
    setViewMode,
    
    // Loading states
    isLoading,
    liveEventsLoading,
    historicalEventsLoading,
    dashboardLoading,
    alertsLoading,
    
    // Errors
    error,
  };
}

// Live Event Analytics Hook
export function useLiveEventAnalytics(eventId: string) {
  const { subscribe, isConnected } = useWebSocket();
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Initial metrics fetch
  const {
    data: initialMetrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', 'live-metrics', eventId],
    queryFn: () => analyticsService.getLiveMetrics(eventId),
    enabled: !!eventId,
  });

  // Set up real-time WebSocket connection
  useEffect(() => {
    if (!eventId || !isConnected()) return;

    setConnectionStatus('connecting');

    // Subscribe to live analytics events
    const unsubscribe = subscribe(`analytics:${eventId}`, (event: LiveAnalyticsEvent) => {
      setConnectionStatus('connected');
      
      switch (event.type) {
        case 'metrics_update':
          setLiveMetrics(prev => ({
            ...prev,
            ...event.data,
            timestamp: event.timestamp,
          }));
          break;
        case 'viewer_join':
        case 'viewer_leave':
          setLiveMetrics(prev => prev ? {
            ...prev,
            currentViewers: event.data.currentViewers,
            peakViewers: Math.max(prev.peakViewers, event.data.currentViewers),
            timestamp: event.timestamp,
          } : null);
          break;
        case 'engagement':
          setLiveMetrics(prev => prev ? {
            ...prev,
            interactions: {
              ...prev.interactions,
              ...event.data,
            },
            timestamp: event.timestamp,
          } : null);
          break;
        case 'quality_change':
          setLiveMetrics(prev => prev ? {
            ...prev,
            streamQuality: {
              ...prev.streamQuality,
              ...event.data,
            },
            timestamp: event.timestamp,
          } : null);
          break;
      }
    });

    // Initial connection
    subscribe(`connect:analytics:${eventId}`, () => {
      setConnectionStatus('connected');
    });

    // Handle disconnect
    subscribe(`disconnect:analytics:${eventId}`, () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      unsubscribe();
      setConnectionStatus('disconnected');
    };
  }, [eventId, subscribe, isConnected]);

  // Initialize metrics from initial fetch
  useEffect(() => {
    if (initialMetrics && !liveMetrics) {
      setLiveMetrics(initialMetrics as any);
    }
  }, [initialMetrics, liveMetrics]);

  return {
    metrics: liveMetrics,
    connectionStatus,
    isLoading: isLoading && !liveMetrics,
    error,
  };
}

// Historical Event Analytics Hook
export function useHistoricalEventAnalytics(eventId: string) {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', 'historical-metrics', eventId],
    queryFn: () => analyticsService.getHistoricalMetrics(eventId, {}),
    enabled: !!eventId,
  });

  const {
    data: retentionCurve,
    isLoading: retentionLoading,
  } = useQuery({
    queryKey: ['analytics', 'retention-curve', eventId],
    queryFn: () => analyticsService.getRetentionCurve(eventId),
    enabled: !!eventId,
  });

  const {
    data: migrationStatus,
  } = useQuery({
    queryKey: ['analytics', 'migration-status', eventId],
    queryFn: () => analyticsService.getDataMigrationStatus(),
    enabled: !!eventId,
    refetchInterval: 10000, // Check migration status every 10 seconds
  });

  return {
    metrics,
    retentionCurve,
    migrationStatus,
    isLoading: isLoading || retentionLoading,
    error,
  };
}

// Comparative Analytics Hook
export function useComparativeAnalytics(eventIds: string[]) {
  const {
    data: comparison,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['analytics', 'comparative', eventIds.sort()],
    queryFn: () => analyticsService.getComparativeAnalysis(eventIds),
    enabled: eventIds.length >= 2,
  });

  return {
    comparison,
    isLoading,
    error,
  };
}

// Alerts Management Hook
export function useAnalyticsAlerts() {
  const queryClient = useQueryClient();

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => analyticsService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: (alert: Partial<AnalyticsAlert>) => analyticsService.createAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'alerts'] });
    },
  });

  return {
    acknowledgeAlert: acknowledgeMutation.mutate,
    createAlert: createAlertMutation.mutate,
    isAcknowledging: acknowledgeMutation.isPending,
    isCreating: createAlertMutation.isPending,
  };
}

// Export Hook
export function useAnalyticsExport() {
  const [reportStatus, setReportStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateReportMutation = useMutation({
    mutationFn: analyticsService.generateReport,
    onMutate: () => {
      setReportStatus('generating');
      setDownloadUrl(null);
    },
    onSuccess: (response) => {
      setDownloadUrl(response.downloadUrl);
      setReportStatus('completed');
    },
    onError: () => {
      setReportStatus('failed');
    },
  });

  return {
    generateReport: generateReportMutation.mutate,
    reportStatus,
    downloadUrl,
    isGenerating: reportStatus === 'generating',
  };
}