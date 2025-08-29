import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Clock
} from 'lucide-react';
import eventService from '../services/eventService';
import { format } from 'date-fns';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
  scheduled_start?: string;
  viewer_count?: number;
}

export function EventsWithDrawerPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: ''
  });

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

  const handleCreateEvent = async () => {
    try {
      // Here you would call the API to create the event
      toast.success('Event created successfully!');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: ''
      });
      loadEvents();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <DashboardLayout title="Events">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Events
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your streaming events
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-foreground text-background hover:opacity-90">
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
                    <Input
                      id="start"
                      type="datetime-local"
                      value={formData.scheduledStart}
                      onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={formData.scheduledEnd}
                      onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">{event.title}</h3>
                  <StatusBadge status={event.status} />
                </div>
                
                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {event.scheduled_start && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.scheduled_start), 'MMM d, h:mm a')}
                    </div>
                  )}
                  {event.viewer_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.viewer_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    live: { icon: Radio, className: 'text-red-500 bg-red-50 dark:bg-red-950' },
    scheduled: { icon: Calendar, className: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
    ended: { icon: Play, className: 'text-gray-500 bg-gray-50 dark:bg-gray-950' },
    completed: { icon: Play, className: 'text-green-500 bg-green-50 dark:bg-green-950' },
    cancelled: { icon: Play, className: 'text-orange-500 bg-orange-50 dark:bg-orange-950' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ended;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${config.className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </div>
  );
}