import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  XCircle
} from 'lucide-react';

// Types
interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'ready' | 'failed';
  error?: string;
  url?: string;
}

interface Asset {
  id: string;
  title: string;
  description: string;
  filename: string;
  size: number;
  duration: number;
  format: string;
  thumbnail: string;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'failed';
  tags: string[];
  usage: number; // Number of events using this asset
}

// Mock data for demonstration
const mockAssets: Asset[] = [
  {
    id: '1',
    title: 'Event Intro Video',
    description: 'Opening sequence for livestream events',
    filename: 'intro.mp4',
    size: 25600000, // 25.6 MB
    duration: 30,
    format: 'MP4',
    thumbnail: '/api/placeholder/400/225',
    uploadDate: new Date('2024-01-15'),
    status: 'ready',
    tags: ['intro', 'branding'],
    usage: 5
  },
  {
    id: '2',
    title: 'Background Music Loop',
    description: 'Ambient background music for waiting screens',
    filename: 'bg-music.mp4',
    size: 15400000, // 15.4 MB
    duration: 120,
    format: 'MP4',
    thumbnail: '/api/placeholder/400/225',
    uploadDate: new Date('2024-01-20'),
    status: 'ready',
    tags: ['music', 'background'],
    usage: 12
  },
  {
    id: '3',
    title: 'Product Demo',
    description: 'Product demonstration video',
    filename: 'demo.mov',
    size: 45800000, // 45.8 MB
    duration: 180,
    format: 'MOV',
    thumbnail: '/api/placeholder/400/225',
    uploadDate: new Date('2024-01-25'),
    status: 'processing',
    tags: ['demo', 'product'],
    usage: 0
  }
];

const ALLOWED_FORMATS = ['mp4', 'mov', 'avi', 'mkv'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

export default function VODUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'processing' | 'ready' | 'failed'>('all');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_FORMATS.includes(extension)) {
      return `Unsupported format. Allowed: ${ALLOWED_FORMATS.join(', ').toUpperCase()}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadFile[] = [];
    
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
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
    }
  };

  // Start upload process
  const startUpload = async () => {
    setIsUploading(true);
    
    for (const uploadFile of uploadFiles.filter(f => f.status === 'queued')) {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      ));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress } : f
        ));
      }

      // Mark as processing
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'processing', progress: 100 } : f
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as ready and add to assets
      const newAsset: Asset = {
        id: `asset-${Date.now()}-${Math.random()}`,
        title: uploadFile.file.name.split('.')[0],
        description: '',
        filename: uploadFile.file.name,
        size: uploadFile.file.size,
        duration: 0, // Would be extracted during processing
        format: uploadFile.file.name.split('.').pop()?.toUpperCase() || '',
        thumbnail: '/api/placeholder/400/225',
        uploadDate: new Date(),
        status: 'ready',
        tags: [],
        usage: 0
      };

      setAssets(prev => [newAsset, ...prev]);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'ready' } : f
      ));
    }

    setIsUploading(false);
    
    // Clear completed uploads after a delay
    setTimeout(() => {
      setUploadFiles(prev => prev.filter(f => f.status !== 'ready'));
    }, 3000);
  };

  // Remove upload file
  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
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
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB per file
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                        <Badge variant={
                          uploadFile.status === 'ready' ? 'default' :
                          uploadFile.status === 'failed' ? 'destructive' :
                          uploadFile.status === 'uploading' || uploadFile.status === 'processing' ? 'secondary' :
                          'outline'
                        }>
                          {uploadFile.status}
                        </Badge>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeUploadFile(uploadFile.id)}
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
                  {assets.length} assets • {filteredAssets.length} shown
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
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
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
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
            {filteredAssets.length === 0 ? (
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusIcon(asset.status)}
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
                                <TabsTrigger value="edit">Edit</TabsTrigger>
                                <TabsTrigger value="usage">Usage</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                  <Play className="h-12 w-12 text-gray-400" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="text-xs text-gray-500">Filename</Label>
                                    <p className="font-mono">{asset.filename}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Format</Label>
                                    <p>{asset.format}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Size</Label>
                                    <p>{formatFileSize(asset.size)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Duration</Label>
                                    <p>{formatDuration(asset.duration)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Upload Date</Label>
                                    <p>{asset.uploadDate.toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Status</Label>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(asset.status)}
                                      <span className="capitalize">{asset.status}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {asset.description && (
                                  <div>
                                    <Label className="text-xs text-gray-500">Description</Label>
                                    <p className="text-sm mt-1">{asset.description}</p>
                                  </div>
                                )}
                                
                                {asset.tags.length > 0 && (
                                  <div>
                                    <Label className="text-xs text-gray-500">Tags</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {asset.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex gap-2 pt-4">
                                  <Button size="sm" variant="outline">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy URL
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="edit" className="space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" defaultValue={asset.title} />
                                  </div>
                                  <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" defaultValue={asset.description} />
                                  </div>
                                  <div>
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input id="tags" defaultValue={asset.tags.join(', ')} />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm">Save Changes</Button>
                                    <Button size="sm" variant="outline">Cancel</Button>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="usage" className="space-y-4">
                                <div className="text-center py-8">
                                  <p className="text-lg font-medium mb-2">
                                    Used in {asset.usage} events
                                  </p>
                                  <p className="text-sm text-gray-500 mb-4">
                                    This asset is currently being used in {asset.usage} live events
                                  </p>
                                  {asset.usage > 0 && (
                                    <Button size="sm" variant="outline">
                                      View Event List
                                    </Button>
                                  )}
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className={`text-xs text-gray-500 ${viewMode === 'grid' ? 'mt-2 space-y-1' : 'mt-1 flex items-center gap-4'}`}>
                        <span>{formatFileSize(asset.size)}</span>
                        <span>{asset.format}</span>
                        {asset.duration > 0 && <span>{formatDuration(asset.duration)}</span>}
                      </div>
                      
                      {viewMode === 'grid' && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {asset.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {asset.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{asset.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}