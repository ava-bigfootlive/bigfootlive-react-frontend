/**
 * Caption System Demo Page
 * Demonstrates the comprehensive automated closed captioning system
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CaptionDisplay, CaptionEditor } from '@/components/Captions';
import { useCaptions } from '@/hooks/useCaptions';
import {
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Users,
  BarChart3,
  Languages,
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2
} from 'lucide-react';

const CaptionDemo: React.FC = () => {
  // State
  const [eventId] = useState('demo-event-123');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  
  // Caption hooks
  const {
    session,
    segments,
    corrections,
    settings,
    export: exportHook
  } = useCaptions(sessionId || undefined, eventId);

  // Demo data for showcase
  const demoStats = {
    totalSegments: segments.segments.length,
    correctedSegments: segments.segments.filter(s => s.is_corrected).length,
    averageConfidence: segments.segments.reduce((acc, s) => acc + s.confidence, 0) / segments.segments.length || 0,
    activeLanguages: ['en-US', 'es-ES', 'fr-FR'],
    providersUsed: ['AWS Transcribe', 'Google Speech'],
    processingLatency: '2.1s avg'
  };

  // Start caption session
  const startCaptioning = async () => {
    try {
      const newSession = await session.startSession(eventId, 'demo-container-123');
      setSessionId(newSession.id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start captioning:', error);
    }
  };

  // Stop caption session
  const stopCaptioning = async () => {
    if (!sessionId) return;
    
    try {
      await session.stopSession(sessionId);
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to stop captioning:', error);
    }
  };

  // Export captions
  const exportCaptions = async (format: 'webvtt' | 'srt' | 'json') => {
    if (!sessionId) return;
    
    try {
      await exportHook.createExport(sessionId, format, 'en-US', {
        include_timestamps: true,
        include_speaker_labels: true,
        include_confidence_scores: format === 'json'
      });
    } catch (error) {
      console.error('Failed to export captions:', error);
    }
  };

  // Update demo time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Automated Closed Captioning System
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive real-time caption generation with multi-provider support,
          live corrections, and accessibility compliance.
        </p>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <Volume2 className="w-4 h-4" />
            Multi-Provider Speech Recognition
          </Badge>
          <Badge variant="outline" className="gap-2">
            <Languages className="w-4 h-4" />
            15+ Languages Supported
          </Badge>
          <Badge variant="outline" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            ADA/WCAG Compliant
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Caption Control</h2>
          <div className="flex items-center gap-2">
            <Badge variant={session.session?.status === 'active' ? 'default' : 'secondary'}>
              {session.session?.status || 'Stopped'}
            </Badge>
            <Badge variant={segments.isConnected ? 'default' : 'destructive'}>
              {segments.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isPlaying ? (
              <Button onClick={startCaptioning} className="gap-2">
                <Play className="w-4 h-4" />
                Start Captioning
              </Button>
            ) : (
              <Button onClick={stopCaptioning} variant="outline" className="gap-2">
                <Square className="w-4 h-4" />
                Stop Captioning
              </Button>
            )}

            <Button
              onClick={() => setShowEditor(!showEditor)}
              variant="outline"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {showEditor ? 'Hide Editor' : 'Show Editor'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportCaptions('webvtt')}
              variant="outline"
              size="sm"
              disabled={!sessionId}
            >
              WebVTT
            </Button>
            <Button
              onClick={() => exportCaptions('srt')}
              variant="outline"
              size="sm"
              disabled={!sessionId}
            >
              SRT
            </Button>
            <Button
              onClick={() => exportCaptions('json')}
              variant="outline"
              size="sm"
              disabled={!sessionId}
            >
              JSON
            </Button>
          </div>
        </div>

        {session.session && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Session ID:</span>
                <br />
                <code className="text-xs">{session.session.id.slice(0, 8)}...</code>
              </div>
              <div>
                <span className="text-gray-500">Provider:</span>
                <br />
                <span className="font-medium">{session.session.provider}</span>
              </div>
              <div>
                <span className="text-gray-500">Language:</span>
                <br />
                <span className="font-medium">{session.session.primary_language}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <br />
                <span className="font-medium">{Math.floor(currentTime)}s</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Segments</p>
              <p className="text-2xl font-bold">{demoStats.totalSegments}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Corrections Made</p>
              <p className="text-2xl font-bold">{demoStats.correctedSegments}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold">
                {Math.round(demoStats.averageConfidence * 100)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Latency</p>
              <p className="text-2xl font-bold">{demoStats.processingLatency}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Caption Display */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Caption Display</h3>
            
            {/* Mock video player */}
            <div className="relative bg-black rounded-lg aspect-video mb-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </div>
                  <p className="text-sm opacity-75">
                    {isPlaying ? 'Live Stream Active' : 'Click Start to Begin'}
                  </p>
                </div>
              </div>

              {/* Caption Overlay */}
              {sessionId && (
                <CaptionDisplay
                  sessionId={sessionId}
                  showControls={true}
                  onSettingsChange={(settings) => {
                    console.log('Caption settings changed:', settings);
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Time: {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}</span>
              <span>Quality: 1080p • Latency: 2.1s</span>
            </div>
          </Card>

          {/* Features Showcase */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Caption Features</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Real-time Speech Recognition</p>
                  <p className="text-sm text-gray-600">AWS Transcribe, Google Speech, Azure, Whisper</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Multi-language Support</p>
                  <p className="text-sm text-gray-600">15+ languages with auto-detection</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Speaker Identification</p>
                  <p className="text-sm text-gray-600">Distinguish between multiple speakers</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Live Corrections</p>
                  <p className="text-sm text-gray-600">Real-time manual corrections and improvements</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Export Formats</p>
                  <p className="text-sm text-gray-600">WebVTT, SRT, CEA-608/708, TTML, JSON</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Accessibility Compliance</p>
                  <p className="text-sm text-gray-600">ADA, WCAG 2.1 AA, FCC requirements</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Caption Editor */}
        <div className="space-y-4">
          {showEditor && sessionId ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Caption Editor & Moderation</h3>
              <div className="h-[600px] border rounded-lg">
                <CaptionEditor
                  sessionId={sessionId}
                  onCorrectionSave={(correction) => {
                    console.log('Correction saved:', correction);
                  }}
                  onCorrectionApprove={(correctionId) => {
                    console.log('Correction approved:', correctionId);
                  }}
                />
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Caption Analytics</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Active Languages</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {demoStats.activeLanguages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Providers Used</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {demoStats.providersUsed.map(provider => (
                        <Badge key={provider} variant="outline" className="text-xs">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Start a captioning session to see real-time analytics and use the 
                    caption editor for live corrections and moderation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Caption session started for Event #{eventId.slice(-6)}</p>
                    <p>• 3 manual corrections applied in last session</p>
                    <p>• WebVTT export generated (2 minutes ago)</p>
                    <p>• Speaker identification enabled for English</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Export Status */}
          {exportHook.exports.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Exports</h3>
              <div className="space-y-2">
                {exportHook.exports.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{exp.format.toUpperCase()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(exp.requested_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                      {exp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Technical Specifications */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
        
        <Tabs defaultValue="providers">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">AWS Transcribe</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time streaming</li>
                  <li>• Custom vocabularies</li>
                  <li>• Speaker identification</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Google Speech-to-Text</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced models</li>
                  <li>• Profanity filtering</li>
                  <li>• Word-level timestamps</li>
                  <li>• Noise robustness</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Azure Speech Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Custom models</li>
                  <li>• Real-time translation</li>
                  <li>• Industry-specific models</li>
                  <li>• Batch processing</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">OpenAI Whisper</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Self-hosted option</li>
                  <li>• High accuracy</li>
                  <li>• Multilingual support</li>
                  <li>• Offline capability</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'WebVTT', desc: 'HTML5 video captions', ext: '.vtt' },
                { name: 'SRT', desc: 'SubRip subtitle format', ext: '.srt' },
                { name: 'CEA-608/708', desc: 'Broadcast television', ext: '.cea' },
                { name: 'TTML', desc: 'Streaming platforms', ext: '.ttml' },
                { name: 'JSON', desc: 'API integration format', ext: '.json' },
              ].map(format => (
                <div key={format.name} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{format.name}</h4>
                  <p className="text-sm text-gray-600">{format.desc}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    {format.ext}
                  </code>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                'English (US/UK)', 'Spanish (ES/MX)', 'French', 'German',
                'Italian', 'Portuguese', 'Japanese', 'Korean',
                'Chinese (Simplified)', 'Chinese (Traditional)', 'Arabic', 'Hindi',
                'Russian', 'Dutch', 'Swedish'
              ].map(lang => (
                <div key={lang} className="p-2 bg-gray-50 rounded text-center">
                  {lang}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Accessibility Standards</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ADA (Americans with Disabilities Act)</li>
                  <li>• WCAG 2.1 Level AA compliance</li>
                  <li>• Section 508 requirements</li>
                  <li>• FCC regulations for broadcast</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Caption Quality Standards</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 99%+ accuracy for live captions</li>
                  <li>• <3 second latency</li>
                  <li>• Proper punctuation and formatting</li>
                  <li>• Speaker identification support</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CaptionDemo;