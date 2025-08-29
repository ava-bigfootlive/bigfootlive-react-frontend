import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Plus,
  Search,
  Radio,
  Users,
  Play,
  Clock
} from 'lucide-react';
import eventService from '../services/eventService';
import { format } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Event {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
  scheduled_start?: string;
  viewer_count?: number;
}

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.listEvents();
      const eventsData = response.items || [];
      setEvents(eventsData);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Events
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your streaming events
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/streaming/live')}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-800"
          />
        </div>

        {/* Events Grid */}
        {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Clock className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => navigate(`/streaming/live?event=${event.id}`)}
              className="w-full text-left p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    {event.status === 'live' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-950/30 text-red-600 text-xs rounded-full">
                        <Radio className="h-3 w-3" />
                        Live
                      </span>
                    )}
                  </div>
                  {event.scheduled_start && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(event.scheduled_start), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
                {event.status === 'scheduled' && (
                  <Play className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
          ))}
          </div>
        ) : (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No events
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Create your first event to get started
          </p>
          <Button
            onClick={() => navigate('/streaming/live')}
            className="bg-black dark:bg-white text-white dark:text-black"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          </div>
        )}
      </div>
    </div>
  );
}