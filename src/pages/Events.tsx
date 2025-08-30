import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Calendar,
  Plus,
  Search,
  Radio,
  Users,
  Play,
  Clock,
  Video,
  Settings,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Filter,
  LayoutGrid,
  List,
  Activity
} from 'lucide-react';
import eventService from '../services/eventService';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Event {
  id: string;
  name?: string;  // Backend uses 'name'
  title?: string;  // For compatibility
  description?: string;
  status?: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
  container_status?: string;  // Backend field
  scheduled_start?: string;
  start_date?: string;  // Backend field
  viewer_count?: number;
  stream_url?: string;
  rtmp_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form state for dialog
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: undefined as Date | undefined,
    scheduledEnd: undefined as Date | undefined
  });

  useEffect(() => {
    loadEvents();
    // Auto-refresh for live events
    const interval = setInterval(loadEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.listEvents();
      const eventsData = response.items || [];
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load events:', err);
      // Show a user-friendly message instead of silently failing
      toast.error('Unable to load events. Please try refreshing the page.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title) {
      toast.error('Please enter an event title');
      return;
    }

    setCreating(true);
    try {
      await eventService.createEvent({
        title: formData.title,
        description: formData.description,
        scheduled_start: formData.scheduledStart?.toISOString(),
        end_date: formData.scheduledEnd?.toISOString()
      });
      
      toast.success('Event created successfully');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        scheduledStart: undefined,
        scheduledEnd: undefined
      });
      loadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      toast.error('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      loadEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      toast.error('Failed to delete event');
    }
  };

  const getEventStatus = (event: Event) => {
    return event.status || 'scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'ended':
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Radio className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'ended':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Filter events based on tab and search
  const getFilteredEvents = () => {
    let filtered = events;
    
    // Filter by tab
    switch (selectedTab) {
      case 'live':
        filtered = events.filter(e => getEventStatus(e) === 'live');
        break;
      case 'scheduled':
        filtered = events.filter(e => getEventStatus(e) === 'scheduled');
        break;
      case 'past':
        filtered = events.filter(e => ['ended', 'completed'].includes(getEventStatus(e)));
        break;
      case 'cancelled':
        filtered = events.filter(e => getEventStatus(e) === 'cancelled');
        break;
      // 'all' shows everything
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        (event.name || event.title || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description || '')?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  const EventCard = ({ event }: { event: Event }) => {
    const status = getEventStatus(event);
    const eventDate = event.scheduled_start || event.start_date;
    
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">
                {event.name || event.title || 'Untitled Event'}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description || 'No description'}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(status)} text-white ml-2`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(status)}
                {status}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(eventDate), 'MMM d, yyyy')}
                </span>
              )}
              {event.viewer_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.viewer_count} viewers
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event.id}/edit`);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEvent(event.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EventListItem = ({ event }: { event: Event }) => {
    const status = getEventStatus(event);
    const eventDate = event.scheduled_start || event.start_date;
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
           onClick={() => navigate(`/events/${event.id}`)}>
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${getStatusColor(status)} bg-opacity-10`}>
            {getStatusIcon(status)}
          </div>
          <div>
            <h3 className="font-medium">{event.name || event.title || 'Untitled Event'}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {event.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {eventDate && (
                <span>{format(new Date(eventDate), 'MMM d, yyyy h:mm a')}</span>
              )}
              {event.viewer_count !== undefined && (
                <span>{event.viewer_count} viewers</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(status)} text-white`}>
            {status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}/edit`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(event.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage your streaming events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadEvents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Set up your streaming event details
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Time</Label>
                    <DateTimePicker
                      date={formData.scheduledStart}
                      setDate={(date) => setFormData({...formData, scheduledStart: date})}
                      placeholder="Select start time"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time</Label>
                    <DateTimePicker
                      date={formData.scheduledEnd}
                      setDate={(date) => setFormData({...formData, scheduledEnd: date})}
                      placeholder="Select end time"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Event'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs for Event Categories */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            All Events
            <Badge variant="secondary" className="ml-1">
              {events.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live
            <Badge variant="secondary" className="ml-1">
              {events.filter(e => getEventStatus(e) === 'live').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduled
            <Badge variant="secondary" className="ml-1">
              {events.filter(e => getEventStatus(e) === 'scheduled').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Past
            <Badge variant="secondary" className="ml-1">
              {events.filter(e => ['ended', 'completed'].includes(getEventStatus(e))).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Cancelled
            <Badge variant="secondary" className="ml-1">
              {events.filter(e => getEventStatus(e) === 'cancelled').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={selectedTab} className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Loading events...
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchQuery
                  ? `No events found matching "${searchQuery}"`
                  : selectedTab === 'all'
                  ? 'No events yet. Create your first event to get started!'
                  : `No ${selectedTab} events`}
              </AlertDescription>
            </Alert>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EventsPage;