import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  PlayCircle, 
  Calendar,
  TrendingUp,
  PlusCircle,
  BarChart3
} from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  totalEvents: number;
  activeStreams: number;
  totalViewers: number;
  upcomingEvents: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeStreams: 0,
    totalViewers: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch events from API
      const eventsResponse = await api.getEvents();
      const events = Array.isArray(eventsResponse) ? eventsResponse : [];
      
      // Calculate stats from real data
      const activeStreams = events.filter((e: any) => e.status === 'live').length;
      const upcomingEvents = events.filter((e: any) => e.status === 'scheduled' || e.status === 'upcoming').length;
      const totalViewers = events.reduce((sum: number, e: any) => sum + (e.viewer_count || 0), 0);
      
      setStats({
        totalEvents: events.length,
        activeStreams,
        totalViewers,
        upcomingEvents
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Don't use mock data - show real state
      setStats({
        totalEvents: 0,
        activeStreams: 0,
        totalViewers: 0,
        upcomingEvents: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Streams',
      value: stats.activeStreams,
      icon: PlayCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Viewers',
      value: stats.totalViewers,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.given_name || user?.email}`}
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/streaming')}
            className="h-20 text-left justify-start bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            variant="outline"
          >
            <PlusCircle className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Create Event</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Start a new streaming event</div>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/streaming/live')}
            className="h-20 text-left justify-start bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            variant="outline"
          >
            <PlayCircle className="h-6 w-6 mr-3 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Go Live</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Start streaming now</div>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/analytics')}
            className="h-20 text-left justify-start bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
            variant="outline"
          >
            <BarChart3 className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">View Analytics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Check your performance</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '...' : stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Events</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Your latest streaming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading events...</p>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent events</p>
                  <Button 
                    onClick={() => navigate('/streaming')}
                    className="mt-4"
                    size="sm"
                  >
                    Create your first event
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Performance</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Last 7 days overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading performance data...</p>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No performance data yet</p>
                  <p className="text-sm mt-2">Start streaming to see your analytics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}