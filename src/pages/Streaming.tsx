import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  Settings, 
  Copy, 
  CheckCircle,
  Wifi,
  WifiOff,
  Users,
  MessageSquare,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';

interface StreamConfig {
  eventId?: string;
  streamKey?: string;
  rtmpUrl?: string;
  hlsUrl?: string;
  status?: 'idle' | 'preparing' | 'live' | 'ended';
}

export default function StreamingPage() {
  const navigate = useNavigate();
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    status: 'idle'
  });
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentStream();
  }, []);

  const fetchCurrentStream = async () => {
    try {
      // Mock response for now
      // const response = await api.get('/streaming/current');
      // if (response.data) {
      //   setStreamConfig(response.data);
      // }
      console.log('No active stream found');
    } catch (error) {
      console.log('No active stream found');
    }
  };

  const createStreamEvent = async () => {
    if (!eventName.trim()) {
      setError('Event name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Create event using the API client
      const response = await api.createEvent({
        name: eventName,
        description: eventDescription,
        status: 'scheduled'
      });

      if (response) {
        setStreamConfig({
          eventId: response.id,
          streamKey: response.streamKey || `stream_${response.id}`,
          rtmpUrl: response.rtmpUrl || 'rtmp://stream.bigfootlive.io/live',
          hlsUrl: response.hlsUrl || `https://stream.bigfootlive.io/hls/${response.id}/index.m3u8`,
          status: 'preparing'
        });
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create streaming event');
    } finally {
      setLoading(false);
    }
  };

  const startStream = async () => {
    if (!streamConfig.eventId) {
      setError('No event created');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Navigate to live streaming view with eventId
      navigate('/streaming/live', { state: { eventId: streamConfig.eventId } });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to start stream');
    } finally {
      setLoading(false);
    }
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

  const isStreamReady = streamConfig.status === 'preparing' || streamConfig.status === 'live';

  return (
    <DashboardLayout 
      title="Streaming Studio" 
      subtitle="Create and manage your live streaming events"
      actions={
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Setup */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Stream Setup</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Configure your streaming event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isStreamReady ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Name
                    </label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter event name"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Describe your event"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={createStreamEvent}
                    disabled={loading || !eventName.trim()}
                    className="w-full"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Create Streaming Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stream Configuration */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <h3 className="text-gray-900 dark:text-white font-medium mb-3">Stream Configuration</h3>
                    
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">RTMP URL</label>
                      <div className="flex mt-1">
                        <Input
                          value={streamConfig.rtmpUrl || ''}
                          readOnly
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(streamConfig.rtmpUrl || '', 'rtmp')}
                          className="ml-2"
                        >
                          {copiedField === 'rtmp' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Stream Key</label>
                      <div className="flex mt-1">
                        <Input
                          value={streamConfig.streamKey || ''}
                          readOnly
                          type="password"
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(streamConfig.streamKey || '', 'key')}
                          className="ml-2"
                        >
                          {copiedField === 'key' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Playback URL (HLS)</label>
                      <div className="flex mt-1">
                        <Input
                          value={streamConfig.hlsUrl || ''}
                          readOnly
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(streamConfig.hlsUrl || '', 'hls')}
                          className="ml-2"
                        >
                          {copiedField === 'hls' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* OBS Instructions */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">OBS Studio Setup</h4>
                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Open OBS Studio</li>
                      <li>Go to Settings → Stream</li>
                      <li>Service: Custom</li>
                      <li>Server: Copy the RTMP URL above</li>
                      <li>Stream Key: Copy the Stream Key above</li>
                      <li>Click OK and Start Streaming</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {streamConfig.status !== 'live' ? (
                      <Button
                        onClick={startStream}
                        disabled={loading}
                        className="flex-1"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Go Live
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/streaming/live', { state: { streamConfig } })}
                        className="flex-1"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        View Live Stream
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stream Status */}
        <div className="space-y-6">
          {/* Connection Status */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg">Stream Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connection</span>
                  <div className="flex items-center">
                    {streamConfig.status === 'live' ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-500">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-500">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`capitalize ${
                    streamConfig.status === 'live' ? 'text-green-500' :
                    streamConfig.status === 'preparing' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {streamConfig.status || 'Idle'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    Viewers
                  </div>
                  <span className="text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat Messages
                  </div>
                  <span className="text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Engagement
                  </div>
                  <span className="text-gray-900 dark:text-white">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}