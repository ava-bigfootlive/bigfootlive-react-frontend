import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Activity,
  Copy,
  Plus,
  Trash2,
  Shield,
  Globe,
  Server,
  Key,
  Link,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Terminal,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  ExternalLink,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { cn } from '@/lib/utils';

interface RTMPEndpoint {
  id: string;
  name: string;
  url: string;
  streamKey: string;
  status: 'active' | 'inactive' | 'error';
  region: string;
  latency: number;
  secured: boolean;
  primary: boolean;
}

interface RTMPConfig {
  resolution: string;
  framerate: number;
  videoBitrate: number;
  audioBitrate: number;
  videoCodec: string;
  audioCodec: string;
  keyframeInterval: number;
  bufferSize: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  authentication: boolean;
  encryption: boolean;
  recordingEnabled: boolean;
  recordingFormat: string;
}

interface StreamKeyConfig {
  prefix: string;
  length: number;
  includeTimestamp: boolean;
  expiresIn: number;
  allowedIPs: string[];
  geoRestrictions: string[];
}

export default function RTMPConfiguration() {
  const [endpoints, setEndpoints] = useState<RTMPEndpoint[]>([
    {
      id: '1',
      name: 'Primary US East',
      url: 'rtmp://ingest-us-east.bigfootlive.io/live',
      streamKey: 'live_abc123xyz789',
      status: 'active',
      region: 'us-east-1',
      latency: 15,
      secured: true,
      primary: true
    },
    {
      id: '2',
      name: 'Backup US West',
      url: 'rtmp://ingest-us-west.bigfootlive.io/live',
      streamKey: 'live_def456uvw321',
      status: 'inactive',
      region: 'us-west-2',
      latency: 25,
      secured: true,
      primary: false
    },
    {
      id: '3',
      name: 'Europe Frankfurt',
      url: 'rtmp://ingest-eu-central.bigfootlive.io/live',
      streamKey: 'live_ghi789rst654',
      status: 'active',
      region: 'eu-central-1',
      latency: 45,
      secured: true,
      primary: false
    }
  ]);

  const [config, setConfig] = useState<RTMPConfig>({
    resolution: '1920x1080',
    framerate: 30,
    videoBitrate: 4500,
    audioBitrate: 128,
    videoCodec: 'h264',
    audioCodec: 'aac',
    keyframeInterval: 2,
    bufferSize: 4096,
    reconnectAttempts: 5,
    reconnectDelay: 5,
    authentication: true,
    encryption: true,
    recordingEnabled: true,
    recordingFormat: 'mp4'
  });

  const [streamKeyConfig, setStreamKeyConfig] = useState<StreamKeyConfig>({
    prefix: 'live_',
    length: 20,
    includeTimestamp: false,
    expiresIn: 0, // 0 means no expiration
    allowedIPs: [],
    geoRestrictions: []
  });

  const [showStreamKey, setShowStreamKey] = useState<{ [key: string]: boolean }>({});
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
    region: 'us-east-1'
  });
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

  // Simulate latency updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEndpoints(prev => prev.map(endpoint => ({
        ...endpoint,
        latency: endpoint.latency + (Math.random() * 10 - 5)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateStreamKey = () => {
    setGeneratingKey(true);
    setTimeout(() => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let key = streamKeyConfig.prefix;
      
      if (streamKeyConfig.includeTimestamp) {
        key += Date.now().toString(36) + '_';
      }
      
      for (let i = 0; i < streamKeyConfig.length; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
      }
      
      toast.success('New stream key generated');
      setGeneratingKey(false);
      
      // Update primary endpoint with new key
      setEndpoints(prev => prev.map(ep => 
        ep.primary ? { ...ep, streamKey: key } : ep
      ));
    }, 1000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const testEndpoint = (id: string) => {
    setTestingEndpoint(id);
    setTimeout(() => {
      setEndpoints(prev => prev.map(ep => 
        ep.id === id ? { ...ep, status: 'active' as const } : ep
      ));
      setTestingEndpoint(null);
      toast.success('Endpoint test successful');
    }, 2000);
  };

  const toggleEndpointStatus = (id: string) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === id 
        ? { ...ep, status: ep.status === 'active' ? 'inactive' as const : 'active' as const }
        : ep
    ));
  };

  const setPrimaryEndpoint = (id: string) => {
    setEndpoints(prev => prev.map(ep => ({
      ...ep,
      primary: ep.id === id
    })));
    toast.success('Primary endpoint updated');
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(ep => ep.id !== id));
    toast.success('Endpoint removed');
  };

  const addEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) {
      toast.error('Please fill in all fields');
      return;
    }

    const endpoint: RTMPEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      url: newEndpoint.url,
      streamKey: `live_${Math.random().toString(36).substring(2, 15)}`,
      status: 'inactive',
      region: newEndpoint.region,
      latency: 0,
      secured: newEndpoint.url.startsWith('rtmps://'),
      primary: false
    };

    setEndpoints(prev => [...prev, endpoint]);
    setNewEndpoint({ name: '', url: '', region: 'us-east-1' });
    toast.success('Endpoint added successfully');
  };

  const exportConfig = () => {
    const configData = {
      endpoints,
      config,
      streamKeyConfig,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rtmp-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  };

  const getStatusColor = (status: RTMPEndpoint['status']) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'inactive': return 'text-gray-500';
      case 'error': return 'text-red-500';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 20) return 'text-green-500';
    if (latency < 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout title="RTMP Configuration">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">RTMP Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Configure RTMP ingest endpoints and streaming parameters
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportConfig}>
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button onClick={generateStreamKey} disabled={generatingKey}>
              <Key className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
        </div>

        {/* Endpoints Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {endpoints.map(endpoint => (
            <Card key={endpoint.id} className={cn(
              "relative",
              endpoint.primary && "ring-2 ring-primary"
            )}>
              {endpoint.primary && (
                <Badge className="absolute -top-2 -right-2 z-10">Primary</Badge>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {endpoint.name}
                      {endpoint.secured && <Lock className="h-4 w-4 text-green-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {endpoint.region}
                      </Badge>
                      <span className={cn("text-xs font-medium", getStatusColor(endpoint.status))}>
                        {endpoint.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleEndpointStatus(endpoint.id)}
                  >
                    {endpoint.status === 'active' ? (
                      <Activity className="h-4 w-4 text-green-500" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">RTMP URL</Label>
                  <div className="flex gap-1 mt-1">
                    <Input 
                      value={endpoint.url} 
                      readOnly 
                      className="text-xs font-mono"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(endpoint.url, 'URL')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs">Stream Key</Label>
                  <div className="flex gap-1 mt-1">
                    <Input 
                      type={showStreamKey[endpoint.id] ? 'text' : 'password'}
                      value={endpoint.streamKey} 
                      readOnly 
                      className="text-xs font-mono"
                    />
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => setShowStreamKey(prev => ({
                        ...prev,
                        [endpoint.id]: !prev[endpoint.id]
                      }))}
                    >
                      {showStreamKey[endpoint.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(endpoint.streamKey, 'Stream key')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Latency:</span>
                  <span className={cn("font-medium", getLatencyColor(endpoint.latency))}>
                    {Math.abs(endpoint.latency).toFixed(0)}ms
                  </span>
                </div>

                <div className="flex gap-2">
                  {!endpoint.primary && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setPrimaryEndpoint(endpoint.id)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={endpoint.primary ? "flex-1" : ""}
                    onClick={() => testEndpoint(endpoint.id)}
                    disabled={testingEndpoint === endpoint.id}
                  >
                    {testingEndpoint === endpoint.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      'Test'
                    )}
                  </Button>
                  {!endpoint.primary && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteEndpoint(endpoint.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Endpoint Card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Add New Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input 
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Backup Asia Pacific"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">RTMP URL</Label>
                <Input 
                  value={newEndpoint.url}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="rtmp://ingest.example.com/live"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Region</Label>
                <Select 
                  value={newEndpoint.region}
                  onValueChange={(value) => setNewEndpoint(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addEndpoint} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Stream Configuration</CardTitle>
            <CardDescription>Configure encoding and streaming parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="encoding">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="encoding">Encoding</TabsTrigger>
                <TabsTrigger value="connection">Connection</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="encoding" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Resolution</Label>
                    <Select 
                      value={config.resolution}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, resolution: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                        <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                        <SelectItem value="854x480">480p (854x480)</SelectItem>
                        <SelectItem value="640x360">360p (640x360)</SelectItem>
                        <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Framerate</Label>
                    <Select 
                      value={config.framerate.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, framerate: parseInt(value) }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="25">25 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="50">50 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Video Bitrate (kbps)</Label>
                    <Input 
                      type="number"
                      value={config.videoBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, videoBitrate: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 2500-6000 for 1080p
                    </p>
                  </div>

                  <div>
                    <Label>Audio Bitrate (kbps)</Label>
                    <Input 
                      type="number"
                      value={config.audioBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 128-192 for stereo
                    </p>
                  </div>

                  <div>
                    <Label>Video Codec</Label>
                    <Select 
                      value={config.videoCodec}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, videoCodec: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264 (Most Compatible)</SelectItem>
                        <SelectItem value="h265">H.265/HEVC (Better Compression)</SelectItem>
                        <SelectItem value="vp9">VP9 (Google)</SelectItem>
                        <SelectItem value="av1">AV1 (Next-Gen)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Audio Codec</Label>
                    <Select 
                      value={config.audioCodec}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, audioCodec: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aac">AAC (Recommended)</SelectItem>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="opus">Opus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Keyframe Interval (seconds)</Label>
                    <Input 
                      type="number"
                      value={config.keyframeInterval}
                      onChange={(e) => setConfig(prev => ({ ...prev, keyframeInterval: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 2 seconds
                    </p>
                  </div>

                  <div>
                    <Label>Buffer Size (KB)</Label>
                    <Input 
                      type="number"
                      value={config.bufferSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, bufferSize: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Larger buffer = more stability, higher latency
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="connection" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Reconnect Attempts</Label>
                    <Input 
                      type="number"
                      value={config.reconnectAttempts}
                      onChange={(e) => setConfig(prev => ({ ...prev, reconnectAttempts: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Number of automatic reconnection attempts
                    </p>
                  </div>

                  <div>
                    <Label>Reconnect Delay (seconds)</Label>
                    <Input 
                      type="number"
                      value={config.reconnectDelay}
                      onChange={(e) => setConfig(prev => ({ ...prev, reconnectDelay: parseInt(e.target.value) }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Delay between reconnection attempts
                    </p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Connection settings help maintain stream stability during network interruptions.
                    The encoder will automatically attempt to reconnect if the connection is lost.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-medium mb-3">Recommended Encoder Settings</h4>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                    <div>Server: {endpoints.find(ep => ep.primary)?.url || 'rtmp://ingest.bigfootlive.io/live'}</div>
                    <div>Stream Key: {endpoints.find(ep => ep.primary)?.streamKey || '[Your Stream Key]'}</div>
                    <div>Video Bitrate: {config.videoBitrate} kbps</div>
                    <div>Audio Bitrate: {config.audioBitrate} kbps</div>
                    <div>Keyframe Interval: {config.keyframeInterval}s</div>
                    <div>Resolution: {config.resolution}</div>
                    <div>Framerate: {config.framerate} fps</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline">
                    <Terminal className="h-4 w-4 mr-2" />
                    View FFmpeg Command
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    OBS Studio Config
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auth">Stream Authentication</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Require authentication for stream publishing
                      </p>
                    </div>
                    <Switch
                      id="auth"
                      checked={config.authentication}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, authentication: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="encrypt">Stream Encryption</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use RTMPS for encrypted streaming
                      </p>
                    </div>
                    <Switch
                      id="encrypt"
                      checked={config.encryption}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, encryption: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="record">Enable Recording</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically record all streams
                      </p>
                    </div>
                    <Switch
                      id="record"
                      checked={config.recordingEnabled}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, recordingEnabled: checked }))}
                    />
                  </div>

                  {config.recordingEnabled && (
                    <div>
                      <Label>Recording Format</Label>
                      <Select 
                        value={config.recordingFormat}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, recordingFormat: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="mkv">MKV</SelectItem>
                          <SelectItem value="flv">FLV</SelectItem>
                          <SelectItem value="ts">MPEG-TS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">Stream Key Configuration</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Key Prefix</Label>
                        <Input 
                          value={streamKeyConfig.prefix}
                          onChange={(e) => setStreamKeyConfig(prev => ({ ...prev, prefix: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Key Length</Label>
                        <Input 
                          type="number"
                          value={streamKeyConfig.length}
                          onChange={(e) => setStreamKeyConfig(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="timestamp">Include Timestamp in Key</Label>
                      <Switch
                        id="timestamp"
                        checked={streamKeyConfig.includeTimestamp}
                        onCheckedChange={(checked) => setStreamKeyConfig(prev => ({ ...prev, includeTimestamp: checked }))}
                      />
                    </div>

                    <div>
                      <Label>Key Expiration (hours, 0 = never)</Label>
                      <Input 
                        type="number"
                        value={streamKeyConfig.expiresIn}
                        onChange={(e) => setStreamKeyConfig(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>IP Whitelist (one per line)</Label>
                      <Textarea 
                        value={streamKeyConfig.allowedIPs.join('\n')}
                        onChange={(e) => setStreamKeyConfig(prev => ({ 
                          ...prev, 
                          allowedIPs: e.target.value.split('\n').filter(ip => ip.trim())
                        }))}
                        placeholder="192.168.1.1&#10;10.0.0.0/24"
                        className="mt-1 font-mono text-sm"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Geo-Restrictions (country codes)</Label>
                      <Input 
                        value={streamKeyConfig.geoRestrictions.join(', ')}
                        onChange={(e) => setStreamKeyConfig(prev => ({ 
                          ...prev, 
                          geoRestrictions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        placeholder="US, CA, GB"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced settings should only be modified by experienced users.
                    Incorrect configuration may result in stream instability.
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className="font-medium mb-3">Nginx RTMP Configuration</h4>
                  <Textarea 
                    className="font-mono text-sm"
                    rows={15}
                    defaultValue={`rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        
        application live {
            live on;
            
            # Authentication
            on_publish http://localhost:8080/auth;
            
            # Recording
            record all;
            record_path /var/recordings;
            record_suffix .flv;
            
            # HLS output
            hls on;
            hls_path /var/hls;
            hls_fragment 3;
            hls_playlist_length 60;
            
            # Transcoding profiles
            exec ffmpeg -i rtmp://localhost/live/$name
                -c:a aac -b:a 128k -c:v libx264 -b:v 2500k
                -f flv rtmp://localhost/hls/$name_720p;
        }
    }
}`}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Config
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Configuration
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}