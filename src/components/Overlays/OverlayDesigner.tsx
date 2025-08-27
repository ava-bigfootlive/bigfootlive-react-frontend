import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { AlertCircle, Eye, Save, Download, Upload, Copy, Trash2, Move3D } from 'lucide-react';

interface OverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OverlayTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  overlay_type: string;
  position: string;
  x_position?: number;
  y_position?: number;
  width: number;
  height: number;
  background_color: string;
  background_opacity: number;
  background_image_url?: string;
  font_family: string;
  font_size: number;
  font_color: string;
  font_weight: string;
  text_align: string;
  text_shadow: boolean;
  text_shadow_color: string;
  text_shadow_offset_x: number;
  text_shadow_offset_y: number;
  text_shadow_blur: number;
  border_width: number;
  border_color: string;
  border_radius: number;
  animation_type: string;
  animation_duration: number;
  layout_config?: any;
  is_public: boolean;
}

interface OverlayDesignerProps {
  initialTemplate?: OverlayTemplate;
  onSave?: (template: OverlayTemplate) => void;
  onPreview?: (template: OverlayTemplate, content: any) => void;
  className?: string;
}

const OVERLAY_TYPES = [
  { value: 'lower_third', label: 'Lower Third' },
  { value: 'chyron', label: 'Chyron/Ticker' },
  { value: 'full_screen', label: 'Full Screen' },
  { value: 'corner_bug', label: 'Corner Bug' },
  { value: 'countdown', label: 'Countdown' },
  { value: 'data_display', label: 'Data Display' },
  { value: 'poll_results', label: 'Poll Results' },
  { value: 'social_feed', label: 'Social Feed' }
];

const POSITIONS = [
  { value: 'lower_left', label: 'Lower Left' },
  { value: 'lower_center', label: 'Lower Center' },
  { value: 'lower_right', label: 'Lower Right' },
  { value: 'upper_left', label: 'Upper Left' },
  { value: 'upper_center', label: 'Upper Center' },
  { value: 'upper_right', label: 'Upper Right' },
  { value: 'center', label: 'Center' },
  { value: 'custom', label: 'Custom Position' }
];

const ANIMATIONS = [
  { value: 'none', label: 'None' },
  { value: 'fade_in_out', label: 'Fade In/Out' },
  { value: 'slide_left', label: 'Slide Left' },
  { value: 'slide_right', label: 'Slide Right' },
  { value: 'slide_up', label: 'Slide Up' },
  { value: 'slide_down', label: 'Slide Down' },
  { value: 'wipe_left', label: 'Wipe Left' },
  { value: 'wipe_right', label: 'Wipe Right' },
  { value: 'scale_in_out', label: 'Scale In/Out' },
  { value: 'typewriter', label: 'Typewriter' }
];

const FONT_FAMILIES = [
  'Arial', 'Arial Bold', 'Times', 'Helvetica', 'Georgia', 'Verdana'
];

const CATEGORIES = [
  'Corporate', 'News', 'Sports', 'Entertainment', 'Education', 'Gaming', 'Custom'
];

export const OverlayDesigner: React.FC<OverlayDesignerProps> = ({
  initialTemplate,
  onSave,
  onPreview,
  className = ''
}) => {
  const [template, setTemplate] = useState<OverlayTemplate>(
    initialTemplate || {
      name: '',
      description: '',
      category: 'Corporate',
      overlay_type: 'lower_third',
      position: 'lower_left',
      width: 400,
      height: 100,
      background_color: '#000000',
      background_opacity: 0.8,
      font_family: 'Arial',
      font_size: 24,
      font_color: '#FFFFFF',
      font_weight: 'normal',
      text_align: 'left',
      text_shadow: true,
      text_shadow_color: '#000000',
      text_shadow_offset_x: 2,
      text_shadow_offset_y: 2,
      text_shadow_blur: 4,
      border_width: 0,
      border_color: '#FFFFFF',
      border_radius: 0,
      animation_type: 'fade_in_out',
      animation_duration: 0.5,
      is_public: false
    }
  );

  const [previewContent, setPreviewContent] = useState({
    name: 'John Doe',
    title: 'CEO, BigFoot Live',
    text: 'Welcome to BigFoot Live streaming platform'
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Video dimensions for preview (16:9 aspect ratio)
  const VIDEO_WIDTH = 640;
  const VIDEO_HEIGHT = 360;

  // Calculate overlay position for preview
  const overlayPosition = useMemo(() => {
    const getPosition = () => {
      if (template.position === 'custom') {
        return {
          x: template.x_position || 0,
          y: template.y_position || 0
        };
      }

      const positionMap: Record<string, { x: number; y: number }> = {
        lower_left: { x: 20, y: VIDEO_HEIGHT - template.height - 20 },
        lower_center: { x: (VIDEO_WIDTH - template.width) / 2, y: VIDEO_HEIGHT - template.height - 20 },
        lower_right: { x: VIDEO_WIDTH - template.width - 20, y: VIDEO_HEIGHT - template.height - 20 },
        upper_left: { x: 20, y: 20 },
        upper_center: { x: (VIDEO_WIDTH - template.width) / 2, y: 20 },
        upper_right: { x: VIDEO_WIDTH - template.width - 20, y: 20 },
        center: { x: (VIDEO_WIDTH - template.width) / 2, y: (VIDEO_HEIGHT - template.height) / 2 }
      };

      return positionMap[template.position] || { x: 20, y: 20 };
    };

    const pos = getPosition();
    return {
      x: Math.max(0, Math.min(pos.x, VIDEO_WIDTH - template.width)),
      y: Math.max(0, Math.min(pos.y, VIDEO_HEIGHT - template.height))
    };
  }, [template.position, template.x_position, template.y_position, template.width, template.height]);

  const handleTemplateChange = (field: keyof OverlayTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (template.position !== 'custom') {
      // Switch to custom position when dragging
      handleTemplateChange('position', 'custom');
    }

    setIsDragging(true);
    const rect = overlayRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.preventDefault();
  }, [template.position]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !previewRef.current) return;

    const previewRect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - previewRect.left - dragOffset.x;
    const y = e.clientY - previewRect.top - dragOffset.y;

    // Constrain within preview bounds
    const constrainedX = Math.max(0, Math.min(x, VIDEO_WIDTH - template.width));
    const constrainedY = Math.max(0, Math.min(y, VIDEO_HEIGHT - template.height));

    handleTemplateChange('x_position', Math.round(constrainedX));
    handleTemplateChange('y_position', Math.round(constrainedY));
  }, [isDragging, dragOffset, template.width, template.height]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const generatePreviewStyle = () => {
    return {
      position: 'absolute' as const,
      left: overlayPosition.x,
      top: overlayPosition.y,
      width: template.width,
      height: template.height,
      backgroundColor: `${template.background_color}${Math.round(template.background_opacity * 255).toString(16).padStart(2, '0')}`,
      color: template.font_color,
      fontFamily: template.font_family,
      fontSize: template.font_size * 0.6, // Scale down for preview
      fontWeight: template.font_weight,
      textAlign: template.text_align as any,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: template.text_align === 'center' ? 'center' : template.text_align === 'right' ? 'flex-end' : 'flex-start',
      padding: '8px',
      cursor: 'move',
      border: template.border_width > 0 ? `${template.border_width}px solid ${template.border_color}` : 'none',
      borderRadius: template.border_radius,
      textShadow: template.text_shadow ? `${template.text_shadow_offset_x}px ${template.text_shadow_offset_y}px ${template.text_shadow_blur}px ${template.text_shadow_color}` : 'none',
      userSelect: 'none' as const,
      zIndex: 10
    };
  };

  const renderPreviewContent = () => {
    switch (template.overlay_type) {
      case 'lower_third':
        return (
          <>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
              {previewContent.name}
            </div>
            <div style={{ fontSize: template.font_size * 0.4, opacity: 0.9 }}>
              {previewContent.title}
            </div>
          </>
        );
      case 'chyron':
        return (
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {previewContent.text}
          </div>
        );
      default:
        return <div>{previewContent.text}</div>;
    }
  };

  const handleSave = () => {
    if (!template.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    onSave?.(template);
  };

  const handlePreview = () => {
    onPreview?.(template, previewContent);
  };

  const handleExportTemplate = () => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name || 'overlay-template'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setTemplate({ ...template, ...imported });
        } catch (error) {
          alert('Invalid template file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`overlay-designer ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designer Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overlay Designer</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={template.name}
                      onChange={(e) => handleTemplateChange('name', e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={template.category} onValueChange={(value) => handleTemplateChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => handleTemplateChange('description', e.target.value)}
                    placeholder="Template description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overlay-type">Overlay Type</Label>
                    <Select value={template.overlay_type} onValueChange={(value) => handleTemplateChange('overlay_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OVERLAY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select value={template.position} onValueChange={(value) => handleTemplateChange('position', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {template.position === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="x-pos">X Position</Label>
                      <Input
                        id="x-pos"
                        type="number"
                        value={template.x_position || 0}
                        onChange={(e) => handleTemplateChange('x_position', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-pos">Y Position</Label>
                      <Input
                        id="y-pos"
                        type="number"
                        value={template.y_position || 0}
                        onChange={(e) => handleTemplateChange('y_position', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={template.width}
                      onChange={(e) => handleTemplateChange('width', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={template.height}
                      onChange={(e) => handleTemplateChange('height', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-public"
                    checked={template.is_public}
                    onCheckedChange={(checked) => handleTemplateChange('is_public', checked)}
                  />
                  <Label htmlFor="is-public">Make template public</Label>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={template.background_color}
                        onChange={(e) => handleTemplateChange('background_color', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        value={template.background_color}
                        onChange={(e) => handleTemplateChange('background_color', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bg-opacity">Background Opacity</Label>
                    <Input
                      id="bg-opacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={template.background_opacity}
                      onChange={(e) => handleTemplateChange('background_opacity', parseFloat(e.target.value))}
                    />
                    <span className="text-sm text-gray-500">{Math.round(template.background_opacity * 100)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={template.font_family} onValueChange={(value) => handleTemplateChange('font_family', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="font-size">Font Size (px)</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={template.font_size}
                      onChange={(e) => handleTemplateChange('font_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="font-color">Font Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="font-color"
                        type="color"
                        value={template.font_color}
                        onChange={(e) => handleTemplateChange('font_color', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        value={template.font_color}
                        onChange={(e) => handleTemplateChange('font_color', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="font-weight">Font Weight</Label>
                    <Select value={template.font_weight} onValueChange={(value) => handleTemplateChange('font_weight', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="text-align">Text Align</Label>
                    <Select value={template.text_align} onValueChange={(value) => handleTemplateChange('text_align', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="text-shadow"
                      checked={template.text_shadow}
                      onCheckedChange={(checked) => handleTemplateChange('text_shadow', checked)}
                    />
                    <Label htmlFor="text-shadow">Enable Text Shadow</Label>
                  </div>

                  {template.text_shadow && (
                    <div className="grid grid-cols-4 gap-4 ml-6">
                      <div>
                        <Label htmlFor="shadow-color">Shadow Color</Label>
                        <Input
                          id="shadow-color"
                          type="color"
                          value={template.text_shadow_color}
                          onChange={(e) => handleTemplateChange('text_shadow_color', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shadow-x">X Offset</Label>
                        <Input
                          id="shadow-x"
                          type="number"
                          value={template.text_shadow_offset_x}
                          onChange={(e) => handleTemplateChange('text_shadow_offset_x', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shadow-y">Y Offset</Label>
                        <Input
                          id="shadow-y"
                          type="number"
                          value={template.text_shadow_offset_y}
                          onChange={(e) => handleTemplateChange('text_shadow_offset_y', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shadow-blur">Blur</Label>
                        <Input
                          id="shadow-blur"
                          type="number"
                          value={template.text_shadow_blur}
                          onChange={(e) => handleTemplateChange('text_shadow_blur', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="border-width">Border Width</Label>
                    <Input
                      id="border-width"
                      type="number"
                      min="0"
                      value={template.border_width}
                      onChange={(e) => handleTemplateChange('border_width', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="border-color">Border Color</Label>
                    <Input
                      id="border-color"
                      type="color"
                      value={template.border_color}
                      onChange={(e) => handleTemplateChange('border_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <Input
                      id="border-radius"
                      type="number"
                      min="0"
                      value={template.border_radius}
                      onChange={(e) => handleTemplateChange('border_radius', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="animation" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="animation-type">Animation Type</Label>
                    <Select value={template.animation_type} onValueChange={(value) => handleTemplateChange('animation_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMATIONS.map(anim => (
                          <SelectItem key={anim.value} value={anim.value}>{anim.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="animation-duration">Duration (seconds)</Label>
                    <Input
                      id="animation-duration"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={template.animation_duration}
                      onChange={(e) => handleTemplateChange('animation_duration', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bg-image">Background Image URL</Label>
                    <Input
                      id="bg-image"
                      value={template.background_image_url || ''}
                      onChange={(e) => handleTemplateChange('background_image_url', e.target.value)}
                      placeholder="https://example.com/image.png"
                    />
                  </div>

                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportTemplate}>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Label htmlFor="import-template">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-1" />
                            Import
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="import-template"
                        type="file"
                        accept=".json"
                        onChange={handleImportTemplate}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Preview</span>
              <Badge variant="outline">{template.overlay_type.replace('_', ' ').toUpperCase()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample Content Editor */}
              <div className="grid grid-cols-1 gap-2">
                <Label>Preview Content</Label>
                {template.overlay_type === 'lower_third' ? (
                  <>
                    <Input
                      value={previewContent.name}
                      onChange={(e) => setPreviewContent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Speaker Name"
                    />
                    <Input
                      value={previewContent.title}
                      onChange={(e) => setPreviewContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Speaker Title"
                    />
                  </>
                ) : (
                  <Textarea
                    value={previewContent.text}
                    onChange={(e) => setPreviewContent(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Overlay text content"
                    rows={2}
                  />
                )}
              </div>

              {/* Video Preview */}
              <div
                ref={previewRef}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{
                  width: VIDEO_WIDTH,
                  height: VIDEO_HEIGHT,
                  background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                }}
              >
                {/* Simulated video background */}
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                  <span className="text-lg font-mono">LIVE VIDEO FEED</span>
                </div>

                {/* Overlay Preview */}
                <div
                  ref={overlayRef}
                  style={generatePreviewStyle()}
                  onMouseDown={handleDragStart}
                >
                  {renderPreviewContent()}
                  {template.position === 'custom' && (
                    <Move3D className="absolute top-1 right-1 w-4 h-4 text-white/70" />
                  )}
                </div>

                {/* Position indicator */}
                {template.position === 'custom' && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    X: {template.x_position || 0}, Y: {template.y_position || 0}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500">
                <p>• Drag the overlay to change position</p>
                <p>• Preview shows 16:9 aspect ratio at {VIDEO_WIDTH}x{VIDEO_HEIGHT}px</p>
                <p>• Actual stream will scale accordingly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};