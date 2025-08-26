import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PlayCircle,
  StopCircle,
  Users,
  MessageSquare,
  Settings,
  Maximize,
  Volume2,
  VolumeX,
  Send,
  AlertCircle
} from 'lucide-react';
import Hls from 'hls.js';
import api from '../services/api';

interface LiveStreamState {
  streamConfig: any;
  viewers: number;
  messages: Array<{
    id: string;
    user: string;
    message: string;
    timestamp: Date;
  }>;
  isStreaming: boolean;
}

export default function StreamingLivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [state, setState] = useState<LiveStreamState>({
    streamConfig: location.state?.streamConfig || {},
    viewers: 0,
    messages: [],
    isStreaming: true
  });
  
  const [chatMessage, setChatMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.streamConfig?.hlsUrl) {
      setError('No stream configuration found');
      return;
    }

    // Initialize HLS.js
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(state.streamConfig.hlsUrl);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(err => {
          console.log('Autoplay prevented:', err);
          // Autoplay might be blocked, user will need to click play
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, cannot recover');
              setError('Stream playback error');
              break;
          }
        }
      });
    } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      videoRef.current.src = state.streamConfig.hlsUrl;
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [state.streamConfig]);

  useEffect(() => {
    // Simulate viewer count updates
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        viewers: Math.floor(Math.random() * 100) + 50
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStopStream = async () => {
    try {
      if (state.streamConfig.eventId) {
        await api.post(`/streaming/events/${state.streamConfig.eventId}/stop`);
      }
      setState(prev => ({ ...prev, isStreaming: false }));
      navigate('/streaming');
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setError('Failed to stop stream');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    setChatMessage('');
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Live Stream</h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  <span className="text-red-500 font-medium">LIVE</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  <Users className="inline h-4 w-4 mr-1" />
                  {state.viewers} viewers
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/streaming')}
                className="text-gray-300 border-gray-600"
              >
                <Settings className="mr-2 h-4 w-4" />
                Stream Settings
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopStream}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                End Stream
              </Button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <div className="relative bg-black rounded-t-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    controls={false}
                    muted={isMuted}
                    playsInline
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => videoRef.current?.play()}
                          className="text-white hover:bg-white/20"
                        >
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Stream Info */}
                <div className="p-4 border-t border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    {state.streamConfig.eventName || 'Live Stream'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {state.streamConfig.eventDescription || 'Currently streaming live'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 h-full flex flex-col">
              <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {state.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Be the first to say something!</p>
                    </div>
                  ) : (
                    state.messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-400">
                            {msg.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!chatMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}