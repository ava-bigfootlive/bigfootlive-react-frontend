/**
 * StreamConfig - Component for displaying RTMPS streaming configuration
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CheckCircle, Shield, Wifi, Key, Server } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface StreamConfigProps {
  eventId: string;
  streamKey: string;
  rtmpUrl?: string;
  rtmpsUrl: string;
  hlsUrl?: string;
}

export const StreamConfig: React.FC<StreamConfigProps> = ({
  eventId,
  streamKey,
  rtmpUrl,
  rtmpsUrl,
  hlsUrl
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy manually',
        variant: 'destructive'
      });
    }
  };

  const obsConfig = {
    rtmps: {
      server: rtmpsUrl.replace(/\/live.*$/, '/live'),
      streamKey: streamKey
    },
    rtmp: rtmpUrl ? {
      server: rtmpUrl.replace(/\/live.*$/, '/live'),
      streamKey: streamKey
    } : null
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>🔒 Secure Streaming Required:</strong> This event uses RTMPS (secure RTMP over TLS) for encrypted streaming. 
          Regular RTMP is disabled for security.
        </AlertDescription>
      </Alert>

      {/* Streaming URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Streaming Configuration
          </CardTitle>
          <CardDescription>
            Configure your streaming software with these settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RTMPS URL (Primary) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              RTMPS URL (Secure - Recommended)
            </Label>
            <div className="flex gap-2">
              <Input 
                value={rtmpsUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(rtmpsUrl, 'RTMPS URL')}
              >
                {copied === 'RTMPS URL' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Stream Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Stream Key
            </Label>
            <div className="flex gap-2">
              <Input 
                type={showKey ? 'text' : 'password'}
                value={streamKey} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(streamKey, 'Stream Key')}
              >
                {copied === 'Stream Key' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* HLS Playback URL */}
          {hlsUrl && (
            <div className="space-y-2">
              <Label>HLS Playback URL</Label>
              <div className="flex gap-2">
                <Input 
                  value={hlsUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(hlsUrl, 'HLS URL')}
                >
                  {copied === 'HLS URL' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Software Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Streaming Software Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="obs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="obs">OBS Studio</TabsTrigger>
              <TabsTrigger value="streamlabs">Streamlabs</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            
            <TabsContent value="obs" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium">OBS Studio Configuration:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Open OBS Studio Settings → Stream</li>
                  <li>2. Service: <strong>Custom...</strong></li>
                  <li>3. Server: <code className="px-2 py-1 bg-background rounded">{obsConfig.rtmps.server}</code></li>
                  <li>4. Stream Key: <code className="px-2 py-1 bg-background rounded">{showKey ? streamKey : '••••••••'}</code></li>
                  <li>5. <strong>⚠️ Important:</strong> Make sure to use RTMPS (not RTMP)</li>
                </ol>
                <Button 
                  className="w-full"
                  onClick={() => {
                    copyToClipboard(obsConfig.rtmps.server, 'OBS Server');
                    setTimeout(() => copyToClipboard(streamKey, 'Stream Key'), 1000);
                  }}
                >
                  Copy OBS Settings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="streamlabs" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium">Streamlabs OBS Configuration:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Open Streamlabs Settings → Stream</li>
                  <li>2. Stream Type: <strong>Custom Streaming Server</strong></li>
                  <li>3. URL: <code className="px-2 py-1 bg-background rounded">{obsConfig.rtmps.server}</code></li>
                  <li>4. Stream Key: <code className="px-2 py-1 bg-background rounded">{showKey ? streamKey : '••••••••'}</code></li>
                  <li>5. Enable <strong>Use SSL/TLS</strong></li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h4 className="font-medium">Generic RTMPS Configuration:</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Protocol:</span>
                    <span>RTMPS (Secure RTMP)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Server URL:</span>
                    <span className="font-mono text-xs">{obsConfig.rtmps.server}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Stream Key:</span>
                    <span className="font-mono text-xs">{showKey ? streamKey : '••••••••'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Port:</span>
                    <span>1936 (RTMPS)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Encryption:</span>
                    <span>TLS 1.2/1.3</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Connection Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Bandwidth:</strong> Minimum 5 Mbps upload for 1080p streaming
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Codec:</strong> H.264 video, AAC audio
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Resolution:</strong> Up to 1920x1080 (1080p)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Framerate:</strong> 30 or 60 FPS recommended
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <strong>Keyframe Interval:</strong> 2 seconds
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};