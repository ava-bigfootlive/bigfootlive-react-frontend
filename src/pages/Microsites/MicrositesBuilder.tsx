import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColorPicker } from '@/components/ui/color-picker';
import { 
  Globe,
  Layout,
  Palette,
  Type,
  Image,
  Video,
  Settings,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Minus,
  Move,
  Grid3x3,
  Layers,
  Link,
  ExternalLink,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  Clock,
  Calendar,
  Users,
  HelpCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from '@/components/ui/use-toast';

interface MicrositeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'event' | 'landing' | 'portfolio' | 'blog';
  premium: boolean;
}

interface MicrositeComponent {
  id: string;
  type: 'hero' | 'video' | 'text' | 'image' | 'cta' | 'countdown' | 'schedule' | 'speakers' | 'sponsors' | 'faq';
  settings: Record<string, any>;
  order: number;
}

interface Microsite {
  id: string;
  name: string;
  subdomain: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  components: MicrositeComponent[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  analytics?: {
    views: number;
    uniqueVisitors: number;
    avgTime: number;
  };
}

export const MicrositesBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [currentView, setCurrentView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  const [currentMicrosite, setCurrentMicrosite] = useState<Microsite>({
    id: '1',
    name: 'New Microsite',
    subdomain: 'my-site',
    template: 'event',
    status: 'draft',
    components: [
      {
        id: '1',
        type: 'hero',
        order: 0,
        settings: {
          title: 'Welcome to Our Event',
          subtitle: 'Join us for an amazing experience',
          backgroundImage: 'https://placehold.co/1920x1080',
          ctaText: 'Register Now',
          ctaLink: '#register'
        }
      },
      {
        id: '2',
        type: 'video',
        order: 1,
        settings: {
          videoUrl: 'https://example.com/video.mp4',
          autoplay: false,
          controls: true
        }
      },
      {
        id: '3',
        type: 'schedule',
        order: 2,
        settings: {
          title: 'Event Schedule',
          events: [
            { time: '09:00', title: 'Registration', description: 'Check-in and networking' },
            { time: '10:00', title: 'Keynote', description: 'Opening keynote presentation' },
            { time: '11:00', title: 'Workshop', description: 'Interactive workshop session' }
          ]
        }
      }
    ],
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#3b82f6',
      fontFamily: 'Inter',
      borderRadius: 8
    },
    seo: {
      title: 'Amazing Event 2024',
      description: 'Join us for an incredible event experience',
      keywords: ['event', 'conference', '2024']
    }
  });

  const templates: MicrositeTemplate[] = [
    {
      id: '1',
      name: 'Event Landing Page',
      description: 'Perfect for conferences, webinars, and live events',
      thumbnail: 'https://placehold.co/400x300',
      category: 'event',
      premium: false
    },
    {
      id: '2',
      name: 'Product Launch',
      description: 'Showcase your new product with style',
      thumbnail: 'https://placehold.co/400x300',
      category: 'landing',
      premium: false
    },
    {
      id: '3',
      name: 'Creator Portfolio',
      description: 'Display your work and achievements',
      thumbnail: 'https://placehold.co/400x300',
      category: 'portfolio',
      premium: true
    },
    {
      id: '4',
      name: 'Blog & Updates',
      description: 'Share news and updates with your audience',
      thumbnail: 'https://placehold.co/400x300',
      category: 'blog',
      premium: false
    }
  ];

  const componentTypes = [
    { id: 'hero', label: 'Hero Section', icon: Layout },
    { id: 'video', label: 'Video Player', icon: Video },
    { id: 'text', label: 'Text Block', icon: Type },
    { id: 'image', label: 'Image Gallery', icon: Image },
    { id: 'cta', label: 'Call to Action', icon: Zap },
    { id: 'countdown', label: 'Countdown Timer', icon: Clock },
    { id: 'schedule', label: 'Event Schedule', icon: Calendar },
    { id: 'speakers', label: 'Speakers Grid', icon: Users },
    { id: 'sponsors', label: 'Sponsors Section', icon: Star },
    { id: 'faq', label: 'FAQ Accordion', icon: HelpCircle }
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(currentMicrosite.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCurrentMicrosite({
      ...currentMicrosite,
      components: items.map((item, index) => ({ ...item, order: index }))
    });
  };

  const addComponent = (type: string) => {
    const newComponent: MicrositeComponent = {
      id: Date.now().toString(),
      type: type as any,
      order: currentMicrosite.components.length,
      settings: {}
    };

    setCurrentMicrosite({
      ...currentMicrosite,
      components: [...currentMicrosite.components, newComponent]
    });

    toast({
      title: "Component Added",
      description: `${type} component has been added to your microsite`
    });
  };

  const removeComponent = (id: string) => {
    setCurrentMicrosite({
      ...currentMicrosite,
      components: currentMicrosite.components.filter(c => c.id !== id)
    });
  };

  const publishMicrosite = () => {
    setCurrentMicrosite({
      ...currentMicrosite,
      status: 'published'
    });

    toast({
      title: "Microsite Published",
      description: `Your microsite is now live at ${currentMicrosite.subdomain}.bigfootlive.io`
    });
  };

  const exportCode = () => {
    const code = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentMicrosite.seo.title}</title>
  <meta name="description" content="${currentMicrosite.seo.description}">
  <style>
    :root {
      --primary-color: ${currentMicrosite.theme.primaryColor};
      --secondary-color: ${currentMicrosite.theme.secondaryColor};
      --border-radius: ${currentMicrosite.theme.borderRadius}px;
    }
    body {
      font-family: '${currentMicrosite.theme.fontFamily}', sans-serif;
    }
  </style>
</head>
<body>
  <!-- Generated microsite content -->
  ${currentMicrosite.components.map(c => `<div class="${c.type}-section"><!-- ${c.type} content --></div>`).join('\n  ')}
</body>
</html>`;

    navigator.clipboard.writeText(code);
    toast({
      title: "Code Exported",
      description: "HTML code has been copied to your clipboard"
    });
  };

  const getViewportWidth = () => {
    switch (currentView) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <DashboardLayout
      title="Microsite Builder"
      subtitle="Create custom landing pages for your events"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCodeExport(true)}>
            <Code className="h-4 w-4 mr-2" />
            Export Code
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={publishMicrosite}>
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {currentMicrosite.status === 'published' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Your microsite is live at{' '}
            <a 
              href={`https://${currentMicrosite.subdomain}.bigfootlive.io`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              {currentMicrosite.subdomain}.bigfootlive.io
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Builder Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="components">Blocks</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {templates.map(template => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium">{template.name}</h4>
                            {template.premium && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <Button className="w-full" disabled={!selectedTemplate}>
                  Use Template
                </Button>
              </TabsContent>

              <TabsContent value="components" className="space-y-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {componentTypes.map(component => (
                      <Button
                        key={component.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addComponent(component.id)}
                      >
                        <component.icon className="h-4 w-4 mr-2" />
                        {component.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  {/* Site Settings */}
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={currentMicrosite.name}
                      onChange={(e) => setCurrentMicrosite({
                        ...currentMicrosite,
                        name: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <div className="flex">
                      <Input
                        id="subdomain"
                        value={currentMicrosite.subdomain}
                        onChange={(e) => setCurrentMicrosite({
                          ...currentMicrosite,
                          subdomain: e.target.value
                        })}
                        className="rounded-r-none"
                      />
                      <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        .bigfootlive.io
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Theme Settings */}
                  <h4 className="text-sm font-medium">Theme</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={currentMicrosite.theme.primaryColor}
                        onChange={(e) => setCurrentMicrosite({
                          ...currentMicrosite,
                          theme: {
                            ...currentMicrosite.theme,
                            primaryColor: e.target.value
                          }
                        })}
                        className="w-16 h-9 p-1"
                      />
                      <Input
                        value={currentMicrosite.theme.primaryColor}
                        onChange={(e) => setCurrentMicrosite({
                          ...currentMicrosite,
                          theme: {
                            ...currentMicrosite.theme,
                            primaryColor: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select
                      value={currentMicrosite.theme.fontFamily}
                      onValueChange={(value) => setCurrentMicrosite({
                        ...currentMicrosite,
                        theme: {
                          ...currentMicrosite.theme,
                          fontFamily: value
                        }
                      })}
                    >
                      <SelectTrigger id="font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="border-radius"
                        value={[currentMicrosite.theme.borderRadius]}
                        onValueChange={(value) => setCurrentMicrosite({
                          ...currentMicrosite,
                          theme: {
                            ...currentMicrosite.theme,
                            borderRadius: value[0]
                          }
                        })}
                        max={20}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">
                        {currentMicrosite.theme.borderRadius}px
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* SEO Settings */}
                  <h4 className="text-sm font-medium">SEO</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">Page Title</Label>
                    <Input
                      id="seo-title"
                      value={currentMicrosite.seo.title}
                      onChange={(e) => setCurrentMicrosite({
                        ...currentMicrosite,
                        seo: {
                          ...currentMicrosite.seo,
                          title: e.target.value
                        }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Meta Description</Label>
                    <Textarea
                      id="seo-description"
                      value={currentMicrosite.seo.description}
                      onChange={(e) => setCurrentMicrosite({
                        ...currentMicrosite,
                        seo: {
                          ...currentMicrosite.seo,
                          description: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Builder Canvas */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Page Builder</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={currentView === 'desktop' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentView('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentView === 'tablet' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentView('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentView === 'mobile' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setCurrentView('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="mx-auto transition-all duration-300 border rounded-lg overflow-hidden"
              style={{ width: getViewportWidth() }}
            >
              <div className="bg-gradient-to-b from-gray-50 to-white min-h-[600px] p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="components">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentMicrosite.components.map((component, index) => (
                          <Draggable
                            key={component.id}
                            draggableId={component.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-4 ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                }`}
                              >
                                <Card className="group relative">
                                  <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-medium">
                                    {component.type}
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                      {...provided.dragHandleProps}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <Move className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <Settings className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => removeComponent(component.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <CardContent className="p-8">
                                    {/* Component Preview */}
                                    {component.type === 'hero' && (
                                      <div className="text-center py-12">
                                        <h2 className="text-3xl font-bold mb-4">
                                          {component.settings.title || 'Hero Title'}
                                        </h2>
                                        <p className="text-muted-foreground mb-6">
                                          {component.settings.subtitle || 'Hero subtitle text'}
                                        </p>
                                        <Button>
                                          {component.settings.ctaText || 'Call to Action'}
                                        </Button>
                                      </div>
                                    )}
                                    {component.type === 'video' && (
                                      <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                                        <Video className="h-12 w-12 text-muted-foreground" />
                                      </div>
                                    )}
                                    {component.type === 'text' && (
                                      <div className="prose max-w-none">
                                        <p className="text-muted-foreground">
                                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        </p>
                                      </div>
                                    )}
                                    {component.type === 'schedule' && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">
                                          {component.settings.title || 'Schedule'}
                                        </h3>
                                        <div className="space-y-2">
                                          {(component.settings.events || []).map((event: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 p-3 bg-muted rounded-lg">
                                              <span className="font-medium">{event.time}</span>
                                              <div>
                                                <p className="font-medium">{event.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                  {event.description}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {currentMicrosite.components.length === 0 && (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Start Building</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add components from the sidebar or choose a template
                    </p>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Component
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Microsite Preview</DialogTitle>
            <DialogDescription>
              Preview how your microsite will look to visitors
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`https://${currentMicrosite.subdomain}.bigfootlive.io`}
              className="w-full h-full border rounded-lg"
              title="Microsite Preview"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Export Dialog */}
      <Dialog open={showCodeExport} onOpenChange={setShowCodeExport}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export HTML Code</DialogTitle>
            <DialogDescription>
              Copy the generated HTML code for your microsite
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted">
            <pre className="text-xs">
              <code>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentMicrosite.seo.title}</title>
  <meta name="description" content="${currentMicrosite.seo.description}">
  <style>
    :root {
      --primary-color: ${currentMicrosite.theme.primaryColor};
      --secondary-color: ${currentMicrosite.theme.secondaryColor};
      --border-radius: ${currentMicrosite.theme.borderRadius}px;
    }
    body {
      font-family: '${currentMicrosite.theme.fontFamily}', sans-serif;
    }
  </style>
</head>
<body>
  ${currentMicrosite.components.map(c => `  <!-- ${c.type} component -->`).join('\n')}
</body>
</html>`}</code>
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCodeExport(false)}>
              Close
            </Button>
            <Button onClick={exportCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MicrositesBuilder;