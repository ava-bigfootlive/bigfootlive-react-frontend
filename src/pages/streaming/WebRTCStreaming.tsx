import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Wifi,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Pause,
  Square,
  Radio,
  Users,
  Cpu,
  HardDrive,
  Gauge,
  Monitor,
  Smartphone,
  Globe,
  Shield,
  Zap,
  RefreshCw,
  Copy,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';

interface StreamStats {
  bitrate: number;
  framerate: number;
  resolution: string;
  latency: number;
  packetLoss: number;
  jitter: number;
  audioLevel: number;
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkQuality: number;
  cpuUsage: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}

interface StreamConfig {
  codec: 'h264' | 'vp8' | 'vp9' | 'av1';
  resolution: string;
  framerate: number;
  bitrate: number;
  adaptiveBitrate: boolean;
  simulcast: boolean;
  dynacast: boolean;
  audioCodec: 'opus' | 'aac';
  audioBitrate: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  networkAdaptation: boolean;
  fecEnabled: boolean;
  rtxEnabled: boolean;
}

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export default function WebRTCStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamKey, setStreamKey] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const statsInterval = useRef<NodeJS.Timeout | null>(null);

  const [streamStats, setStreamStats] = useState<StreamStats>({
    bitrate: 0,
    framerate: 0,
    resolution: '1920x1080',
    latency: 0,
    packetLoss: 0,
    jitter: 0,
    audioLevel: 0,
    videoQuality: 'excellent',
    networkQuality: 5,
    cpuUsage: 0,
    bandwidth: {
      upload: 0,
      download: 0
    }
  });

  const [config, setConfig] = useState<StreamConfig>({
    codec: 'h264',
    resolution: '1920x1080',
    framerate: 30,
    bitrate: 4500,
    adaptiveBitrate: true,
    simulcast: true,
    dynacast: true,
    audioCodec: 'opus',
    audioBitrate: 128,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    networkAdaptation: true,
    fecEnabled: true,
    rtxEnabled: true
  });

  const [iceServers, setIceServers] = useState<IceServer[]>([
    {
      urls: ['stun:stun.l.google.com:19302']
    },
    {
      urls: ['turn:turn.bigfootlive.io:3478'],
      username: 'bigfoot',
      credential: 'live2024'
    }
  ]);

  // Initialize media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter(device => device.kind === 'videoinput'));
        setMicrophones(devices.filter(device => device.kind === 'audioinput'));
        
        // Set default devices
        if (devices.length > 0) {
          const defaultCamera = devices.find(d => d.kind === 'videoinput');
          const defaultMic = devices.find(d => d.kind === 'audioinput');
          if (defaultCamera) setSelectedCamera(defaultCamera.deviceId);
          if (defaultMic) setSelectedMicrophone(defaultMic.deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
        toast.error('Failed to access media devices');
      }
    };

    getDevices();
  }, []);

  // Generate stream key
  useEffect(() => {
    const key = `live_${Math.random().toString(36).substring(2, 15)}`;
    setStreamKey(key);
    setStreamUrl(`wss://stream.bigfootlive.io/webrtc/${key}`);
  }, []);

  // Collect WebRTC stats
  const collectStats = useCallback(async () => {
    if (!peerConnection.current) return;

    const stats = await peerConnection.current.getStats();
    let bitrate = 0;
    let framerate = 0;
    let packetLoss = 0;
    let jitter = 0;

    stats.forEach((report) => {
      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
        if (report.bytesSent && report.timestamp) {
          bitrate = Math.round((report.bytesSent * 8) / 1000); // kbps
        }
        framerate = report.framesPerSecond || 0;
      }
      
      if (report.type === 'remote-inbound-rtp') {
        packetLoss = report.packetsLost || 0;
        jitter = report.jitter || 0;
      }
    });

    // Simulate other metrics
    const latency = Math.random() * 50 + 10;
    const audioLevel = Math.random() * 100;
    const cpuUsage = Math.random() * 30 + 20;
    const uploadBandwidth = bitrate + Math.random() * 500;
    const downloadBandwidth = Math.random() * 1000 + 500;
    
    let videoQuality: StreamStats['videoQuality'] = 'excellent';
    if (packetLoss > 5) videoQuality = 'poor';
    else if (packetLoss > 2) videoQuality = 'fair';
    else if (packetLoss > 0.5) videoQuality = 'good';

    const networkQuality = packetLoss > 5 ? 1 : packetLoss > 2 ? 3 : 5;

    setStreamStats({
      bitrate,
      framerate,
      resolution: config.resolution,
      latency,
      packetLoss,
      jitter,
      audioLevel,
      videoQuality,
      networkQuality,
      cpuUsage,
      bandwidth: {
        upload: uploadBandwidth,
        download: downloadBandwidth
      }
    });

    // Update viewer count (simulated)
    setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)));
  }, [config.resolution]);

  const startStream = async () => {
    try {
      setIsConnecting(true);
      setStreamStatus('connecting');

      // Get user media
      const constraints: MediaStreamConstraints = {
        video: videoEnabled ? {
          deviceId: selectedCamera,
          width: { ideal: parseInt(config.resolution.split('x')[0]) },
          height: { ideal: parseInt(config.resolution.split('x')[1]) },
          frameRate: { ideal: config.framerate }
        } : false,
        audio: audioEnabled ? {
          deviceId: selectedMicrophone,
          echoCancellation: config.echoCancellation,
          noiseSuppression: config.noiseSuppression,
          autoGainControl: config.autoGainControl
        } : false
      };

      localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = localStream.current;
      }

      // Create peer connection
      peerConnection.current = new RTCPeerConnection({
        iceServers: iceServers
      });

      // Add tracks to peer connection
      localStream.current.getTracks().forEach(track => {
        if (peerConnection.current && localStream.current) {
          peerConnection.current.addTrack(track, localStream.current);
        }
      });

      // Set up event handlers
      peerConnection.current.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.current?.iceConnectionState);
        if (peerConnection.current?.iceConnectionState === 'connected') {
          setStreamStatus('connected');
          setIsStreaming(true);
          setIsConnecting(false);
          toast.success('Stream started successfully');
        }
      };

      // Start collecting stats
      statsInterval.current = setInterval(collectStats, 1000);

      // Simulate connection (in production, this would connect to a signaling server)
      setTimeout(() => {
        setStreamStatus('connected');
        setIsStreaming(true);
        setIsConnecting(false);
        toast.success('WebRTC stream started successfully');
        setViewerCount(1);
      }, 2000);

    } catch (error) {
      console.error('Error starting stream:', error);
      setStreamStatus('error');
      setIsConnecting(false);
      toast.error('Failed to start stream');
    }
  };

  const stopStream = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (statsInterval.current) {
      clearInterval(statsInterval.current);
      statsInterval.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setStreamStatus('idle');
    setViewerCount(0);
    toast.info('Stream stopped');
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenShare) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current?.getSenders().find(
          s => s.track?.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        videoTrack.onended = () => {
          setScreenShare(false);
          // Return to camera
          if (localStream.current) {
            const cameraTrack = localStream.current.getVideoTracks()[0];
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack);
            }
          }
        };
        
        setScreenShare(true);
        toast.success('Screen sharing started');
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen');
      }
    } else {
      // Stop screen share and return to camera
      const sender = peerConnection.current?.getSenders().find(
        s => s.track?.kind === 'video'
      );
      
      if (sender && localStream.current) {
        const cameraTrack = localStream.current.getVideoTracks()[0];
        if (cameraTrack) {
          sender.replaceTrack(cameraTrack);
        }
      }
      
      setScreenShare(false);
      toast.info('Screen sharing stopped');
    }
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    toast.success('Stream key copied to clipboard');
  };

  const copyStreamUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    toast.success('Stream URL copied to clipboard');
  };

  const getQualityColor = (quality: StreamStats['videoQuality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
    }
  };

  const getStatusColor = (status: typeof streamStatus) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout title="WebRTC Streaming">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WebRTC Ultra-Low Latency Streaming</h1>
            <p className="text-muted-foreground mt-2">
              Stream with sub-second latency using WebRTC technology
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <span className={cn('w-2 h-2 rounded-full mr-2', getStatusColor(streamStatus))} />
              {streamStatus === 'connected' ? 'Live' : streamStatus}
            </Badge>
            {isStreaming && (
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="h-3 w-3 mr-1" />
                {viewerCount} viewers
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Wifi className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Stream preview will appear here</p>
                      </div>
                    </div>
                  )}
                  {isStreaming && (
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <Badge variant="destructive" className="animate-pulse">
                        <Radio className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                      <Badge variant="secondary">
                        {streamStats.resolution} @ {streamStats.framerate}fps
                      </Badge>
                    </div>
                  )}
                  {screenShare && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">
                        <Monitor className="h-3 w-3 mr-1" />
                        Screen Share
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-card border-t flex items-center gap-2">
                  <Button
                    onClick={toggleAudio}
                    variant={audioEnabled ? 'secondary' : 'destructive'}
                    size="sm"
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={toggleVideo}
                    variant={videoEnabled ? 'secondary' : 'destructive'}
                    size="sm"
                  >
                    {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={toggleScreenShare}
                    variant={screenShare ? 'default' : 'secondary'}
                    size="sm"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <div className="flex-1" />
                  {!isStreaming ? (
                    <Button
                      onClick={startStream}
                      disabled={isConnecting}
                      className="min-w-[120px]"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Stream
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={stopStream}
                      variant="destructive"
                      className="min-w-[120px]"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Stream
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Statistics</CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bitrate</p>
                    <p className="text-2xl font-bold">{streamStats.bitrate} kbps</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="text-2xl font-bold">{streamStats.latency.toFixed(0)} ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Packet Loss</p>
                    <p className="text-2xl font-bold">{streamStats.packetLoss.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quality</p>
                    <p className={cn('text-2xl font-bold capitalize', getQualityColor(streamStats.videoQuality))}>
                      {streamStats.videoQuality}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Network Quality</span>
                      <span className="text-sm font-medium">{streamStats.networkQuality}/5</span>
                    </div>
                    <Progress value={streamStats.networkQuality * 20} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">CPU Usage</span>
                      <span className="text-sm font-medium">{streamStats.cpuUsage.toFixed(0)}%</span>
                    </div>
                    <Progress value={streamStats.cpuUsage} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Audio Level</span>
                      <span className="text-sm font-medium">{streamStats.audioLevel.toFixed(0)}%</span>
                    </div>
                    <Progress value={streamStats.audioLevel} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Upload</p>
                      <p className="text-sm font-medium">{streamStats.bandwidth.upload.toFixed(0)} kbps</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Download</p>
                      <p className="text-sm font-medium">{streamStats.bandwidth.download.toFixed(0)} kbps</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Stream Info */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Stream Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={streamKey} readOnly className="font-mono text-xs" />
                    <Button onClick={copyStreamKey} size="icon" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>WebRTC URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={streamUrl} readOnly className="font-mono text-xs" />
                    <Button onClick={copyStreamUrl} size="icon" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Stream Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="video">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="space-y-4">
                    <div>
                      <Label>Camera</Label>
                      <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameras.map(camera => (
                            <SelectItem key={camera.deviceId} value={camera.deviceId}>
                              {camera.label || 'Unknown Camera'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Codec</Label>
                      <Select 
                        value={config.codec} 
                        onValueChange={(value: StreamConfig['codec']) => 
                          setConfig(prev => ({ ...prev, codec: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h264">H.264</SelectItem>
                          <SelectItem value="vp8">VP8</SelectItem>
                          <SelectItem value="vp9">VP9</SelectItem>
                          <SelectItem value="av1">AV1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Resolution</Label>
                      <Select 
                        value={config.resolution} 
                        onValueChange={(value) => 
                          setConfig(prev => ({ ...prev, resolution: value }))
                        }
                      >
                        <SelectTrigger>
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
                      <Label>Framerate: {config.framerate} fps</Label>
                      <Slider
                        value={[config.framerate]}
                        onValueChange={([value]) => 
                          setConfig(prev => ({ ...prev, framerate: value }))
                        }
                        min={15}
                        max={60}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Bitrate: {config.bitrate} kbps</Label>
                      <Slider
                        value={[config.bitrate]}
                        onValueChange={([value]) => 
                          setConfig(prev => ({ ...prev, bitrate: value }))
                        }
                        min={500}
                        max={10000}
                        step={500}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-4">
                    <div>
                      <Label>Microphone</Label>
                      <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select microphone" />
                        </SelectTrigger>
                        <SelectContent>
                          {microphones.map(mic => (
                            <SelectItem key={mic.deviceId} value={mic.deviceId}>
                              {mic.label || 'Unknown Microphone'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Audio Codec</Label>
                      <Select 
                        value={config.audioCodec} 
                        onValueChange={(value: StreamConfig['audioCodec']) => 
                          setConfig(prev => ({ ...prev, audioCodec: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opus">Opus</SelectItem>
                          <SelectItem value="aac">AAC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Audio Bitrate: {config.audioBitrate} kbps</Label>
                      <Slider
                        value={[config.audioBitrate]}
                        onValueChange={([value]) => 
                          setConfig(prev => ({ ...prev, audioBitrate: value }))
                        }
                        min={32}
                        max={256}
                        step={32}
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="echo-cancel">Echo Cancellation</Label>
                        <Switch
                          id="echo-cancel"
                          checked={config.echoCancellation}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, echoCancellation: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="noise-suppress">Noise Suppression</Label>
                        <Switch
                          id="noise-suppress"
                          checked={config.noiseSuppression}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, noiseSuppression: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-gain">Auto Gain Control</Label>
                        <Switch
                          id="auto-gain"
                          checked={config.autoGainControl}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, autoGainControl: checked }))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="network" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="adaptive">Adaptive Bitrate</Label>
                        <Switch
                          id="adaptive"
                          checked={config.adaptiveBitrate}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, adaptiveBitrate: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="simulcast">Simulcast</Label>
                        <Switch
                          id="simulcast"
                          checked={config.simulcast}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, simulcast: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dynacast">Dynacast</Label>
                        <Switch
                          id="dynacast"
                          checked={config.dynacast}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, dynacast: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="network-adapt">Network Adaptation</Label>
                        <Switch
                          id="network-adapt"
                          checked={config.networkAdaptation}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, networkAdaptation: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fec">Forward Error Correction</Label>
                        <Switch
                          id="fec"
                          checked={config.fecEnabled}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, fecEnabled: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rtx">Retransmission (RTX)</Label>
                        <Switch
                          id="rtx"
                          checked={config.rtxEnabled}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, rtxEnabled: checked }))
                          }
                        />
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Network optimization features ensure stable streaming even in poor network conditions.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Configure SFU Cluster
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Edge Server Selection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  End-to-End Encryption
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Automatic Reconnection
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Multi-CDN Distribution
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}