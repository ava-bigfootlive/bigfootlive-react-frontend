import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Radio,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Play,
  Pause,
  StopCircle,
  Settings,
  Users,
  Eye,
  MessageSquare,
  Heart,
  DollarSign,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Share2,
  Download,
  Upload,
  Film,
  Layers,
  Zap,
  Clock,
  Calendar,
  Globe,
  Shield,
  Key,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Sparkles,
  Target,
  TrendingUp,
  Server,
  Cpu,
  HardDrive,
  ThermometerSun,
  Plus,
  Lock,
  Link as LinkIcon,
  RefreshCw as RefreshCwIcon
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StreamSettings {
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  chatEnabled: boolean;
  recordingEnabled: boolean;
  lowLatencyMode: boolean;
  autoStart: boolean;
  scheduledTime?: Date;
}

interface StreamStats {
  viewers: number;
  peakViewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  resolution: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
}

interface StreamSource {
  id: string;
  type: 'camera' | 'screen' | 'window' | 'rtmp';
  name: string;
  active: boolean;
  settings: {
    deviceId?: string;
    resolution?: string;
    frameRate?: number;
    bitrate?: number;
  };
}

export const StreamManager: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'starting' | 'live' | 'stopping' | 'error'>('idle');
  const [selectedSource, setSelectedSource] = useState<StreamSource | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [streamKey, setStreamKey] = useState('live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [streamUrl] = useState('rtmp://live.bigfootlive.io/live');
  
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    title: 'My Live Stream',
    description: '',
    category: 'gaming',
    tags: [],
    visibility: 'public',
    chatEnabled: true,
    recordingEnabled: true,
    lowLatencyMode: false,
    autoStart: false
  });

  const [streamStats, setStreamStats] = useState<StreamStats>({
    viewers: 0,
    peakViewers: 0,
    duration: 0,
    bitrate: 0,
    fps: 0,
    resolution: '1920x1080',
    health: 'excellent'
  });

  const [sources, setSources] = useState<StreamSource[]>([
    {
      id: '1',
      type: 'camera',
      name: 'Webcam',
      active: true,
      settings: {
        deviceId: 'default',
        resolution: '1920x1080',
        frameRate: 30,
        bitrate: 4000
      }
    },
    {
      id: '2',
      type: 'screen',
      name: 'Screen Share',
      active: false,
      settings: {
        resolution: '1920x1080',
        frameRate: 30,
        bitrate: 6000
      }
    }
  ]);

  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    bandwidth: 4.5,
    temperature: 65
  });

  // Simulated real-time data
  const [viewerData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      viewers: Math.floor(Math.random() * 100) + 50
    }))
  );

  const [bitrateData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      bitrate: Math.floor(Math.random() * 1000) + 3000
    }))
  );

  // Simulate real-time updates
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setStreamStats(prev => ({
        ...prev,
        viewers: Math.max(0, prev.viewers + Math.floor(Math.random() * 10) - 5),
        duration: prev.duration + 1,
        bitrate: Math.floor(Math.random() * 1000) + 3000,
        fps: Math.floor(Math.random() * 5) + 28
      }));

      setSystemStats({
        cpu: Math.floor(Math.random() * 20) + 40,
        memory: Math.floor(Math.random() * 15) + 55,
        bandwidth: Math.random() * 2 + 3.5,
        temperature: Math.floor(Math.random() * 10) + 60
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isStreaming]);

  const startStream = async () => {
    setStreamStatus('starting');
    // Simulate stream start delay
    setTimeout(() => {
      setIsStreaming(true);
      setStreamStatus('live');
      toast({
        title: "Stream Started",
        description: "You are now live!"
      });
    }, 2000);
  };

  const stopStream = () => {
    setStreamStatus('stopping');
    setTimeout(() => {
      setIsStreaming(false);
      setStreamStatus('idle');
      toast({
        title: "Stream Ended",
        description: `Stream duration: ${formatDuration(streamStats.duration)}`
      });
      setStreamStats(prev => ({ ...prev, viewers: 0, duration: 0 }));
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast({
      title: "Stream Key Copied",
      description: "Your stream key has been copied to clipboard"
    });
  };

  const regenerateStreamKey = () => {
    const newKey = `live_${Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('')}`;
    setStreamKey(newKey);
    toast({
      title: "Stream Key Regenerated",
      description: "Your stream key has been updated"
    });
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const categories = [
    'Gaming', 'Music', 'Talk Shows', 'Sports', 'Education',
    'Entertainment', 'Tech', 'Art', 'Cooking', 'Fitness'
  ];

  return (
    <DashboardLayout
      title="Stream Manager"
      subtitle="Manage your live streaming broadcast"
      actions={
        <div className="flex gap-2 items-center">
          {isStreaming && (
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowSchedule(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {!isStreaming ? (
            <Button 
              onClick={startStream}
              disabled={streamStatus !== 'idle'}
            >
              <Play className="h-4 w-4 mr-2" />
              {streamStatus === 'starting' ? 'Starting...' : 'Go Live'}
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopStream}
              disabled={streamStatus === 'stopping'}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              {streamStatus === 'stopping' ? 'Stopping...' : 'End Stream'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stream Status Alert */}
      {streamStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stream connection error. Please check your settings and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Live Stats */}
      {isStreaming && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viewers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streamStats.viewers}</div>
              <p className="text-xs text-muted-foreground">
                Peak: {streamStats.peakViewers}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(streamStats.duration)}
              </div>
              <p className="text-xs text-muted-foreground">Live time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitrate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streamStats.bitrate}</div>
              <p className="text-xs text-muted-foreground">kbps</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FPS</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streamStats.fps}</div>
              <p className="text-xs text-muted-foreground">frames/sec</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sm">
                {streamStats.resolution}
              </div>
              <p className="text-xs text-muted-foreground">HD Quality</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold capitalize ${getHealthColor(streamStats.health)}`}>
                {streamStats.health}
              </div>
              <p className="text-xs text-muted-foreground">Stream quality</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Stream Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Stream Preview</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                >
                  {videoEnabled ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <CameraOff className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
              {videoEnabled ? (
                <div className="text-white text-center">
                  <Video className="h-12 w-12 mx-auto mb-4" />
                  <p>Camera Preview</p>
                  {isStreaming && (
                    <Badge variant="destructive" className="absolute top-4 left-4">
                      LIVE
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-white text-center">
                  <CameraOff className="h-12 w-12 mx-auto mb-4" />
                  <p>Video Disabled</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {/* Audio Levels */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Microphone</span>
                  <span>{audioEnabled ? 'Active' : 'Muted'}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-1 rounded ${
                        i < 12 ? 'bg-green-500' : i < 16 ? 'bg-yellow-500' : 'bg-red-500'
                      } ${!audioEnabled || i > 14 ? 'opacity-20' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Source Management */}
              <div>
                <Label>Video Sources</Label>
                <div className="grid gap-2 mt-2">
                  {sources.map(source => (
                    <div
                      key={source.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        source.active ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {source.type === 'camera' && <Camera className="h-4 w-4" />}
                        {source.type === 'screen' && <Monitor className="h-4 w-4" />}
                        {source.type === 'window' && <Layers className="h-4 w-4" />}
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.settings.resolution} @ {source.settings.frameRate}fps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={source.active ? 'default' : 'secondary'}>
                          {source.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stream Controls */}
        <div className="space-y-6">
          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Stream Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stream-title">Stream Title</Label>
                <Input
                  id="stream-title"
                  value={streamSettings.title}
                  onChange={(e) => setStreamSettings({
                    ...streamSettings,
                    title: e.target.value
                  })}
                  disabled={isStreaming}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-category">Category</Label>
                <Select
                  value={streamSettings.category}
                  onValueChange={(value) => setStreamSettings({
                    ...streamSettings,
                    category: value
                  })}
                  disabled={isStreaming}
                >
                  <SelectTrigger id="stream-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.toLowerCase()} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={streamSettings.visibility}
                  onValueChange={(value: any) => setStreamSettings({
                    ...streamSettings,
                    visibility: value
                  })}
                  disabled={isStreaming}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Unlisted
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="chat-enabled">Chat</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow viewers to chat
                    </p>
                  </div>
                  <Switch
                    id="chat-enabled"
                    checked={streamSettings.chatEnabled}
                    onCheckedChange={(checked) => setStreamSettings({
                      ...streamSettings,
                      chatEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="recording-enabled">Recording</Label>
                    <p className="text-xs text-muted-foreground">
                      Save stream for VOD
                    </p>
                  </div>
                  <Switch
                    id="recording-enabled"
                    checked={streamSettings.recordingEnabled}
                    onCheckedChange={(checked) => setStreamSettings({
                      ...streamSettings,
                      recordingEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-latency">Low Latency</Label>
                    <p className="text-xs text-muted-foreground">
                      Reduce stream delay
                    </p>
                  </div>
                  <Switch
                    id="low-latency"
                    checked={streamSettings.lowLatencyMode}
                    onCheckedChange={(checked) => setStreamSettings({
                      ...streamSettings,
                      lowLatencyMode: checked
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU Usage
                  </span>
                  <span>{systemStats.cpu}%</span>
                </div>
                <Progress value={systemStats.cpu} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Memory
                  </span>
                  <span>{systemStats.memory}%</span>
                </div>
                <Progress value={systemStats.memory} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Bandwidth
                  </span>
                  <span>{systemStats.bandwidth.toFixed(1)} Mbps</span>
                </div>
                <Progress value={systemStats.bandwidth * 10} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4" />
                    Temperature
                  </span>
                  <span>{systemStats.temperature}°C</span>
                </div>
                <Progress 
                  value={systemStats.temperature} 
                  className={systemStats.temperature > 80 ? 'bg-red-500' : ''}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      {isStreaming && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Viewer Count</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={viewerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="viewers" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bitrate Stability</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={bitrateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="bitrate" 
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stream Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Stream Configuration</CardTitle>
          <CardDescription>RTMP settings for external streaming software</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Server URL</Label>
              <div className="flex gap-2">
                <Input value={streamUrl} readOnly className="font-mono" />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Stream Key</Label>
              <div className="flex gap-2">
                <Input 
                  value={streamKey} 
                  type="password" 
                  readOnly 
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={copyStreamKey}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={regenerateStreamKey}>
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Keep your stream key private. Anyone with this key can stream to your channel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Advanced Stream Settings</DialogTitle>
            <DialogDescription>
              Configure advanced streaming parameters
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="output" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Encoder</Label>
                  <Select defaultValue="x264">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x264">Software (x264)</SelectItem>
                      <SelectItem value="nvenc">NVIDIA NVENC</SelectItem>
                      <SelectItem value="quicksync">Intel Quick Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bitrate (kbps)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      defaultValue={[4000]}
                      min={1000}
                      max={10000}
                      step={500}
                      className="flex-1"
                    />
                    <span className="w-16 text-right">4000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keyframe Interval</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 second</SelectItem>
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="4">4 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select defaultValue="1920x1080">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                      <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                      <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                      <SelectItem value="854x480">480p (854x480)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frame Rate</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Audio Bitrate</Label>
                  <Select defaultValue="128">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64">64 kbps</SelectItem>
                      <SelectItem value="128">128 kbps</SelectItem>
                      <SelectItem value="192">192 kbps</SelectItem>
                      <SelectItem value="256">256 kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sample Rate</Label>
                  <Select defaultValue="44100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hardware Acceleration</Label>
                    <p className="text-xs text-muted-foreground">
                      Use GPU for encoding
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-reconnect</Label>
                    <p className="text-xs text-muted-foreground">
                      Reconnect on connection loss
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dynamic Bitrate</Label>
                    <p className="text-xs text-muted-foreground">
                      Adjust bitrate based on connection
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSettings(false);
              toast({
                title: "Settings Saved",
                description: "Your stream settings have been updated"
              });
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StreamManager;