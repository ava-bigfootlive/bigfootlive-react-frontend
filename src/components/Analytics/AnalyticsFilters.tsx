import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X, CalendarDays } from 'lucide-react';
import type { AnalyticsFilters, DateRange, EventType, EventStatus, EngagementLevel, DataSource } from '../../types/analytics';
import { cn } from '../../lib/utils';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void;
  onPresetSelect: (preset: DateRange['preset']) => void;
  className?: string;
  compactMode?: boolean;
}

const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'live_stream', label: 'Live Stream' },
  { value: 'sim_live', label: 'Sim-Live' },
  { value: 'rebroadcast', label: 'Rebroadcast' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'conference', label: 'Conference' },
];

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'ended', label: 'Ended' },
  { value: 'failed', label: 'Failed' },
  { value: 'scheduled', label: 'Scheduled' },
];

const engagementOptions: { value: EngagementLevel; label: string; color: string }[] = [
  { value: 'high', label: 'High (70%+)', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium (40-69%)', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low (<40%)', color: 'bg-red-500' },
];

const dataSourceOptions: { value: DataSource; label: string; description: string }[] = [
  { value: 'live', label: 'Live Data', description: 'Real-time from event containers' },
  { value: 'historical', label: 'Historical Data', description: 'Platform analytics database' },
  { value: 'migrating', label: 'Migrating Data', description: 'Data being transferred' },
];

const datePresets = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom Range' },
];

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  onPresetSelect,
  className,
  compactMode = false,
}: AnalyticsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(!compactMode);

  const handleEventTypeChange = (type: EventType, checked: boolean) => {
    const newTypes = checked
      ? [...filters.eventTypes, type]
      : filters.eventTypes.filter(t => t !== type);
    onFiltersChange({ eventTypes: newTypes });
  };

  const handleStatusChange = (status: EventStatus, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.statuses, status]
      : filters.statuses.filter(s => s !== status);
    onFiltersChange({ statuses: newStatuses });
  };

  const handleEngagementChange = (level: EngagementLevel, checked: boolean) => {
    const newLevels = checked
      ? [...filters.engagementLevel, level]
      : filters.engagementLevel.filter(l => l !== level);
    onFiltersChange({ engagementLevel: newLevels });
  };

  const handleDataSourceChange = (source: DataSource, checked: boolean) => {
    const newSources = checked
      ? [...filters.dataSource, source]
      : filters.dataSource.filter(s => s !== source);
    onFiltersChange({ dataSource: newSources });
  };

  const handleViewerRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    onFiltersChange({
      viewerRange: {
        ...filters.viewerRange,
        [field]: field === 'max' && numValue === 0 ? Number.MAX_SAFE_INTEGER : numValue,
      },
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      eventIds: [],
      eventTypes: [],
      statuses: [],
      viewerRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
      engagementLevel: [],
      dataSource: ['live', 'historical'],
    });
  };

  const getActiveFilterCount = () => {
    return (
      filters.eventIds.length +
      filters.eventTypes.length +
      filters.statuses.length +
      filters.engagementLevel.length +
      (filters.viewerRange.min > 0 || filters.viewerRange.max < Number.MAX_SAFE_INTEGER ? 1 : 0)
    );
  };

  if (compactMode) {
    return (
      <div className={cn('flex items-center gap-2 flex-wrap', className)}>
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarDays size={16} />
              {filters.dateRange.preset 
                ? datePresets.find(p => p.value === filters.dateRange.preset)?.label
                : 'Custom Range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="space-y-2">
              {datePresets.map(preset => (
                <Button
                  key={preset.value}
                  variant={filters.dateRange.preset === preset.value ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onPresetSelect(preset.value as DateRange['preset'])}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Filters */}
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter size={16} />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter size={20} />
            Analytics Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <>
                <Badge variant="secondary">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              {datePresets.map(preset => (
                <Button
                  key={preset.value}
                  variant={filters.dateRange.preset === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPresetSelect(preset.value as DateRange['preset'])}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Viewer Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min viewers"
                value={filters.viewerRange.min || ''}
                onChange={(e) => handleViewerRangeChange('min', e.target.value)}
                className="w-24"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.viewerRange.max === Number.MAX_SAFE_INTEGER ? '' : filters.viewerRange.max}
                onChange={(e) => handleViewerRangeChange('max', e.target.value)}
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Event Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Event Types</Label>
            <div className="space-y-2">
              {eventTypeOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={filters.eventTypes.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleEventTypeChange(option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`type-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.statuses.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Level */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Engagement Level</Label>
            <div className="space-y-2">
              {engagementOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`engagement-${option.value}`}
                    checked={filters.engagementLevel.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleEngagementChange(option.value, checked as boolean)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', option.color)} />
                    <Label
                      htmlFor={`engagement-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data Source</Label>
            <div className="space-y-2">
              {dataSourceOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${option.value}`}
                    checked={filters.dataSource.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleDataSourceChange(option.value, checked as boolean)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={`source-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}