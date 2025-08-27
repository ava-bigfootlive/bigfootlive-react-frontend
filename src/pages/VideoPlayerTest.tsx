import { useState } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoPlayerGrid } from '@/components/VideoPlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, AlertCircle, CheckCircle, Info, Copy, ExternalLink } from 'lucide-react';

// Test HLS streams
const TEST_STREAMS = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360/1e40af/ffffff?text=Big+Buck+Bunny',
    description: 'Test stream from Mux',
    status: 'ready' as const,
    qualities: ['1080p', '720p', '480p'],
    duration: 634
  },
  {
    id: '2',
    title: 'Sintel',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360/059669/ffffff?text=Sintel',
    description: 'Bitmovin demo content',
    status: 'ready' as const,
    qualities: ['1080p', '720p'],
    duration: 888
  },
  {
    id: '3',
    title: 'Tears of Steel',
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360/dc2626/ffffff?text=Tears+of+Steel',
    description: 'Unified Streaming demo',
    status: 'ready' as const,
    qualities: ['1080p', '720p', '480p', '360p'],
    duration: 734
  },
  {
    id: '4',
    title: 'Live Stream Example',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    thumbnailUrl: 'https://via.placeholder.com/640x360/7c3aed/ffffff?text=Live+Stream',
    description: 'Sample live stream (may be offline)',
    status: 'ready' as const,
    qualities: ['Auto'],
    duration: undefined
  }
];

export default function VideoPlayerTest() {
  const [customUrl, setCustomUrl] = useState('');
  const [isPlayingCustom, setIsPlayingCustom] = useState(false);
  const [selectedStream, setSelectedStream] = useState(TEST_STREAMS[0]);
  const [playerStats, setPlayerStats] = useState({
    currentTime: 0,
    duration: 0,
    quality: 'Auto',
    buffered: 0
  });

  const handlePlayCustom = () => {
    if (!customUrl) {
      toast.error('Please enter a valid HLS URL');
      return;
    }
    
    if (!customUrl.endsWith('.m3u8')) {
      toast.warning('URL should end with .m3u8 for HLS streams');
    }
    
    setIsPlayingCustom(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <DashboardLayout
      title="HLS Video Player Test"
      subtitle="Test and validate HLS video playback functionality"
    >
      <div className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Video Player Testing</AlertTitle>
          <AlertDescription>
            This page allows you to test HLS video playback with sample streams or your own HLS URLs.
            The player supports adaptive bitrate streaming, quality selection, and playback controls.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="samples" className="w-full">
          <TabsList>
            <TabsTrigger value="samples">Sample Streams</TabsTrigger>
            <TabsTrigger value="custom">Custom URL</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Sample Streams Tab */}
          <TabsContent value="samples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test HLS Streams</CardTitle>
                <CardDescription>
                  Select a sample stream to test playback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stream Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEST_STREAMS.map(stream => (
                    <Card
                      key={stream.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStream.id === stream.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedStream(stream)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-1">{stream.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">{stream.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {stream.qualities[0]}
                          </Badge>
                          {selectedStream.id === stream.id && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Video Player */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <VideoPlayer
                    key={selectedStream.id}
                    src={selectedStream.url}
                    poster={selectedStream.thumbnailUrl}
                    title={selectedStream.title}
                    className="w-full h-full"
                    onLoadedMetadata={(duration) => {
                      setPlayerStats(prev => ({ ...prev, duration }));
                      console.log('Video loaded, duration:', duration);
                    }}
                    onTimeUpdate={(currentTime, duration) => {
                      setPlayerStats(prev => ({ ...prev, currentTime, duration }));
                    }}
                    onQualityChange={(level, quality) => {
                      setPlayerStats(prev => ({ ...prev, quality }));
                      toast.info(`Quality changed to ${quality}`);
                    }}
                    onError={(error) => {
                      console.error('Player error:', error);
                      toast.error('Failed to load video stream');
                    }}
                    enableSubtitles={false}
                  />
                </div>

                {/* Player Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Playback Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Current Time</p>
                        <p className="font-mono">
                          {Math.floor(playerStats.currentTime / 60)}:
                          {Math.floor(playerStats.currentTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Duration</p>
                        <p className="font-mono">
                          {Math.floor(playerStats.duration / 60)}:
                          {Math.floor(playerStats.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Quality</p>
                        <p className="font-medium">{playerStats.quality}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Stream URL</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedStream.url)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom URL Tab */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom HLS Stream</CardTitle>
                <CardDescription>
                  Enter your own HLS manifest URL (.m3u8) to test playback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-url">HLS Manifest URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-url"
                      type="url"
                      placeholder="https://example.com/stream/master.m3u8"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                    <Button onClick={handlePlayCustom}>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter a valid HLS manifest URL ending with .m3u8
                  </p>
                </div>

                {isPlayingCustom && customUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <VideoPlayer
                      src={customUrl}
                      title="Custom Stream"
                      className="w-full h-full"
                      onError={(error) => {
                        console.error('Custom stream error:', error);
                        toast.error('Failed to load custom stream');
                        setIsPlayingCustom(false);
                      }}
                      enableSubtitles={false}
                    />
                  </div>
                )}

                {/* Example URLs */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Example HLS URLs:</h4>
                  <div className="space-y-1">
                    {TEST_STREAMS.map(stream => (
                      <div key={stream.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{stream.title}</p>
                          <p className="text-xs text-gray-500 truncate">{stream.url}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCustomUrl(stream.url)}
                          >
                            Use
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(stream.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grid View Tab */}
          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multiple Players Grid</CardTitle>
                <CardDescription>
                  Test multiple video streams simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoPlayerGrid
                  videos={TEST_STREAMS}
                  columns={2}
                  autoplay={false}
                  muted={true}
                  onVideoError={(videoId, error) => {
                    console.error(`Grid video error ${videoId}:`, error);
                    toast.error(`Failed to load video: ${videoId}`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Player Features</CardTitle>
                <CardDescription>
                  Comprehensive list of supported features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-2">Playback Features</h4>
                    <div className="space-y-2">
                      {[
                        'HLS Adaptive Bitrate Streaming',
                        'Quality Selection (Manual/Auto)',
                        'Playback Speed Control',
                        'Picture-in-Picture Support',
                        'Fullscreen Mode',
                        'Seek Preview Thumbnails',
                        'Loop Playback',
                        'Autoplay Support'
                      ].map(feature => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-2">Controls & UI</h4>
                    <div className="space-y-2">
                      {[
                        'Custom Video Controls',
                        'Keyboard Shortcuts',
                        'Touch Gestures',
                        'Volume Control with Mute',
                        'Progress Bar with Buffer Display',
                        'Time Display (Current/Total)',
                        'Settings Menu',
                        'Auto-hide Controls'
                      ].map(feature => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-2">Technical Features</h4>
                    <div className="space-y-2">
                      {[
                        'HLS.js Integration',
                        'Native HLS Support (Safari)',
                        'Error Recovery',
                        'Network Adaptive Loading',
                        'Low Latency Mode',
                        'Fragment Loading Optimization',
                        'Buffer Management',
                        'CORS Support'
                      ].map(feature => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-2">Keyboard Shortcuts</h4>
                    <div className="space-y-2">
                      {[
                        'Space / K - Play/Pause',
                        'F - Fullscreen',
                        'M - Mute/Unmute',
                        '← / J - Seek backward 10s',
                        '→ / L - Seek forward 10s',
                        '↑ - Volume up',
                        '↓ - Volume down',
                        'C - Toggle captions',
                        '0-9 - Seek to % of video'
                      ].map(shortcut => (
                        <div key={shortcut} className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-mono">{shortcut}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}