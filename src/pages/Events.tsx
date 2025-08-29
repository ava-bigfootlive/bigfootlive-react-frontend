import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  
  // Form state for drawer
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

  return (
    <DashboardLayout title="Events">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Events
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your streaming events
            </p>
          </div>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button className="bg-[#ab4aba] text-white hover:bg-[#973aa8]">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Create New Event</DrawerTitle>
                <DrawerDescription>
                  Set up your streaming event details
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              
              <DrawerFooter>
                <Button 
                  onClick={() => {
                    toast.success('Event created successfully!');
                    setOpen(false);
                    setFormData({ title: '', description: '', scheduledStart: '', scheduledEnd: '' });
                    loadEvents();
                  }} 
                  className="w-full bg-[#ab4aba] text-white hover:bg-[#973aa8]"
                >
                  Create Event
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

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
              onClick={() => setOpen(true)}
              className="bg-[#ab4aba] text-white hover:bg-[#973aa8]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}