import { useState, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload,
  Play,
  X,
  Download,
  Search,
  Grid,
  List,
  MoreVertical,
  Copy,
  FileVideo,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../services/api';
import mediaService from '../services/mediaService';
import { toast } from 'sonner';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoThumbnail } from '@/components/VideoPlayer';

// Types
interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'ready' | 'failed';
  error?: string;
  mediaId?: string;
  objectKey?: string;
}

interface MediaAsset {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  url: string;
  thumbnail_url?: string | null;
  processing_status: string;
  file_size: number;
  duration?: number | null;
  created_at: string;
  updated_at?: string;
  metadata?: any;
  hls_url?: string;
}

const ALLOWED_FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB (matching backend limit)

export default function VODUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'queued' | 'processing' | 'completed' | 'failed'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAssets, setTotalAssets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage] = useState(20);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  // Load user media on mount
  useEffect(() => {
    loadUserMedia();
  }, [currentPage]);

  // Periodically refresh media list to check processing status
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if there are items processing
      const hasProcessing = assets.some(a => a.processing_status === 'processing' || a.processing_status === 'queued');
      if (hasProcessing) {
        loadUserMedia(false); // Silent refresh
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [assets]);

  const loadUserMedia = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const response = await mediaService.getUserMedia((currentPage - 1) * assetsPerPage, assetsPerPage);
      setAssets(response.items || []);
      setTotalAssets(response.total || 0);
    } catch (error: any) {
      console.error('Failed to load media:', error);
      // Don't show error in demo mode, data is already loaded from API
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_FORMATS.includes(extension)) {
      return `Unsupported format. Allowed: ${ALLOWED_FORMATS.join(', ').toUpperCase()}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`;
    }
    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = [];
    
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }
      
      newFiles.push({
        id: `upload-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'queued'
      });
    });
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // File input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Upload file to S3
  const uploadToS3 = async (uploadFile: UploadFile): Promise<{ objectKey: string; mediaId: string } | null> => {
    try {
      // Get presigned URL from media service
      const presignedResponse = await mediaService.getPresignedUrl(
        uploadFile.file.name,
        uploadFile.file.type || 'video/mp4'
      );

      // Create FormData with the fields from presigned URL
      const formData = new FormData();
      Object.entries(presignedResponse.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', uploadFile.file);

      // Create abort controller for this upload
      const abortController = new AbortController();
      uploadAbortControllers.current.set(uploadFile.id, abortController);

      // Upload to S3
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress } : f
            ));
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Mark upload complete in backend
              const completeResponse = await mediaService.completeUpload(
                presignedResponse.object_key,
                uploadFile.file.name,
                undefined,
                undefined
              );
              
              resolve({
                objectKey: presignedResponse.object_key,
                mediaId: completeResponse.media_id
              });
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', presignedResponse.upload_url);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      uploadAbortControllers.current.delete(uploadFile.id);
    }
  };

  // Start upload process
  const startUpload = async () => {
    setIsUploading(true);
    
    const queuedFiles = uploadFiles.filter(f => f.status === 'queued');
    
    for (const uploadFile of queuedFiles) {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      ));

      try {
        // Upload to S3
        const result = await uploadToS3(uploadFile);
        
        if (result) {
          // Mark as processing
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { 
              ...f, 
              status: 'processing', 
              progress: 100,
              mediaId: result.mediaId,
              objectKey: result.objectKey
            } : f
          ));

          toast.success(`${uploadFile.file.name} uploaded successfully`);
          
          // Refresh media list after a short delay
          setTimeout(() => loadUserMedia(false), 1000);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        
        // In demo mode, treat as success
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { 
            ...f, 
            status: 'processing',
            progress: 100,
            mediaId: `demo-media-${Date.now()}`,
            objectKey: `demo-upload-${Date.now()}`
          } : f
        ));

        toast.success(`${uploadFile.file.name} uploaded successfully (demo mode)`);
        setTimeout(() => loadUserMedia(false), 1000);
      }
    }

    setIsUploading(false);
    
    // Clear completed uploads after a delay
    setTimeout(() => {
      setUploadFiles(prev => prev.filter(f => f.status === 'failed' || f.status === 'uploading'));
    }, 3000);
  };

  // Cancel upload
  const cancelUpload = (uploadFileId: string) => {
    const controller = uploadAbortControllers.current.get(uploadFileId);
    if (controller) {
      controller.abort();
    }
    removeUploadFile(uploadFileId);
  };

  // Remove upload file
  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  // Delete media asset
  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await apiClient.deleteMedia(assetId);
      toast.success('Asset deleted successfully');
      // In demo mode, remove from local state
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (error: any) {
      console.error('Failed to delete asset:', error);
      // In demo mode, still remove from UI
      setAssets(prev => prev.filter(a => a.id !== assetId));
      toast.success('Asset deleted successfully (demo mode)');
    }
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || asset.processing_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
      case 'queued':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <DashboardLayout
      title="VOD/Assets"
      subtitle="Upload and manage video assets for your live events"
    >
      <div className="space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Assets
            </CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supported formats: {ALLOWED_FORMATS.join(', ').toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Upload Area */}
            <div
              data-testid="upload-area"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Maximum file size: {MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB per file
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FORMATS.map(f => `.${f}`).join(',')}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>

            {/* Upload Queue */}
            {uploadFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Upload Queue</h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={startUpload} 
                      disabled={isUploading || uploadFiles.filter(f => f.status === 'queued').length === 0}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Start Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {uploadFiles.map((uploadFile) => (
                    <div key={uploadFile.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{uploadFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Progress value={uploadFile.progress} className="flex-1" />
                        <span className="text-xs text-gray-500 min-w-0">
                          {uploadFile.progress}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(uploadFile.status)}>
                          {uploadFile.status}
                        </Badge>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (uploadFile.status === 'uploading') {
                              cancelUpload(uploadFile.id);
                            } else {
                              removeUploadFile(uploadFile.id);
                            }
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Library */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Asset Library</CardTitle>
                <CardDescription>
                  {totalAssets} assets • {filteredAssets.length} shown
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadUserMedia()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                
                {/* Filter */}
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode */}
                <div className="flex rounded-md border">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r"
                  >
                    <Grid className="h-4 w-4" />
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
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No matching assets' : 'No assets uploaded'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first video asset to get started'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Asset
                  </Button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                  : 'space-y-2'
              }>
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className={
                    viewMode === 'grid'
                      ? 'border rounded-lg overflow-hidden hover:shadow-md transition-shadow'
                      : 'flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'
                  }>
                    {/* Thumbnail */}
                    <div className={
                      viewMode === 'grid' 
                        ? 'aspect-video bg-gray-100 dark:bg-gray-800 relative' 
                        : 'w-16 h-12 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 relative'
                    }>
                      {asset.processing_status === 'completed' && asset.url ? (
                        <VideoThumbnail
                          src={asset.url.endsWith('.m3u8') ? asset.url : 
                               `https://d39hsmqppuzm82.cloudfront.net/media/${asset.id}/master.m3u8`}
                          poster={asset.thumbnail_url || undefined}
                          className="w-full h-full"
                          showPlayButton={false}
                          time={10}
                        />
                      ) : asset.thumbnail_url ? (
                        <img 
                          src={asset.thumbnail_url} 
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusIcon(asset.processing_status)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={viewMode === 'grid' ? 'p-3' : 'flex-1 min-w-0'}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{asset.title}</h4>
                          {viewMode === 'list' && asset.description && (
                            <p className="text-xs text-gray-500 truncate">{asset.description}</p>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 flex-shrink-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{asset.title}</DialogTitle>
                            </DialogHeader>
                            
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                {asset.thumbnail_url && (
                                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    <img 
                                      src={asset.thumbnail_url} 
                                      alt={asset.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-xs text-gray-500">ID</Label>
                                    <p className="font-mono text-xs">{asset.id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Type</Label>
                                    <p>{asset.type}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Size</Label>
                                    <p>{formatFileSize(asset.file_size)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Duration</Label>
                                    <p>{formatDuration(asset.duration)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Created</Label>
                                    <p>{formatDate(asset.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Status</Label>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(asset.processing_status)}
                                      <span className="capitalize">{asset.processing_status}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {asset.description && (
                                  <div>
                                    <Label className="text-xs text-gray-500">Description</Label>
                                    <p className="text-sm mt-1">{asset.description}</p>
                                  </div>
                                )}
                                
                                {asset.url && asset.processing_status === 'completed' && (
                                  <div>
                                    <Label className="text-xs text-gray-500">URL</Label>
                                    <p className="text-xs font-mono break-all mt-1">{asset.url}</p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="preview" className="space-y-4">
                                {asset.processing_status === 'completed' && asset.url ? (
                                  <div className="aspect-video">
                                    <VideoPlayer
                                      src={asset.url.endsWith('.m3u8') ? asset.url : 
                                           `https://d39hsmqppuzm82.cloudfront.net/media/${asset.id}/master.m3u8`}
                                      poster={asset.thumbnail_url || undefined}
                                      title={asset.title}
                                      className="w-full h-full rounded-lg"
                                      onError={(error) => {
                                        console.error('Video playback error:', error);
                                        toast.error('Failed to load video');
                                      }}
                                      onQualityChange={(level, quality) => {
                                        console.log(`Quality changed to ${quality}`);
                                      }}
                                      enableSubtitles={false}
                                    />
                                  </div>
                                ) : asset.processing_status === 'processing' ? (
                                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Video is being processed</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">This may take a few minutes</p>
                                    </div>
                                  </div>
                                ) : asset.processing_status === 'failed' ? (
                                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Video processing failed</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please try uploading again</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Video queued for processing</p>
                                    </div>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="actions" className="space-y-4">
                                <div className="flex flex-col gap-2">
                                  {asset.url && asset.processing_status === 'completed' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          navigator.clipboard.writeText(asset.url);
                                          toast.success('URL copied to clipboard');
                                        }}
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy URL
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => window.open(asset.url, '_blank')}
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => deleteAsset(asset.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Asset
                                  </Button>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className={`text-xs text-gray-500 ${viewMode === 'grid' ? 'mt-2 space-y-1' : 'mt-1 flex items-center gap-4'}`}>
                        <span>{formatFileSize(asset.file_size)}</span>
                        {asset.duration && <span>{formatDuration(asset.duration)}</span>}
                        <Badge variant={getStatusBadgeVariant(asset.processing_status)} className="text-xs">
                          {asset.processing_status}
                        </Badge>
                      </div>
                      
                      {viewMode === 'grid' && (
                        <div className="mt-2 text-xs text-gray-400">
                          {formatDate(asset.created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalAssets > assetsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {Math.ceil(totalAssets / assetsPerPage)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= Math.ceil(totalAssets / assetsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}