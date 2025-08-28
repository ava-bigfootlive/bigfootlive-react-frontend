import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload,
  Search,
  Filter,
  Grid3x3,
  List,
  Download,
  Edit,
  Trash2,
  Share2,
  Copy,
  Eye,
  MoreVertical,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Image,
  Music,
  Video,
  FileCode,
  Archive,
  HardDrive,
  Cloud,
  Link,
  Tag,
  Calendar,
  User,
  Lock,
  Globe,
  AlertCircle,
  ChevronRight,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  uploadDate: Date;
  modifiedDate: Date;
  owner: string;
  visibility: 'public' | 'private' | 'team';
  tags: string[];
  thumbnail?: string;
  path: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

interface AssetFolder {
  id: string;
  name: string;
  parent?: string;
  assetCount: number;
  createdDate: Date;
}

export const AssetManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'hero-banner.jpg',
      type: 'image',
      size: 2097152,
      uploadDate: new Date('2024-02-20'),
      modifiedDate: new Date('2024-02-20'),
      owner: 'John Doe',
      visibility: 'public',
      tags: ['banner', 'hero', 'homepage'],
      thumbnail: 'https://placehold.co/400x300',
      path: '/images/hero-banner.jpg',
      mimeType: 'image/jpeg',
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '2',
      name: 'promo-video.mp4',
      type: 'video',
      size: 52428800,
      uploadDate: new Date('2024-02-18'),
      modifiedDate: new Date('2024-02-19'),
      owner: 'Jane Smith',
      visibility: 'team',
      tags: ['promo', 'marketing', 'video'],
      thumbnail: 'https://placehold.co/400x300',
      path: '/videos/promo-video.mp4',
      mimeType: 'video/mp4',
      dimensions: { width: 1280, height: 720 },
      duration: 120
    },
    {
      id: '3',
      name: 'background-music.mp3',
      type: 'audio',
      size: 5242880,
      uploadDate: new Date('2024-02-15'),
      modifiedDate: new Date('2024-02-15'),
      owner: 'Mike Johnson',
      visibility: 'private',
      tags: ['music', 'background', 'audio'],
      path: '/audio/background-music.mp3',
      mimeType: 'audio/mpeg',
      duration: 180
    },
    {
      id: '4',
      name: 'presentation.pdf',
      type: 'document',
      size: 1048576,
      uploadDate: new Date('2024-02-10'),
      modifiedDate: new Date('2024-02-12'),
      owner: 'Sarah Wilson',
      visibility: 'team',
      tags: ['presentation', 'pdf', 'document'],
      path: '/documents/presentation.pdf',
      mimeType: 'application/pdf'
    }
  ]);

  const [folders, setFolders] = useState<AssetFolder[]>([
    {
      id: 'images',
      name: 'Images',
      parent: 'root',
      assetCount: 24,
      createdDate: new Date('2024-01-01')
    },
    {
      id: 'videos',
      name: 'Videos',
      parent: 'root',
      assetCount: 8,
      createdDate: new Date('2024-01-01')
    },
    {
      id: 'audio',
      name: 'Audio',
      parent: 'root',
      assetCount: 15,
      createdDate: new Date('2024-01-01')
    },
    {
      id: 'documents',
      name: 'Documents',
      parent: 'root',
      assetCount: 32,
      createdDate: new Date('2024-01-01')
    }
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <FileAudio className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowUploadDialog(false);
          toast({
            title: "Upload Complete",
            description: "Your files have been uploaded successfully"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleBulkAction = (action: string) => {
    if (selectedAssets.length === 0) {
      toast({
        title: "No assets selected",
        description: "Please select assets to perform this action",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${action} ${selectedAssets.length} assets`,
      description: `Successfully ${action.toLowerCase()}ed selected assets`
    });
    setSelectedAssets([]);
  };

  const copyAssetLink = (asset: Asset) => {
    const url = `https://cdn.bigfootlive.io${asset.path}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Asset URL copied to clipboard"
    });
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const storageUsed = assets.reduce((total, asset) => total + asset.size, 0);
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10 GB
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asset Manager</h1>
          <p className="text-muted-foreground">Manage all your media assets and files</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Assets
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground">Across all folders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(storageUsed)}</div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              of {formatFileSize(storageLimit)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Assets</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">With team members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFolder('root')}>
            <Home className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span>Assets</span>
          {currentFolder !== 'root' && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{currentFolder}</span>
            </>
          )}
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedAssets.length > 0 && (
          <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
            <span className="text-sm">{selectedAssets.length} assets selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('Download')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('Share')}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('Delete')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedAssets([])}>
              Clear Selection
            </Button>
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Folder Structure */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Folders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setCurrentFolder(folder.name)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                <span className="flex-1 text-left">{folder.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {folder.assetCount}
                </Badge>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Assets Grid/List */}
        <div className="md:col-span-3">
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map(asset => (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="relative">
                    {asset.type === 'image' && asset.thumbnail ? (
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-muted flex items-center justify-center">
                        {asset.type === 'video' && <Video className="h-12 w-12 text-muted-foreground" />}
                        {asset.type === 'audio' && <Music className="h-12 w-12 text-muted-foreground" />}
                        {asset.type === 'document' && <FileText className="h-12 w-12 text-muted-foreground" />}
                        {asset.type === 'other' && <File className="h-12 w-12 text-muted-foreground" />}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssets([...selectedAssets, asset.id]);
                          } else {
                            setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                          }
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">
                        {asset.visibility === 'public' && <Globe className="h-3 w-3" />}
                        {asset.visibility === 'private' && <Lock className="h-3 w-3" />}
                        {asset.visibility === 'team' && <User className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFileIcon(asset.type)}
                        <p className="text-sm font-medium line-clamp-1">{asset.name}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(asset.size)}</span>
                      <span>{format(asset.uploadDate, 'MMM d')}</span>
                    </div>
                    {asset.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {asset.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
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
                    <div className="flex gap-1 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyAssetLink(asset)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAssets.includes(asset.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAssets([...selectedAssets, asset.id]);
                            } else {
                              setSelectedAssets(selectedAssets.filter(id => id !== asset.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(asset.type)}
                          <span className="font-medium">{asset.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.type}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(asset.size)}</TableCell>
                      <TableCell>{format(asset.modifiedDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>{asset.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyAssetLink(asset)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Assets</DialogTitle>
            <DialogDescription>
              Add new files to your asset library
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <Input type="file" multiple className="hidden" id="file-upload" />
              <Label htmlFor="file-upload">
                <Button variant="secondary" asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum file size: 100MB per file
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading 3 files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload to Folder</Label>
                <Select defaultValue="root">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Root</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma separated)</Label>
                <Input placeholder="e.g., marketing, banner, homepage" />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select defaultValue="team">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="team">Team Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      {selectedAsset && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedAsset.type === 'image' && selectedAsset.thumbnail && (
                <img
                  src={selectedAsset.thumbnail}
                  alt={selectedAsset.name}
                  className="w-full max-h-64 object-contain rounded-lg"
                />
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <p className="text-sm">{selectedAsset.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>File Type</Label>
                  <p className="text-sm">{selectedAsset.mimeType}</p>
                </div>
                <div className="space-y-2">
                  <Label>File Size</Label>
                  <p className="text-sm">{formatFileSize(selectedAsset.size)}</p>
                </div>
                {selectedAsset.dimensions && (
                  <div className="space-y-2">
                    <Label>Dimensions</Label>
                    <p className="text-sm">
                      {selectedAsset.dimensions.width} × {selectedAsset.dimensions.height}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Uploaded</Label>
                  <p className="text-sm">{format(selectedAsset.uploadDate, 'PPP')}</p>
                </div>
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <p className="text-sm">{selectedAsset.owner}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>CDN URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={`https://cdn.bigfootlive.io${selectedAsset.path}`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyAssetLink(selectedAsset)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 flex-wrap">
                  {selectedAsset.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AssetManager;