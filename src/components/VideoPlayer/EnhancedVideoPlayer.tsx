import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Subtitles,
  Cast,
  PictureInPicture,
  Download,
  Share,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Monitor,
  Airplay
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Chapter {
  time: number;
  title: string;
  thumbnail?: string;
}

interface Caption {
  language: string;
  label: string;
  url: string;
}

interface EnhancedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  chapters?: Chapter[];
  captions?: Caption[];
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  savedProgress?: number;
  className?: string;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  src,
  poster,
  title,
  chapters = [],
  captions = [],
  onTimeUpdate,
  onEnded,
  savedProgress,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [availableQualities, setAvailableQualities] = useState<any[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [bufferedPercentage, setBufferedPercentage] = useState(0);
  const [thumbnailPosition, setThumbnailPosition] = useState(0);
  const [thumbnailTime, setThumbnailTime] = useState('00:00');
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          const qualities = hls.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate,
            label: level.height ? `${level.height}p` : 'Auto'
          }));
          setAvailableQualities(qualities);
          setIsLoading(false);

          // Check if it's a live stream
          setIsLive(data.levels[0]?.details?.live || false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data);
            setIsLoading(false);
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = src;
        setIsLoading(false);
      }
    } else {
      // Regular video file
      video.src = src;
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  // Load saved progress
  useEffect(() => {
    if (savedProgress && videoRef.current && duration > 0) {
      videoRef.current.currentTime = savedProgress;
    }
  }, [savedProgress, duration]);

  // Load saved volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('videoPlayerVolume');
    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    }
  }, []);

  // Save volume to localStorage
  useEffect(() => {
    localStorage.setItem('videoPlayerVolume', volume.toString());
  }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      const video = videoRef.current;
      const activeElement = document.activeElement;
      
      // Don't handle if typing in an input
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 't':
          e.preventDefault();
          setIsTheaterMode(!isTheaterMode);
          break;
        case 'c':
          e.preventDefault();
          toggleCaptions();
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
          video.currentTime = (duration * percent) / 100;
          break;
        case '<':
          e.preventDefault();
          changePlaybackRate(Math.max(0.25, playbackRate - 0.25));
          break;
        case '>':
          e.preventDefault();
          changePlaybackRate(Math.min(2, playbackRate + 0.25));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume, duration, isFullscreen, isTheaterMode, playbackRate]);

  // Auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      hideControls();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) {
          setShowControls(false);
        }
      });
    }

    hideControls();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Update current chapter
  useEffect(() => {
    const chapterIndex = chapters.findIndex((chapter, index) => {
      const nextChapter = chapters[index + 1];
      return currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time);
    });
    setCurrentChapterIndex(chapterIndex);
  }, [currentTime, chapters]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const changeVolume = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    const vol = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (!isPiPActive) {
        if (document.pictureInPictureEnabled) {
          await videoRef.current.requestPictureInPicture();
          setIsPiPActive(true);
        }
      } else {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPiPActive(false);
        }
      }
    } catch (err) {
      console.error('Error toggling PiP:', err);
    }
  }, [isPiPActive]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const changeQuality = useCallback((qualityIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = qualityIndex;
    setSelectedQuality(qualityIndex);
  }, []);

  const toggleCaptions = useCallback(() => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    
    if (selectedCaption) {
      // Turn off current captions
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden';
      }
      setSelectedCaption('');
    } else if (captions.length > 0) {
      // Turn on first available caption
      setSelectedCaption(captions[0].language);
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].language === captions[0].language) {
          tracks[i].mode = 'showing';
        }
      }
    }
  }, [selectedCaption, captions]);

  const selectCaption = useCallback((language: string) => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    
    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i].language === language) {
        tracks[i].mode = 'showing';
      } else {
        tracks[i].mode = 'hidden';
      }
    }
    setSelectedCaption(language);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, [duration]);

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !thumbnailRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    
    setThumbnailPosition(percent * 100);
    setThumbnailTime(formatTime(time));
    setShowThumbnail(true);
  }, [duration]);

  const skipToChapter = useCallback((chapterTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = chapterTime;
    setCurrentTime(chapterTime);
  }, []);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadVideo = useCallback(() => {
    const a = document.createElement('a');
    a.href = src;
    a.download = title || 'video.mp4';
    a.click();
  }, [src, title]);

  const shareVideo = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: title || 'Video',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [title]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }

    // Update buffered percentage
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / videoRef.current.duration) * 100;
      setBufferedPercentage(bufferedPercent);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  return (
    <TooltipProvider>
      <div 
        ref={containerRef}
        className={cn(
          "relative group bg-black overflow-hidden",
          isTheaterMode && "theater-mode",
          className
        )}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
        >
          {/* Add caption tracks */}
          {captions.map((caption) => (
            <track
              key={caption.language}
              src={caption.url}
              kind="captions"
              srcLang={caption.language}
              label={caption.label}
            />
          ))}
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}

        {/* Chapter Display */}
        {currentChapterIndex >= 0 && chapters[currentChapterIndex] && (
          <div className={cn(
            "absolute top-4 left-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <Badge variant="secondary" className="bg-black/70 text-white">
              {chapters[currentChapterIndex].title}
            </Badge>
          </div>
        )}

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-600 text-white animate-pulse">
              LIVE
            </Badge>
          </div>
        )}

        {/* Controls Container */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-4 group/progress"
            onClick={seek}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setShowThumbnail(false)}
          >
            {/* Buffered Progress */}
            <div 
              className="absolute h-full bg-white/30 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />
            
            {/* Played Progress */}
            <div 
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Progress Handle */}
            <div 
              className="absolute w-3 h-3 bg-primary rounded-full -mt-1 transform -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {/* Thumbnail Preview */}
            {showThumbnail && (
              <div 
                ref={thumbnailRef}
                className="absolute -top-16 transform -translate-x-1/2 bg-black/90 rounded px-2 py-1 text-white text-xs pointer-events-none"
                style={{ left: `${thumbnailPosition}%` }}
              >
                {thumbnailTime}
              </div>
            )}

            {/* Chapter Markers */}
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className="absolute w-1 h-2 bg-white/60 -mt-0.5 transform -translate-x-1/2"
                style={{ left: `${(chapter.time / duration) * 100}%` }}
                title={chapter.title}
              />
            ))}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Pause (Space)' : 'Play (Space)'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Skip Back */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back 10s (←)</p>
                </TooltipContent>
              </Tooltip>

              {/* Skip Forward */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                      }
                    }}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Forward 10s (→)</p>
                </TooltipContent>
              </Tooltip>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mute (M)</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={([val]) => changeVolume(val)}
                    max={1}
                    step={0.01}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {isLive ? 'LIVE' : formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Chapters Menu */}
              {chapters.length > 0 && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chapters</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Chapters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {chapters.map((chapter, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => skipToChapter(chapter.time)}
                        className={cn(
                          "cursor-pointer",
                          currentChapterIndex === index && "bg-primary/10"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{chapter.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(chapter.time)}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Captions */}
              {captions.length > 0 && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "text-white hover:bg-white/20",
                            selectedCaption && "text-primary"
                          )}
                        >
                          <Subtitles className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Captions (C)</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Captions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => selectCaption('')}
                      className="cursor-pointer"
                    >
                      <span className={!selectedCaption ? 'font-semibold' : ''}>
                        Off
                      </span>
                    </DropdownMenuItem>
                    {captions.map((caption) => (
                      <DropdownMenuItem
                        key={caption.language}
                        onClick={() => selectCaption(caption.language)}
                        className="cursor-pointer"
                      >
                        <span className={selectedCaption === caption.language ? 'font-semibold' : ''}>
                          {caption.label}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Settings Menu */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Playback Speed */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Speed: {playbackRate}x</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                        <DropdownMenuItem
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={cn(
                            "cursor-pointer",
                            playbackRate === rate && "font-semibold"
                          )}
                        >
                          {rate}x {rate === 1 && '(Normal)'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Quality */}
                  {availableQualities.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span>
                          Quality: {selectedQuality === -1 
                            ? 'Auto' 
                            : availableQualities.find(q => q.index === selectedQuality)?.label}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem
                          onClick={() => changeQuality(-1)}
                          className={cn(
                            "cursor-pointer",
                            selectedQuality === -1 && "font-semibold"
                          )}
                        >
                          Auto
                        </DropdownMenuItem>
                        {availableQualities.map((quality) => (
                          <DropdownMenuItem
                            key={quality.index}
                            onClick={() => changeQuality(quality.index)}
                            className={cn(
                              "cursor-pointer",
                              selectedQuality === quality.index && "font-semibold"
                            )}
                          >
                            {quality.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  <DropdownMenuSeparator />
                  
                  {/* Additional Actions */}
                  <DropdownMenuItem onClick={downloadVideo} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={shareVideo} className="cursor-pointer">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Picture in Picture */}
              {document.pictureInPictureEnabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-white hover:bg-white/20",
                        isPiPActive && "text-primary"
                      )}
                      onClick={togglePiP}
                    >
                      <PictureInPicture className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Picture in Picture (P)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Theater Mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white hover:bg-white/20",
                      isTheaterMode && "text-primary"
                    )}
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Theater Mode (T)</p>
                </TooltipContent>
              </Tooltip>

              {/* Fullscreen */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fullscreen (F)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Click to Play Overlay */}
        {!isPlaying && !isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedVideoPlayer;