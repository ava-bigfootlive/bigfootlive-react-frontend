import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeSeriesData, ComparisonData } from '../../types/analytics';
import { DataSourceBadge } from './DataSourceBadge';
import { cn } from '../../lib/utils';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(label).toLocaleString()}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Real-time Viewer Chart
interface ViewerTimeSeriesChartProps {
  data: TimeSeriesData[];
  isLive?: boolean;
  title?: string;
  className?: string;
  showPeakLine?: boolean;
}

export function ViewerTimeSeriesChart({ 
  data, 
  isLive = false, 
  title = "Viewer Count", 
  className,
  showPeakLine = false
}: ViewerTimeSeriesChartProps) {
  const peakValue = Math.max(...data.map(d => d.value));
  const formatXAxis = (tickItem: any) => {
    const date = new Date(tickItem);
    return isLive ? date.toLocaleTimeString() : date.toLocaleDateString();
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isLive && <DataSourceBadge source="live" />}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={isLive ? 3 : 2}
              fill="url(#viewerGradient)"
              dot={false}
              activeDot={{ r: 6, fill: "#3B82F6" }}
            />
            {showPeakLine && (
              <ReferenceLine 
                y={peakValue} 
                stroke="#EF4444" 
                strokeDasharray="5 5"
                label={{ value: `Peak: ${peakValue.toLocaleString()}`, position: "top" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Engagement Chart
interface EngagementChartProps {
  data: TimeSeriesData[];
  title?: string;
  className?: string;
}

export function EngagementChart({ data, title = "Engagement Over Time", className }: EngagementChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Stream Quality Chart
interface StreamQualityChartProps {
  bitrateData: TimeSeriesData[];
  frameRateData: TimeSeriesData[];
  latencyData: TimeSeriesData[];
  className?: string;
}

export function StreamQualityChart({ 
  bitrateData, 
  frameRateData, 
  latencyData, 
  className 
}: StreamQualityChartProps) {
  // Combine data for synchronized display
  const combinedData = bitrateData.map((bitrate, index) => ({
    timestamp: bitrate.timestamp,
    bitrate: bitrate.value / 1000, // Convert to kbps
    frameRate: frameRateData[index]?.value || 0,
    latency: latencyData[index]?.value || 0,
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Stream Quality Metrics
          <DataSourceBadge source="live" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bitrate"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Bitrate (kbps)"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="frameRate"
              stroke="#10B981"
              strokeWidth={2}
              name="Frame Rate (fps)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="latency"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Latency (ms)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Geographic Distribution Chart
interface GeographicChartProps {
  data: { country: string; viewers: number; percentage: number }[];
  className?: string;
}

export function GeographicChart({ data, className }: GeographicChartProps) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">Viewer Distribution by Country</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="viewers"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, _name: any, props: any) => [
                `${value.toLocaleString()} viewers (${props.payload.percentage.toFixed(1)}%)`,
                props.payload.country
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Comparison Chart
interface ComparisonChartProps {
  data: ComparisonData[];
  metricKey: string;
  metricLabel: string;
  className?: string;
}

export function ComparisonChart({ data, metricKey, metricLabel, className }: ComparisonChartProps) {
  const chartData = data.map(item => ({
    event: item.eventTitle.length > 20 ? `${item.eventTitle.slice(0, 20)}...` : item.eventTitle,
    value: item.metrics[metricKey] || 0,
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">{metricLabel} Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="event" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => 
                value > 1000 ? `${(value/1000).toFixed(1)}k` : value
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Resource Usage Chart (for Container Health)
interface ResourceUsageChartProps {
  cpuData: TimeSeriesData[];
  memoryData: TimeSeriesData[];
  className?: string;
}

export function ResourceUsageChart({ cpuData, memoryData, className }: ResourceUsageChartProps) {
  const combinedData = cpuData.map((cpu, index) => ({
    timestamp: cpu.timestamp,
    cpu: cpu.value,
    memory: memoryData[index]?.value || 0,
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Container Resource Usage
          <DataSourceBadge source="live" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={combinedData}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="cpu"
              stackId="1"
              stroke="#EF4444"
              fill="url(#cpuGradient)"
              name="CPU Usage"
            />
            <Area
              type="monotone"
              dataKey="memory"
              stackId="2"
              stroke="#3B82F6"
              fill="url(#memoryGradient)"
              name="Memory Usage"
            />
            <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Revenue Chart
interface RevenueChartProps {
  data: TimeSeriesData[];
  title?: string;
  className?: string;
}

export function RevenueChart({ data, title = "Revenue Over Time", className }: RevenueChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#10B981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}