import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Monitor, 
  Cpu, 
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import type { AnalyticsEvent } from '../../types/analytics';
import { DataSourceBadge, ConnectionStatus, MigrationProgress } from './DataSourceBadge';
import { useLiveEventAnalytics } from '../../hooks/useAnalytics';
import { cn } from '../../lib/utils';

interface LiveEventCardProps {
  event: AnalyticsEvent;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function LiveEventCard({ 
  event, 
  onClick, 
  className,
  showDetails = false 
}: LiveEventCardProps) {
  const { metrics, connectionStatus, isLoading } = useLiveEventAnalytics(event.id);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getResourceColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const currentTime = Date.now();
  const startTime = new Date(event.startTime).getTime();
  const duration = Math.floor((currentTime - startTime) / 1000);

  return (
    <Card 
      className={cn(
        'group hover:shadow-lg transition-all duration-200',
        'border-l-4 border-l-green-500',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold truncate">
                {event.title}
              </CardTitle>
              <DataSourceBadge source={event.dataSource} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Badge variant="outline" className="text-xs">
                {event.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <span>Started {formatDuration(duration)} ago</span>
            </div>
          </div>
          
          {onClick && (
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <ExternalLink size={16} />
            </Button>
          )}
        </div>

        <ConnectionStatus status={connectionStatus} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-blue-500" size={20} />
            <div>
              <div className="font-semibold text-lg">
                {formatNumber(metrics?.currentViewers || event.quickStats.currentViewers || 0)}
              </div>
              <div className="text-xs text-gray-500">Current Viewers</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            <div>
              <div className="font-semibold text-lg">
                {formatNumber(event.quickStats.peakViewers)}
              </div>
              <div className="text-xs text-gray-500">Peak Viewers</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="text-purple-500" size={20} />
            <div>
              <div className="font-semibold text-lg">
                {metrics?.chatRate?.toFixed(0) || '0'}/min
              </div>
              <div className="text-xs text-gray-500">Chat Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="text-orange-500" size={20} />
            <div>
              <div className={cn(
                'font-semibold text-lg',
                getEngagementColor(event.quickStats.engagementScore)
              )}>
                {event.quickStats.engagementScore}%
              </div>
              <div className="text-xs text-gray-500">Engagement</div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetails && metrics && (
          <>
            {/* Stream Quality */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Monitor size={16} />
                Stream Quality
              </h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold">
                    {(metrics.streamQuality.bitrate / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-gray-500">Bitrate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{metrics.streamQuality.frameRate}</div>
                  <div className="text-xs text-gray-500">FPS</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{metrics.streamQuality.latency}ms</div>
                  <div className="text-xs text-gray-500">Latency</div>
                </div>
              </div>
            </div>

            {/* Container Health */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Cpu size={16} />
                Container Health
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">{metrics.containerHealth.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full transition-all duration-500 ease-out", getResourceColor(metrics.containerHealth.cpu))}
                    style={{ width: `${Math.min(metrics.containerHealth.cpu, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-medium">{metrics.containerHealth.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={cn("h-2 rounded-full transition-all duration-500 ease-out", getResourceColor(metrics.containerHealth.memory))}
                    style={{ width: `${Math.min(metrics.containerHealth.memory, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Real-time Interactions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Live Interactions</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-semibold">{metrics.interactions.reactions}</div>
                  <div className="text-gray-500">Reactions</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-semibold">{metrics.interactions.polls}</div>
                  <div className="text-gray-500">Polls</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-semibold">{metrics.interactions.questions}</div>
                  <div className="text-gray-500">Q&A</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alerts */}
        {metrics && (
          <>
            {metrics.containerHealth.cpu > 80 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-sm">
                <AlertTriangle size={16} />
                High CPU usage detected
              </div>
            )}
            {metrics.streamQuality.droppedFrames > 100 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded text-sm">
                <AlertTriangle size={16} />
                Frame drops detected
              </div>
            )}
          </>
        )}

        {/* Migration Status */}
        {event.dataSource === 'migrating' && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-yellow-600">Data Migration</h4>
            <MigrationProgress progress={75} estimatedCompletion="2024-03-15T10:30:00Z" />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !metrics && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-gray-500">Loading live metrics...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Live Events Grid Component
interface LiveEventsGridProps {
  events: AnalyticsEvent[];
  onEventClick?: (eventId: string) => void;
  className?: string;
  showDetails?: boolean;
}

export function LiveEventsGrid({ 
  events, 
  onEventClick, 
  className,
  showDetails = false 
}: LiveEventsGridProps) {
  if (events.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}>
        <Activity className="w-12 h-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No Live Events
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          There are currently no active streaming events
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
      className
    )}>
      {events.map(event => (
        <LiveEventCard
          key={event.id}
          event={event}
          onClick={onEventClick ? () => onEventClick(event.id) : undefined}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
}