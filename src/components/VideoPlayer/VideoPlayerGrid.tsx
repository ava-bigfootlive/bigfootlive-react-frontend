import { VideoPlayer } from './VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VideoAsset {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  status: 'ready' | 'processing' | 'failed';
  qualities?: string[];
}

interface VideoPlayerGridProps {
  videos: VideoAsset[];
  columns?: 1 | 2 | 3 | 4;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
  onVideoError?: (videoId: string, error: Error) => void;
  onVideoClick?: (video: VideoAsset) => void;
}

export function VideoPlayerGrid({
  videos,
  columns = 2,
  autoplay = false,
  muted = true,
  className,
  onVideoError,
  onVideoClick,
}: VideoPlayerGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {videos.map((video) => (
        <Card 
          key={video.id} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onVideoClick?.(video)}
        >
          <CardHeader className="p-4">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base truncate flex-1">
                {video.title}
              </CardTitle>
              <Badge variant={getStatusVariant(video.status)} className="text-xs">
                {video.status}
              </Badge>
            </div>
            {video.duration && (
              <p className="text-xs text-gray-500 mt-1">
                Duration: {formatDuration(video.duration)}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {video.status === 'ready' ? (
              <div className="aspect-video">
                <VideoPlayer
                  src={video.url}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  autoplay={autoplay}
                  muted={muted}
                  className="h-full"
                  onError={(error) => onVideoError?.(video.id, error)}
                />
              </div>
            ) : video.status === 'processing' ? (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">Processing video...</p>
                  <p className="text-xs text-gray-400 mt-1">This may take a few minutes</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm">Failed to process</p>
                  <p className="text-xs mt-1">Please try uploading again</p>
                </div>
              </div>
            )}
            {video.qualities && video.qualities.length > 0 && (
              <div className="p-2 border-t bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-gray-500 mr-1">Available:</span>
                  {video.qualities.map((quality) => (
                    <Badge key={quality} variant="outline" className="text-xs">
                      {quality}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}