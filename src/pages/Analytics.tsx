import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, Users } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <DashboardLayout 
      title="Analytics" 
      subtitle="View your streaming performance and audience insights"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">45,231</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Watch Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24:37</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+5 min from last month</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unique Viewers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3,842</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+8% from last month</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">68%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">+3% from last month</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Viewership Trends</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Daily views over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Performing Streams</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Your most watched events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Product Launch Q1</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">March 15, 2024</p>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">8,432 views</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Team All-Hands</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">March 10, 2024</p>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">5,221 views</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Training Session</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">March 5, 2024</p>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">3,142 views</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}