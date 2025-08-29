import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Plus,
  Search,
  Radio,
  Clock,
  Users,
  MoreVertical,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import eventService from '../services/eventService';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
  scheduled_start?: string;
  viewer_count?: number;
}

export default function EventsPage() {
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
      console.error('Failed to load events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  return (
    <div className="min-h-screen">
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
            <Button
              onClick={() => navigate('/events/new')}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 dark:border-gray-800"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center text-gray-500">
              <Clock className="mr-2 h-5 w-5 animate-spin" />
              Loading events...
            </div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="group rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status === 'live' && <Radio className="mr-1 h-3 w-3" />}
                        {event.status}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {event.scheduled_start && (
                        <div className="flex items-center">
                          <Calendar className="mr-1.5 h-4 w-4" />
                          {format(new Date(event.scheduled_start), 'MMM d, yyyy h:mm a')}
                        </div>
                      )}
                      {event.viewer_count !== undefined && event.viewer_count > 0 && (
                        <div className="flex items-center">
                          <Users className="mr-1.5 h-4 w-4" />
                          {event.viewer_count} viewers
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {event.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/streaming/live?event=${event.id}`)}
                        className="border-gray-200 dark:border-gray-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-200 dark:border-gray-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first event to start streaming
            </p>
            <Button
              onClick={() => navigate('/events/new')}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}