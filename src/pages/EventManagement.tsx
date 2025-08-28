import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format, addDays, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Settings,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Globe,
  Shield,
  Zap,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  Bell,
  Wifi,
  WifiOff,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  FileText,
  Search
} from 'lucide-react';
import api from '../services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled';
  start_time: string;
  end_time?: string;
  duration?: number;
  stream_key?: string;
  rtmp_url?: string;
  hls_url?: string;
  embed_code?: string;
  visibility: 'public' | 'private' | 'unlisted';
  password_protected: boolean;
  password?: string;
  max_viewers?: number;
  current_viewers?: number;
  total_views?: number;
  features: {
    chat: boolean;
    reactions: boolean;
    polls: boolean;
    qa: boolean;
    recording: boolean;
    transcription: boolean;
    analytics: boolean;
  };
  settings: {
    auto_start: boolean;
    auto_stop: boolean;
    allow_replay: boolean;
    enable_dvr: boolean;
    low_latency: boolean;
    adaptive_bitrate: boolean;
    max_resolution: string;
    backup_stream: boolean;
  };
  created_at: string;
  updated_at: string;
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'live' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    visibility: 'public',
    password_protected: false,
    features: {
      chat: true,
      reactions: true,
      polls: false,
      qa: false,
      recording: true,
      transcription: false,
      analytics: true
    },
    settings: {
      auto_start: false,
      auto_stop: false,
      allow_replay: true,
      enable_dvr: false,
      low_latency: true,
      adaptive_bitrate: true,
      max_resolution: '1080p',
      backup_stream: false
    }
  });

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('14:00');

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filterStatus, searchQuery]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getEvents();
      
      // Generate demo events if none exist
      const demoEvents: Event[] = response.length > 0 ? response : [
        {
          id: 'evt-1',
          title: 'Q1 2024 Product Launch',
          description: 'Unveiling our latest product innovations',
          status: 'live',
          start_time: new Date().toISOString(),
          current_viewers: 1234,
          total_views: 5678,
          visibility: 'public',
          password_protected: false,
          features: {
            chat: true,
            reactions: true,
            polls: true,
            qa: true,
            recording: true,
            transcription: false,
            analytics: true
          },
          settings: {
            auto_start: false,
            auto_stop: false,
            allow_replay: true,
            enable_dvr: true,
            low_latency: true,
            adaptive_bitrate: true,
            max_resolution: '1080p',
            backup_stream: true
          },
          rtmp_url: 'rtmp://stream.bigfootlive.io/live',
          stream_key: 'sk_live_abc123',
          hls_url: 'https://stream.bigfootlive.io/hls/evt-1/index.m3u8',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'evt-2',
          title: 'Weekly Team Standup',
          description: 'Regular team sync and updates',
          status: 'scheduled',
          start_time: addDays(new Date(), 2).toISOString(),
          duration: 30,
          visibility: 'private',
          password_protected: false,
          features: {
            chat: true,
            reactions: false,
            polls: false,
            qa: true,
            recording: true,
            transcription: true,
            analytics: true
          },
          settings: {
            auto_start: true,
            auto_stop: true,
            allow_replay: false,
            enable_dvr: false,
            low_latency: true,
            adaptive_bitrate: false,
            max_resolution: '720p',
            backup_stream: false
          },
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'evt-3',
          title: 'Customer Training Webinar',
          description: 'Deep dive into platform features',
          status: 'ended',
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          duration: 120,
          total_views: 856,
          visibility: 'unlisted',
          password_protected: true,
          features: {
            chat: true,
            reactions: true,
            polls: true,
            qa: true,
            recording: true,
            transcription: false,
            analytics: true
          },
          settings: {
            auto_start: false,
            auto_stop: false,
            allow_replay: true,
            enable_dvr: false,
            low_latency: false,
            adaptive_bitrate: true,
            max_resolution: '1080p',
            backup_stream: false
          },
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setEvents(demoEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      if (!newEvent.title) {
        toast.error('Please enter an event title');
        return;
      }

      const eventData = {
        ...newEvent,
        start_time: startDate ? format(startDate, "yyyy-MM-dd'T'") + startTime + ':00Z' : new Date().toISOString(),
        status: 'scheduled' as const
      };

      await api.createEvent(eventData);
      toast.success('Event created successfully');
      setShowCreateDialog(false);
      loadEvents();
      resetNewEventForm();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };

  const resetNewEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      visibility: 'public',
      password_protected: false,
      features: {
        chat: true,
        reactions: true,
        polls: false,
        qa: false,
        recording: true,
        transcription: false,
        analytics: true
      },
      settings: {
        auto_start: false,
        auto_stop: false,
        allow_replay: true,
        enable_dvr: false,
        low_latency: true,
        adaptive_bitrate: true,
        max_resolution: '1080p',
        backup_stream: false
      }
    });
    setStartDate(new Date());
    setStartTime('14:00');
  };

  const startStreaming = async (eventId: string) => {
    try {
      await api.post(`/api/v1/events/${eventId}/start`);
      toast.success('Stream started');
      loadEvents();
    } catch (error) {
      console.error('Failed to start stream:', error);
      toast.error('Failed to start stream');
    }
  };

  const stopStreaming = async (eventId: string) => {
    try {
      await api.post(`/api/v1/events/${eventId}/stop`);
      toast.success('Stream stopped');
      loadEvents();
    } catch (error) {
      console.error('Failed to stop stream:', error);
      toast.error('Failed to stop stream');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/api/v1/events/${eventId}`);
      toast.success('Event deleted');
      loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  const copyStreamKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Stream key copied to clipboard');
  };

  const copyEmbedCode = (event: Event) => {
    const embedCode = `<iframe 
  src="https://embed.bigfootlive.io/event/${event.id}" 
  width="800" 
  height="450" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Play className="h-3 w-3" />;
      case 'scheduled': return <Clock className="h-3 w-3" />;
      case 'ended': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const upcomingEvents = filteredEvents.filter(e => e.status === 'scheduled');
  const liveEvents = filteredEvents.filter(e => e.status === 'live');
  const pastEvents = filteredEvents.filter(e => e.status === 'ended');

  return (
    <DashboardLayout
      title="Event Management"
      subtitle="Create and manage your streaming events"
      actions={
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Set up a new streaming event with custom settings
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={newEvent.visibility}
                    onValueChange={(value: any) => setNewEvent({ ...newEvent, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Public - Anyone can watch
                        </div>
                      </SelectItem>
                      <SelectItem value="unlisted">
                        <div className="flex items-center">
                          <EyeOff className="h-4 w-4 mr-2" />
                          Unlisted - Only with link
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Private - Invite only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Password Protection</Label>
                    <p className="text-xs text-muted-foreground">
                      Require a password to view this event
                    </p>
                  </div>
                  <Switch
                    checked={newEvent.password_protected}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, password_protected: checked })}
                  />
                </div>

                {newEvent.password_protected && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Event Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={newEvent.password}
                      onChange={(e) => setNewEvent({ ...newEvent, password: e.target.value })}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {Object.entries({
                    chat: { label: 'Live Chat', icon: MessageSquare, description: 'Enable real-time chat' },
                    reactions: { label: 'Reactions', icon: ThumbsUp, description: 'Allow emoji reactions' },
                    polls: { label: 'Polls', icon: BarChart3, description: 'Create interactive polls' },
                    qa: { label: 'Q&A', icon: MessageSquare, description: 'Host Q&A sessions' },
                    recording: { label: 'Recording', icon: Video, description: 'Record the stream' },
                    transcription: { label: 'Transcription', icon: FileText, description: 'Generate captions' },
                    analytics: { label: 'Analytics', icon: BarChart3, description: 'Track viewer metrics' }
                  }).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={newEvent.features?.[key as keyof typeof newEvent.features] || false}
                          onCheckedChange={(checked) => setNewEvent({
                            ...newEvent,
                            features: { ...newEvent.features!, [key]: checked }
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum Resolution</Label>
                    <Select
                      value={newEvent.settings?.max_resolution || '1080p'}
                      onValueChange={(value) => setNewEvent({
                        ...newEvent,
                        settings: { ...newEvent.settings!, max_resolution: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4k">4K (2160p)</SelectItem>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="480p">SD (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries({
                    auto_start: { label: 'Auto Start', description: 'Start streaming automatically at scheduled time' },
                    auto_stop: { label: 'Auto Stop', description: 'Stop streaming after specified duration' },
                    allow_replay: { label: 'Allow Replay', description: 'Let viewers watch the recording' },
                    enable_dvr: { label: 'Enable DVR', description: 'Allow viewers to rewind during live stream' },
                    low_latency: { label: 'Low Latency', description: 'Reduce stream delay for real-time interaction' },
                    adaptive_bitrate: { label: 'Adaptive Bitrate', description: 'Adjust quality based on viewer connection' },
                    backup_stream: { label: 'Backup Stream', description: 'Enable redundant streaming for reliability' }
                  }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{config.label}</Label>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                      <Switch
                        checked={Boolean(newEvent.settings?.[key as keyof typeof newEvent.settings])}
                        onCheckedChange={(checked) => setNewEvent({
                          ...newEvent,
                          settings: { ...newEvent.settings!, [key]: checked }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createEvent}>
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" onClick={loadEvents}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              Live ({liveEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastEvents.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({filteredEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={loadEvents} />
              ))}
            </div>
            {upcomingEvents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No upcoming events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {liveEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={loadEvents} />
              ))}
            </div>
            {liveEvents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No live events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={loadEvents} />
              ))}
            </div>
            {pastEvents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No past events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={loadEvents} />
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No events found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Event Card Component
function EventCard({ event, onAction }: { event: Event; onAction: () => void }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="h-12 w-12 text-gray-600" />
        </div>
        <Badge className={`absolute top-2 right-2 ${getStatusColor(event.status)}`}>
          {event.status.toUpperCase()}
        </Badge>
        {event.status === 'live' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-1 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white">{event.current_viewers || 0} watching</span>
            </div>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {event.description || 'No description'}
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{event.title}</DialogTitle>
                <DialogDescription>Event details and controls</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                {event.status === 'live' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Stream is Live</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span>RTMP URL:</span>
                          <code className="text-xs">{event.rtmp_url || 'rtmp://stream.bigfootlive.io/live'}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Stream Key:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs">****{event.stream_key?.slice(-4) || 'abc123'}</code>
                            <Button size="sm" variant="ghost" onClick={() => toast.success('Stream key copied')}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <p className="text-sm">{new Date(event.start_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Visibility</Label>
                    <p className="text-sm capitalize">{event.visibility}</p>
                  </div>
                </div>

                <div>
                  <Label>Enabled Features</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(event.features).filter(([_, enabled]) => enabled).map(([feature]) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {event.status === 'scheduled' && (
                    <Button size="sm" variant="default" onClick={() => toast.success('Stream started')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Stream
                    </Button>
                  )}
                  {event.status === 'live' && (
                    <Button size="sm" variant="destructive" onClick={() => toast.success('Stream stopped')}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Stream
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => toast.success('Embed code copied')}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Embed
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{new Date(event.start_time).toLocaleDateString()}</span>
          </div>
          {event.total_views && (
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>{event.total_views} views</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}