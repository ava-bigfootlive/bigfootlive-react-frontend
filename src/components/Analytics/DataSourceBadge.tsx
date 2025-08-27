import { Badge } from '@/components/ui/badge';
import { Activity, Database, RefreshCw, Clock } from 'lucide-react';
import type { DataSource } from '../../types/analytics';
import { cn } from '../../lib/utils';

interface DataSourceBadgeProps {
  source: DataSource;
  lastUpdated?: number;
  className?: string;
  showTimestamp?: boolean;
}

export function DataSourceBadge({ 
  source, 
  lastUpdated, 
  className,
  showTimestamp = false 
}: DataSourceBadgeProps) {
  const getSourceConfig = (source: DataSource) => {
    switch (source) {
      case 'live':
        return {
          label: 'LIVE',
          icon: Activity,
          variant: 'default' as const,
          className: 'bg-green-500 text-white hover:bg-green-600 animate-pulse',
          description: 'Real-time data from event container',
        };
      case 'historical':
        return {
          label: 'HISTORICAL',
          icon: Database,
          variant: 'secondary' as const,
          className: 'bg-blue-500 text-white hover:bg-blue-600',
          description: 'Platform analytics data',
        };
      case 'migrating':
        return {
          label: 'MIGRATING',
          icon: RefreshCw,
          variant: 'outline' as const,
          className: 'bg-yellow-500 text-white hover:bg-yellow-600',
          description: 'Data being transferred to platform',
        };
      default:
        return {
          label: 'UNKNOWN',
          icon: Clock,
          variant: 'outline' as const,
          className: 'bg-gray-500 text-white',
          description: 'Unknown data source',
        };
    }
  };

  const config = getSourceConfig(source);
  const Icon = config.icon;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 24 hours
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant={config.variant}
        className={cn(
          'flex items-center gap-1 font-medium',
          config.className,
          source === 'migrating' && 'animate-pulse'
        )}
        title={config.description}
      >
        <Icon size={12} />
        {config.label}
      </Badge>
      
      {showTimestamp && lastUpdated && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimestamp(lastUpdated)}
        </span>
      )}
    </div>
  );
}

// Connection Status Indicator for Live Data
interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
  className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const getStatusConfig = (status: ConnectionStatusProps['status']) => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          label: 'Connected',
          className: 'text-green-700 dark:text-green-400',
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          label: 'Connecting...',
          className: 'text-yellow-700 dark:text-yellow-400 animate-pulse',
        };
      case 'disconnected':
        return {
          color: 'bg-red-500',
          label: 'Disconnected',
          className: 'text-red-700 dark:text-red-400',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'w-2 h-2 rounded-full',
          config.color,
          status === 'connecting' && 'animate-pulse'
        )}
      />
      <span className={cn('text-xs font-medium', config.className)}>
        {config.label}
      </span>
    </div>
  );
}

// Migration Progress Indicator
interface MigrationProgressProps {
  progress: number;
  estimatedCompletion?: string;
  className?: string;
}

export function MigrationProgress({ 
  progress, 
  estimatedCompletion, 
  className 
}: MigrationProgressProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-yellow-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {progress.toFixed(0)}%
        {estimatedCompletion && (
          <div className="text-xs text-gray-500">
            ETA: {new Date(estimatedCompletion).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}