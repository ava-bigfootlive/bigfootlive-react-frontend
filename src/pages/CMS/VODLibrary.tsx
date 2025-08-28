import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Video, 
  Upload, 
  Search, 
  Filter,
  Grid3x3,
  List,
  Play,
  Eye,
  Download,
  Edit,
  Trash2,
  Share2,
  Lock,
  Globe,
  Clock,
  Calendar,
  Tag,
  Folder,
  Info,
  MoreVertical,
  ChevronRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface VODItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  uploadDate: Date;
  category: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  monetization: 'free' | 'subscription' | 'ppv';
  price?: number;
  description?: string;
  fileSize: number;
  resolution: string;
  status: 'processing' | 'ready' | 'error';
}

export const VODLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const [vodItems, setVodItems] = useState<VODItem[]>([
    {
      id: '1',
      title: 'Championship Finals 2024 - Full Event',
      thumbnail: 'https://placehold.co/400x225',
      duration: 10800,
      views: 45230,
      uploadDate: new Date('2024-02-15'),
      category: 'Sports',
      tags: ['championship', 'finals', '2024', 'sports'],
      visibility: 'public',
      monetization: 'ppv',
      price: 19.99,
      fileSize: 2147483648,
      resolution: '1920x1080',
      status: 'ready',
      description: 'Complete coverage of the 2024 Championship Finals'
    },
    {
      id: '2',
      title: 'Behind the Scenes - Artist Interview',
      thumbnail: 'https://placehold.co/400x225',
      duration: 3600,
      views: 12450,
      uploadDate: new Date('2024-02-10'),
      category: 'Entertainment',
      tags: ['interview', 'behind-the-scenes', 'exclusive'],
      visibility: 'private',
      monetization: 'subscription',
      fileSize: 536870912,
      resolution: '1280x720',
      status: 'ready'
    },
    {
      id: '3',
      title: 'Tutorial Series - Episode 1',
      thumbnail: 'https://placehold.co/400x225',
      duration: 1800,
      views: 8920,
      uploadDate: new Date('2024-02-08'),
      category: 'Education',
      tags: ['tutorial', 'learning', 'episode-1'],
      visibility: 'public',
      monetization: 'free',
      fileSize: 268435456,
      resolution: '1920x1080',
      status: 'processing'
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'music', label: 'Music' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'news', label: 'News' }
  ];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    return `${mb.toFixed(2)} MB`;
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
            description: "Your video has been uploaded successfully"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform this action",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${action} ${selectedItems.length} items`,
      description: `Successfully ${action.toLowerCase()}ed selected items`
    });
    setSelectedItems([]);
  };

  const filteredItems = vodItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">VOD Library</h1>
          <p className="text-muted-foreground">Manage your video on demand content</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vodItems.length}</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">66.6K</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.9 GB</div>
            <Progress value={29} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">of 10 GB</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24:35</div>
            <p className="text-xs text-muted-foreground">+5 min from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
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

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
            <span className="text-sm">{selectedItems.length} items selected</span>
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
            <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
              Clear Selection
            </Button>
          </div>
        )}
      </Card>

      {/* VOD Content */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {formatDuration(item.duration)}
                </div>
                {item.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Processing...</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Eye className="h-3 w-3" />
                  {item.views.toLocaleString()} views • {format(item.uploadDate, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    {item.visibility === 'public' && <Globe className="h-3 w-3 mr-1" />}
                    {item.visibility === 'private' && <Lock className="h-3 w-3 mr-1" />}
                    {item.visibility}
                  </Badge>
                  <Badge variant="secondary">
                    {item.monetization === 'ppv' && `$${item.price}`}
                    {item.monetization === 'subscription' && 'Subscribers'}
                    {item.monetization === 'free' && 'Free'}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="pt-3 pb-3 border-t">
                <div className="flex justify-between w-full">
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardFooter>
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
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img src={item.thumbnail} alt={item.title} className="w-16 h-9 object-cover rounded" />
                      <div>
                        <p className="line-clamp-1">{item.title}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.visibility}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.monetization}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.views.toLocaleString()}</TableCell>
                  <TableCell>{formatDuration(item.duration)}</TableCell>
                  <TableCell>{format(item.uploadDate, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'ready' ? 'default' : item.status === 'processing' ? 'secondary' : 'destructive'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Add a new video to your VOD library
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your video file here, or click to browse
              </p>
              <Input type="file" accept="video/*" className="hidden" id="video-upload" />
              <Label htmlFor="video-upload">
                <Button variant="secondary" asChild>
                  <span>Choose File</span>
                </Button>
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: MP4, MOV, AVI, MKV (max 5GB)
              </p>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="video-title">Title</Label>
                <Input id="video-title" placeholder="Enter video title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-category">Category</Label>
                <Select>
                  <SelectTrigger id="video-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <textarea
                id="video-description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter video description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="video-visibility">Visibility</Label>
                <Select defaultValue="public">
                  <SelectTrigger id="video-visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-monetization">Monetization</Label>
                <Select defaultValue="free">
                  <SelectTrigger id="video-monetization">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="ppv">Pay-Per-View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-price">Price (if PPV)</Label>
                <Input id="video-price" type="number" placeholder="0.00" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VODLibrary;