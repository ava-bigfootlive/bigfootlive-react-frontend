/**
 * CaptionDisplay Component
 * Real-time caption overlay with customizable styling and positioning
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Settings,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Move,
  Type,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';

// Types
interface CaptionSegment {
  id: string;
  session_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  text: string;
  confidence: number;
  language: string;
  speaker_id?: string;
  speaker_name?: string;
  is_corrected: boolean;
  created_at: string;
}

interface CaptionSettings {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'top' | 'bottom' | 'center' | 'custom';
  customPosition?: { x: number; y: number };
  showSpeakerLabels: boolean;
  showConfidence: boolean;
  maxLines: number;
  autoScroll: boolean;
  wordHighlighting: boolean;
  rtlSupport: boolean;
}

interface CaptionDisplayProps {
  sessionId: string;
  className?: string;
  showControls?: boolean;
  initialSettings?: Partial<CaptionSettings>;
  onSettingsChange?: (settings: CaptionSettings) => void;
  onCaptionClick?: (caption: CaptionSegment) => void;
}

const defaultSettings: CaptionSettings = {
  fontSize: 16,
  fontFamily: 'Arial, sans-serif',
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 0.8,
  position: 'bottom',
  showSpeakerLabels: true,
  showConfidence: false,
  maxLines: 3,
  autoScroll: true,
  wordHighlighting: false,
  rtlSupport: false
};

const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' }
];

const CaptionDisplay: React.FC<CaptionDisplayProps> = ({
  sessionId,
  className,
  showControls = true,
  initialSettings = {},
  onSettingsChange,
  onCaptionClick
}) => {
  // State
  const [settings, setSettings] = useState<CaptionSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, startTime: 0 });

  // WebSocket for live captions
  // Use WebSocket only when needed for captions, silent mode
  const { isConnected, messages, subscribe } = useWebSocket({ autoConnect: false, silent: true });
  
  useEffect(() => {
    if (!sessionId) return;
    
    const unsubscribe = subscribe('captions', (message: any) => {
      if (message.type === 'captions') {
        setCaptions(prev => [...prev.slice(-100), ...message.captions]); // Keep last 100 captions
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [sessionId, subscribe]);

  // Current visible captions based on time
  const visibleCaptions = useMemo(() => {
    const now = currentTime;
    return captions.filter(caption => 
      caption.start_time <= now && caption.end_time >= now
    ).slice(-settings.maxLines);
  }, [captions, currentTime, settings.maxLines]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now() / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Notify parent of settings changes
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  // Position styles
  const positionStyles = useMemo(() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'auto',
      maxWidth: '80%',
      minWidth: '200px',
      zIndex: 1000
    };

    switch (settings.position) {
      case 'top':
        return { ...base, top: '20px' };
      case 'bottom':
        return { ...base, bottom: '20px' };
      case 'center':
        return { ...base, top: '50%', transform: 'translate(-50%, -50%)' };
      case 'custom':
        return {
          ...base,
          left: settings.customPosition?.x || '50%',
          top: settings.customPosition?.y || '50%',
          transform: 'none'
        };
      default:
        return { ...base, bottom: '20px' };
    }
  }, [settings.position, settings.customPosition]);

  // Caption styles
  const captionStyles: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    color: settings.fontColor,
    backgroundColor: `${settings.backgroundColor}${Math.round(settings.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
    padding: '8px 16px',
    borderRadius: '4px',
    textAlign: 'center' as const,
    lineHeight: '1.4',
    wordWrap: 'break-word' as const,
    maxWidth: '100%',
    direction: settings.rtlSupport ? 'rtl' : 'ltr'
  };

  // Handle dragging for custom positioning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.position !== 'custom') return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now()
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || settings.position !== 'custom') return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const currentX = settings.customPosition?.x || 50;
    const currentY = settings.customPosition?.y || 50;

    setSettings(prev => ({
      ...prev,
      customPosition: {
        x: Math.max(0, Math.min(100, currentX + (deltaX / window.innerWidth) * 100)),
        y: Math.max(0, Math.min(100, currentY + (deltaY / window.innerHeight) * 100))
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Render caption text with highlighting
  const renderCaptionText = (caption: CaptionSegment) => {
    let text = caption.text;
    
    // Add speaker label
    if (settings.showSpeakerLabels && caption.speaker_name) {
      text = `${caption.speaker_name}: ${text}`;
    }

    // Add confidence badge
    const confidenceBadge = settings.showConfidence && (
      <Badge 
        variant={caption.confidence > 0.8 ? 'default' : 'secondary'}
        className="ml-2 text-xs"
      >
        {Math.round(caption.confidence * 100)}%
      </Badge>
    );

    return (
      <div 
        key={caption.id}
        className={cn(
          "caption-segment transition-opacity duration-300",
          caption.is_corrected && "border-l-2 border-blue-400 pl-2"
        )}
        onClick={() => onCaptionClick?.(caption)}
      >
        <span>{text}</span>
        {confidenceBadge}
      </div>
    );
  };

  // Settings panel
  const SettingsPanel = () => (
    <Card className="absolute top-full mt-2 left-0 w-80 p-4 bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Font Size</label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, fontSize: value }))}
            min={10}
            max={48}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Font Family</label>
          <Select 
            value={settings.fontFamily}
            onValueChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map(font => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Text Color</label>
            <input
              type="color"
              value={settings.fontColor}
              onChange={(e) => setSettings(prev => ({ ...prev, fontColor: e.target.value }))}
              className="mt-2 w-full h-10 rounded border"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Background</label>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
              className="mt-2 w-full h-10 rounded border"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Background Opacity</label>
          <Slider
            value={[settings.backgroundOpacity]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, backgroundOpacity: value }))}
            min={0}
            max={1}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Position</label>
          <Select 
            value={settings.position}
            onValueChange={(value: any) => setSettings(prev => ({ ...prev, position: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Max Lines</label>
          <Slider
            value={[settings.maxLines]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, maxLines: value }))}
            min={1}
            max={10}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Speaker Labels</label>
            <Switch
              checked={settings.showSpeakerLabels}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showSpeakerLabels: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Confidence</label>
            <Switch
              checked={settings.showConfidence}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showConfidence: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto Scroll</label>
            <Switch
              checked={settings.autoScroll}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoScroll: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">RTL Support</label>
            <Switch
              checked={settings.rtlSupport}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, rtlSupport: checked }))}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  if (!isVisible) {
    return showControls ? (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          <Eye className="h-4 w-4 mr-2" />
          Show Captions
        </Button>
      </div>
    ) : null;
  }

  return (
    <div className={cn("caption-display", className)}>
      {/* Main caption container */}
      <div
        ref={containerRef}
        style={positionStyles}
        className={cn(
          "caption-container transition-all duration-300",
          isDragging && "cursor-grabbing",
          settings.position === 'custom' && "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Caption content */}
        <div
          ref={captionRef}
          style={captionStyles}
          className={cn(
            "caption-content",
            visibleCaptions.length === 0 && "opacity-0"
          )}
        >
          {visibleCaptions.length > 0 ? (
            <div className="space-y-1">
              {visibleCaptions.map(renderCaptionText)}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              {isConnected ? 'Waiting for captions...' : 'Connecting...'}
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-black/80 text-white border-gray-600 hover:bg-black/90"
            >
              <Settings className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={() => setIsVisible(false)}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-black/80 text-white border-gray-600 hover:bg-black/90"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Settings panel */}
        {showSettings && <SettingsPanel />}
      </div>

      {/* Connection status indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <Badge variant={isConnected ? 'default' : 'destructive'}>
          {isConnected ? 'Live' : 'Disconnected'}
        </Badge>
      </div>
    </div>
  );
};

export default CaptionDisplay;