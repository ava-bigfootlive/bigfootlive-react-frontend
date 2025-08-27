import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Plus, 
  Edit, 
  Eye, 
  Clock, 
  Zap,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer
} from 'lucide-react';

interface OverlayTemplate {
  id: string;
  name: string;
  overlay_type: string;
  category: string;
  usage_count: number;
}

interface OverlayContent {
  id: string;
  template_id: string;
  title?: string;
  content_data: any;
  priority: number;
  display_duration?: number;
  auto_remove: boolean;
  created_at: string;
  template?: OverlayTemplate;
}

interface OverlayQueueItem {
  id: string;
  content_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  queue_position: number;
  queued_at: string;
  started_at?: string;
  completed_at?: string;
  content?: OverlayContent;
}

interface OverlayPreset {
  id: string;
  name: string;
  description?: string;
  preset_data: any;
  usage_count: number;
}

interface OverlayControlProps {
  eventId: string;
  onTemplateCreate?: () => void;
  onContentCreate?: (templateId: string, content: any) => void;
  className?: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800', 
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const STATUS_ICONS = {
  pending: Clock,
  active: Play,
  completed: CheckCircle,
  cancelled: XCircle
};

export const OverlayControl: React.FC<OverlayControlProps> = ({
  eventId,
  onTemplateCreate,
  onContentCreate,
  className = ''
}) => {
  const [templates, setTemplates] = useState<OverlayTemplate[]>([]);
  const [queue, setQueue] = useState<OverlayQueueItem[]>([]);
  const [presets, setPresets] = useState<OverlayPreset[]>([]);
  const [activeContent, setActiveContent] = useState<OverlayContent[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [quickContent, setQuickContent] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:8000/api/v1/overlays/events/${eventId}/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Overlay WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        console.log('Overlay WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('Overlay WebSocket error:', error);
      };
      
      setWebsocket(ws);
    };

    connectWebSocket();
    
    return () => {
      websocket?.close();
    };
  }, [eventId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'overlay_queue_update':
        fetchQueue();
        break;
      case 'overlay_status_change':
        updateQueueItemStatus(message.queue_item_id, message.status);
        break;
      default:
        console.log('Unknown WebSocket message:', message);
    }
  }, []);

  // Fetch data
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/v1/overlays/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch(`/api/v1/overlays/events/${eventId}/queue`);
      const data = await response.json();
      setQueue(data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/v1/overlays/presets');
      const data = await response.json();
      setPresets(data);
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  const fetchActiveContent = async () => {
    try {
      const response = await fetch(`/api/v1/overlays/events/${eventId}/content`);
      const data = await response.json();
      setActiveContent(data);
    } catch (error) {
      console.error('Error fetching active content:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchQueue();
    fetchPresets();
    fetchActiveContent();
  }, [eventId]);

  // Update queue item status locally
  const updateQueueItemStatus = (itemId: string, status: string) => {
    setQueue(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: status as any, started_at: status === 'active' ? new Date().toISOString() : item.started_at }
        : item
    ));
  };

  // Quick overlay creation and triggering
  const handleQuickOverlay = async (templateId: string) => {
    try {
      // Create content
      const contentData = quickContent[templateId] || getDefaultContentForTemplate(templateId);
      const contentResponse = await fetch(`/api/v1/overlays/events/${eventId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          content_data: contentData,
          auto_remove: true,
          display_duration: 5.0
        })
      });

      if (!contentResponse.ok) throw new Error('Failed to create content');
      const content = await contentResponse.json();

      // Add to queue
      const queueResponse = await fetch(`/api/v1/overlays/events/${eventId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: content.id
        })
      });

      if (!queueResponse.ok) throw new Error('Failed to add to queue');
      const queueItem = await queueResponse.json();

      // Trigger immediately
      await triggerOverlay(queueItem.id);

    } catch (error) {
      console.error('Error creating quick overlay:', error);
    }
  };

  // Trigger overlay
  const triggerOverlay = async (queueItemId: string) => {
    try {
      const response = await fetch(`/api/v1/overlays/events/${eventId}/queue/${queueItemId}/trigger`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to trigger overlay');
      
      // Update local state immediately
      updateQueueItemStatus(queueItemId, 'active');
      
    } catch (error) {
      console.error('Error triggering overlay:', error);
    }
  };

  // Remove from queue
  const removeFromQueue = async (queueItemId: string) => {
    try {
      const response = await fetch(`/api/v1/overlays/events/${eventId}/queue/${queueItemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove from queue');
      
      setQueue(prev => prev.filter(item => item.id !== queueItemId));
      
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  };

  // Add existing content to queue
  const addContentToQueue = async (contentId: string) => {
    try {
      const response = await fetch(`/api/v1/overlays/events/${eventId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId
        })
      });

      if (!response.ok) throw new Error('Failed to add to queue');
      
      fetchQueue(); // Refresh queue
      
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  // Get default content for template type
  const getDefaultContentForTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return {};

    switch (template.overlay_type) {
      case 'lower_third':
        return {
          name: 'Speaker Name',
          title: 'Speaker Title'
        };
      case 'chyron':
        return {
          text: 'Breaking: Important announcement'
        };
      case 'countdown':
        return {
          target_time: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
          title: 'Event Starting Soon'
        };
      default:
        return {
          text: 'Overlay Text'
        };
    }
  };

  // Apply preset
  const applyPreset = async (preset: OverlayPreset) => {
    try {
      // Create multiple overlays from preset data
      const promises = preset.preset_data.overlays?.map(async (overlayData: any) => {
        const contentResponse = await fetch(`/api/v1/overlays/events/${eventId}/content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overlayData)
        });

        if (contentResponse.ok) {
          const content = await contentResponse.json();
          return addContentToQueue(content.id);
        }
      });

      if (promises) {
        await Promise.all(promises);
        fetchQueue();
      }
      
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className={`overlay-control ${className}`}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Quick Controls */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Overlay Control</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="quick" className="w-full">
                <TabsList>
                  <TabsTrigger value="quick">Quick Launch</TabsTrigger>
                  <TabsTrigger value="queue">Queue Management</TabsTrigger>
                  <TabsTrigger value="content">Content Library</TabsTrigger>
                </TabsList>

                {/* Quick Launch Tab */}
                <TabsContent value="quick" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.slice(0, 6).map(template => (
                      <Card key={template.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {template.overlay_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          {/* Quick content input */}
                          {template.overlay_type === 'lower_third' ? (
                            <div className="space-y-2 mb-3">
                              <Input
                                placeholder="Speaker Name"
                                size="sm"
                                value={quickContent[template.id]?.name || ''}
                                onChange={(e) => setQuickContent(prev => ({
                                  ...prev,
                                  [template.id]: {
                                    ...prev[template.id],
                                    name: e.target.value
                                  }
                                }))}
                              />
                              <Input
                                placeholder="Speaker Title"
                                size="sm"
                                value={quickContent[template.id]?.title || ''}
                                onChange={(e) => setQuickContent(prev => ({
                                  ...prev,
                                  [template.id]: {
                                    ...prev[template.id],
                                    title: e.target.value
                                  }
                                }))}
                              />
                            </div>
                          ) : (
                            <div className="mb-3">
                              <Textarea
                                placeholder="Overlay text"
                                rows={2}
                                value={quickContent[template.id]?.text || ''}
                                onChange={(e) => setQuickContent(prev => ({
                                  ...prev,
                                  [template.id]: {
                                    ...prev[template.id],
                                    text: e.target.value
                                  }
                                }))}
                              />
                            </div>
                          )}

                          <Button
                            onClick={() => handleQuickOverlay(template.id)}
                            className="w-full"
                            size="sm"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Quick Launch
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Queue Management Tab */}
                <TabsContent value="queue">
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queue.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.queue_position}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {item.content?.title || 'Untitled Overlay'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.content?.template?.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_COLORS[item.status]}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.content?.display_duration ? 
                                `${item.content.display_duration}s` : 'Manual'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {item.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => triggerOverlay(item.id)}
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromQueue(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>

                {/* Content Library Tab */}
                <TabsContent value="content">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Saved Overlay Content</h3>
                      <Button onClick={onTemplateCreate}>
                        <Plus className="w-4 h-4 mr-1" />
                        Create New
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-80">
                      <div className="space-y-2">
                        {activeContent.map(content => (
                          <Card key={content.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {content.title || 'Untitled'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {content.template?.name} • Priority: {content.priority}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addContentToQueue(content.id)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Preview Content</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-2">
                                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                                          {JSON.stringify(content.content_data, null, 2)}
                                        </pre>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Presets and Statistics Sidebar */}
        <div className="space-y-6">
          
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Overlay Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {presets.map(preset => (
                    <Card key={preset.id} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <p className="text-xs text-gray-500">
                              Used {preset.usage_count} times
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyPreset(preset)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Live Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Live Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Active Overlays</span>
                  <span className="font-medium">
                    {queue.filter(q => q.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Queued Overlays</span>
                  <span className="font-medium">
                    {queue.filter(q => q.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Templates</span>
                  <span className="font-medium">{templates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saved Content</span>
                  <span className="font-medium">{activeContent.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    // Clear all active overlays
                    queue
                      .filter(q => q.status === 'active')
                      .forEach(q => removeFromQueue(q.id));
                  }}
                >
                  <Square className="w-4 h-4 mr-1" />
                  Clear All Active
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Pause all pending overlays
                    setQueue(prev => prev.map(item => 
                      item.status === 'pending' 
                        ? { ...item, status: 'cancelled' as any }
                        : item
                    ));
                  }}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};