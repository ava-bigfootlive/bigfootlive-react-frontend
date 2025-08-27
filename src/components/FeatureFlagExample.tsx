/**
 * Example React components showing feature flag integration
 * These examples demonstrate how to use feature flags throughout the application
 */

import React from 'react';
import { useFeatureFlag, useTypedFeatureFlag, withFeatureFlag } from '@/hooks/useFeatureFlag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Users, 
  MessageSquare, 
  BarChart, 
  Palette, 
  Cloud,
  Shield,
  FlaskConical,
  Zap
} from 'lucide-react';

/**
 * Example 1: Events Page with WebRTC Multi-presenter Feature
 */
export function EventsPageWithFeatureFlags() {
  // Check if WebRTC multi-presenter is enabled
  const { isEnabled: hasMultiPresenter, loading: multiPresenterLoading } = useTypedFeatureFlag(
    'premium.webrtc.multipresenter'
  );
  
  // Check if breakout rooms are enabled
  const { isEnabled: hasBreakoutRooms } = useTypedFeatureFlag('premium.breakout.rooms');
  
  // Check if AI captions are enabled (beta feature)
  const { isEnabled: hasAICaptions, variant: captionsVariant } = useTypedFeatureFlag(
    'beta.captions.ai'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Event</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic event configuration always visible */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Name</label>
            <input className="w-full p-2 border rounded" placeholder="Enter event name" />
          </div>
          
          {/* Premium feature: Multi-presenter */}
          {hasMultiPresenter && (
            <div className="border-l-4 border-purple-500 pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Multi-Presenter Mode</span>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable multiple presenters to share video simultaneously
              </p>
              <Button variant="outline" size="sm">
                Configure Presenters
              </Button>
            </div>
          )}
          
          {/* Premium feature: Breakout Rooms */}
          {hasBreakoutRooms && (
            <div className="border-l-4 border-purple-500 pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Breakout Rooms</span>
                <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Create separate rooms for smaller group discussions
              </p>
              <Button variant="outline" size="sm">
                Setup Breakout Rooms
              </Button>
            </div>
          )}
          
          {/* Beta feature: AI Captions */}
          {hasAICaptions && (
            <div className="border-l-4 border-blue-500 pl-4 space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium">AI-Powered Captions</span>
                <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic real-time captions powered by AI
                {captionsVariant && ` (Using ${captionsVariant} model)`}
              </p>
              <Button variant="outline" size="sm">
                Configure Captions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example 2: Analytics Dashboard with Advanced Features
 */
export function AnalyticsDashboardWithFlags() {
  const { isEnabled: hasAdvancedAnalytics, config } = useTypedFeatureFlag(
    'premium.analytics.advanced'
  );
  
  const { isEnabled: hasRealtimeTranslation } = useTypedFeatureFlag(
    'beta.translation.realtime'
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      {/* Basic analytics always shown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">12,345</p>
              </div>
              <BarChart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Premium analytics features */}
      {hasAdvancedAnalytics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Advanced Analytics</CardTitle>
              <Badge className="bg-purple-100 text-purple-800">
                <Shield className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sentiment Analysis */}
              {config?.sentiment_analysis && (
                <div>
                  <h3 className="font-medium mb-2">Chat Sentiment Analysis</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="text-green-600 text-2xl font-bold">72%</div>
                      <div className="text-sm text-muted-foreground">Positive</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-yellow-600 text-2xl font-bold">20%</div>
                      <div className="text-sm text-muted-foreground">Neutral</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-red-600 text-2xl font-bold">8%</div>
                      <div className="text-sm text-muted-foreground">Negative</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Heatmap */}
              {config?.heatmap && (
                <div>
                  <h3 className="font-medium mb-2">Engagement Heatmap</h3>
                  <div className="bg-gradient-to-r from-blue-100 to-red-100 h-32 rounded">
                    {/* Heatmap visualization would go here */}
                    <div className="p-4 text-center text-muted-foreground">
                      Engagement heatmap visualization
                    </div>
                  </div>
                </div>
              )}
              
              {/* Predictive Analytics */}
              {config?.predictive && (
                <div>
                  <h3 className="font-medium mb-2">Predictive Insights</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Expected peak viewers: 450 at 2:30 PM</li>
                    <li>• Predicted total attendance: 1,234</li>
                    <li>• Engagement forecast: 92% (+5% from average)</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Beta: Real-time translation metrics */}
      {hasRealtimeTranslation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Translation Metrics</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">
                <FlaskConical className="mr-1 h-3 w-3" />
                Beta
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Languages Active</div>
              </div>
              <div>
                <div className="text-xl font-bold">234</div>
                <div className="text-sm text-muted-foreground">Translations/min</div>
              </div>
              <div>
                <div className="text-xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Example 3: Chat Component with AI Moderation
 */
export function ChatWithAIModeration() {
  const { 
    isEnabled: hasAIModeration, 
    config: moderationConfig 
  } = useTypedFeatureFlag('beta.moderation.ai');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Event Chat</CardTitle>
          {hasAIModeration && (
            <Badge className="bg-blue-100 text-blue-800">
              <FlaskConical className="mr-1 h-3 w-3" />
              AI Moderation Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chat messages */}
          <div className="h-64 overflow-y-auto border rounded p-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">User1:</span> Great presentation!
            </div>
            <div className="text-sm">
              <span className="font-medium">User2:</span> Can you share the slides?
            </div>
            {hasAIModeration && moderationConfig?.show_filtered && (
              <div className="text-sm text-muted-foreground italic">
                [1 message filtered by AI moderation]
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="flex gap-2">
            <input 
              className="flex-1 p-2 border rounded" 
              placeholder={
                hasAIModeration 
                  ? "Type a message (AI moderated)..." 
                  : "Type a message..."
              }
            />
            <Button>Send</Button>
          </div>
          
          {/* AI Moderation Settings (if enabled) */}
          {hasAIModeration && (
            <div className="border-t pt-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span>Toxicity Filter:</span>
                  <Badge variant="outline">
                    {moderationConfig?.toxicity_threshold || 'Medium'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Spam Detection:</span>
                  <Badge variant="outline">
                    {moderationConfig?.spam_detection ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Language Filter:</span>
                  <Badge variant="outline">
                    {moderationConfig?.profanity_filter ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Tenant Settings with Custom Branding
 */
const BrandingSettings = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Custom Branding</CardTitle>
        <Badge className="bg-purple-100 text-purple-800">
          <Shield className="mr-1 h-3 w-3" />
          Premium
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Logo</label>
        <Button variant="outline">
          <Cloud className="mr-2 h-4 w-4" />
          Upload Logo
        </Button>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Brand Colors</label>
        <div className="flex gap-2">
          <input type="color" className="h-10 w-20" />
          <input type="color" className="h-10 w-20" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Custom Domain</label>
        <input className="w-full p-2 border rounded" placeholder="events.yourdomain.com" />
      </div>
    </CardContent>
  </Card>
);

// This component will only render if the feature flag is enabled
export const CustomBrandingPanel = withFeatureFlag(
  'premium.branding.custom',
  BrandingSettings
);

/**
 * Example 5: Experimental VR Streaming Feature
 */
export function VRStreamingOption() {
  const { 
    isEnabled: hasVRStreaming, 
    experiment 
  } = useTypedFeatureFlag('experimental.vr.streaming');

  if (!hasVRStreaming) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>VR Streaming</CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-orange-100 text-orange-800">
              <Zap className="mr-1 h-3 w-3" />
              Experimental
            </Badge>
            {experiment && (
              <Badge variant="outline">
                {experiment.variant} variant
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Stream your event in immersive VR. Viewers can join using VR headsets
          for a fully immersive experience.
        </p>
        <Button variant="outline" className="w-full">
          Enable VR Streaming (Experimental)
        </Button>
        {experiment && (
          <p className="text-xs text-muted-foreground mt-2">
            You're in experiment: {experiment.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 6: Feature Flag Status Display
 * Shows users which features are available in their plan
 */
export function FeatureStatusDisplay() {
  const features = [
    { key: 'premium.webrtc.multipresenter', name: 'Multi-Presenter', category: 'premium' },
    { key: 'premium.breakout.rooms', name: 'Breakout Rooms', category: 'premium' },
    { key: 'premium.analytics.advanced', name: 'Advanced Analytics', category: 'premium' },
    { key: 'beta.captions.ai', name: 'AI Captions', category: 'beta' },
    { key: 'beta.moderation.ai', name: 'AI Moderation', category: 'beta' },
    { key: 'experimental.vr.streaming', name: 'VR Streaming', category: 'experimental' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {features.map((feature) => {
            const { isEnabled } = useTypedFeatureFlag(feature.key as any);
            
            return (
              <div key={feature.key} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{feature.name}</span>
                  {feature.category === 'premium' && (
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  )}
                  {feature.category === 'beta' && (
                    <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
                  )}
                  {feature.category === 'experimental' && (
                    <Badge className="bg-orange-100 text-orange-800">Experimental</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEnabled ? (
                    <>
                      <span className="text-xs text-green-600">Enabled</span>
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">Disabled</span>
                      <div className="h-2 w-2 bg-gray-300 rounded-full" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  EventsPageWithFeatureFlags,
  AnalyticsDashboardWithFlags,
  ChatWithAIModeration,
  CustomBrandingPanel,
  VRStreamingOption,
  FeatureStatusDisplay,
};