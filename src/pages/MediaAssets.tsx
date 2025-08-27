import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { VideoPlayerGrid } from '@/components/VideoPlayer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3x3,
  Grid2x2,
  Square,
  List,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  Play,
  FileVideo
} from 'lucide-react';
import { apiClient } from '../services/api';
import { toast } from 'sonner';

interface MediaAsset {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnail_url: string | null;
  processing_status: 'queued' | 'processing' | 'completed' | 'failed';
  file_size: number;
  duration: number | null;
  created_at: string;
  updated_at?: string;
  metadata?: any;
}

export default function MediaAssets() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'processing' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [gridColumns, setGridColumns] = useState<1 | 2 | 3 | 4>(3);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAndSortAssets();
  }, [assets, searchQuery, filterStatus, sortBy]);

  // Auto-refresh for processing videos
  useEffect(() => {
    const hasProcessing = assets.some(a => a.processing_status === 'processing' || a.processing_status === 'queued');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      loadAssets(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [assets]);

  const loadAssets = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await apiClient.getUserMedia(1, 100);
      const mediaAssets = response.items || [];
      
      // Transform to match our interface if needed
      const transformedAssets = mediaAssets.map((asset: any) => ({
        ...asset,
        url: asset.url || (asset.processing_status === 'completed' 
          ? `https://d39hsmqppuzm82.cloudfront.net/media/${asset.id}/master.m3u8`
          : ''),
        processing_status: asset.processing_status === 'completed' ? 'completed' :
                          asset.processing_status === 'failed' ? 'failed' :
                          asset.processing_status === 'queued' ? 'queued' : 'processing'
      }));
      
      setAssets(transformedAssets);
    } catch (error) {
      console.error('Failed to load assets:', error);
      // Load demo data
      setAssets([
        {
          id: 'demo-1',
          title: 'Sample Event Recording',
          description: 'Live event from December 2024',
          type: 'video/mp4',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          thumbnail_url: 'https://via.placeholder.com/640x360/1e40af/ffffff?text=Sample+Video',
          processing_status: 'completed',
          file_size: 52428800,
          duration: 634,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          metadata: { bitrate: '5000k', resolution: '1920x1080', fps: 30 }
        },
        {
          id: 'demo-2',
          title: 'Product Launch Stream',
          description: 'Q4 2024 Product Launch',
          type: 'video/mp4',
          url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
          thumbnail_url: 'https://via.placeholder.com/640x360/059669/ffffff?text=Product+Launch',
          processing_status: 'completed',
          file_size: 157286400,
          duration: 1507,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          metadata: { bitrate: '8000k', resolution: '3840x2160', fps: 60 }
        },
        {
          id: 'demo-3',
          title: 'Training Session',
          description: 'Employee training webinar',
          type: 'video/mp4',
          url: '',
          thumbnail_url: 'https://via.placeholder.com/640x360/dc2626/ffffff?text=Processing',
          processing_status: 'processing',
          file_size: 104857600,
          duration: null,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const filterAndSortAssets = () => {
    let filtered = [...assets];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(asset => {
        if (filterStatus === 'ready') return asset.processing_status === 'completed';
        if (filterStatus === 'processing') return asset.processing_status === 'processing' || asset.processing_status === 'queued';
        if (filterStatus === 'failed') return asset.processing_status === 'failed';
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.file_size - a.file_size;
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  };

  const handleVideoClick = (asset: MediaAsset) => {
    if (asset.processing_status === 'completed' && asset.url) {
      setSelectedAsset(asset);
      setShowPlayer(true);
    }
  };

  const handleVideoError = (videoId: string, error: Error) => {
    console.error(`Error playing video ${videoId}:`, error);
    toast.error('Failed to play video');
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await apiClient.deleteMedia(assetId);
      setAssets(prev => prev.filter(a => a.id !== assetId));
      toast.success('Asset deleted successfully');
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(null);
        setShowPlayer(false);
      }
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Transform assets for VideoPlayerGrid
  const videoGridAssets = filteredAssets.map(asset => ({
    id: asset.id,
    title: asset.title,
    url: asset.url,
    thumbnailUrl: asset.thumbnail_url || undefined,
    duration: asset.duration || undefined,
    status: asset.processing_status === 'completed' ? 'ready' as const :
            asset.processing_status === 'failed' ? 'failed' as const : 'processing' as const,
    qualities: asset.metadata?.resolution ? [asset.metadata.resolution] : undefined
  }));

  return (
    <DashboardLayout
      title="Media Assets"
      subtitle="Browse and manage your video library"
    >
      <div className="space-y-6">
        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="size">Size (Large)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadAssets()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                {viewMode === 'grid' && (
                  <div className="flex rounded-md border">
                    <Button
                      size="sm"
                      variant={gridColumns === 1 ? 'default' : 'ghost'}
                      onClick={() => setGridColumns(1)}
                      className="rounded-r-none border-r px-2"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={gridColumns === 2 ? 'default' : 'ghost'}
                      onClick={() => setGridColumns(2)}
                      className="rounded-none border-r px-2"
                    >
                      <Grid2x2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={gridColumns === 3 ? 'default' : 'ghost'}
                      onClick={() => setGridColumns(3)}
                      className="rounded-none border-r px-2"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={gridColumns === 4 ? 'default' : 'ghost'}
                      onClick={() => setGridColumns(4)}
                      className="rounded-l-none px-2"
                    >
                      <span className="text-xs font-bold">4</span>
                    </Button>
                  </div>
                )}

                <div className="flex rounded-md border">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ) : filteredAssets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No assets found</h3>
              <p className="text-gray-500">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Upload videos to see them here'}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <VideoPlayerGrid
            videos={videoGridAssets}
            columns={gridColumns}
            autoplay={false}
            muted={true}
            onVideoError={handleVideoError}
            onVideoClick={(video) => {
              const asset = assets.find(a => a.id === video.id);
              if (asset) handleVideoClick(asset);
            }}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredAssets.map(asset => (
                  <div 
                    key={asset.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleVideoClick(asset)}
                  >
                    <div className="w-20 h-14 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                      {asset.thumbnail_url ? (
                        <img src={asset.thumbnail_url} alt={asset.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{asset.title}</h4>
                      {asset.description && (
                        <p className="text-sm text-gray-500 truncate">{asset.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(asset.file_size)}</span>
                        <span>{formatDuration(asset.duration)}</span>
                        <span>{formatDate(asset.created_at)}</span>
                      </div>
                    </div>

                    <Badge variant={
                      asset.processing_status === 'completed' ? 'default' :
                      asset.processing_status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {asset.processing_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Player Dialog */}
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedAsset && (
              <Tabs defaultValue="player" className="w-full">
                <TabsList>
                  <TabsTrigger value="player">Player</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="player" className="mt-4">
                  <div className="aspect-video">
                    <VideoPlayer
                      src={selectedAsset.url}
                      poster={selectedAsset.thumbnail_url || undefined}
                      title={selectedAsset.title}
                      className="w-full h-full rounded-lg"
                      onError={(error) => {
                        console.error('Video playback error:', error);
                        toast.error('Failed to load video');
                      }}
                      enableSubtitles={false}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">File Size</p>
                      <p className="font-medium">{formatFileSize(selectedAsset.file_size)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Duration</p>
                      <p className="font-medium">{formatDuration(selectedAsset.duration)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Created</p>
                      <p className="font-medium">{formatDate(selectedAsset.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Type</p>
                      <p className="font-medium">{selectedAsset.type}</p>
                    </div>
                  </div>
                  
                  {selectedAsset.metadata && (
                    <div>
                      <p className="text-gray-500 mb-2">Metadata</p>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <pre className="text-xs">{JSON.stringify(selectedAsset.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAsset.url);
                        toast.success('URL copied to clipboard');
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        deleteAsset(selectedAsset.id);
                        setShowPlayer(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}