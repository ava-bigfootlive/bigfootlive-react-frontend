import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Code,
  Copy,
  Eye,
  Settings,
  Play,
  Maximize,
  Volume2,
  MessageSquare,
  ThumbsUp,
  BarChart3,
  Download,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Info,
  Palette,
  Lock,
  Globe,
  Zap
} from 'lucide-react';
import api from '../services/api';

interface EmbedConfig {
  type: 'event' | 'playlist' | 'vod';
  contentId: string;
  contentTitle?: string;
  width: number;
  height: number;
  responsive: boolean;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  loop: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showChat: boolean;
  showReactions: boolean;
  showViewCount: boolean;
  allowFullscreen: boolean;
  allowDownload: boolean;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  startTime?: number;
  endTime?: number;
  quality: 'auto' | '4k' | '1080p' | '720p' | '480p' | '360p';
  language: string;
  customDomain?: string;
  analyticsEnabled: boolean;
  gdprCompliant: boolean;
}

export default function EmbedGenerator() {
  const [config, setConfig] = useState<EmbedConfig>({
    type: 'event',
    contentId: '',
    width: 800,
    height: 450,
    responsive: true,
    autoplay: false,
    muted: false,
    controls: true,
    loop: false,
    showTitle: true,
    showDescription: false,
    showChat: false,
    showReactions: false,
    showViewCount: true,
    allowFullscreen: true,
    allowDownload: false,
    primaryColor: '#3b82f6',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    quality: 'auto',
    language: 'en',
    analyticsEnabled: true,
    gdprCompliant: false
  });

  const [embedCode, setEmbedCode] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [availableContent, setAvailableContent] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    loadAvailableContent();
  }, [config.type]);

  useEffect(() => {
    generateEmbedCode();
  }, [config]);

  const loadAvailableContent = async () => {
    try {
      let content: any[] = [];
      
      if (config.type === 'event') {
        // Load events
        content = [
          { id: 'evt-1', title: 'Q1 Product Launch', status: 'live' },
          { id: 'evt-2', title: 'Weekly Standup', status: 'scheduled' },
          { id: 'evt-3', title: 'Training Webinar', status: 'ended' }
        ];
      } else if (config.type === 'playlist') {
        // Load playlists
        content = [
          { id: 'pl-1', title: 'Training Series', items: 5 },
          { id: 'pl-2', title: 'Product Demos', items: 3 }
        ];
      } else {
        // Load VOD
        const response = await api.getUserMedia(1, 20);
        content = response.items || [
          { id: 'vod-1', title: 'Sample Video 1' },
          { id: 'vod-2', title: 'Sample Video 2' }
        ];
      }
      
      setAvailableContent(content);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const generateEmbedCode = () => {
    if (!config.contentId) {
      setEmbedCode('');
      return;
    }

    const baseUrl = config.customDomain || 'https://embed.bigfootlive.io';
    const params = new URLSearchParams();

    // Add configuration parameters
    if (config.autoplay) params.append('autoplay', '1');
    if (config.muted) params.append('muted', '1');
    if (!config.controls) params.append('controls', '0');
    if (config.loop) params.append('loop', '1');
    if (config.showTitle) params.append('title', '1');
    if (config.showDescription) params.append('description', '1');
    if (config.showChat) params.append('chat', '1');
    if (config.showReactions) params.append('reactions', '1');
    if (config.showViewCount) params.append('views', '1');
    if (!config.allowFullscreen) params.append('fullscreen', '0');
    if (config.allowDownload) params.append('download', '1');
    if (config.quality !== 'auto') params.append('quality', config.quality);
    if (config.language !== 'en') params.append('lang', config.language);
    if (config.startTime) params.append('start', config.startTime.toString());
    if (config.endTime) params.append('end', config.endTime.toString());
    if (config.primaryColor !== '#3b82f6') params.append('color', config.primaryColor.replace('#', ''));
    if (config.backgroundColor !== '#000000') params.append('bg', config.backgroundColor.replace('#', ''));
    if (config.textColor !== '#ffffff') params.append('text', config.textColor.replace('#', ''));
    if (config.analyticsEnabled) params.append('analytics', '1');
    if (config.gdprCompliant) params.append('gdpr', '1');

    const queryString = params.toString();
    const embedUrl = `${baseUrl}/${config.type}/${config.contentId}${queryString ? '?' + queryString : ''}`;

    let code = '';
    
    if (config.responsive) {
      // Responsive embed with wrapper
      code = `<!-- BigfootLive Embed - Responsive -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="${embedUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    ${config.allowFullscreen ? 'allowfullscreen' : ''}
    allow="autoplay; fullscreen; picture-in-picture"
    title="${config.contentTitle || 'BigfootLive Video'}"
  ></iframe>
</div>`;
    } else {
      // Fixed size embed
      code = `<!-- BigfootLive Embed -->
<iframe 
  src="${embedUrl}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  ${config.allowFullscreen ? 'allowfullscreen' : ''}
  allow="autoplay; fullscreen; picture-in-picture"
  title="${config.contentTitle || 'BigfootLive Video'}"
></iframe>`;
    }

    setEmbedCode(code);
  };

  const copyToClipboard = () => {
    if (!embedCode) {
      toast.error('Please select content to embed');
      return;
    }
    
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleContentSelect = (contentId: string) => {
    const content = availableContent.find(c => c.id === contentId);
    if (content) {
      setSelectedContent(content);
      setConfig({ ...config, contentId, contentTitle: content.title });
    }
  };

  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  return (
    <DashboardLayout
      title="Embed Generator"
      subtitle="Create custom embed codes for your content"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Selection</CardTitle>
              <CardDescription>Choose the content you want to embed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={config.type}
                  onValueChange={(value: any) => {
                    setConfig({ ...config, type: value, contentId: '' });
                    setSelectedContent(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Live Event</SelectItem>
                    <SelectItem value="playlist">Playlist</SelectItem>
                    <SelectItem value="vod">Video on Demand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select {config.type === 'event' ? 'Event' : config.type === 'playlist' ? 'Playlist' : 'Video'}</Label>
                <Select
                  value={config.contentId}
                  onValueChange={handleContentSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${config.type}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContent.map((content) => (
                      <SelectItem key={content.id} value={content.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{content.title}</span>
                          {content.status && (
                            <Badge variant={
                              content.status === 'live' ? 'default' :
                              content.status === 'scheduled' ? 'secondary' : 'outline'
                            } className="ml-2">
                              {content.status}
                            </Badge>
                          )}
                          {content.items && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {content.items} items
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContent && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Selected: {selectedContent.title}</AlertTitle>
                  <AlertDescription>
                    Configure the embed settings below to customize the player appearance and behavior.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Settings</CardTitle>
              <CardDescription>Customize player appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Responsive Design</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically adjust to container size
                      </p>
                    </div>
                    <Switch
                      checked={config.responsive}
                      onCheckedChange={(checked) => setConfig({ ...config, responsive: checked })}
                    />
                  </div>

                  {!config.responsive && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="width">Width (px)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={config.width}
                          onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) || 800 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={config.height}
                          onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) || 450 })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Video Quality</Label>
                    <Select
                      value={config.quality}
                      onValueChange={(value: any) => setConfig({ ...config, quality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Adaptive)</SelectItem>
                        <SelectItem value="4k">4K (2160p)</SelectItem>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="480p">SD (480p)</SelectItem>
                        <SelectItem value="360p">Low (360p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Autoplay</Label>
                      <Switch
                        checked={config.autoplay}
                        onCheckedChange={(checked) => setConfig({ ...config, autoplay: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Muted (required for autoplay)</Label>
                      <Switch
                        checked={config.muted}
                        onCheckedChange={(checked) => setConfig({ ...config, muted: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Controls</Label>
                      <Switch
                        checked={config.controls}
                        onCheckedChange={(checked) => setConfig({ ...config, controls: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Loop Playback</Label>
                      <Switch
                        checked={config.loop}
                        onCheckedChange={(checked) => setConfig({ ...config, loop: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow Fullscreen</Label>
                      <Switch
                        checked={config.allowFullscreen}
                        onCheckedChange={(checked) => setConfig({ ...config, allowFullscreen: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <Label>Show Title</Label>
                      </div>
                      <Switch
                        checked={config.showTitle}
                        onCheckedChange={(checked) => setConfig({ ...config, showTitle: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <Label>Show Description</Label>
                      </div>
                      <Switch
                        checked={config.showDescription}
                        onCheckedChange={(checked) => setConfig({ ...config, showDescription: checked })}
                      />
                    </div>
                    {config.type === 'event' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <Label>Enable Chat</Label>
                          </div>
                          <Switch
                            checked={config.showChat}
                            onCheckedChange={(checked) => setConfig({ ...config, showChat: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            <Label>Enable Reactions</Label>
                          </div>
                          <Switch
                            checked={config.showReactions}
                            onCheckedChange={(checked) => setConfig({ ...config, showReactions: checked })}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <Label>Show View Count</Label>
                      </div>
                      <Switch
                        checked={config.showViewCount}
                        onCheckedChange={(checked) => setConfig({ ...config, showViewCount: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <Label>Allow Download</Label>
                      </div>
                      <Switch
                        checked={config.allowDownload}
                        onCheckedChange={(checked) => setConfig({ ...config, allowDownload: checked })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label>Start Time (seconds)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={config.startTime || ''}
                      onChange={(e) => setConfig({ ...config, startTime: parseInt(e.target.value) || undefined })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time (seconds)</Label>
                    <Input
                      type="number"
                      placeholder="End of video"
                      value={config.endTime || ''}
                      onChange={(e) => setConfig({ ...config, endTime: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={config.language}
                      onValueChange={(value) => setConfig({ ...config, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Advanced Settings</CardTitle>
                  <CardDescription>Privacy and analytics options</CardDescription>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <div>
                      <Label>Analytics</Label>
                      <p className="text-xs text-muted-foreground">Track viewer engagement</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.analyticsEnabled}
                    onCheckedChange={(checked) => setConfig({ ...config, analyticsEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <div>
                      <Label>GDPR Compliant</Label>
                      <p className="text-xs text-muted-foreground">Show cookie consent</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.gdprCompliant}
                    onCheckedChange={(checked) => setConfig({ ...config, gdprCompliant: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input
                    placeholder="https://videos.yourdomain.com"
                    value={config.customDomain || ''}
                    onChange={(e) => setConfig({ ...config, customDomain: e.target.value || undefined })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use your own domain for embed URLs (requires setup)
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Preview and Code Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>See how your embed will look</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <div 
                  className={`mx-auto bg-white dark:bg-black rounded-lg overflow-hidden ${
                    previewDevice === 'mobile' ? 'max-w-sm' :
                    previewDevice === 'tablet' ? 'max-w-2xl' : 'w-full'
                  }`}
                >
                  {config.contentId ? (
                    <div className={`bg-gray-800 ${config.responsive ? 'aspect-video' : ''}`} 
                         style={!config.responsive ? { width: config.width, height: config.height } : {}}>
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-white font-medium">{selectedContent?.title || 'Video Player'}</p>
                          <p className="text-gray-400 text-sm mt-1">Preview Mode</p>
                          {config.showViewCount && (
                            <p className="text-gray-400 text-xs mt-2">1,234 views</p>
                          )}
                        </div>
                      </div>
                      {config.controls && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center gap-3 text-white">
                            <Play className="h-6 w-6" />
                            <div className="flex-1 h-1 bg-gray-600 rounded-full">
                              <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                            </div>
                            <span className="text-xs">0:45 / 2:30</span>
                            {config.allowFullscreen && <Maximize className="h-4 w-4" />}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <p className="text-gray-500">Select content to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy and paste this code into your website</CardDescription>
                </div>
                <Button
                  onClick={copyToClipboard}
                  disabled={!embedCode}
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {embedCode ? (
                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm">
                    <code>{embedCode}</code>
                  </pre>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No code generated</AlertTitle>
                  <AlertDescription>
                    Select content above to generate an embed code
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>Quick tips for embedding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Copy the embed code</p>
                  <p className="text-sm text-muted-foreground">Click the "Copy Code" button above</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Paste into your HTML</p>
                  <p className="text-sm text-muted-foreground">Add the code where you want the player to appear</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Test your embed</p>
                  <p className="text-sm text-muted-foreground">Make sure everything works as expected</p>
                </div>
              </div>

              <Alert className="mt-4">
                <Zap className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  Use responsive embeds for better mobile experience. The player will automatically adjust to fit any screen size.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}