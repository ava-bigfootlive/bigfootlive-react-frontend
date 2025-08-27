import { useState, useEffect, useRef } from 'react';
import { Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

interface VideoThumbnailProps {
  src: string;
  poster?: string;
  time?: number; // Time in seconds to capture thumbnail
  className?: string;
  onClick?: () => void;
  showPlayButton?: boolean;
  showDuration?: boolean;
  duration?: number;
}

export function VideoThumbnail({
  src,
  poster,
  time = 5,
  className,
  onClick,
  showPlayButton = true,
  showDuration = false,
  duration,
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(poster || null);
  const [isLoading, setIsLoading] = useState(!poster);
  const [error, setError] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (poster || !src) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const captureFrame = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setThumbnail(url);
          setIsLoading(false);
        }
      }, 'image/jpeg', 0.8);
    };

    // Setup HLS if needed
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          maxBufferLength: 5, // Only buffer a small amount for thumbnail
          maxMaxBufferLength: 10,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.currentTime = time;
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            setError(true);
            setIsLoading(false);
            hls.destroy();
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support
        video.src = src;
        video.currentTime = time;
      } else {
        setError(true);
        setIsLoading(false);
      }
    } else {
      // Regular video file
      video.src = src;
      video.currentTime = time;
    }

    const handleSeeked = () => {
      captureFrame();
      
      // Clean up
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const handleError = () => {
      console.error('Video thumbnail error');
      setError(true);
      setIsLoading(false);
    };

    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (thumbnail && thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnail);
      }
    };
  }, [src, poster, time, thumbnail]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        'relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      {/* Hidden video and canvas for thumbnail generation */}
      {!poster && (
        <>
          <video
            ref={videoRef}
            className="hidden"
            crossOrigin="anonymous"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}

      {/* Display thumbnail or loading/error state */}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span className="text-xs">Failed to load thumbnail</span>
        </div>
      ) : thumbnail ? (
        <>
          <img 
            src={thumbnail} 
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Play button overlay */}
      {showPlayButton && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Duration badge */}
      {showDuration && duration && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
}