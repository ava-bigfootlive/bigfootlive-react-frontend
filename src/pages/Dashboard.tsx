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
          <h2 className="text-headline" style={{ color: 'hsl(var(--foreground))' }}>Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/streaming')}
            className="card-modern h-20 text-left justify-start transition-all duration-200 hover:card-elevated"
            variant="outline"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border))',
            }}
          >
            <PlusCircle className="h-6 w-6 mr-3" style={{ color: 'hsl(var(--brand-primary))' }} />
            <div>
              <div className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Create Event</div>
              <div className="text-sm" style={{ color: 'hsl(var(--foreground-secondary))' }}>Start a new streaming event</div>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/streaming/live')}
            className="card-modern h-20 text-left justify-start transition-all duration-200 hover:card-elevated"
            variant="outline"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border))',
            }}
          >
            <PlayCircle className="h-6 w-6 mr-3" style={{ color: 'hsl(var(--success))' }} />
            <div>
              <div className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Go Live</div>
              <div className="text-sm" style={{ color: 'hsl(var(--foreground-secondary))' }}>Start streaming now</div>
            </div>
          </Button>
          <Button
            onClick={() => navigate('/analytics')}
            className="card-modern h-20 text-left justify-start transition-all duration-200 hover:card-elevated"
            variant="outline"
            style={{
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border))',
            }}
          >
            <BarChart3 className="h-6 w-6 mr-3" style={{ color: 'hsl(var(--info))' }} />
            <div>
              <div className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>View Analytics</div>
              <div className="text-sm" style={{ color: 'hsl(var(--foreground-secondary))' }}>Check your performance</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <h2 className="text-headline mb-4" style={{ color: 'hsl(var(--foreground))' }}>Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-modern transition-all duration-200 hover:card-elevated" style={{
                backgroundColor: 'hsl(var(--surface))',
                borderColor: 'hsl(var(--border))',
              }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" style={{ color: 'hsl(var(--foreground-secondary))' }}>
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg transition-all duration-200" style={{ backgroundColor: `hsl(var(--brand-primary) / 0.1)` }}>
                    <Icon className="h-4 w-4" style={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
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
        <Card className="card-modern" style={{
          backgroundColor: 'hsl(var(--surface))',
          borderColor: 'hsl(var(--border))',
        }}>
          <CardHeader>
            <CardTitle style={{ color: 'hsl(var(--foreground))' }}>Recent Events</CardTitle>
            <CardDescription style={{ color: 'hsl(var(--foreground-secondary))' }}>
              Your latest streaming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p style={{ color: 'hsl(var(--foreground-secondary))' }}>Loading events...</p>
              ) : (
                <div className="text-center py-8" style={{ color: 'hsl(var(--foreground-secondary))' }}>
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

        <Card className="card-modern" style={{
          backgroundColor: 'hsl(var(--surface))',
          borderColor: 'hsl(var(--border))',
        }}>
          <CardHeader>
            <CardTitle style={{ color: 'hsl(var(--foreground))' }}>Performance</CardTitle>
            <CardDescription style={{ color: 'hsl(var(--foreground-secondary))' }}>
              Last 7 days overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p style={{ color: 'hsl(var(--foreground-secondary))' }}>Loading performance data...</p>
              ) : (
                <div className="text-center py-8" style={{ color: 'hsl(var(--foreground-secondary))' }}>
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