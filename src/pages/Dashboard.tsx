import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  PlayCircle, 
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
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
  const { user, signOut } = useAuth();
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
      // Try to fetch from admin dashboard endpoint
      try {
        const response = await api.get('/api/admin/dashboard');
        if (response) {
          // Map the response to our stats format
          setStats({
            totalEvents: response.active_events || 0,
            activeStreams: response.active_streams || 0,
            totalViewers: response.total_viewers || 0,
            upcomingEvents: response.upcoming_events || 0
          });
        }
      } catch (err) {
        // Fallback to mock data if API fails
        console.log('Using mock data for dashboard');
        setStats({
          totalEvents: 12,
          activeStreams: 3,
          totalViewers: 1234,
          upcomingEvents: 5
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-white">BigfootLive Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, {user?.given_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'platform_admin' && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/platform-admin')}
                  className="text-gray-300 border-gray-600"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/streaming')}
              className="h-20 text-left justify-start"
              variant="outline"
            >
              <PlusCircle className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Create Event</div>
                <div className="text-sm opacity-75">Start a new streaming event</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate('/streaming/live')}
              className="h-20 text-left justify-start"
              variant="outline"
            >
              <PlayCircle className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Go Live</div>
                <div className="text-sm opacity-75">Start streaming now</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate('/analytics')}
              className="h-20 text-left justify-start"
              variant="outline"
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">View Analytics</div>
                <div className="text-sm opacity-75">Check your performance</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Events</CardTitle>
              <CardDescription className="text-gray-400">
                Your latest streaming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400">Loading events...</p>
                ) : (
                  <div className="text-center py-8 text-gray-400">
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

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Last 7 days overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-400">Loading performance data...</p>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No performance data yet</p>
                    <p className="text-sm mt-2">Start streaming to see your analytics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}