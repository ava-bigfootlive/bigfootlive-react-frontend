import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DroppableProvided
} from '@hello-pangea/dnd';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  List,
  Grid,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Video,
  Clock,
  Calendar,
  Users,
  BarChart3,
  Settings,
  MoreVertical,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

interface PlaylistItem {
  id: string;
  media_id: string;
  title: string;
  duration: number;
  thumbnail_url?: string;
  order: number;
  type: 'video' | 'live' | 'upcoming';
  metadata?: any;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  thumbnail_url?: string;
  items: PlaylistItem[];
  settings: {
    autoplay: boolean;
    loop: boolean;
    shuffle: boolean;
    show_controls: boolean;
    allow_fullscreen: boolean;
    allow_download: boolean;
    start_time?: string;
    end_time?: string;
  };
  stats: {
    total_duration: number;
    total_views: number;
    avg_watch_time: number;
    completion_rate: number;
  };
  created_at: string;
  updated_at: string;
}

export default function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [availableMedia, setAvailableMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [newPlaylist, setNewPlaylist] = useState<Partial<Playlist>>({
    title: '',
    description: '',
    visibility: 'public',
    items: [],
    settings: {
      autoplay: true,
      loop: false,
      shuffle: false,
      show_controls: true,
      allow_fullscreen: true,
      allow_download: false
    }
  });

  useEffect(() => {
    loadPlaylists();
    loadAvailableMedia();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      // Demo playlists
      const demoPlaylists: Playlist[] = [
        {
          id: 'pl-1',
          title: 'Product Training Series',
          description: 'Complete product training curriculum for new employees',
          visibility: 'private',
          thumbnail_url: 'https://via.placeholder.com/320x180/1e40af/ffffff?text=Training',
          items: [
            {
              id: 'item-1',
              media_id: 'media-1',
              title: 'Introduction to Platform',
              duration: 600,
              thumbnail_url: 'https://via.placeholder.com/160x90/3b82f6/ffffff?text=Intro',
              order: 0,
              type: 'video'
            },
            {
              id: 'item-2',
              media_id: 'media-2',
              title: 'Advanced Features',
              duration: 1200,
              thumbnail_url: 'https://via.placeholder.com/160x90/10b981/ffffff?text=Advanced',
              order: 1,
              type: 'video'
            },
            {
              id: 'item-3',
              media_id: 'media-3',
              title: 'Best Practices',
              duration: 900,
              thumbnail_url: 'https://via.placeholder.com/160x90/f59e0b/ffffff?text=Best',
              order: 2,
              type: 'video'
            }
          ],
          settings: {
            autoplay: true,
            loop: false,
            shuffle: false,
            show_controls: true,
            allow_fullscreen: true,
            allow_download: true
          },
          stats: {
            total_duration: 2700,
            total_views: 1234,
            avg_watch_time: 1800,
            completion_rate: 67
          },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'pl-2',
          title: 'Weekly Webinar Recordings',
          description: 'All weekly webinar sessions',
          visibility: 'public',
          thumbnail_url: 'https://via.placeholder.com/320x180/059669/ffffff?text=Webinars',
          items: [
            {
              id: 'item-4',
              media_id: 'media-4',
              title: 'Q4 Review',
              duration: 3600,
              order: 0,
              type: 'video'
            },
            {
              id: 'item-5',
              media_id: 'media-5',
              title: 'Product Updates',
              duration: 2400,
              order: 1,
              type: 'video'
            }
          ],
          settings: {
            autoplay: false,
            loop: false,
            shuffle: false,
            show_controls: true,
            allow_fullscreen: true,
            allow_download: false
          },
          stats: {
            total_duration: 6000,
            total_views: 5678,
            avg_watch_time: 2400,
            completion_rate: 45
          },
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setPlaylists(demoPlaylists);
      if (demoPlaylists.length > 0) {
        setSelectedPlaylist(demoPlaylists[0]);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMedia = async () => {
    try {
      const response = await api.getUserMedia(1, 100);
      setAvailableMedia(response.items || [
        { id: 'media-1', title: 'Sample Video 1', duration: 600, type: 'video' },
        { id: 'media-2', title: 'Sample Video 2', duration: 1200, type: 'video' },
        { id: 'media-3', title: 'Sample Video 3', duration: 900, type: 'video' },
        { id: 'media-4', title: 'Live Event', duration: 0, type: 'live' },
        { id: 'media-5', title: 'Upcoming Stream', duration: 0, type: 'upcoming' }
      ]);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylist.title) {
      toast.error('Please enter a playlist title');
      return;
    }

    try {
      const playlist: Playlist = {
        id: `pl-${Date.now()}`,
        title: newPlaylist.title!,
        description: newPlaylist.description || '',
        visibility: newPlaylist.visibility as any || 'public',
        items: newPlaylist.items || [],
        settings: newPlaylist.settings!,
        stats: {
          total_duration: 0,
          total_views: 0,
          avg_watch_time: 0,
          completion_rate: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPlaylists([...playlists, playlist]);
      setSelectedPlaylist(playlist);
      setShowCreateDialog(false);
      resetNewPlaylistForm();
      toast.success('Playlist created successfully');
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const resetNewPlaylistForm = () => {
    setNewPlaylist({
      title: '',
      description: '',
      visibility: 'public',
      items: [],
      settings: {
        autoplay: true,
        loop: false,
        shuffle: false,
        show_controls: true,
        allow_fullscreen: true,
        allow_download: false
      }
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedPlaylist) return;

    const items = Array.from(selectedPlaylist.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setSelectedPlaylist({
      ...selectedPlaylist,
      items: updatedItems
    });

    // Update in the main list
    setPlaylists(playlists.map(pl => 
      pl.id === selectedPlaylist.id 
        ? { ...selectedPlaylist, items: updatedItems }
        : pl
    ));

    toast.success('Playlist order updated');
  };

  const addToPlaylist = (mediaId: string) => {
    if (!selectedPlaylist) return;

    const media = availableMedia.find(m => m.id === mediaId);
    if (!media) return;

    const newItem: PlaylistItem = {
      id: `item-${Date.now()}`,
      media_id: mediaId,
      title: media.title,
      duration: media.duration || 0,
      thumbnail_url: media.thumbnail_url,
      order: selectedPlaylist.items.length,
      type: media.type || 'video'
    };

    const updatedPlaylist = {
      ...selectedPlaylist,
      items: [...selectedPlaylist.items, newItem],
      stats: {
        ...selectedPlaylist.stats,
        total_duration: selectedPlaylist.stats.total_duration + (media.duration || 0)
      }
    };

    setSelectedPlaylist(updatedPlaylist);
    setPlaylists(playlists.map(pl => 
      pl.id === selectedPlaylist.id ? updatedPlaylist : pl
    ));

    toast.success(`Added "${media.title}" to playlist`);
  };

  const removeFromPlaylist = (itemId: string) => {
    if (!selectedPlaylist) return;

    const updatedItems = selectedPlaylist.items
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, order: index }));

    const updatedPlaylist = {
      ...selectedPlaylist,
      items: updatedItems,
      stats: {
        ...selectedPlaylist.stats,
        total_duration: updatedItems.reduce((sum, item) => sum + item.duration, 0)
      }
    };

    setSelectedPlaylist(updatedPlaylist);
    setPlaylists(playlists.map(pl => 
      pl.id === selectedPlaylist.id ? updatedPlaylist : pl
    ));

    toast.success('Item removed from playlist');
  };

  const deletePlaylist = (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    setPlaylists(playlists.filter(pl => pl.id !== playlistId));
    if (selectedPlaylist?.id === playlistId) {
      setSelectedPlaylist(null);
    }
    toast.success('Playlist deleted');
  };

  const copyEmbedCode = (playlist: Playlist) => {
    const embedCode = `<iframe 
  src="https://embed.bigfootlive.io/playlist/${playlist.id}" 
  width="800" 
  height="450" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <DashboardLayout
      title="Playlist Manager"
      subtitle="Create and manage video playlists"
      actions={
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Set up a new playlist with custom settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Playlist Title</Label>
                <Input
                  id="title"
                  placeholder="Enter playlist title"
                  value={newPlaylist.title}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your playlist"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={newPlaylist.visibility}
                  onValueChange={(value: any) => setNewPlaylist({ ...newPlaylist, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Playback Settings</Label>
                <div className="space-y-3">
                  {[
                    { key: 'autoplay', label: 'Autoplay', description: 'Start playing automatically' },
                    { key: 'loop', label: 'Loop', description: 'Repeat playlist when finished' },
                    { key: 'shuffle', label: 'Shuffle', description: 'Play videos in random order' },
                    { key: 'show_controls', label: 'Show Controls', description: 'Display playback controls' },
                    { key: 'allow_fullscreen', label: 'Allow Fullscreen', description: 'Enable fullscreen mode' },
                    { key: 'allow_download', label: 'Allow Download', description: 'Let viewers download videos' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch
                        checked={newPlaylist.settings?.[setting.key as keyof typeof newPlaylist.settings] as boolean}
                        onCheckedChange={(checked) => setNewPlaylist({
                          ...newPlaylist,
                          settings: { ...newPlaylist.settings!, [setting.key]: checked }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createPlaylist}>
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Playlists</CardTitle>
              <CardDescription>Select a playlist to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlaylist?.id === playlist.id
                          ? 'bg-accent border-accent-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedPlaylist(playlist)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{playlist.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{playlist.items.length} videos</span>
                            <span>•</span>
                            <span>{formatDuration(playlist.stats.total_duration)}</span>
                          </div>
                        </div>
                        <Badge variant={
                          playlist.visibility === 'public' ? 'default' :
                          playlist.visibility === 'private' ? 'secondary' : 'outline'
                        }>
                          {playlist.visibility}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Playlist Editor */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPlaylist.title}</CardTitle>
                    <CardDescription>{selectedPlaylist.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyEmbedCode(selectedPlaylist)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Embed
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePlaylist(selectedPlaylist.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="items">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="add">Add Media</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="items" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {selectedPlaylist.items.length} items • {formatDuration(selectedPlaylist.stats.total_duration)}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled={selectedPlaylist.items.length === 0}>
                            <Shuffle className="h-4 w-4 mr-2" />
                            Shuffle
                          </Button>
                          <Button size="sm" variant="outline" disabled={selectedPlaylist.items.length === 0}>
                            <Play className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="playlist-items">
                          {(provided: DroppableProvided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-2"
                            >
                              {selectedPlaylist.items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided: DraggableProvided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                                    >
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div className="text-sm font-medium text-muted-foreground w-8">
                                        {index + 1}
                                      </div>
                                      <div className="w-20 h-12 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                                        {item.thumbnail_url ? (
                                          <img
                                            src={item.thumbnail_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Video className="h-6 w-6 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium">{item.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Badge variant="outline" className="text-xs">
                                            {item.type}
                                          </Badge>
                                          {item.duration > 0 && (
                                            <span>{formatDuration(item.duration)}</span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFromPlaylist(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>

                      {selectedPlaylist.items.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <List className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No items in this playlist</p>
                          <p className="text-sm mt-1">Add media from the "Add Media" tab</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="add" className="mt-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search media..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 gap-2">
                          {availableMedia
                            .filter(media => 
                              media.title.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((media) => (
                              <div
                                key={media.id}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted"
                              >
                                <div className="w-20 h-12 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                                  {media.thumbnail_url ? (
                                    <img
                                      src={media.thumbnail_url}
                                      alt={media.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Video className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{media.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {media.type}
                                    </Badge>
                                    {media.duration > 0 && (
                                      <span>{formatDuration(media.duration)}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => addToPlaylist(media.id)}
                                  disabled={selectedPlaylist.items.some(item => item.media_id === media.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Visibility</Label>
                        <Select value={selectedPlaylist.visibility}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        {[
                          { key: 'autoplay', label: 'Autoplay', description: 'Start playing automatically' },
                          { key: 'loop', label: 'Loop', description: 'Repeat playlist when finished' },
                          { key: 'shuffle', label: 'Shuffle', description: 'Play videos in random order' },
                          { key: 'show_controls', label: 'Show Controls', description: 'Display playback controls' },
                          { key: 'allow_fullscreen', label: 'Allow Fullscreen', description: 'Enable fullscreen mode' },
                          { key: 'allow_download', label: 'Allow Download', description: 'Let viewers download videos' }
                        ].map(setting => (
                          <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{setting.label}</p>
                              <p className="text-xs text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch
                              checked={selectedPlaylist.settings[setting.key as keyof typeof selectedPlaylist.settings] as boolean}
                              onCheckedChange={(checked) => {
                                const updated = {
                                  ...selectedPlaylist,
                                  settings: { ...selectedPlaylist.settings, [setting.key]: checked }
                                };
                                setSelectedPlaylist(updated);
                                setPlaylists(playlists.map(pl => 
                                  pl.id === selectedPlaylist.id ? updated : pl
                                ));
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <h3 className="text-sm font-medium mb-3">Playlist Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Views</p>
                            <p className="text-xl font-bold">{selectedPlaylist.stats.total_views.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Watch Time</p>
                            <p className="text-xl font-bold">{formatDuration(selectedPlaylist.stats.avg_watch_time)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completion Rate</p>
                            <p className="text-xl font-bold">{selectedPlaylist.stats.completion_rate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Duration</p>
                            <p className="text-xl font-bold">{formatDuration(selectedPlaylist.stats.total_duration)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <List className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">Select a playlist to edit</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}