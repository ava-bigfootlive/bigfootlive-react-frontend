import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  Shield,
  Database,
  BarChart3,
  ArrowLeft,
  Server,
  Bell,
  Flag
} from 'lucide-react';
import api from '../services/api';
import FeatureFlags from './PlatformAdmin/FeatureFlags';
import TenantManagement from './PlatformAdmin/TenantManagement';
import UserManagement from './PlatformAdmin/UserManagement';

interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  activeStreams: number;
  monthlyRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  storageUsed: number;
  storageTotal: number;
}

export default function PlatformAdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalTenants: 0,
    totalUsers: 0,
    activeStreams: 0,
    monthlyRevenue: 0,
    systemHealth: 'healthy',
    storageUsed: 0,
    storageTotal: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'users' | 'billing' | 'system' | 'features'>('overview');

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/platform/admin/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch platform stats:', error);
      setError('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Tenants',
      value: stats.totalTenants,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+23%'
    },
    {
      title: 'Active Streams',
      value: stats.activeStreams,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: '+18%'
    }
  ];

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'system', label: 'System', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Platform Administration</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and monitor the entire BigfootLive platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 text-sm font-medium transition-colors
                    ${activeTab === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loading ? '...' : stat.value}
                      </div>
                      <p className="text-xs text-green-500 mt-1">
                        {stat.change} from last month
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* System Health */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Health</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Overall platform performance and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`flex items-center ${
                      stats.systemHealth === 'healthy' ? 'text-green-500' :
                      stats.systemHealth === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      <Activity className="h-4 w-4 mr-2" />
                      {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Storage Usage</span>
                      <span className="text-foreground">
                        {stats.storageUsed}GB / {stats.storageTotal}GB
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(stats.storageUsed / stats.storageTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Security Settings</p>
                    <p className="text-sm text-muted-foreground">Manage platform security</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Database className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">Monitor database performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Configure alerts</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && <TenantManagement />}

        {/* Users Tab */}
        {activeTab === 'users' && <UserManagement />}

        {/* Feature Flags Tab */}
        {activeTab === 'features' && (
          <FeatureFlags />
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Billing & Revenue</CardTitle>
              <CardDescription className="text-muted-foreground">
                Platform billing and financial overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Billing management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">System Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Platform settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>System configuration interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}