import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Radio,
  StopCircle,
  Users,
  Copy,
  Check,
  Loader2,
  Settings
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import eventService from '../services/eventService';

interface Event {
  id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
  streamKey?: string;
  rtmpUrl?: string;
}

export default function StreamingLivePage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventService.listEvents();
      const eventsData = response.items || [];
      setEvents(eventsData);
    } catch (err) {
      setEvents([]);
    }
  };

  const handleEventSelect = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleGoLive = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    // Simulate going live
    setTimeout(() => {
      setIsStreaming(true);
      setViewers(Math.floor(Math.random() * 1000));
      setLoading(false);
    }, 2000);
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    setViewers(0);
    navigate('/events');
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const rtmpUrl = selectedEvent?.rtmpUrl || 'rtmp://stream.bigfootlive.io/live';
  const streamKey = selectedEvent?.streamKey || 'stream_key_' + (selectedEvent?.id || 'demo');

  return (
    <DashboardLayout title="Go Live">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Go Live
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start streaming your event
              </p>
            </div>

              {/* Event Selector */}
              <Select 
                value={selectedEvent?.id || ''} 
                onValueChange={handleEventSelect}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Live Indicator */}
              {isStreaming && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                    <span className="text-red-500 font-medium">LIVE</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    <Users className="inline h-4 w-4 mr-1" />
                    {viewers} viewers
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!isStreaming ? (
                <Button
                  onClick={handleGoLive}
                  disabled={!selectedEvent || loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing...</>
                  ) : (
                    <><Radio className="mr-2 h-4 w-4" /> Go Live</>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/streaming/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleEndStream}
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    End Stream
                  </Button>
                </>
              )}
            </div>
          </div>
        {!selectedEvent ? (
          <div className="text-center py-24">
            <Radio className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No event selected
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Select an event from the dropdown to start streaming
            </p>
            <Button 
              onClick={() => navigate('/events')} 
              variant="outline"
            >
              View Events
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video Preview */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {isStreaming ? (
                    <video
                      ref={videoRef}
                      className="w-full aspect-video bg-black"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <Radio className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Stream preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stream Configuration */}
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Stream Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    {/* RTMP URL */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        RTMP Server
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={rtmpUrl}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-900 dark:text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(rtmpUrl, 'rtmp')}
                        >
                          {copiedField === 'rtmp' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Stream Key */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">
                        Stream Key
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="password"
                          value={streamKey}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-900 dark:text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(streamKey, 'key')}
                        >
                          {copiedField === 'key' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Status */}
                {isStreaming && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Stream Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                        <span className="text-sm text-gray-900 dark:text-white">00:00:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Bitrate</span>
                        <span className="text-sm text-gray-900 dark:text-white">4.5 Mbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Resolution</span>
                        <span className="text-sm text-gray-900 dark:text-white">1920x1080</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}