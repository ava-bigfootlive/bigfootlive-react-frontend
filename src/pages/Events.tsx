import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Search,
  Plus,
  MoreVertical,
  Play,
  CheckCircle
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'live' | 'ended';
  startTime: string;
  duration: string;
  viewers: number;
  maxViewers?: number;
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all');

  const events: Event[] = [
    {
      id: '1',
      name: 'Q1 Product Launch',
      description: 'Introducing our new product line for 2024',
      status: 'live',
      startTime: 'Now',
      duration: '45 mins',
      viewers: 234,
    },
    {
      id: '2',
      name: 'Team All-Hands Meeting',
      description: 'Monthly company-wide update and Q&A',
      status: 'upcoming',
      startTime: 'Tomorrow, 2:00 PM',
      duration: '1 hour',
      viewers: 0,
    },
    {
      id: '3',
      name: 'Developer Workshop',
      description: 'Advanced React patterns and best practices',
      status: 'ended',
      startTime: 'March 15, 2024',
      duration: '2 hours',
      viewers: 456,
      maxViewers: 512,
    },
    {
      id: '4',
      name: 'Customer Success Webinar',
      description: 'Tips and tricks for getting the most out of our platform',
      status: 'ended',
      startTime: 'March 10, 2024',
      duration: '30 mins',
      viewers: 189,
      maxViewers: 245,
    },
    {
      id: '5',
      name: 'Marketing Strategy Session',
      description: 'Planning Q2 marketing campaigns',
      status: 'upcoming',
      startTime: 'Next Week',
      duration: '90 mins',
      viewers: 0,
    },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'ended':
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'live':
        return <Play className="h-3 w-3" />;
      case 'upcoming':
        return <Clock className="h-3 w-3" />;
      case 'ended':
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <DashboardLayout 
      title="Events" 
      subtitle="Manage your streaming events and schedules"
      actions={
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live Now</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'live').length}
                </p>
              </div>
              <Video className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'upcoming').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.reduce((acc, e) => acc + (e.maxViewers || e.viewers), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
          <Button
            variant={filterStatus === 'live' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('live')}
            size="sm"
          >
            Live
          </Button>
          <Button
            variant={filterStatus === 'ended' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('ended')}
            size="sm"
          >
            Ended
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white text-lg">{event.name}</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    {event.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(event.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(event.status)}
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {event.startTime}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {event.duration}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    {event.status === 'ended' && event.maxViewers 
                      ? `${event.maxViewers} max`
                      : `${event.viewers} viewers`}
                  </span>
                </div>

                <div className="flex gap-2">
                  {event.status === 'live' ? (
                    <Button className="flex-1" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      View Stream
                    </Button>
                  ) : event.status === 'upcoming' ? (
                    <Button variant="outline" className="flex-1" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      View Recording
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first event to get started'}
            </p>
            {!searchQuery && (
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}