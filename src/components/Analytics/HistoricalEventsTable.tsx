import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { AnalyticsEvent, EventType, EventStatus } from '../../types/analytics';
import { DataSourceBadge, MigrationProgress } from './DataSourceBadge';
import { cn } from '../../lib/utils';

interface HistoricalEventsTableProps {
  events: AnalyticsEvent[];
  onEventClick?: (eventId: string) => void;
  onExportEvent?: (eventId: string) => void;
  className?: string;
  compact?: boolean;
}

export function HistoricalEventsTable({
  events,
  onEventClick,
  onExportEvent,
  className,
  compact = false,
}: HistoricalEventsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // const formatCurrency = (amount: number): string => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //   }).format(amount);
  // };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      case 'scheduled': return 'bg-blue-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case 'live_stream': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'sim_live': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'rebroadcast': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'webinar': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'conference': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const columns: ColumnDef<AnalyticsEvent>[] = useMemo(() => {
    const baseColumns: ColumnDef<AnalyticsEvent>[] = [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Event Title
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const event = row.original;
          return (
            <div className="space-y-1">
              <div className="font-medium text-gray-900 dark:text-white">
                {event.title}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', getTypeColor(event.type))}
                >
                  {event.type.replace('_', ' ').toUpperCase()}
                </Badge>
                <DataSourceBadge source={event.dataSource} />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'startTime',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Date
            {column.getIsSorted() && (
              column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.startTime);
          return (
            <div className="text-sm">
              <div className="font-medium">{date.toLocaleDateString()}</div>
              <div className="text-gray-500">{date.toLocaleTimeString()}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={cn('text-xs', getStatusColor(row.original.status))}>
            {row.original.status.toUpperCase()}
          </Badge>
        ),
      },
    ];

    // Add detailed columns if not in compact mode
    if (!compact) {
      baseColumns.push(
        {
          accessorKey: 'quickStats.totalViews',
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              <Users className="mr-2 h-4 w-4" />
              Total Views
              {column.getIsSorted() && (
                column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          ),
          cell: ({ row }) => (
            <div className="font-medium">
              {formatNumber(row.original.quickStats.totalViews || 0)}
            </div>
          ),
        },
        {
          accessorKey: 'quickStats.peakViewers',
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Peak Viewers
              {column.getIsSorted() && (
                column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          ),
          cell: ({ row }) => (
            <div className="font-medium">
              {formatNumber(row.original.quickStats.peakViewers)}
            </div>
          ),
        },
        {
          accessorKey: 'quickStats.engagementScore',
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Engagement
              {column.getIsSorted() && (
                column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          ),
          cell: ({ row }) => {
            const score = row.original.quickStats.engagementScore;
            const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600';
            return (
              <div className={cn('font-medium', color)}>
                {score}%
              </div>
            );
          },
        },
        {
          accessorKey: 'quickStats.duration',
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-auto p-0 font-semibold"
            >
              <Clock className="mr-2 h-4 w-4" />
              Duration
              {column.getIsSorted() && (
                column.getIsSorted() === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          ),
          cell: ({ row }) => (
            <div className="font-medium">
              {formatDuration(row.original.quickStats.duration)}
            </div>
          ),
        }
      );
    }

    // Actions column
    baseColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEventClick?.(event.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportEvent?.(event.id)}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });

    return baseColumns;
  }, [compact, onEventClick, onExportEvent]);

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: compact ? 5 : 10,
      },
    },
  });

  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No Historical Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No events found matching your criteria
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Historical Events</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search events..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Migration Status for events being migrated */}
        {events.some(e => e.dataSource === 'migrating') && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Data Migration in Progress
            </h4>
            <div className="space-y-2">
              {events.filter(e => e.dataSource === 'migrating').map(event => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    {event.title}
                  </span>
                  <MigrationProgress 
                    progress={75} 
                    estimatedCompletion="2024-03-15T10:30:00Z"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => onEventClick?.(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 pt-4">
          <div className="text-sm text-gray-500">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              events.length
            )}{' '}
            of {events.length} events
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}