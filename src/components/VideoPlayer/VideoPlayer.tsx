import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  AlertCircle,
  SkipBack,
  SkipForward,
  Subtitles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onLoadedMetadata?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onQualityChange?: (level: number, quality: string) => void;
  enableSubtitles?: boolean;
  subtitlesUrl?: string;
  thumbnailsUrl?: string;
}

interface VideoState {
  isPlaying: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isFullscreen: boolean;
  showControls: boolean;
  availableQualities: Array<{ height: number; bitrate: number; label: string }>;
  currentQuality: number;
  showSubtitles: boolean;
  playbackRate: number;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoplay = false,
  muted = false,
  loop = false,
  className,
  onError,
  onLoadedMetadata,
  onTimeUpdate,
  onQualityChange,
  enableSubtitles = false,
  subtitlesUrl,
  thumbnailsUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekPreviewRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isLoading: true,
    isError: false,
    volume: 1,
    isMuted: muted,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    isFullscreen: false,
    showControls: true,
    availableQualities: [],
    currentQuality: -1,
    showSubtitles: false,
    playbackRate: 1,
  });

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;

    // Check if HLS is supported
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000, // 60 MB
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.25,
          enableSoftwareAES: true,
          startLevel: -1, // Auto quality
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 64000,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            availableQualities: data.levels.map((level, index) => ({
              height: level.height,
              bitrate: level.bitrate,
              label: level.height ? `${level.height}p` : `Auto`,
            })),
            currentQuality: hls.currentLevel,
          }));

          if (autoplay) {
            video.play().catch(err => {
              console.warn('Autoplay failed:', err);
            });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const quality = hls.levels[data.level];
          setState(prev => ({ ...prev, currentQuality: data.level }));
          onQualityChange?.(data.level, quality.height ? `${quality.height}p` : 'Auto');
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Fatal network error encountered, trying to recover');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Fatal media error encountered, trying to recover');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, cannot recover:', data);
                setState(prev => ({
                  ...prev,
                  isError: true,
                  isLoading: false,
                  errorMessage: 'Failed to load video stream',
                }));
                onError?.(new Error(data.details));
                hls.destroy();
                break;
            }
          }
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const bufferedPercent = (bufferedEnd / video.duration) * 100;
            setState(prev => ({ ...prev, buffered: bufferedPercent }));
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        setState(prev => ({
          ...prev,
          isError: true,
          isLoading: false,
          errorMessage: 'HLS is not supported in this browser',
        }));
        onError?.(new Error('HLS not supported'));
      }
    } else {
      // Regular video file
      video.src = src;
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay, onError, onQualityChange]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: video.duration }));
      onLoadedMetadata?.(video.duration);
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ 
        ...prev, 
        currentTime: video.currentTime,
        duration: video.duration 
      }));
      onTimeUpdate?.(video.currentTime, video.duration);
    };

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      if (loop && video) {
        video.currentTime = 0;
        video.play();
      }
    };

    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: video.volume,
        isMuted: video.muted 
      }));
    };

    const handleWaiting = () => setState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isLoading: false }));
    
    const handleError = () => {
      setState(prev => ({ 
        ...prev, 
        isError: true, 
        isLoading: false,
        errorMessage: 'Failed to load video' 
      }));
      onError?.(new Error('Video loading error'));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [loop, onLoadedMetadata, onTimeUpdate, onError]);

  // Control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.warn('Play failed:', err);
      });
    }
  }, [state.isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value[0];
    if (value[0] > 0 && video.muted) {
      video.muted = false;
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setState(prev => ({ ...prev, isFullscreen: true }));
      });
    } else {
      document.exitFullscreen().then(() => {
        setState(prev => ({ ...prev, isFullscreen: false }));
      });
    }
  }, []);

  const changeQuality = useCallback((level: string) => {
    const levelIndex = parseInt(level);
    if (hlsRef.current && levelIndex >= -1) {
      hlsRef.current.currentLevel = levelIndex;
    }
  }, []);

  const changePlaybackRate = useCallback((rate: string) => {
    const video = videoRef.current;
    if (!video) return;
    const playbackRate = parseFloat(rate);
    video.playbackRate = playbackRate;
    setState(prev => ({ ...prev, playbackRate }));
  }, []);

  const toggleSubtitles = useCallback(() => {
    setState(prev => ({ ...prev, showSubtitles: !prev.showSubtitles }));
    // Add subtitle track management here if needed
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setState(prev => ({ ...prev, showControls: true }));
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (state.isPlaying) {
          setState(prev => ({ ...prev, showControls: false }));
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (state.isPlaying) {
          setState(prev => ({ ...prev, showControls: false }));
        }
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [state.isPlaying]);

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange([Math.min(1, state.volume + 0.1)]);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange([Math.max(0, state.volume - 0.1)]);
          break;
        case 'c':
          e.preventDefault();
          toggleSubtitles();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) * 10;
          handleSeek([(state.duration * percent) / 100]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, toggleFullscreen, toggleMute, skip, handleVolumeChange, handleSeek, toggleSubtitles, state.volume, state.duration]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        state.isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
      />

      {/* Loading Spinner */}
      {state.isLoading && !state.isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      {/* Error State */}
      {state.isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white">
          <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
          <p className="text-lg font-medium mb-2">Unable to load video</p>
          <p className="text-sm text-gray-400">{state.errorMessage}</p>
        </div>
      )}

      {/* Subtitles */}
      {state.showSubtitles && subtitlesUrl && (
        <div className="absolute bottom-24 left-0 right-0 text-center">
          <div className="inline-block bg-black/75 text-white px-4 py-2 rounded">
            {/* Subtitle content would be rendered here */}
            <span className="text-lg">Subtitles placeholder</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300',
        state.showControls || !state.isPlaying ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <div className="relative">
            {/* Buffered Progress */}
            <div className="absolute inset-0 bg-white/20 rounded-full" style={{ width: `${state.buffered}%` }} />
            
            {/* Seek Slider */}
            <Slider
              value={[state.currentTime]}
              min={0}
              max={state.duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="relative z-10"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {state.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip Backward */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Skip Forward */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {state.isMuted || state.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[state.isMuted ? 0 : state.volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="text-white text-sm font-mono">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Subtitles */}
            {enableSubtitles && (
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSubtitles}
                className={cn(
                  "text-white hover:bg-white/20",
                  state.showSubtitles && "bg-white/20"
                )}
              >
                <Subtitles className="h-4 w-4" />
              </Button>
            )}

            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Quality Settings */}
                {state.availableQualities.length > 0 && (
                  <>
                    <DropdownMenuLabel>Quality</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={state.currentQuality.toString()}
                      onValueChange={changeQuality}
                    >
                      <DropdownMenuRadioItem value="-1">
                        Auto
                      </DropdownMenuRadioItem>
                      {state.availableQualities.map((quality, index) => (
                        <DropdownMenuRadioItem key={index} value={index.toString()}>
                          {quality.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Playback Speed */}
                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={state.playbackRate.toString()}
                  onValueChange={changePlaybackRate}
                >
                  <DropdownMenuRadioItem value="0.25">0.25x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="0.75">0.75x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1">Normal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.25">1.25x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {state.isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && state.showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white text-lg font-medium">{title}</h3>
        </div>
      )}
    </div>
  );
}