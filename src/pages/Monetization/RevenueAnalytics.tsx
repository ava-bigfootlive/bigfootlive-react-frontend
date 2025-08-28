import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  CreditCard,
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Globe,
  Zap,
  Target
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { addDays, format } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
  ppv: number;
  gifts: number;
  ads: number;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

export const RevenueAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sample revenue data
  const revenueData: RevenueData[] = [
    { date: '2024-01-01', revenue: 12000, subscriptions: 8000, ppv: 2500, gifts: 1000, ads: 500 },
    { date: '2024-01-02', revenue: 15000, subscriptions: 8200, ppv: 4500, gifts: 1500, ads: 800 },
    { date: '2024-01-03', revenue: 13500, subscriptions: 8100, ppv: 3200, gifts: 1200, ads: 1000 },
    { date: '2024-01-04', revenue: 18000, subscriptions: 8300, ppv: 6500, gifts: 2200, ads: 1000 },
    { date: '2024-01-05', revenue: 16500, subscriptions: 8400, ppv: 5000, gifts: 2100, ads: 1000 },
    { date: '2024-01-06', revenue: 14000, subscriptions: 8500, ppv: 3500, gifts: 1500, ads: 500 },
    { date: '2024-01-07', revenue: 19000, subscriptions: 8600, ppv: 7000, gifts: 2400, ads: 1000 },
  ];

  const revenueBySource = [
    { name: 'Subscriptions', value: 58000, percentage: 62, color: '#8b5cf6' },
    { name: 'Pay-Per-View', value: 24000, percentage: 26, color: '#3b82f6' },
    { name: 'Virtual Gifts', value: 8000, percentage: 9, color: '#10b981' },
    { name: 'Advertising', value: 3000, percentage: 3, color: '#f59e0b' }
  ];

  const topPerformers = [
    { name: 'Championship Finals 2024', type: 'PPV Event', revenue: 45000, growth: 125 },
    { name: 'Premium Monthly', type: 'Subscription', revenue: 35000, growth: 15 },
    { name: 'Concert Series', type: 'PPV Event', revenue: 28000, growth: 85 },
    { name: 'VIP Annual', type: 'Subscription', revenue: 25000, growth: 20 },
    { name: 'Workshop Bundle', type: 'Bundle', revenue: 18000, growth: 45 }
  ];

  const metrics: MetricCard[] = [
    { title: 'Total Revenue', value: '$93,000', change: 12.5, icon: DollarSign },
    { title: 'Active Subscribers', value: '4,250', change: 8.2, icon: Users },
    { title: 'Average Order Value', value: '$42.50', change: 5.1, icon: ShoppingCart },
    { title: 'Conversion Rate', value: '4.8%', change: -2.3, icon: Target }
  ];

  const exportData = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Subscriptions', 'PPV', 'Gifts', 'Ads'],
      ...revenueData.map(row => [
        row.date,
        row.revenue,
        row.subscriptions,
        row.ppv,
        row.gifts,
        row.ads
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your revenue streams</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs flex items-center gap-1 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(metric.change)}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Revenue by Source
            </CardTitle>
            <CardDescription>Breakdown of revenue streams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={revenueBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {revenueBySource.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-sm">{source.name}</span>
                  </div>
                  <span className="text-sm font-medium">${source.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streams">Revenue Streams</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="streams">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Stream Analysis</CardTitle>
              <CardDescription>Detailed breakdown by revenue type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subscriptions" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="ppv" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="gifts" stackId="a" fill="#10b981" />
                  <Bar dataKey="ads" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid gap-4 md:grid-cols-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$58,000</p>
                    <Progress value={62} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pay-Per-View</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$24,000</p>
                    <Progress value={26} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Virtual Gifts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$8,000</p>
                    <Progress value={9} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Advertising</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$3,000</p>
                    <Progress value={3} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Your highest revenue generating content</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>${item.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.growth > 50 ? (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium">+{item.growth}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Insight:</strong> PPV events are showing 85% average growth. Consider increasing event frequency.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Revenue Distribution</CardTitle>
              <CardDescription>Revenue breakdown by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-4">Top Countries</h4>
                  <div className="space-y-4">
                    {[
                      { country: 'United States', revenue: 45000, percentage: 48 },
                      { country: 'United Kingdom', revenue: 18000, percentage: 19 },
                      { country: 'Canada', revenue: 12000, percentage: 13 },
                      { country: 'Australia', revenue: 9000, percentage: 10 },
                      { country: 'Germany', revenue: 5000, percentage: 5 },
                      { country: 'Others', revenue: 4000, percentage: 5 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.country}</span>
                          </div>
                          <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Regional Insights</h4>
                  <div className="space-y-3">
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        North America accounts for 61% of total revenue
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        European markets showing 25% month-over-month growth
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        Consider localized content for UK market (19% revenue share)
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>Projected revenue based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={[
                  ...revenueData,
                  { date: '2024-01-08', revenue: 20000, projected: true },
                  { date: '2024-01-09', revenue: 21500, projected: true },
                  { date: '2024-01-10', revenue: 22000, projected: true },
                  { date: '2024-01-11', revenue: 23500, projected: true },
                  { date: '2024-01-12', revenue: 24000, projected: true }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeDasharray="5 5"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>

              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Next 30 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$125,000</p>
                    <p className="text-xs text-muted-foreground">Projected revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">+15.2%</p>
                    <p className="text-xs text-muted-foreground">Expected increase</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mt-6">
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Based on current growth patterns, you're on track to exceed monthly revenue goals by 12%
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalytics;