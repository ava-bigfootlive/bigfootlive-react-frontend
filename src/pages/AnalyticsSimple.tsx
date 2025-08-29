import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const stats = [
    { label: 'Total Views', value: '0', icon: Eye },
    { label: 'Unique Viewers', value: '0', icon: Users },
    { label: 'Avg Duration', value: '0m', icon: Clock },
    { label: 'Peak Viewers', value: '0', icon: TrendingUp }
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
              <Icon className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
        </div>

        {!loading && (
          <div className="p-12 text-center rounded-lg border border-gray-200 dark:border-gray-800">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No analytics data
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start streaming to see your analytics
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}