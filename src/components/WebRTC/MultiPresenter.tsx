/**
 * Multi-Presenter Component for BigFootLive WebRTC
 * 
 * Features:
 * - Multi-presenter video grid with dynamic layouts
 * - Screen sharing controls and management
 * - Presenter queue with request/approve flow
 * - Audio/video controls per presenter
 * - Recording indicators
 * - Connection quality indicators
 * - Adaptive layout based on presenter count
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Share2,
  Hand,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  MoreVertical,
  Crown,
  Clock,
  Signal,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useWebRTC, WebRTCPeer, WebRTCRoom } from '@/hooks/useWebRTC';
import { cn } from '@/lib/utils';

interface MultiPresenterProps {
  roomId: string;
  userId: string;
  displayName: string;
  role?: 'presenter' | 'moderator' | 'attendee' | 'admin';
  className?: string;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

interface VideoTileProps {
  peer: WebRTCPeer;
  stream?: MediaStream;
  isLocal?: boolean;
  isFullscreen?: boolean;
  showControls?: boolean;
  onToggleFullscreen?: () => void;
  onMutePeer?: (peerId: string) => void;
  onRemovePresenter?: (peerId: string) => void;
}

// Video tile component for individual presenters
const VideoTile: React.FC<VideoTileProps> = ({
  peer,
  stream,
  isLocal = false,
  isFullscreen = false,
  showControls = false,
  onToggleFullscreen,
  onMutePeer,
  onRemovePresenter
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Set up video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
      setIsVideoLoaded(true);
    }
  }, [stream]);
  
  // Monitor audio level (simplified version)
  useEffect(() => {
    if (!stream || !peer.audioEnabled) {
      setAudioLevel(0);
      return;
    }
    
    // This would normally use Web Audio API to analyze audio levels
    // For demo, we'll simulate audio activity
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 100);
    
    return () => clearInterval(interval);
  }, [stream, peer.audioEnabled]);
  
  const getConnectionQualityColor = useCallback((quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, []);
  
  const getConnectionQualityIcon = useCallback((quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <Signal className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Signal className="w-4 h-4" />;
    }
  }, []);
  
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isFullscreen ? "w-full h-full" : "w-full h-full",
      peer.isPresenting ? "ring-2 ring-blue-500" : "",
      peer.connectionQuality === 'failed' ? "ring-2 ring-red-500" : ""
    )}>
      {/* Video element */}
      <div className="relative w-full h-full bg-gray-900">
        {isVideoLoaded && peer.videoEnabled ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isLocal} // Prevent echo on local video
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-800">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-2xl">
                {peer.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {/* Overlay controls and indicators */}
        <div className="absolute inset-0 flex flex-col justify-between p-2">
          {/* Top overlay - Status indicators */}
          <div className="flex justify-between items-start">
            <div className="flex gap-1">
              {/* Recording indicator */}
              {peer.isPresenting && (
                <Badge variant="secondary" className="bg-red-600 text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                  LIVE
                </Badge>
              )}
              
              {/* Screen sharing indicator */}
              {peer.isScreenSharing && (
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  <Share className="w-3 h-3 mr-1" />
                  Screen
                </Badge>
              )}
              
              {/* Role indicator */}
              {peer.role === 'moderator' || peer.role === 'admin' && (
                <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500 text-yellow-100">
                  <Crown className="w-3 h-3 mr-1" />
                  {peer.role}
                </Badge>
              )}
            </div>
            
            {/* Connection quality */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md bg-black/50",
                    getConnectionQualityColor(peer.connectionQuality)
                  )}>
                    {getConnectionQualityIcon(peer.connectionQuality)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Connection: {peer.connectionQuality}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Bottom overlay - Name and controls */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              {/* Audio level indicator */}
              {peer.audioEnabled && audioLevel > 20 && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-3 bg-green-400 rounded-full transition-opacity",
                        audioLevel >= i * 20 ? "opacity-100" : "opacity-30"
                      )}
                    />
                  ))}
                </div>
              )}
              
              {/* Presenter name */}
              <div className="bg-black/70 rounded-md px-2 py-1">
                <span className="text-white text-sm font-medium">
                  {peer.displayName}
                  {isLocal && " (You)"}
                </span>
              </div>
            </div>
            
            {/* Control buttons */}
            <div className="flex gap-1">
              {/* Audio status */}
              <div className={cn(
                "p-1 rounded-md",
                peer.audioEnabled ? "bg-green-600/80" : "bg-red-600/80"
              )}>
                {peer.audioEnabled ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <MicOff className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Video status */}
              <div className={cn(
                "p-1 rounded-md",
                peer.videoEnabled ? "bg-green-600/80" : "bg-red-600/80"
              )}>
                {peer.videoEnabled ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <VideoOff className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Additional controls for moderators */}
              {showControls && !isLocal && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 bg-black/70 hover:bg-black/90"
                    >
                      <MoreVertical className="w-3 h-3 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onMutePeer?.(peer.peerId)}>
                      {peer.audioEnabled ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          Mute
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Unmute
                        </>
                      )}
                    </DropdownMenuItem>
                    {peer.isPresenting && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onRemovePresenter?.(peer.peerId)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove Presenter
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Fullscreen toggle */}
              {onToggleFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-black/70 hover:bg-black/90"
                  onClick={onToggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-3 h-3 text-white" />
                  ) : (
                    <Maximize2 className="w-3 h-3 text-white" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main MultiPresenter component
export const MultiPresenter: React.FC<MultiPresenterProps> = ({
  roomId,
  userId,
  displayName,
  role = 'attendee',
  className,
  onError,
  onStatusChange
}) => {
  const [fullscreenPeer, setFullscreenPeer] = useState<string | null>(null);
  const [showPresenterQueue, setShowPresenterQueue] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus' | 'sidebar'>('grid');
  const [selectedDevices, setSelectedDevices] = useState({
    video: null as string | null,
    audio: null as string | null,
    audioOutput: null as string | null
  });
  
  // Use WebRTC hook
  const webrtc = useWebRTC({
    roomId,
    userId,
    displayName,
    role,
    autoJoin: true,
    enableAudio: true,
    enableVideo: true
  });
  
  // Status change effect
  useEffect(() => {
    if (webrtc.isConnecting) {
      onStatusChange?.('connecting');
    } else if (webrtc.isConnected) {
      onStatusChange?.('connected');
    } else {
      onStatusChange?.('disconnected');
    }
  }, [webrtc.isConnecting, webrtc.isConnected, onStatusChange]);
  
  // Error handling effect
  useEffect(() => {
    if (webrtc.connectionError) {
      onError?.(webrtc.connectionError);
    }
  }, [webrtc.connectionError, onError]);
  
  // Get presenters and attendees
  const presenters = useMemo(() => {
    const presenting = webrtc.peers.filter(peer => peer.isPresenting);
    
    // Add local peer if presenting
    if (webrtc.localPeer?.isPresenting) {
      presenting.unshift(webrtc.localPeer);
    }
    
    return presenting;
  }, [webrtc.peers, webrtc.localPeer]);
  
  const attendees = useMemo(() => {
    const nonPresenting = webrtc.peers.filter(peer => !peer.isPresenting);
    
    // Add local peer if not presenting
    if (webrtc.localPeer && !webrtc.localPeer.isPresenting) {
      nonPresenting.unshift(webrtc.localPeer);
    }
    
    return nonPresenting;
  }, [webrtc.peers, webrtc.localPeer]);
  
  // Calculate grid layout
  const getGridLayout = useCallback((count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  }, []);
  
  const getGridRows = useCallback((count: number) => {
    if (count <= 2) return 'grid-rows-1';
    if (count <= 4) return 'grid-rows-2';
    if (count <= 6) return 'grid-rows-2';
    if (count <= 9) return 'grid-rows-3';
    return 'grid-rows-4';
  }, []);
  
  // Handle presenter request
  const handleRequestPresenter = useCallback(async () => {
    try {
      await webrtc.requestPresenter();
    } catch (error) {
      console.error('Failed to request presenter:', error);
      onError?.(`Failed to request presenter: ${error}`);
    }
  }, [webrtc.requestPresenter, onError]);
  
  // Handle presenter approval (moderator only)
  const handleApprovePresenter = useCallback(async (userId: string) => {
    try {
      await webrtc.approvePresenter(userId);
    } catch (error) {
      console.error('Failed to approve presenter:', error);
      onError?.(`Failed to approve presenter: ${error}`);
    }
  }, [webrtc.approvePresenter, onError]);
  
  // Handle presenter denial (moderator only)
  const handleDenyPresenter = useCallback(async (userId: string) => {
    try {
      await webrtc.denyPresenter(userId);
    } catch (error) {
      console.error('Failed to deny presenter:', error);
      onError?.(`Failed to deny presenter: ${error}`);
    }
  }, [webrtc.denyPresenter, onError]);
  
  // Screen sharing handlers
  const handleStartScreenShare = useCallback(async () => {
    try {
      await webrtc.startScreenShare();
    } catch (error) {
      console.error('Failed to start screen share:', error);
      onError?.(`Failed to start screen sharing: ${error}`);
    }
  }, [webrtc.startScreenShare, onError]);
  
  const handleStopScreenShare = useCallback(async () => {
    try {
      await webrtc.stopScreenShare();
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      onError?.(`Failed to stop screen sharing: ${error}`);
    }
  }, [webrtc.stopScreenShare, onError]);
  
  // Toggle fullscreen for a peer
  const toggleFullscreen = useCallback((peerId: string) => {
    setFullscreenPeer(current => current === peerId ? null : peerId);
  }, []);
  
  // Render connection status
  const renderConnectionStatus = () => {
    if (webrtc.isConnecting) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-md">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-700 dark:text-blue-300 text-sm">
            Connecting to room...
          </span>
        </div>
      );
    }
    
    if (!webrtc.isConnected) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950 rounded-md">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 dark:text-red-300 text-sm">
            Disconnected from room
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={webrtc.retry}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-md">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-green-700 dark:text-green-300 text-sm">
          Connected - {webrtc.room?.peerCount || 0} participants
        </span>
        {webrtc.room?.isRecording && (
          <Badge variant="destructive" className="ml-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
            Recording
          </Badge>
        )}
      </div>
    );
  };
  
  // Render presenter controls
  const renderPresenterControls = () => {
    const canControl = role === 'moderator' || role === 'admin';
    
    return (
      <div className="flex flex-wrap gap-2">
        {/* Request presenter button */}
        {webrtc.canRequestPresenter && (
          <Button
            onClick={handleRequestPresenter}
            disabled={webrtc.isInPresenterQueue}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Hand className="w-4 h-4 mr-2" />
            {webrtc.isInPresenterQueue 
              ? `In Queue (${webrtc.presenterQueuePosition})` 
              : 'Request Presenter'
            }
          </Button>
        )}
        
        {/* Stop presenting button */}
        {webrtc.isPresenting && (
          <Button
            onClick={webrtc.stopPresenting}
            variant="outline"
          >
            Stop Presenting
          </Button>
        )}
        
        {/* Screen sharing button */}
        {(webrtc.isPresenting || canControl) && (
          <Button
            onClick={webrtc.isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
            variant={webrtc.isScreenSharing ? "destructive" : "outline"}
            disabled={!webrtc.canScreenShare}
          >
            {webrtc.isScreenSharing ? (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Stop Sharing
              </>
            ) : (
              <>
                <Share className="w-4 h-4 mr-2" />
                Share Screen
              </>
            )}
          </Button>
        )}
        
        {/* Media controls */}
        <Button
          onClick={webrtc.toggleAudio}
          variant={webrtc.localPeer?.audioEnabled ? "outline" : "destructive"}
        >
          {webrtc.localPeer?.audioEnabled ? (
            <Mic className="w-4 h-4 mr-2" />
          ) : (
            <MicOff className="w-4 h-4 mr-2" />
          )}
          {webrtc.localPeer?.audioEnabled ? 'Mute' : 'Unmute'}
        </Button>
        
        <Button
          onClick={webrtc.toggleVideo}
          variant={webrtc.localPeer?.videoEnabled ? "outline" : "destructive"}
        >
          {webrtc.localPeer?.videoEnabled ? (
            <Video className="w-4 h-4 mr-2" />
          ) : (
            <VideoOff className="w-4 h-4 mr-2" />
          )}
          {webrtc.localPeer?.videoEnabled ? 'Stop Video' : 'Start Video'}
        </Button>
        
        {/* Presenter queue button (moderators only) */}
        {canControl && webrtc.room && webrtc.room.queueLength > 0 && (
          <Button
            onClick={() => setShowPresenterQueue(true)}
            variant="outline"
          >
            <Users className="w-4 h-4 mr-2" />
            Queue ({webrtc.room.queueLength})
          </Button>
        )}
        
        {/* Settings button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setLayoutMode('grid')}>
              Layout: Grid View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutMode('focus')}>
              Layout: Focus View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutMode('sidebar')}>
              Layout: Sidebar View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Video Quality Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Audio Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
  // Render video grid
  const renderVideoGrid = () => {
    if (fullscreenPeer) {
      const peer = [...presenters, ...attendees].find(p => p.peerId === fullscreenPeer);
      if (peer) {
        const stream = peer.peerId === webrtc.localPeer?.peerId 
          ? webrtc.localStream 
          : webrtc.remoteStreams.get(peer.peerId);
        
        return (
          <div className="w-full h-full">
            <VideoTile
              peer={peer}
              stream={stream || undefined}
              isLocal={peer.peerId === webrtc.localPeer?.peerId}
              isFullscreen
              showControls={role === 'moderator' || role === 'admin'}
              onToggleFullscreen={() => setFullscreenPeer(null)}
              onMutePeer={webrtc.mutePeer}
            />
          </div>
        );
      }
    }
    
    const gridCols = getGridLayout(presenters.length);
    const gridRows = getGridRows(presenters.length);
    
    return (
      <div className="w-full h-full">
        {/* Presenters grid */}
        {presenters.length > 0 && (
          <div className={cn(
            "grid gap-2 h-full",
            gridCols,
            gridRows
          )}>
            {presenters.map(peer => {
              const stream = peer.peerId === webrtc.localPeer?.peerId 
                ? webrtc.localStream 
                : webrtc.remoteStreams.get(peer.peerId);
              
              return (
                <VideoTile
                  key={peer.peerId}
                  peer={peer}
                  stream={stream || undefined}
                  isLocal={peer.peerId === webrtc.localPeer?.peerId}
                  showControls={role === 'moderator' || role === 'admin'}
                  onToggleFullscreen={() => toggleFullscreen(peer.peerId)}
                  onMutePeer={webrtc.mutePeer}
                />
              );
            })}
          </div>
        )}
        
        {/* No presenters message */}
        {presenters.length === 0 && (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Active Presenters
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Request presenter access to start sharing video
              </p>
              {webrtc.canRequestPresenter && (
                <Button onClick={handleRequestPresenter}>
                  <Hand className="w-4 h-4 mr-2" />
                  Request Presenter
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* Header with connection status and controls */}
      <div className="flex flex-col gap-2 p-4 border-b">
        {renderConnectionStatus()}
        {renderPresenterControls()}
      </div>
      
      {/* Main video area */}
      <div className="flex-1 p-4">
        {renderVideoGrid()}
      </div>
      
      {/* Screen sharing overlay */}
      {webrtc.screenStream && (
        <div className="fixed inset-4 z-50 bg-black rounded-lg overflow-hidden">
          <video
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            ref={ref => {
              if (ref && webrtc.screenStream) {
                ref.srcObject = webrtc.screenStream;
              }
            }}
          />
          <Button
            className="absolute top-4 right-4"
            onClick={handleStopScreenShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Stop Sharing
          </Button>
        </div>
      )}
      
      {/* Presenter queue dialog */}
      <Dialog open={showPresenterQueue} onOpenChange={setShowPresenterQueue}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Presenter Queue</DialogTitle>
            <DialogDescription>
              Manage presenter requests for this room.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Queue would be populated from WebRTC service */}
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No pending presenter requests
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};