import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Layers,
  Activity,
  Gauge,
  Wifi,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Zap,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Copy,
  Save,
  FileVideo,
  Film,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  HardDrive,
  Clock,
  Globe,
  Shield
} from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

interface BitrateProfile {
  id: string;
  name: string;
  resolution: string;
  bitrate: number;
  framerate: number;
  codec: string;
  profile: string;
  level: string;
  enabled: boolean;
  active: boolean;
  bandwidth: number;
}

interface StreamSegment {
  index: number;
  duration: number;
  size: number;
  timestamp: number;
  bitrate: string;
  downloaded: boolean;
}

interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  downloadSpeed: number;
  bufferHealth: number;
}

interface QualityMetrics {
  currentLevel: number;
  currentBitrate: number;
  switches: number;
  droppedFrames: number;
  bufferStalls: number;
  averageBitrate: number;
  timeToFirstByte: number;
}

export default function HLSAdaptiveBitrate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<string>('auto');
  const [autoQuality, setAutoQuality] = useState(true);
  const [lowLatencyMode, setLowLatencyMode] = useState(false);
  const [dvrEnabled, setDvrEnabled] = useState(true);
  const [streamUrl, setStreamUrl] = useState('https://stream.bigfootlive.io/live/stream.m3u8');
  
  const [profiles, setProfiles] = useState<BitrateProfile[]>([
    {
      id: '1',
      name: '4K Ultra HD',
      resolution: '3840x2160',
      bitrate: 15000,
      framerate: 60,
      codec: 'h264',
      profile: 'High',
      level: '5.1',
      enabled: true,
      active: false,
      bandwidth: 18000000
    },
    {
      id: '2',
      name: '1080p Full HD',
      resolution: '1920x1080',
      bitrate: 5000,
      framerate: 30,
      codec: 'h264',
      profile: 'High',
      level: '4.1',
      enabled: true,
      active: true,
      bandwidth: 6000000
    },
    {
      id: '3',
      name: '720p HD',
      resolution: '1280x720',
      bitrate: 2800,
      framerate: 30,
      codec: 'h264',
      profile: 'Main',
      level: '3.1',
      enabled: true,
      active: false,
      bandwidth: 3500000
    },
    {
      id: '4',
      name: '480p SD',
      resolution: '854x480',
      bitrate: 1400,
      framerate: 30,
      codec: 'h264',
      profile: 'Main',
      level: '3.0',
      enabled: true,
      active: false,
      bandwidth: 1800000
    },
    {
      id: '5',
      name: '360p Mobile',
      resolution: '640x360',
      bitrate: 800,
      framerate: 30,
      codec: 'h264',
      profile: 'Baseline',
      level: '3.0',
      enabled: true,
      active: false,
      bandwidth: 1000000
    },
    {
      id: '6',
      name: '240p Low',
      resolution: '426x240',
      bitrate: 400,
      framerate: 30,
      codec: 'h264',
      profile: 'Baseline',
      level: '2.1',
      enabled: true,
      active: false,
      bandwidth: 500000
    }
  ]);

  const [segments, setSegments] = useState<StreamSegment[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    bandwidth: 10000000,
    latency: 20,
    jitter: 2,
    packetLoss: 0.1,
    downloadSpeed: 8500,
    bufferHealth: 95
  });

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    currentLevel: 2,
    currentBitrate: 2800,
    switches: 0,
    droppedFrames: 0,
    bufferStalls: 0,
    averageBitrate: 2800,
    timeToFirstByte: 0
  });

  const [manifestSettings, setManifestSettings] = useState({
    segmentDuration: 6,
    playlistWindow: 60,
    minSegments: 3,
    maxSegments: 10,
    targetDuration: 10,
    partTargetDuration: 0.33,
    holdBackSegments: 3,
    canSkipUntil: 6,
    canBlockReload: false,
    endlist: false
  });

  const [encoderSettings, setEncoderSettings] = useState({
    preset: 'medium',
    tune: 'zerolatency',
    gopSize: 60,
    bFrames: 0,
    refFrames: 1,
    sceneDetection: true,
    rateControl: 'cbr',
    bufferSize: 2000,
    maxRate: 6000,
    minRate: 1000,
    threads: 0
  });

  // Initialize HLS.js
  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: lowLatencyMode,
        backBufferLength: dvrEnabled ? 90 : 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: Infinity,
        liveSyncDuration: undefined,
        liveMaxLatencyDuration: undefined,
        maxLiveSyncPlaybackRate: 2,
        liveDurationInfinity: true,
        preferManagedMediaSource: true
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('Manifest parsed:', data);
        const levels = data.levels.map((level: any, index: number) => ({
          ...profiles[index],
          bitrate: level.bitrate / 1000,
          resolution: `${level.width}x${level.height}`,
          active: index === hls.currentLevel
        }));
        setProfiles(levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log('Level switched:', data);
        setQualityMetrics(prev => ({
          ...prev,
          currentLevel: data.level,
          currentBitrate: hls.levels[data.level].bitrate / 1000,
          switches: prev.switches + 1
        }));
        
        setProfiles(prev => prev.map((p, i) => ({
          ...p,
          active: i === data.level
        })));
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        // Cast data to access stats if available
        const fragData = data as any;
        
        const segment: StreamSegment = {
          index: typeof data.frag.sn === 'number' ? data.frag.sn : 0,
          duration: data.frag.duration,
          size: fragData.stats?.total || 0,
          timestamp: Date.now(),
          bitrate: profiles.find(p => p.active)?.name || 'Unknown',
          downloaded: true
        };
        
        setSegments(prev => [...prev.slice(-20), segment]);
        
        // Update network metrics if stats are available
        if (fragData.stats) {
          const downloadTime = fragData.stats.tload - fragData.stats.trequest;
          const bandwidth = (fragData.stats.total * 8) / (downloadTime / 1000);
          setNetworkMetrics(prev => ({
            ...prev,
            bandwidth: bandwidth,
            downloadSpeed: fragData.stats.total / (downloadTime / 1000) / 1024
          }));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              toast.error('Network error encountered');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              toast.error('Media error encountered');
              hls.recoverMediaError();
              break;
            default:
              toast.error('Fatal error occurred');
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    }
  }, [lowLatencyMode, dvrEnabled]);

  // Simulate metrics updates
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Update network metrics
      setNetworkMetrics(prev => ({
        bandwidth: Math.max(500000, prev.bandwidth + (Math.random() - 0.5) * 500000),
        latency: Math.max(5, prev.latency + (Math.random() - 0.5) * 5),
        jitter: Math.max(0, prev.jitter + (Math.random() - 0.5) * 1),
        packetLoss: Math.max(0, Math.min(5, prev.packetLoss + (Math.random() - 0.5) * 0.5)),
        downloadSpeed: Math.max(500, prev.downloadSpeed + (Math.random() - 0.5) * 500),
        bufferHealth: Math.max(0, Math.min(100, prev.bufferHealth + (Math.random() - 0.5) * 10))
      }));

      // Update quality metrics
      setQualityMetrics(prev => ({
        ...prev,
        droppedFrames: prev.droppedFrames + Math.floor(Math.random() * 2),
        bufferStalls: prev.bufferStalls + (Math.random() > 0.95 ? 1 : 0),
        averageBitrate: (prev.averageBitrate * 0.95 + prev.currentBitrate * 0.05)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const startStream = () => {
    if (hlsRef.current && videoRef.current) {
      hlsRef.current.loadSource(streamUrl);
      hlsRef.current.attachMedia(videoRef.current);
      setIsStreaming(true);
      setQualityMetrics(prev => ({
        ...prev,
        timeToFirstByte: Date.now()
      }));
      toast.success('HLS stream started');
    }
  };

  const stopStream = () => {
    if (hlsRef.current) {
      hlsRef.current.stopLoad();
      setIsStreaming(false);
      setSegments([]);
      toast.info('Stream stopped');
    }
  };

  const switchQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      if (levelIndex === -1) {
        hlsRef.current.currentLevel = -1;
        setAutoQuality(true);
        toast.info('Switched to auto quality');
      } else {
        hlsRef.current.currentLevel = levelIndex;
        setAutoQuality(false);
        toast.info(`Switched to ${profiles[levelIndex].name}`);
      }
    }
  };

  const toggleProfile = (id: string) => {
    setProfiles(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const addProfile = () => {
    const newProfile: BitrateProfile = {
      id: Date.now().toString(),
      name: 'Custom Profile',
      resolution: '1920x1080',
      bitrate: 3000,
      framerate: 30,
      codec: 'h264',
      profile: 'Main',
      level: '4.0',
      enabled: true,
      active: false,
      bandwidth: 3600000
    };
    setProfiles(prev => [...prev, newProfile]);
    toast.success('Profile added');
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    toast.success('Profile removed');
  };

  const saveConfiguration = () => {
    const config = {
      profiles,
      manifestSettings,
      encoderSettings,
      lowLatencyMode,
      dvrEnabled
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hls-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration saved');
  };

  const getQualityColor = (bitrate: number) => {
    if (bitrate >= 5000) return 'text-purple-500';
    if (bitrate >= 2800) return 'text-blue-500';
    if (bitrate >= 1400) return 'text-green-500';
    if (bitrate >= 800) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getBandwidthColor = (bandwidth: number) => {
    if (bandwidth >= 10000000) return 'text-green-500';
    if (bandwidth >= 5000000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout title="HLS Adaptive Bitrate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HLS Adaptive Bitrate Streaming</h1>
            <p className="text-muted-foreground mt-2">
              Configure and manage adaptive bitrate streaming with HLS protocol
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Layers className="h-3 w-3 mr-1" />
              {profiles.filter(p => p.enabled).length} Profiles Active
            </Badge>
            {isStreaming && (
              <Badge variant="destructive" className="px-3 py-1 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Video Player and Controls */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                  />
                  {isStreaming && (
                    <>
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">
                          <Activity className="h-3 w-3 mr-1" />
                          LIVE HLS
                        </Badge>
                        <Badge variant="secondary">
                          {profiles.find(p => p.active)?.name || 'Auto'}
                        </Badge>
                        {lowLatencyMode && (
                          <Badge variant="secondary">
                            <Zap className="h-3 w-3 mr-1" />
                            Low Latency
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <Select 
                          value={autoQuality ? 'auto' : qualityMetrics.currentLevel.toString()}
                          onValueChange={(value) => {
                            if (value === 'auto') {
                              switchQuality(-1);
                            } else {
                              switchQuality(parseInt(value));
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-8 bg-black/50 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            {profiles.filter(p => p.enabled).map((profile, index) => (
                              <SelectItem key={profile.id} value={index.toString()}>
                                {profile.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">HLS stream preview</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-card border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        placeholder="HLS stream URL (m3u8)"
                        className="font-mono text-sm"
                      />
                    </div>
                    {!isStreaming ? (
                      <Button onClick={startStream}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Stream
                      </Button>
                    ) : (
                      <Button onClick={stopStream} variant="destructive">
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Stream
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="auto-quality"
                        checked={autoQuality}
                        onCheckedChange={setAutoQuality}
                      />
                      <Label htmlFor="auto-quality" className="text-sm">Auto Quality</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="low-latency"
                        checked={lowLatencyMode}
                        onCheckedChange={setLowLatencyMode}
                      />
                      <Label htmlFor="low-latency" className="text-sm">Low Latency</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="dvr"
                        checked={dvrEnabled}
                        onCheckedChange={setDvrEnabled}
                      />
                      <Label htmlFor="dvr" className="text-sm">DVR Mode</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
                <CardDescription>Network and quality statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className={cn("text-2xl font-bold", getBandwidthColor(networkMetrics.bandwidth))}>
                      {(networkMetrics.bandwidth / 1000000).toFixed(1)} Mbps
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bitrate</p>
                    <p className={cn("text-2xl font-bold", getQualityColor(qualityMetrics.currentBitrate))}>
                      {qualityMetrics.currentBitrate} kbps
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buffer Health</p>
                    <p className="text-2xl font-bold">{networkMetrics.bufferHealth.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality Switches</p>
                    <p className="text-2xl font-bold">{qualityMetrics.switches}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dropped Frames</p>
                    <p className="text-2xl font-bold">{qualityMetrics.droppedFrames}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buffer Stalls</p>
                    <p className="text-2xl font-bold">{qualityMetrics.bufferStalls}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Network Quality</span>
                      <span className="text-sm font-medium">
                        {networkMetrics.latency.toFixed(0)}ms latency
                      </span>
                    </div>
                    <Progress value={100 - networkMetrics.packetLoss * 20} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Download Speed</span>
                      <span className="text-sm font-medium">
                        {networkMetrics.downloadSpeed.toFixed(0)} KB/s
                      </span>
                    </div>
                    <Progress value={Math.min(100, networkMetrics.downloadSpeed / 100)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Segment Timeline</CardTitle>
                <CardDescription>Recently downloaded segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {segments.slice(-10).reverse().map((segment, index) => (
                    <div key={`${segment.index}-${index}`} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="min-w-[60px]">
                        #{segment.index}
                      </Badge>
                      <span className="text-muted-foreground">
                        {segment.duration.toFixed(2)}s
                      </span>
                      <Badge variant="secondary" className="min-w-[80px]">
                        {(segment.size / 1024).toFixed(0)} KB
                      </Badge>
                      <span className={cn("text-xs", getQualityColor(parseInt(segment.bitrate)))}>
                        {segment.bitrate}
                      </span>
                      <div className="flex-1" />
                      {segment.downloaded && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Bitrate Profiles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bitrate Profiles</CardTitle>
                  <Button onClick={addProfile} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        profile.active && "bg-accent border-accent-foreground/20",
                        !profile.enabled && "opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{profile.name}</p>
                            {profile.active && (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {profile.resolution} @ {profile.framerate}fps
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={profile.enabled}
                            onCheckedChange={() => toggleProfile(profile.id)}
                            className="scale-75"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteProfile(profile.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={cn("font-medium", getQualityColor(profile.bitrate))}>
                          {profile.bitrate} kbps
                        </span>
                        <span className="text-muted-foreground">{profile.codec}</span>
                        <span className="text-muted-foreground">{profile.profile}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manifest" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="manifest">Manifest</TabsTrigger>
                    <TabsTrigger value="encoder">Encoder</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manifest" className="space-y-4">
                    <div>
                      <Label className="text-xs">Segment Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={manifestSettings.segmentDuration}
                        onChange={(e) => setManifestSettings(prev => ({
                          ...prev,
                          segmentDuration: parseInt(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Playlist Window (seconds)</Label>
                      <Input
                        type="number"
                        value={manifestSettings.playlistWindow}
                        onChange={(e) => setManifestSettings(prev => ({
                          ...prev,
                          playlistWindow: parseInt(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Hold Back Segments</Label>
                      <Slider
                        value={[manifestSettings.holdBackSegments]}
                        onValueChange={([value]) => setManifestSettings(prev => ({
                          ...prev,
                          holdBackSegments: value
                        }))}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {manifestSettings.holdBackSegments} segments
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="can-block" className="text-xs">Can Block Reload</Label>
                      <Switch
                        id="can-block"
                        checked={manifestSettings.canBlockReload}
                        onCheckedChange={(checked) => setManifestSettings(prev => ({
                          ...prev,
                          canBlockReload: checked
                        }))}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="encoder" className="space-y-4">
                    <div>
                      <Label className="text-xs">Preset</Label>
                      <Select 
                        value={encoderSettings.preset}
                        onValueChange={(value) => setEncoderSettings(prev => ({
                          ...prev,
                          preset: value
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ultrafast">Ultrafast</SelectItem>
                          <SelectItem value="superfast">Superfast</SelectItem>
                          <SelectItem value="veryfast">Very Fast</SelectItem>
                          <SelectItem value="faster">Faster</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="slower">Slower</SelectItem>
                          <SelectItem value="veryslow">Very Slow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Tune</Label>
                      <Select 
                        value={encoderSettings.tune}
                        onValueChange={(value) => setEncoderSettings(prev => ({
                          ...prev,
                          tune: value
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zerolatency">Zero Latency</SelectItem>
                          <SelectItem value="film">Film</SelectItem>
                          <SelectItem value="animation">Animation</SelectItem>
                          <SelectItem value="grain">Grain</SelectItem>
                          <SelectItem value="stillimage">Still Image</SelectItem>
                          <SelectItem value="fastdecode">Fast Decode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Rate Control</Label>
                      <Select 
                        value={encoderSettings.rateControl}
                        onValueChange={(value) => setEncoderSettings(prev => ({
                          ...prev,
                          rateControl: value
                        }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbr">CBR (Constant)</SelectItem>
                          <SelectItem value="vbr">VBR (Variable)</SelectItem>
                          <SelectItem value="crf">CRF (Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">GOP Size</Label>
                      <Input
                        type="number"
                        value={encoderSettings.gopSize}
                        onChange={(e) => setEncoderSettings(prev => ({
                          ...prev,
                          gopSize: parseInt(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={saveConfiguration} className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Adaptive Bitrate Streaming</AlertTitle>
              <AlertDescription>
                HLS automatically adjusts video quality based on network conditions, ensuring smooth playback across all devices and connections.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}